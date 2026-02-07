# Git 提交指南

## 📋 提交步骤

### 1. 查看当前状态
```bash
git status
```

### 2. 添加所有更改
```bash
git add .
```

### 3. 提交更改
```bash
git commit -m "feat: 完成3D分子可视化和AR增强现实功能

- 集成6个后端接口（分子对接 + ADMET预测）
- 实现ADMET五维雷达图
- 添加卡通模式蛋白质渲染
- 实现AR增强现实效果（陀螺仪控制）
- 添加科学的分子对接动画
- 优化3D场景光照和材质
- 添加全屏查看模式
- 实现实时角度显示器"
```

### 4. 推送到远程仓库
```bash
git push origin main
```
（如果你的主分支是master，使用 `git push origin master`）

---

## 📦 本次提交包含的主要文件

### 新增文件
- `src/components/3d/CartoonProtein.tsx` - 卡通蛋白质渲染
- `src/components/3d/StickLigand.tsx` - 球棍配体渲染
- `src/components/3d/DockingAnimation.tsx` - 对接动画
- `src/components/3d/ARParallax.tsx` - AR视差效果
- `src/components/RadarChart.tsx` - 五角雷达图
- `src/utils/admetUtils.ts` - ADMET数据处理工具
- `AR_SETUP_GUIDE.md` - AR功能设置指南
- `FINAL_IMPLEMENTATION_SUMMARY.md` - 最终实现总结

### 修改文件
- `src/screens/DetailScreen.tsx` - 详情页（添加3D+AR+雷达图）
- `src/screens/ReportScreen.tsx` - 报告页（简化）
- `src/services/api.ts` - API接口（添加对接和ADMET接口）
- `src/types/api.ts` - 类型定义（添加新接口类型）
- `app.json` - 添加传感器权限配置
- `package.json` - 添加expo-sensors依赖

### 删除文件
- 已删除所有临时文档和未使用的组件

---

## 🔍 提交前检查清单

- [x] 删除未使用的组件
- [x] 删除临时文档
- [x] 保留重要文档（README, AR_SETUP_GUIDE, FINAL_IMPLEMENTATION_SUMMARY）
- [ ] 确认所有功能正常工作
- [ ] 确认没有敏感信息（API密钥、密码等）
- [ ] 确认.gitignore配置正确

---

## 📝 .gitignore 检查

确保以下内容在 `.gitignore` 中：
```
node_modules/
.expo/
.expo-shared/
npm-debug.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/
dist/
```

---

## 🚀 快速提交命令（一键执行）

```bash
git add . && git commit -m "feat: 完成3D分子可视化和AR增强现实功能" && git push
```

---

## 📊 提交统计

### 功能模块
1. **3D可视化** - 卡通蛋白质 + 球棍配体
2. **AR增强现实** - 陀螺仪控制分子移动
3. **分子对接** - 三阶段科学动画
4. **ADMET预测** - 五维雷达图展示
5. **全屏查看** - 沉浸式3D体验

### 代码统计
- 新增组件: 5个
- 修改文件: 6个
- 删除文件: 13个
- 新增依赖: 1个（expo-sensors）

---

## ⚠️ 注意事项

1. **首次推送**：如果是首次推送到新仓库，可能需要：
   ```bash
   git remote add origin <你的仓库URL>
   git branch -M main
   git push -u origin main
   ```

2. **冲突处理**：如果有冲突，先拉取远程更改：
   ```bash
   git pull origin main --rebase
   # 解决冲突后
   git add .
   git rebase --continue
   git push
   ```

3. **大文件警告**：如果有大文件警告，检查是否误提交了：
   - node_modules/
   - .expo/
   - 其他构建产物

---

## 🎉 提交完成后

提交成功后，你可以：
1. 在GitHub/GitLab上查看提交记录
2. 创建Pull Request（如果使用分支开发）
3. 添加Release标签（如 v1.0.0）
4. 更新项目文档

---

## 📞 遇到问题？

常见问题解决：

**问题1**: `fatal: not a git repository`
```bash
git init
git remote add origin <你的仓库URL>
```

**问题2**: `Permission denied (publickey)`
```bash
# 配置SSH密钥或使用HTTPS
git remote set-url origin https://github.com/用户名/仓库名.git
```

**问题3**: `rejected - non-fast-forward`
```bash
git pull origin main --rebase
git push
```
