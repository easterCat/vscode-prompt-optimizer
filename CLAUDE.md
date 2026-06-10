# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PromptAlchemy is a VS Code sidebar extension that optimizes user prompts using LLM APIs (OpenAI, Gemini, DeepSeek, or custom endpoints). It has **zero runtime dependencies** — all HTTP calls use Node.js built-in `https`/`http` modules.

## Commands

- **Build**: `npm run build` (runs `tsc -p ./`, compiles to `dist/`)
- **Watch**: `npm run watch` (rebuilds on file changes)
- **Lint**: `npm run lint` (runs `eslint src --ext ts`)
- **Package**: `npm run package` (creates `.vsix` via `vsce package`)
- **Debug**: Launch "Run Extension" in VS Code — pre-launch task runs the build automatically

There is **no test framework** configured. No test scripts or test files exist.

## Architecture

Three-layer pattern, ~1,450 lines total across 7 TypeScript files:

```
extension.ts                     — Entry point, registers sidebar provider + sendSelection + optimizeInPlace commands
  └─ webview/promptSidebar.ts    — Message hub (WebviewViewProvider), handles 8 message types
       ├─ webview/sidebarHtml.ts — Entire UI as inline HTML/CSS/JS string (824 lines)
       ├─ config/modelConfig.ts  — API key in SecretStorage, config in globalState
       └─ optimizer/promptOptimizer.ts — LLM calls via native https/http
            ├─ optimizer/systemPrompt.ts      — System prompt constants (zh/en)
            └─ optimizer/userPromptTemplate.ts — User template with {prompt} placeholder
```

## Key Patterns

- **Webview communication**: All messages use `postMessage`/`onDidReceiveMessage` with typed `type` discriminators (e.g., `optimize`, `saveConfig`, `loadConfig`, `testConnection`).
- **Monolithic webview HTML**: [sidebarHtml.ts](src/webview/sidebarHtml.ts) is a single inline string containing all HTML, CSS (using VS Code CSS variables), and JavaScript. This avoids CSP issues. When modifying the UI, this is the file to edit.
- **Dual-language support**: System prompts and user templates have both Chinese and English variants in separate constants. UI labels stay English.
- **Gemini dual-auth**: The Gemini provider sends the API key both as `x-goog-api-key` header AND `?key=` query parameter for compatibility.
- **No bundler**: Pure `tsc` compilation. `dist/` mirrors `src/` structure exactly.
- **Config storage**: API keys use `vscode.SecretStorage` (encrypted). Non-sensitive settings use `globalState`. Both use keys prefixed with `easyPromptOptimizer`.
- **Webview state preservation**: `retainContextWhenHidden: true` keeps sidebar state when hidden.
- **Model provider type**: `'openai' | 'gemini' | 'deepseek' | 'custom'` — custom providers use the same OpenAI-compatible `/chat/completions` format.
- **Clipboard optimization**: `optimizeInPlace` command reads from `vscode.env.clipboard`, optimizes via `PromptOptimizer`, writes result back to clipboard. Works in any context (editor, Webview, external app) since it doesn't depend on `activeTextEditor`.

## Provider Differences

OpenAI, DeepSeek, and custom providers use standard OpenAI Chat Completions API format (`/chat/completions` with Bearer token). Gemini uses `/models/{model}:generateContent` with its own auth pattern. All providers send at `temperature: 0.7` and `max_tokens: 4096`.

## Debugging

The `.vscode/launch.json` has a single "Run Extension" config that starts an Extension Development Host. The pre-launch task runs `npm run build` automatically. Set breakpoints in `src/` files and they will map to `dist/` via source maps.
