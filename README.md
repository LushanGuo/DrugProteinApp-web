# 药物筛选平台移动端应用

这是一个基于 React Native + Expo 开发的药物筛选平台移动端应用，用于浏览和搜索化合物信息。

## 功能特性

✅ **化合物列表浏览**
- 支持分页加载（每页10条）
- 下拉刷新
- 上拉加载更多

✅ **搜索功能**
- 支持中文名和英文名模糊搜索
- 实时搜索结果

✅ **分类筛选**
- 按化合物类别筛选（黄酮类、生物碱类、木脂素类等）

✅ **化合物详情**
- 查看完整的化合物信息
- 包含分子量、LogP、SMILES 结构式等

## API 接口

应用对接以下后端接口：

### 1. 获取化合物列表
```
GET /api/compounds?page=0&size=10&keyword=槲皮素
```

### 2. 获取化合物详情
```
GET /api/compounds/{id}
```

## 安装和运行

### 前置要求
- Node.js 16+
- npm 或 yarn
- Expo CLI

### 安装依赖
```bash
npm install
```

### 配置后端地址

编辑 `src/services/api.ts` 文件，修改 `BASE_URL`：

```typescript
// Android 模拟器
const BASE_URL = 'http://10.0.2.2:8080/api';

// iOS 模拟器或真机（替换为你的电脑 IP）
const BASE_URL = 'http://192.168.1.100:8080/api';
```

### 启动应用

```bash
# 启动开发服务器
npm start

# 在 Android 上运行
npm run android

# 在 iOS 上运行
npm run ios

# 在 Web 上运行
npm run web
```

## 项目结构

```
├── App.tsx                          # 应用入口
├── src/
│   ├── components/
│   │   └── CompoundCard.tsx         # 化合物卡片组件
│   ├── screens/
│   │   ├── HomeScreen.tsx           # 主页面
│   │   └── CompoundDetailScreen.tsx # 详情页面
│   ├── services/
│   │   └── api.ts                   # API 服务
│   ├── types/
│   │   └── index.ts                 # TypeScript 类型定义
│   └── theme.ts                     # 主题配置
└── package.json
```

## 技术栈

- **React Native** - 跨平台移动应用框架
- **Expo** - React Native 开发工具链
- **TypeScript** - 类型安全
- **Axios** - HTTP 客户端
- **Expo Vector Icons** - 图标库

## 开发说明

### 添加新功能

1. 在 `src/services/api.ts` 中添加新的 API 方法
2. 在 `src/types/index.ts` 中定义相关类型
3. 在相应的 Screen 中实现 UI 和逻辑

### 调试技巧

- 使用 `console.log()` 查看日志
- 在 Expo 开发工具中查看网络请求
- 使用 React Native Debugger 进行调试

## 常见问题

### 1. 无法连接到后端服务器

确保：
- 后端服务已启动（http://localhost:8080）
- 防火墙允许连接
- BASE_URL 配置正确（模拟器使用 10.0.2.2，真机使用电脑 IP）

### 2. 搜索功能不工作

检查后端 API 是否支持 `keyword` 参数

### 3. 图标不显示

运行 `expo install @expo/vector-icons` 重新安装图标库

## License

MIT
