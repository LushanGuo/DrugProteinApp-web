@echo off
echo ========================================
echo Unity 集成 - 快速启动脚本
echo ========================================
echo.

echo [1/3] 清理并重新生成 Android 项目（包含 Unity）...
call npx expo prebuild --platform android --clean

if %errorlevel% neq 0 (
    echo.
    echo ❌ Prebuild 失败！请检查错误信息。
    pause
    exit /b 1
)

echo.
echo [2/3] 编译并运行应用...
call npx expo run:android

if %errorlevel% neq 0 (
    echo.
    echo ❌ 运行失败！请检查错误信息。
    pause
    exit /b 1
)

echo.
echo ✅ 应用已启动！
echo.
echo 💡 提示：
echo - 打开应用后，点击任意化合物进入详情页
echo - 你应该能看到 Unity 3D 视图
echo - 尝试拖动、缩放、点击"重置视角"按钮
echo.
pause
