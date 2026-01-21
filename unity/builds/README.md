# Unity 导出文件目录

## 使用说明

这个目录用于存放从 Unity 导出的原生项目文件。

### Android
1. 在 Unity 中，选择 `File > Build Settings`
2. 选择 `Android` 平台
3. 勾选 `Export Project`
4. 导出到 `./unity/builds/android` 目录
5. 确保导出后包含 `unityLibrary` 文件夹

### iOS
1. 在 Unity 中，选择 `File > Build Settings`
2. 选择 `iOS` 平台
3. 导出到 `./unity/builds/ios` 目录

## 工作流程

使用方案 A（Config Plugins）后，你的工作流程是：

1. **Unity 侧**：修改游戏 → 导出到 `unity/builds/android` 或 `unity/builds/ios`
2. **React Native 侧**：
   ```bash
   # 重新生成原生代码（包含 Unity 配置）
   npx expo prebuild --platform android --clean
   
   # 编译并运行
   npx expo run:android
   ```

## 注意事项

- 不要手动修改 `android` 或 `ios` 文件夹中的代码
- 所有配置都通过 `app.json` 中的 plugins 来管理
- 每次 Unity 导出更新后，需要重新运行 `npx expo prebuild`
