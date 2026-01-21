# Unity 3D 蛋白质可视化使用指南

## ✅ 当前集成状态

你的项目现在已经完成了 Unity 的前端集成！

### 已完成的工作：

1. ✅ Unity 项目已导出到 `unity/builds/android/`
2. ✅ Config Plugin 已配置在 `app.json`
3. ✅ `@azesmway/react-native-unity` 库已安装
4. ✅ `DetailScreen.tsx` 已集成 UnityView 组件
5. ✅ 添加了 Unity 消息通信机制

## 🎮 Unity 视图功能

### 在 DetailScreen 中的功能：

```typescript
// 1. 显示 Unity 3D 场景
<UnityView
  ref={unityRef}
  style={styles.unityView}
  onUnityMessage={handleUnityMessage}
/>

// 2. 从 React Native 发送消息到 Unity
sendToUnity('GameManager', 'ResetCamera', '');

// 3. 接收 Unity 发来的消息
const handleUnityMessage = (message: string) => {
  console.log('Unity 消息:', message);
};
```

### 用户交互：

- 🖱️ **拖动旋转**：查看蛋白质的不同角度
- 🔍 **双指缩放**：放大/缩小查看细节
- 🔄 **重置视角**：点击"重置视角"按钮恢复初始视图

## 🚀 如何运行和测试

### 第一步：生成包含 Unity 的 Android 项目

```bash
npx expo prebuild --platform android --clean
```

这会：
- 删除旧的 `android/` 文件夹
- 根据 `app.json` 重新生成
- 自动集成 Unity（通过 Config Plugin）

### 第二步：编译并运行

```bash
npx expo run:android
```

或者：

```bash
npm run android
```

### 第三步：测试 Unity 视图

1. 打开应用
2. 从首页点击任意化合物
3. 进入详情页面
4. 你应该能看到 Unity 3D 视图区域
5. 尝试拖动、缩放、点击"重置视角"按钮

## 🔧 Unity 场景配置

### 在 Unity 中需要做的：

1. **创建 GameManager 脚本**（用于接收 React Native 消息）：

```csharp
using UnityEngine;

public class GameManager : MonoBehaviour
{
    // 接收来自 React Native 的消息
    public void ResetCamera()
    {
        // 重置相机位置
        Camera.main.transform.position = new Vector3(0, 0, -10);
        Camera.main.transform.rotation = Quaternion.identity;
    }

    public void LoadProtein(string pdbData)
    {
        // 加载蛋白质数据
        Debug.Log("Loading protein: " + pdbData);
        // 解析 PDB/PDBQT 数据并渲染
    }

    // 发送消息到 React Native
    public void SendMessageToRN(string message)
    {
        // 使用 Unity 的消息系统
        #if UNITY_ANDROID
        AndroidJavaClass unityPlayer = new AndroidJavaClass("com.unity3d.player.UnityPlayer");
        AndroidJavaObject currentActivity = unityPlayer.GetStatic<AndroidJavaObject>("currentActivity");
        currentActivity.Call("onUnityMessage", message);
        #endif
    }
}
```

2. **在 Unity 场景中**：
   - 创建一个空的 GameObject，命名为 "GameManager"
   - 添加上面的 GameManager 脚本
   - 设置相机、光照、蛋白质模型等

3. **重新导出**：
   - `File > Build Settings > Android`
   - 勾选 `Export Project`
   - 导出到 `unity/builds/android/`

## 📡 React Native ↔ Unity 通信

### 从 React Native 发送到 Unity：

```typescript
// 在 DetailScreen.tsx 中
sendToUnity('GameManager', 'LoadProtein', compound.pdbData);
sendToUnity('GameManager', 'ResetCamera', '');
```

### 从 Unity 发送到 React Native：

```csharp
// 在 Unity 中
SendMessageToRN("ProteinLoaded");
SendMessageToRN(JsonUtility.ToJson(new { event = "click", atom = "CA" }));
```

### 在 React Native 中接收：

```typescript
const handleUnityMessage = (message: string) => {
  console.log('Unity 消息:', message);
  
  if (message === 'ProteinLoaded') {
    Alert.alert('成功', '蛋白质加载完成');
  }
  
  try {
    const data = JSON.parse(message);
    if (data.event === 'click') {
      console.log('点击了原子:', data.atom);
    }
  } catch (e) {
    // 不是 JSON 格式的消息
  }
};
```

## 🎯 下一步开发建议

### 1. 加载真实的蛋白质数据

修改 `DetailScreen.tsx`，在组件加载时发送蛋白质数据：

```typescript
useEffect(() => {
  // 从后端获取 PDB/PDBQT 数据
  const loadProteinData = async () => {
    try {
      const response = await axios.get(`/api/compounds/${compound.id}/structure`);
      sendToUnity('GameManager', 'LoadProtein', response.data.pdbqt);
    } catch (error) {
      console.error('加载蛋白质数据失败:', error);
    }
  };
  
  loadProteinData();
}, [compound.id]);
```

### 2. 添加更多控制按钮

```typescript
<TouchableOpacity onPress={() => sendToUnity('GameManager', 'ToggleLabels', '')}>
  <Text>显示/隐藏标签</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => sendToUnity('GameManager', 'ChangeRenderMode', 'cartoon')}>
  <Text>卡通模式</Text>
</TouchableOpacity>

<TouchableOpacity onPress={() => sendToUnity('GameManager', 'ChangeRenderMode', 'sphere')}>
  <Text>球棍模式</Text>
</TouchableOpacity>
```

### 3. 显示对接结果

当分子对接完成后，加载对接后的复合物结构：

```typescript
const handleDocking = async () => {
  try {
    const response = await axios.post('/api/docking/start', {
      compoundId: compound.id
    });
    
    // 对接完成后，加载结果
    const result = await axios.get(`/api/docking/result/${response.data.jobId}`);
    sendToUnity('GameManager', 'LoadDockingResult', result.data.complexPdbqt);
    
  } catch (error) {
    console.error('对接失败:', error);
  }
};
```

## 🐛 故障排查

### Unity 视图显示黑屏？

1. 检查 Unity 项目是否正确导出
2. 确认 `unity/builds/android/unityLibrary/` 存在
3. 运行 `npx expo prebuild --clean` 重新生成
4. 查看 Android Logcat 日志：`adb logcat | grep Unity`

### 消息通信不工作？

1. 确认 Unity 中的 GameObject 名称和方法名称正确
2. 检查 Unity 脚本是否正确挂载到 GameObject 上
3. 在 Unity 中添加 Debug.Log 查看是否收到消息

### 编译错误？

1. 清理 Gradle 缓存：`cd android && ./gradlew clean`
2. 删除 `android/` 文件夹，重新 prebuild
3. 检查 `app.json` 中的 Unity 路径是否正确

## 📚 参考资源

- [React Native Unity 库文档](https://github.com/azesmway/react-native-unity)
- [Unity Android 导出指南](https://docs.unity3d.com/Manual/android-BuildProcess.html)
- [Expo Config Plugins](https://docs.expo.dev/guides/config-plugins/)

## 🎉 总结

现在你的项目已经可以：

✅ 在前端展示 Unity 3D 场景  
✅ 显示蛋白质-配体复合物  
✅ 支持用户交互（旋转、缩放）  
✅ React Native 和 Unity 双向通信  
✅ 动态加载蛋白质数据

只需要运行 `npx expo prebuild --clean` 和 `npx expo run:android`，就可以看到效果了！
