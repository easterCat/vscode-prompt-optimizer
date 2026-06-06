# PromptForge

A lightweight VS Code extension for optimizing AI prompts using configurable LLM providers.

![Main App Screenshot](media/main-app.png)

## Features

- **Model Configuration** — Support for OpenAI, Gemini, DeepSeek, and custom providers with secure API key storage.
- **One-Click Optimization** — Paste or type your prompt, click "Optimize", and get an improved version instantly.
- **Editor Integration** — Right-click selected text in the editor to send it directly to the optimizer sidebar.
- **One-Click Copy** — Copy the optimized prompt to your clipboard with a single click.

## Getting Started

### Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` to open the Extensions panel
3. Search for **PromptForge**
4. Click **Install**

### Configuration

1. Click the **PromptForge** icon in the Activity Bar to open the sidebar
2. Expand the **Model Configuration** section
3. Select your **Provider** (OpenAI, Gemini, DeepSeek, or Custom)
4. Enter your **API Key**
5. (Optional) Modify the **Base URL** if using a custom endpoint
6. Set the **Model Name** (e.g., `gpt-4o`, `gemini-1.5-pro`, `deepseek-chat`)
7. Click **Save**

### Usage

1. Open the PromptForge sidebar
2. Enter your prompt in the **Original Prompt** text area
3. Click **Optimize**
4. View the improved prompt in the **Optimized Prompt** section
5. Click **Copy** to copy the result to your clipboard

You can also select text in the editor, right-click, and choose **Send to PromptForge** to fill the input automatically.

## Supported Providers

| Provider | Default Base URL |
| :--- | :--- |
| OpenAI | `https://api.openai.com/v1` |
| Gemini | `https://generativelanguage.googleapis.com/v1beta` |
| DeepSeek | `https://api.deepseek.com/v1` |
| Custom | (user-defined) |

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [VS Code](https://code.visualstudio.com/) v1.85+

### Build

```bash
npm install
npm run build
```

### Watch

```bash
npm run watch
```

### Package

```bash
npm run package
```

### Lint

```bash
npm run lint
```

## License

[MIT](LICENSE)
