# 忘记密码功能 - 后端实现指南

## 📋 概述

忘记密码功能采用**手机验证码**方式重置密码，分为三个步骤：
1. 发送验证码到手机
2. 验证验证码
3. 重置密码

## 🔌 API 接口设计

### 1. 发送验证码

**接口:** `POST /api/auth/forgot-password/send-code`

**请求体:**
```json
{
  "phone": "13800138000"
}
```

**成功响应:**
```json
{
  "success": true,
  "message": "验证码已发送",
  "data": null
}
```

**错误响应:**
```json
{
  "success": false,
  "message": "手机号未注册",
  "data": null
}
```

**业务逻辑:**
1. 验证手机号格式（11位，1开头）
2. 检查手机号是否已注册
3. 生成6位随机验证码
4. 将验证码存储到 Redis（有效期5分钟）
5. 调用短信服务发送验证码
6. 返回成功响应

**Redis 存储:**
```
Key: reset_code:{phone}
Value: {code}
TTL: 300秒（5分钟）
```

---

### 2. 验证验证码

**接口:** `POST /api/auth/forgot-password/verify-code`

**请求体:**
```json
{
  "phone": "13800138000",
  "code": "123456"
}
```

**成功响应:**
```json
{
  "success": true,
  "message": "验证成功",
  "data": null
}
```

**错误响应:**
```json
{
  "success": false,
  "message": "验证码错误或已过期",
  "data": null
}
```

**业务逻辑:**
1. 从 Redis 获取验证码
2. 比对验证码是否正确
3. 验证成功后，标记该验证码已验证（但不删除）
4. 返回成功响应

**Redis 更新:**
```
Key: reset_code_verified:{phone}
Value: {code}
TTL: 600秒（10分钟）
```

---

### 3. 重置密码

**接口:** `POST /api/auth/forgot-password/reset`

**请求体:**
```json
{
  "phone": "13800138000",
  "code": "123456",
  "newPassword": "newpass123"
}
```

**成功响应:**
```json
{
  "success": true,
  "message": "密码重置成功",
  "data": null
}
```

**错误响应:**
```json
{
  "success": false,
  "message": "验证码未验证或已过期",
  "data": null
}
```

**业务逻辑:**
1. 检查验证码是否已验证（从 Redis 获取 `reset_code_verified:{phone}`）
2. 验证验证码是否匹配
3. 使用 BCrypt 加密新密码
4. 更新数据库中的密码
5. 删除 Redis 中的验证码记录
6. 返回成功响应

---

## 🗄️ 数据库设计

### User 表（已存在）

不需要新增字段，使用现有的：
- `phone` - 手机号
- `password` - 密码（BCrypt 加密）

---

## 💾 Redis 设计

### 验证码存储

```redis
# 发送验证码时
SET reset_code:13800138000 "123456" EX 300

# 验证成功后
SET reset_code_verified:13800138000 "123456" EX 600

# 重置密码后
DEL reset_code:13800138000
DEL reset_code_verified:13800138000
```

### Key 命名规范
- `reset_code:{phone}` - 发送的验证码
- `reset_code_verified:{phone}` - 已验证的验证码

---

## 🔐 安全措施

### 1. 验证码安全
- ✅ 6位随机数字
- ✅ 5分钟有效期
- ✅ 一次性使用（重置后删除）
- ✅ 验证成功后延长有效期到10分钟

### 2. 频率限制
```java
// 同一手机号1分钟内只能发送1次
Key: reset_code_limit:{phone}
Value: 1
TTL: 60秒
```

### 3. 密码安全
- ✅ 使用 BCrypt 加密
- ✅ 最少6位
- ✅ 最多20位

### 4. 防止暴力破解
- ✅ 验证码错误5次后锁定10分钟
- ✅ IP 限制（可选）

---

## 📝 Java 实现示例

### Controller

