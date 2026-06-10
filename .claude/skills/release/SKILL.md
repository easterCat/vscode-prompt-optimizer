---
name: release
description: VS Code 扩展版本发布技能。当用户明确说"release"或"发布版本"时触发。自动完成：检查状态 → 编译构建 → 打包 .vsix → 提交代码 → 创建 tag → 推送远程。仅适用于使用 vsce 打包的 VS Code 扩展项目，不要用于普通的 git commit/push 操作。
---

# Release — VS Code 扩展版本发布

一键完成版本发布全流程：检查状态、编译构建、打包安装包、提交代码、创建 tag、推送到远程。

## 前置条件

- 项目根目录存在 `package.json`（含 `vsce` 打包配置）
- 已安装依赖（`node_modules/` 存在）
- Git 仓库已配置远程地址

## 发布流程

按以下顺序执行，每步完成后进入下一步。如果某步失败，停止流程并报告错误。

### Step 1: 检查状态

```bash
# 读取当前版本号
cat package.json | grep '"version"'

# 检查 git 状态
git status
git log --oneline -3
git tag --sort=-version:refname | head -3
```

向用户确认：
- 当前版本号是什么？新版本号是什么？
- 有哪些文件变更？是否都已保存？
- 是否需要更新版本号（package.json）？

### Step 2: 更新版本号（如需要）

如果用户确认需要更新版本号，修改 `package.json` 中的 `version` 字段。

### Step 3: 编译构建

```bash
npm run build
```

必须零错误。如果有 TypeScript 编译错误，停止流程并报告具体错误信息。

### Step 4: 打包 .vsix

```bash
npm run package
```

记录输出的 `.vsix` 文件路径和大小。

### Step 5: 提交代码

```bash
# 添加变更文件（自动遵循 .gitignore）
git add -A

# 确认暂存内容
git status

# 提交
git commit -m "{变更描述}\n\nCo-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

提交信息格式要求：
- 第一行：简洁描述本次变更（中文或英文均可）
- 空行
- Co-Authored-By 署名行（必须包含）

### Step 6: 创建 Tag

```bash
git tag -a v{版本号} -m "v{版本号}: {简要描述}"
```

Tag 版本号必须与 `package.json` 中的 `version` 一致。

### Step 7: 推送到远程

```bash
git push origin main --tags
```

## 注意事项

- **.gitignore 检查**：确保 `dist/`、`*.vsix`、`node_modules/` 在 `.gitignore` 中，避免提交构建产物
- **文档同步**：如果项目有中英文 README（README.md / README_CN.md），确保两者内容一致
- **版本号一致性**：tag 版本号 = package.json 版本号 = CHANGELOG 版本号
- **编译必须通过**：打包前必须确保 `npm run build` 零错误
- **提交前检查**：`git status` 确认没有遗漏或多余的文件

## 快速模式

如果用户说"release 快速"或"直接发版"，跳过确认步骤，按默认流程执行：
1. 读取当前版本号（不修改）
2. build → package → commit → tag → push
3. 汇报结果
