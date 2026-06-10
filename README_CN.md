# Prompt Alchemy

一个轻量级的 VS Code 扩展，支持通过多种可配置的 LLM 提供商优化 AI 提示词。

![主界面截图](media/main-app.png)

## 功能特性

- **模型配置** — 支持 OpenAI、Gemini、DeepSeek 及自定义提供商，API 密钥安全存储。
- **一键优化** — 粘贴或输入提示词，点击"优化"即可获得改进后的版本。
- **剪贴板优化** — 在任意位置复制文本（编辑器、Webview 面板、外部应用），按 `Ctrl+Alt+M`（Mac 为 `Cmd+Alt+M`），粘贴优化结果。
- **编辑器集成** — 在编辑器中选中文本后右键，可直接发送到优化器侧边栏。
- **一键复制** — 将优化后的提示词一键复制到剪贴板。

## 快速开始

### 安装

1. 打开 VS Code
2. 按 `Ctrl+Shift+X` 打开扩展面板
3. 搜索 **Prompt Alchemy**
4. 点击 **安装**

### 配置

1. 点击活动栏中的 **Prompt Alchemy** 图标打开侧边栏
2. 展开 **模型配置** 区域
3. 选择**提供商**（OpenAI、Gemini、DeepSeek 或自定义）
4. 输入你的 **API Key**
5. （可选）如使用自定义端点，修改 **Base URL**
6. 设置**模型名称**（如 `gpt-4o`、`gemini-1.5-pro`、`deepseek-chat`）
7. 点击 **保存**

### 使用方法

#### 侧边栏工作流

1. 打开 Prompt Alchemy 侧边栏
2. 在 **原始提示词** 文本区域中输入你的提示词
3. 点击 **优化**
4. 在 **优化后的提示词** 区域查看改进结果
5. 点击 **复制** 将结果复制到剪贴板

你也可以在编辑器中选中文本，右键选择 **Send to Prompt Alchemy**，将文本自动填入输入框。

#### 剪贴板优化（通用工作流）

1. 在任意位置复制文本（编辑器、Webview 面板、外部应用均可）
2. 按 `Ctrl+Alt+M`（Mac 为 `Cmd+Alt+M`）
3. 优化结果自动写入剪贴板
4. 按 `Ctrl+V` 粘贴替换

## 支持的提供商

| 提供商 | 默认 Base URL |
| :--- | :--- |
| OpenAI | `https://api.openai.com/v1` |
| Gemini | `https://generativelanguage.googleapis.com/v1beta` |
| DeepSeek | `https://api.deepseek.com/v1` |
| 自定义 | （用户自定义） |

## 开发

### 前置要求

- [Node.js](https://nodejs.org/) v18+
- [VS Code](https://code.visualstudio.com/) v1.85+

### 构建

```bash
npm install
npm run build
```

### 监听模式

```bash
npm run watch
```

### 打包

```bash
npm run package
```

### 代码检查

```bash
npm run lint
```

## 许可证

[MIT](LICENSE)