```java
@RestController
@RequestMapping("/api/auth/forgot-password")
public class ForgotPasswordController {

    @Autowired
    private ForgotPasswordService forgotPasswordService;

    /**
     * 发送验证码
     */
    @PostMapping("/send-code")
    public ResponseEntity<ApiResponse> sendCode(@RequestBody SendCodeRequest request) {
        try {
            forgotPasswordService.sendResetCode(request.getPhone());
            return ResponseEntity.ok(ApiResponse.success("验证码已发送"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 验证验证码
     */
    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse> verifyCode(@RequestBody VerifyCodeRequest request) {
        try {
            forgotPasswordService.verifyResetCode(
                request.getPhone(), 
                request.getCode()
            );
            return ResponseEntity.ok(ApiResponse.success("验证成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 重置密码
     */
    @PostMapping("/reset")
    public ResponseEntity<ApiResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            forgotPasswordService.resetPassword(
                request.getPhone(),
                request.getCode(),
                request.getNewPassword()
            );
            return ResponseEntity.ok(ApiResponse.success("密码重置成功"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}
```

### Service

```java
@Service
public class ForgotPasswordService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private SmsService smsService; // 短信服务

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    /**
     * 发送重置密码验证码
     */
    public void sendResetCode(String phone) {
        // 1. 验证手机号格式
        if (!phone.matches("^1[3-9]\\d{9}$")) {
            throw new IllegalArgumentException("手机号格式不正确");
        }

        // 2. 检查手机号是否注册
        User user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new IllegalArgumentException("手机号未注册"));

        // 3. 检查发送频率（1分钟内只能发送1次）
        String limitKey = "reset_code_limit:" + phone;
        if (redisTemplate.hasKey(limitKey)) {
            throw new IllegalArgumentException("请稍后再试");
        }

        // 4. 生成6位验证码
        String code = String.format("%06d", new Random().nextInt(1000000));

        // 5. 存储到 Redis（5分钟有效）
        String codeKey = "reset_code:" + phone;
        redisTemplate.opsForValue().set(codeKey, code, 5, TimeUnit.MINUTES);

        // 6. 设置发送频率限制（1分钟）
        redisTemplate.opsForValue().set(limitKey, "1", 1, TimeUnit.MINUTES);

        // 7. 发送短信
        smsService.sendResetCode(phone, code);

        log.info("发送重置密码验证码: phone={}, code={}", phone, code);
    }

    /**
     * 验证重置密码验证码
     */
    public void verifyResetCode(String phone, String code) {
        // 1. 从 Redis 获取验证码
        String codeKey = "reset_code:" + phone;
        String storedCode = redisTemplate.opsForValue().get(codeKey);

        // 2. 验证码不存在或已过期
        if (storedCode == null) {
            throw new IllegalArgumentException("验证码已过期");
        }

        // 3. 验证码错误
        if (!storedCode.equals(code)) {
            // 记录错误次数
            String errorKey = "reset_code_error:" + phone;
            Long errorCount = redisTemplate.opsForValue().increment(errorKey);
            redisTemplate.expire(errorKey, 10, TimeUnit.MINUTES);

            if (errorCount >= 5) {
                // 错误5次，锁定10分钟
                redisTemplate.delete(codeKey);
                throw new IllegalArgumentException("验证码错误次数过多，请10分钟后重试");
            }

            throw new IllegalArgumentException("验证码错误");
        }

        // 4. 验证成功，标记已验证（延长有效期到10分钟）
        String verifiedKey = "reset_code_verified:" + phone;
        redisTemplate.opsForValue().set(verifiedKey, code, 10, TimeUnit.MINUTES);

        log.info("验证码验证成功: phone={}", phone);
    }

    /**
     * 重置密码
     */
    @Transactional
    public void resetPassword(String phone, String code, String newPassword) {
        // 1. 检查验证码是否已验证
        String verifiedKey = "reset_code_verified:" + phone;
        String verifiedCode = redisTemplate.opsForValue().get(verifiedKey);

        if (verifiedCode == null) {
            throw new IllegalArgumentException("请先验证验证码");
        }

        if (!verifiedCode.equals(code)) {
            throw new IllegalArgumentException("验证码不匹配");
        }

        // 2. 验证密码格式
        if (newPassword.length() < 6 || newPassword.length() > 20) {
            throw new IllegalArgumentException("密码长度必须在6-20位之间");
        }

        // 3. 查找用户
        User user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new IllegalArgumentException("用户不存在"));

        // 4. 加密新密码
        String encodedPassword = passwordEncoder.encode(newPassword);

        // 5. 更新密码
        user.setPassword(encodedPassword);
        userRepository.save(user);

        // 6. 删除 Redis 中的验证码记录
        redisTemplate.delete("reset_code:" + phone);
        redisTemplate.delete(verifiedKey);
        redisTemplate.delete("reset_code_error:" + phone);

        log.info("密码重置成功: phone={}", phone);
    }
}
```

