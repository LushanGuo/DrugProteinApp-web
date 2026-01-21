# Unity 集成指南（方案 A - Config Plugins）

## ✅ 当前状态

你的项目已经成功配置为使用 **方案 A（Config Plugins）**，这意味着：

- ✅ Unity 项目已导出到 `unity/builds/android/`
- ✅ `app.json` 已配置 `@azesmway/react-native-unity` 插件
- ✅ `.gitignore` 已设置为不追踪自动生成的 `android/` 文件夹
- ✅ 项目根目录保持整洁

## 📁 项目结构

```
DrugScreenApp/
├── unity/builds/android/          # Unity 导出的 Android 项目
│   ├── unityLibrary/              # Unity 核心库（游戏逻辑、资源、原生代码）
│   ├── launcher/                  # Unity 启动器
│   ├── build.gradle
│   └── settings.gradle
│
├── app.json                       # 包含 Unity Config Plugin 配置
├── src/                           # React Native 代码
└── android/                       # 🚫 自动生成，不要手动修改！
```

## 🚀 下一步：生成并运行

### 1️⃣ 重新生成原生代码（包含 Unity 配置）

```bash
npx expo prebuild --platform android --clean
```

这个命令会：
- 删除旧的 `android/` 文件夹
- 根据 `app.json` 重新生成 `android/` 项目
- 自动集成 Unity（通过 Config Plugin）

### 2️⃣ 编译并运行

```bash
npx expo run:android
```

或者使用开发模式：

```bash
npm run android
```

## 🔄 日常工作流程

### 当你修改 Unity 游戏时：

1. 在 Unity 中修改游戏
2. 重新导出到 `unity/builds/android/`
3. 运行 `npx expo prebuild --platform android --clean`
4. 运行 `npx expo run:android`

### 当你修改 React Native 代码时：

- 直接修改 `src/` 下的代码
- 热重载会自动生效
- 不需要重新 prebuild

## 📝 在 React Native 中使用 Unity

安装完成后，你可以在代码中这样使用：

```typescript
import UnityView from '@azesmway/react-native-unity';

function GameScreen() {
  return (
    <UnityView
      style={{ flex: 1 }}
      onUnityMessage={(message) => {
        console.log('Unity 消息:', message);
      }}
    />
  );
}
```

## ⚠️ 重要提醒

### ✅ 应该做的：
- 修改 `app.json` 来配置 Unity 集成
- 把 Unity 导出文件放在 `unity/builds/android/`
- 提交 `unity/` 文件夹到 Git
- 每次 Unity 更新后运行 `npx expo prebuild`

### ❌ 不应该做的：
- ❌ 手动修改 `android/` 文件夹中的代码
- ❌ 把 `android/` 文件夹提交到 Git
- ❌ 直接编辑 `android/app/build.gradle` 或 `android/settings.gradle`

## 🔧 故障排查

### 如果遇到编译错误：

1. **清理并重新生成**：
   ```bash
   npx expo prebuild --platform android --clean
   ```

2. **清理 Gradle 缓存**：
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **删除 node_modules 并重新安装**：
   ```bash
   rm -rf node_modules
   npm install
   ```

### 如果 Unity 没有正确集成：

1. 检查 `app.json` 中的 `unityPath` 是否正确
2. 确认 `unity/builds/android/unityLibrary/` 存在
3. 查看 `npx expo prebuild` 的输出日志

## 📚 相关文档

- [Unity 项目结构说明](./unity/UNITY_PROJECT_STRUCTURE.md)
- [Unity 导出说明](./unity/builds/README.md)
- [@azesmway/react-native-unity 文档](https://github.com/azesmway/react-native-unity)
- [Expo Config Plugins 文档](https://docs.expo.dev/guides/config-plugins/)

## 🎯 方案 A 的优势

✅ **整洁**：原生代码自动生成，不污染项目  
✅ **可维护**：配置集中在 `app.json`  
✅ **可复现**：删除 `android/` 后可以完美重建  
✅ **易升级**：升级 React Native/Expo 版本更轻松  
✅ **团队协作**：减少原生代码冲突
