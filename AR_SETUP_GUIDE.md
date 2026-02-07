# AR功能设置指南

## 📱 AR效果说明

AR（增强现实）模式让3D分子模型根据手机的倾斜角度实时移动和旋转，创造出"悬浮立体"的视觉效果。

## ✅ 已完成的配置

### 1. 依赖安装
```bash
npm install expo-sensors
```

### 2. 权限配置（app.json）
已添加以下配置：

**iOS权限：**
```json
"ios": {
  "infoPlist": {
    "NSMotionUsageDescription": "此应用需要访问设备运动传感器以提供AR分子查看体验"
  }
}
```

**Android权限：**
```json
"android": {
  "permissions": [
    "android.permission.BODY_SENSORS"
  ]
}
```

**Expo插件：**
```json
"plugins": [
  "expo-font",
  [
    "expo-sensors",
    {
      "motionPermission": "允许DrugScreenApp访问设备运动传感器以提供AR分子查看体验"
    }
  ]
]
```

## 🚀 使用步骤

### 步骤1: 重新构建应用
由于修改了 `app.json` 和添加了新的原生依赖，需要重新构建：

```bash
# 清除缓存
npx expo start -c

# 或者重新安装
rm -rf node_modules
npm install
npx expo prebuild --clean
```

### 步骤2: 在真机上测试
AR功能需要在真实设备上测试（模拟器不支持陀螺仪）：

```bash
# Android
npx expo run:android

# iOS
npx expo run:ios
```

### 步骤3: 授予权限
首次运行时，应用会请求运动传感器权限：
- **iOS**: 会弹出权限对话框，点击"允许"
- **Android**: 会自动授予（BODY_SENSORS权限）

### 步骤4: 使用AR模式
1. 打开任意化合物详情页
2. 点击左上角的 **"3D"** 按钮切换到 **"AR"** 模式
3. 倾斜手机，观察分子模型随手机移动

## 🎯 AR效果特性

### 视差效果
- **左右倾斜**: 分子左右移动
- **前后倾斜**: 分子上下移动
- **旋转**: 分子随手机倾斜角度旋转

### 效果强度
- 位置偏移: 最大 ±8 单位
- 旋转角度: 根据手机倾斜角度的 50%
- 平滑插值: 避免抖动，响应流畅

## 🔍 调试信息

### 开发模式下的调试
在开发模式（`__DEV__`）下，会显示调试信息：
- AR传感器状态
- 设备旋转角度（每秒更新）
- 控制台日志

### 检查传感器可用性
打开应用后，查看控制台日志：
```
✅ AR传感器可用
🎬 开始监听设备运动传感器...
📱 设备旋转: { beta: 45.2, gamma: -12.5 }
```

如果看到：
```
❌ AR传感器不可用
```
说明设备不支持运动传感器。

## ⚠️ 常见问题

### Q1: AR按钮点击后没有效果
**原因**: 设备不支持运动传感器或权限未授予

**解决方案**:
1. 确认在真机上测试（不是模拟器）
2. 检查权限设置：设置 → DrugScreenApp → 权限
3. 查看控制台是否有错误信息

### Q2: 分子移动不明显
**原因**: 手机倾斜角度太小

**解决方案**:
1. 尝试更大幅度地倾斜手机（前后左右各30-45度）
2. 在全屏模式下测试（效果更明显）

### Q3: 分子移动有延迟或抖动
**原因**: 设备性能或传感器精度问题

**解决方案**:
1. 关闭其他后台应用
2. 调整 `ARParallax` 组件的 `intensity` 参数（降低到 0.5）
3. 调整 `lerpFactor` 参数（降低到 0.05）

### Q4: iOS上没有权限弹窗
**原因**: 需要重新构建应用

**解决方案**:
```bash
# 清除构建缓存
rm -rf ios android
npx expo prebuild --clean
npx expo run:ios
```

### Q5: Android上传感器不工作
**原因**: 权限配置问题

**解决方案**:
1. 检查 `app.json` 中的 `android.permissions`
2. 手动授予权限：设置 → 应用 → DrugScreenApp → 权限 → 身体传感器
3. 重新安装应用

## 📊 技术细节

### 传感器数据
使用 `expo-sensors` 的 `DeviceMotion` API：
- **beta**: 前后倾斜角度 (-180° 到 180°)
- **gamma**: 左右倾斜角度 (-90° 到 90°)
- **alpha**: 指南针方向 (0° 到 360°)

### 坐标映射
```javascript
// 位置偏移
x = sin(gamma) * 8
y = -sin(beta) * 5.6
z = cos(beta) * 4

// 旋转角度
rotationX = beta * 0.5
rotationY = gamma * 0.5
rotationZ = gamma * 0.15
```

### 性能优化
- 更新频率: 60fps (16ms)
- 平滑插值: lerp factor = 0.1
- 仅在AR模式启用时监听传感器

## 🎨 UI改进

### 简化显示模式
- 移除了"现代"、"表面"、"彩虹"模式
- 只保留"卡通"模式（最美观）
- 简化了UI，减少选择困扰

### AR指示器
- **3D按钮**: 灰色背景，表示普通3D模式
- **AR按钮**: 绿色背景，表示AR模式已启用
- **提示文字**: "倾斜手机查看AR效果"

## 🔧 自定义配置

### 调整AR效果强度
编辑 `src/screens/DetailScreen.tsx`:

```typescript
<ARParallax 
  enabled={arMode && arAvailable}
  targetGroup={sceneGroupRef.current}
  intensity={0.7}  // 调整这个值 (0.0 - 1.0)
/>
```

### 调整响应速度
编辑 `src/components/3d/ARParallax.tsx`:

```typescript
const lerpFactor = 0.1;  // 调整这个值
// 0.05 = 慢速平滑
// 0.1 = 中速（默认）
// 0.2 = 快速响应
```

## 📱 测试设备要求

### 支持的设备
- ✅ iPhone 6s 及以上（带陀螺仪）
- ✅ 大部分Android手机（2016年后）
- ❌ 模拟器（不支持）
- ❌ 部分低端设备（无陀螺仪）

### 推荐测试环境
- iOS 13.0+
- Android 8.0+
- 良好的光线环境
- 稳定的手持姿势

## 🎉 完成！

现在你的应用已经支持AR功能了！在真机上测试，倾斜手机，享受3D分子的"悬浮立体"效果吧！
