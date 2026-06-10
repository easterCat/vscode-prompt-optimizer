---
name: release
description: VS Code 扩展版本发布技能。当用户明确说"发布版本"时触发。自动完成：检查状态 → 编译构建 → 打包 .vsix → 提交代码 → 创建 tag → 推送远程。仅适用于使用 vsce 打包的 VS Code 扩展项目，不要用于普通的 git commit/push 操作。
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

### Step 3: 更新文档

自动检查并更新项目文档，确保版本发布时文档与代码同步。

**3.1 检查 CHANGELOG.md**

读取 `CHANGELOG.md`，检查当前版本号是否已有对应条目：
- 如果没有，根据 `git log` 自动新增版本条目，格式参考已有条目
- 条目内容从 git 提交记录中提取本次变更的关键信息

**3.2 检查 PRD.md**

读取 `docs/PRD.md`（如存在），检查以下内容：
- 版本记录表：是否需要新增版本条目（如本次有新功能或重大变更）
- 功能范围表：新增功能是否需要补充到功能列表
- 里程碑表：是否有已完成的阶段需要更新状态
- 技术约束：是否有架构变更需要同步

**3.3 检查 README 同步**

如果项目同时存在 `README.md` 和 `README_CN.md`：
- 对比两者的功能特性列表是否一致
- 如果有差异，提示用户并同步更新

**3.4 检查版本号一致性**

确认以下四处版本号一致：
- `package.json` 中的 `version`
- `CHANGELOG.md` 最新条目的版本号
- `docs/PRD.md` 版本记录表中的最新版本号（如存在）
- 如有 `README_CN.md`，确认无过期版本引用

### Step 4: 编译构建

```bash
npm run build
```

必须零错误。如果有 TypeScript 编译错误，停止流程并报告具体错误信息。

### Step 5: 打包 .vsix

```bash
npm run package
```

记录输出的 `.vsix` 文件路径和大小。

### Step 6: 提交代码

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

### Step 7: 创建 Tag

```bash
git tag -a v{版本号} -m "v{版本号}: {简要描述}"
```

Tag 版本号必须与 `package.json` 中的 `version` 一致。

### Step 8: 推送到远程

```bash
git push origin main --tags
```

## 注意事项

- **.gitignore 检查**：确保 `dist/`、`*.vsix`、`node_modules/` 在 `.gitignore` 中，避免提交构建产物
- **文档同步**：如果项目有中英文 README（README.md / README_CN.md），确保两者内容一致
- **版本号一致性**：tag 版本号 = package.json 版本号 = CHANGELOG 版本号
- **编译必须通过**：打包前必须确保 `npm run build` 零错误
- **提交前检查**：`git status` 确认没有遗漏或多余的文件
- **CHANGELOG 必须更新**：每次发布前，CHANGELOG.md 必须包含当前版本的变更条目

## 快速模式

如果用户说"快速发布版本"，跳过确认步骤，按默认流程执行：
1. 读取当前版本号（不修改）
2. 自动更新 CHANGELOG.md
3. build → package → commit → tag → push
4. 汇报结果
