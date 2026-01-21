# Unity Android 项目结构

## 📁 完整目录结构

```
unity/builds/android/
├── 📄 build.gradle                    # Unity 项目的主构建文件
├── 📄 settings.gradle                 # Gradle 设置文件
├── 📄 gradle.properties               # Gradle 属性配置
├── 📄 local.properties                # 本地环境配置（SDK 路径等）
│
├── 📁 gradle/                         # Gradle Wrapper
│   └── wrapper/
│       └── gradle-wrapper.properties
│
├── 📁 launcher/                       # Unity 启动器模块
│   ├── build.gradle
│   └── src/main/
│
└── 📁 unityLibrary/                   # Unity 核心库 ⭐
    ├── 📄 build.gradle                # Unity 库的构建配置
    ├── 📄 proguard-unity.txt          # ProGuard 混淆规则
    │
    ├── 📁 libs/
    │   └── unity-classes.jar          # Unity 核心类库
    │
    └── 📁 src/main/
        ├── 📄 AndroidManifest.xml     # Unity 的 Android 清单
        │
        ├── 📁 assets/                 # Unity 游戏资源 🎮
        │   └── bin/Data/
        │       ├── boot.config
        │       ├── data.unity3d       # Unity 场景和资源数据
        │       ├── unity default resources
        │       ├── RuntimeInitializeOnLoads.json
        │       ├── ScriptingAssemblies.json
        │       ├── unity_app_guid
        │       └── Managed/           # C# 托管代码程序集
        │
        ├── 📁 java/                   # Unity Java 代码
        │   └── com/unity3d/player/
        │
        ├── 📁 jniLibs/                # 原生库 (.so 文件)
        │   └── armeabi-v7a/
        │       ├── libmain.so
        │       ├── libunity.so
        │       ├── libmono-native.so
        │       ├── libmonobdwgc-2.0.so
        │       └── libMonoPosixHelper.so
        │
        ├── 📁 res/                    # Android 资源
        │   ├── values/
        │   │   ├── colors.xml
        │   │   ├── styles.xml
        │   │   ├── ids.xml
        │   │   └── freeformwindow.xml
        │   ├── values-v21/
        │   ├── values-v30/
        │   └── values-v31/
        │
        └── 📁 resources/
            └── META-INF/
                └── com.android.games.engine.build_fingerprint
```

## 🔑 关键组件说明

### 1. unityLibrary（核心模块）
这是 Unity 导出的主要库，包含：
- **游戏逻辑**：C# 脚本编译后的程序集（Managed/）
- **游戏资源**：场景、材质、纹理等（data.unity3d）
- **原生代码**：Unity 引擎的 C++ 库（.so 文件）
- **Unity Player**：Unity 播放器的 Java 代码

### 2. launcher（启动器模块）
Unity 默认的启动器应用，通常在集成到 React Native 时不会直接使用。

### 3. 原生库架构
当前支持的 CPU 架构：
- ✅ **armeabi-v7a**（32位 ARM）

如果需要支持更多架构，需要在 Unity 中重新导出：
- arm64-v8a（64位 ARM）
- x86（32位 Intel）
- x86_64（64位 Intel）

## 📊 文件大小统计

主要组件：
- `data.unity3d` - Unity 场景和资源包
- `libunity.so` - Unity 引擎核心库
- `unity-classes.jar` - Unity Java 类库
- `Managed/` - C# 程序集

## 🔄 工作流程

1. **Unity 导出** → `unity/builds/android/`
2. **Expo Prebuild** → 读取 `app.json` 配置 → 自动集成到 `android/` 文件夹
3. **编译运行** → `npx expo run:android`

## ⚠️ 注意事项

- ✅ 这个目录应该被 Git 追踪（包含 Unity 导出的文件）
- ❌ 生成的 `android/` 文件夹不应该被追踪（已在 .gitignore 中配置）
- 🔄 每次 Unity 更新后，需要重新导出并运行 `npx expo prebuild`
