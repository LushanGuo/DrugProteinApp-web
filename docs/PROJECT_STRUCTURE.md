# 项目结构说明

## 📁 目录结构

```
DrugScreenApp/
├── .expo/                      # Expo 配置文件
├── .git/                       # Git 版本控制
├── assets/                     # 静态资源
│   ├── adaptive-icon.png
│   ├── favicon.png
│   ├── icon.png
│   └── splash-icon.png
├── node_modules/               # 依赖包
├── src/                        # 源代码目录
│   ├── components/             # React 组件
│   │   ├── 3d/                # 3D 可视化组件
│   │   │   ├── LigandModel.tsx
│   │   │   ├── MoleculeViewer.tsx
│   │   │   ├── ProteinModel.tsx
│   │   │   ├── RainbowProtein.tsx
│   │   │   └── StickLigand.tsx
│   │   └── CompoundCard.tsx   # 化合物卡片组件
│   ├── screens/               # 页面组件
│   │   ├── DetailScreen.tsx   # 化合物详情页（含3D可视化）
│   │   ├── HomeScreen.tsx     # 主页（化合物列表）
│   │   ├── LoginScreen.tsx    # 登录页
│   │   ├── RegisterScreen.tsx # 注册页
│   │   └── ReportScreen.tsx   # 评分报告页
│   ├── services/              # API 服务
│   │   └── api.ts            # API 封装（axios）
│   ├── types/                 # TypeScript 类型定义
│   │   ├── api.ts            # API 响应类型
│   │   └── index.ts          # 通用类型
│   ├── utils/                 # 工具函数
│   │   ├── moleculeUtils.ts  # 分子数据解析工具
│   │   ├── storage.ts        # AsyncStorage 封装
│   │   └── validators.ts     # 表单验证工具
│   ├── config.ts             # 配置文件
│   └── theme.ts              # 主题配置
├── .gitignore                 # Git 忽略文件
├── .npmrc                     # npm 配置
├── API_COMPARISON.md          # 前后端接口对比文档
├── app.json                   # Expo 应用配置
├── App.tsx                    # 应用入口文件
├── AUTH_INTEGRATION.md        # 认证系统集成文档
├── babel.config.js            # Babel 配置
├── package.json               # 项目依赖配置
├── package-lock.json          # 依赖锁定文件
├── README.md                  # 项目说明文档
└── tsconfig.json              # TypeScript 配置
```

## 📄 核心文件说明

### 应用入口
- **App.tsx** - 应用主入口，包含导航配置和认证检查逻辑

### 页面组件
- **LoginScreen.tsx** - 用户登录界面
- **RegisterScreen.tsx** - 用户注册界面
- **HomeScreen.tsx** - 化合物列表展示
- **DetailScreen.tsx** - 化合物详情和 3D 可视化
- **ReportScreen.tsx** - 化合物评分报告

### 3D 可视化组件
- **MoleculeViewer.tsx** - 3D 场景容器
- **ProteinModel.tsx** - 蛋白质模型渲染
- **LigandModel.tsx** - 配体模型渲染
- **RainbowProtein.tsx** - 彩虹色蛋白质骨架
- **StickLigand.tsx** - 球棍模型配体

### API 服务
- **api.ts** - 统一的 API 接口封装
  - compoundAPI - 化合物相关接口
  - visualAPI - 3D 可视化接口
  - analysisAPI - 评分分析接口
  - authAPI - 认证相关接口

### 工具函数
- **storage.ts** - AsyncStorage 封装（token、用户信息存储）
- **validators.ts** - 表单验证函数
- **moleculeUtils.ts** - PDB/PDBQT 文件解析

## 🔧 配置文件

### app.json
Expo 应用配置，包含应用名称、图标、启动画面等

### tsconfig.json
TypeScript 编译配置

### babel.config.js
Babel 转译配置，支持 Expo 和 React Native

### package.json
项目依赖和脚本配置

## 📚 文档文件

### API_COMPARISON.md
前后端接口对比检查报告，详细说明所有 API 接口的请求/响应格式

### AUTH_INTEGRATION.md
认证系统集成文档，说明登录/注册功能的实现细节

### README.md
项目总体说明文档

## 🚀 启动命令

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 在 Android 上运行
npm run android

# 在 iOS 上运行
npm run ios

# 在 Web 上运行
npm run web
```

## 🔑 环境配置

API 基础地址配置在 `src/services/api.ts` 中：
```typescript
const API_BASE_URL = 'http://192.168.3.254:8080';
```

根据实际情况修改为你的后端服务器地址。

## 📦 主要依赖

- **React Native** - 移动应用框架
- **Expo** - React Native 开发工具
- **React Navigation** - 导航库
- **@react-three/fiber** - React 的 Three.js 渲染器
- **@react-three/drei** - Three.js 辅助工具
- **axios** - HTTP 客户端
- **AsyncStorage** - 本地存储
- **react-native-vector-icons** - 图标库
- **react-native-paper** - UI 组件库

## 🎨 主题配置

主题颜色配置在 `src/theme.ts` 中，主色调为绿色系（#4CAF50）。

## 🔐 认证流程

1. 应用启动时检查 AsyncStorage 中的 token
2. 有 token → 进入主页
3. 无 token → 显示登录页
4. 登录成功后保存 token 并跳转主页
5. 所有 API 请求自动携带 Bearer token

## 📱 功能模块

### 认证模块
- 用户注册
- 用户登录
- Token 管理
- 自动登录

### 化合物模块
- 化合物列表展示
- 化合物详情查看
- 3D 分子结构可视化
- 化合物评分分析

### 3D 可视化模块
- 蛋白质 Ribbon/Cartoon 表示
- 配体球棍模型
- 交互式旋转、缩放
- 彩虹色骨架渲染

---

**项目版本：** v1.0.0  
**最后更新：** 2026-01-24