### Request DTOs

```java
@Data
public class SendCodeRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;
}

@Data
public class VerifyCodeRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "验证码不能为空")
    private String code;
}

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "手机号不能为空")
    private String phone;

    @NotBlank(message = "验证码不能为空")
    private String code;

    @NotBlank(message = "新密码不能为空")
    @Size(min = 6, max = 20, message = "密码长度必须在6-20位之间")
    private String newPassword;
}
```

---

## 📱 短信服务集成

### 短信模板示例

```
【药物筛选平台】您的密码重置验证码是：{code}，5分钟内有效。如非本人操作，请忽略此短信。
```

### 短信服务商选择

推荐使用：
- 阿里云短信服务
- 腾讯云短信服务
- 华为云短信服务

### SmsService 接口

```java
public interface SmsService {
    /**
     * 发送重置密码验证码
     */
    void sendResetCode(String phone, String code);
}
```

---

## 🧪 测试用例

### 1. 正常流程测试

```bash
# 1. 发送验证码
curl -X POST http://localhost:8080/api/auth/forgot-password/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000"}'

# 2. 验证验证码
curl -X POST http://localhost:8080/api/auth/forgot-password/verify-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456"}'

# 3. 重置密码
curl -X POST http://localhost:8080/api/auth/forgot-password/reset \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","code":"123456","newPassword":"newpass123"}'
```

### 2. 异常情况测试

- ❌ 手机号未注册
- ❌ 验证码错误
- ❌ 验证码过期
- ❌ 验证码未验证就重置
- ❌ 密码格式不正确
- ❌ 频繁发送验证码

---

## 📊 监控和日志

### 日志记录

```java
log.info("发送重置密码验证码: phone={}, code={}", phone, code);
log.info("验证码验证成功: phone={}", phone);
log.info("密码重置成功: phone={}", phone);
log.warn("验证码错误: phone={}, errorCount={}", phone, errorCount);
log.error("重置密码失败: phone={}, error={}", phone, e.getMessage());
```

### 监控指标

- 验证码发送成功率
- 验证码验证成功率
- 密码重置成功率
- 平均处理时间
- 错误率

---

## 🔄 流程图

```
用户输入手机号
    ↓
发送验证码 → Redis存储(5分钟) → 短信发送
    ↓
用户输入验证码
    ↓
验证验证码 → Redis标记已验证(10分钟)
    ↓
用户输入新密码
    ↓
重置密码 → 更新数据库 → 删除Redis记录
    ↓
跳转登录页
```

---

## ⚠️ 注意事项

### 开发环境
- 可以在控制台打印验证码
- 可以设置固定验证码（如：123456）
- 不实际发送短信

### 生产环境
- 必须使用真实短信服务
- 必须启用频率限制
- 必须记录所有操作日志
- 建议添加图形验证码

---

**文档版本:** v1.0.0  
**创建时间:** 2026-01-24  
**适用范围:** 乳腺癌药物筛选平台
