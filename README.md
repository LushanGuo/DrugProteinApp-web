# 乳腺癌药物筛选平台 - 移动端

基于 React Native + Expo 开发的乳腺癌药物筛选移动应用，针对 CDK2/1e9h 靶点进行药物分子筛选和评分分析。

## 📱 功能特性

### 核心功能
- ✅ **用户认证** - 登录、注册、忘记密码
- ✅ **化合物浏览** - 分子库列表、搜索、分类筛选
- ✅ **3D 可视化** - 蛋白质-配体复合物 3D 展示
- ✅ **评分分析** - 效能、安全性、类药性综合评分
- ✅ **退出登录** - 安全退出，清除本地数据

### 技术亮点
- 🎨 现代化 UI 设计（Material Design）
- 🔐 JWT Token 认证
- 📊 实时数据可视化
- 🧬 分子结构 3D 渲染
- 📱 响应式布局

## 🚀 快速开始

### 环境要求
- Node.js >= 16
- npm 或 yarn
- Expo CLI
- Android Studio（Android 开发）或 Xcode（iOS 开发）

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

### 运行应用
```bash
# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📁 项目结构

```
DrugScreenApp/
├── src/
│   ├── components/          # React 组件
│   │   ├── 3d/             # 3D 可视化组件
│   │   └── CompoundCard.tsx
│   ├── screens/            # 页面组件
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ForgotPasswordScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── DetailScreen.tsx
│   │   └── ReportScreen.tsx
│   ├── services/           # API 服务
│   │   └── api.ts
│   ├── types/              # TypeScript 类型
│   │   ├── api.ts
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   ├── moleculeUtils.ts
│   │   ├── storage.ts
│   │   └── validators.ts
│   ├── config.ts           # 配置文件
│   └── theme.ts            # 主题配置
├── assets/                 # 静态资源
├── docs/                   # 文档目录
├── App.tsx                 # 应用入口
├── app.json                # Expo 配置
├── package.json            # 依赖配置
└── tsconfig.json           # TypeScript 配置
```

## 🔌 API 配置

### 修改后端地址
编辑 `src/services/api.ts`：
```typescript
const API_BASE_URL = 'http://192.168.3.254:8080'; // 修改为你的后端地址
```

### API 端点
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/forgot-password/send-code` - 发送验证码
- `POST /api/auth/forgot-password/verify-code` - 验证验证码
- `POST /api/auth/forgot-password/reset` - 重置密码
- `GET /api/compounds` - 获取化合物列表
- `GET /api/compounds/{id}` - 获取化合物详情
- `GET /api/visual/{id}` - 获取 3D 可视化数据
- `POST /api/analysis/{id}/calculate` - 计算评分

## 🎨 主要页面

### 1. 登录页面
- 手机号 + 密码登录
- 忘记密码入口
- 注册引导

### 2. 注册页面
- 手机号、邮箱、密码注册
- 表单验证
- 自动生成测试数据

### 3. 忘记密码
- 三步流程：验证手机 → 输入验证码 → 设置新密码
- 60秒倒计时
- 步骤指示器

### 4. 主页
- 化合物列表
- 搜索功能
- 分类筛选
- 退出登录

### 5. 详情页
- 化合物基本信息
- 3D 分子结构可视化
- 蛋白质-配体复合物展示

### 6. 评分报告
- 效能评分
- 安全性评分
- 类药性评分
- 专家建议

## 🔐 认证流程

### 登录
1. 用户输入手机号和密码
2. 前端验证格式
3. 调用登录 API
4. 保存 JWT Token 到 AsyncStorage
5. 跳转到主页

### Token 管理
- 登录成功后自动保存 Token
- 所有 API 请求自动携带 Token
- Token 存储在 AsyncStorage
- 退出登录时清除 Token

### 忘记密码
1. 输入手机号 → 发送验证码
2. 输入验证码 → 验证
3. 设置新密码 → 完成重置

## 🧬 3D 可视化

### 技术栈
- `@react-three/fiber` - React 的 Three.js 渲染器
- `@react-three/drei` - Three.js 辅助工具
- `three` - 3D 图形库

### 功能
- 蛋白质 Ribbon/Cartoon 表示
- 配体球棍模型
- 交互式旋转、缩放
- 彩虹色骨架渲染

## 📦 主要依赖

```json
{
  "react-native": "0.81.5",
  "expo": "~54.0.0",
  "react-navigation": "^7.x",
  "@react-three/fiber": "^9.0.0",
  "axios": "^1.13.2",
  "@react-native-async-storage/async-storage": "latest",
  "react-native-vector-icons": "latest"
}
```

## 🎯 开发指南

### 添加新页面
1. 在 `src/screens/` 创建页面组件
2. 在 `src/types/index.ts` 添加路由类型
3. 在 `App.tsx` 注册路由

### 添加新 API
1. 在 `src/types/api.ts` 定义类型
2. 在 `src/services/api.ts` 添加方法
3. 在页面中调用

### 样式规范
- 使用 StyleSheet 创建样式
- 主色调：#4CAF50（绿色）
- 圆角：12-25px
- 阴影：elevation 或 shadowColor

## 🧪 测试

### 运行测试
```bash
npm test
```

### 测试账号
- 手机号：13800138000
- 密码：123456

## 📝 文档

### 用户文档
- [README.md](README.md) - 项目概述和快速开始
- [CHANGELOG.md](CHANGELOG.md) - 版本更新日志
- [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南

### 技术文档
- [项目结构说明](docs/PROJECT_STRUCTURE.md) - 详细的项目结构和文件说明
- [忘记密码 - 前端](docs/FORGOT_PASSWORD_FRONTEND.md) - 忘记密码功能前端实现
- [忘记密码 - 后端](docs/FORGOT_PASSWORD_BACKEND.md) - 忘记密码功能后端实现指南

## 🔧 配置文件

### app.json
Expo 应用配置，包含应用名称、图标、启动画面等。

### tsconfig.json
TypeScript 编译配置。

### babel.config.js
Babel 转译配置，支持 Expo 和 React Native。

## 🐛 常见问题

### 1. 无法连接后端
- 检查 API_BASE_URL 是否正确
- 确认后端服务已启动
- 确认手机/模拟器与电脑在同一网络

### 2. 3D 模型不显示
- 检查后端是否返回 PDB/PDBQT 数据
- 查看控制台错误日志
- 确认数据格式正确

### 3. Token 过期
- 重新登录获取新 Token
- Token 有效期为 24 小时

## 🚀 部署

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

## 📄 许可证

本项目仅供科研使用。

## 👥 贡献者

- 前端开发：Kiro AI Assistant
- 后端开发：待补充
- UI 设计：待补充

## 📞 联系方式

如有问题，请联系项目管理员。

---

**版本：** v1.0.0  
**最后更新：** 2026-01-24  
**技术栈：** React Native + Expo + TypeScript
