# Change Log

All notable changes to the "Prompt Alchemy" extension will be documented in this file.

## [0.1.4] - 2026-06-10

### Changed

- Added project-level release skill for version publishing workflow.
- Updated README_CN with clipboard optimization feature.
- Updated icon asset.

## [0.1.3] - 2026-06-10

### Added

- **Optimize from Clipboard**: Press `Ctrl+Alt+M` (`Cmd+Alt+M` on Mac) to optimize the clipboard content and copy the result back — works anywhere, including Webview panels.
- Added command palette entry **Optimize from Clipboard** (always available).

## [0.1.2] - 2026-06-07

### Added

- System Prompt Configuration: Users can now customize the system prompt used for optimization.
- User Prompt Template Configuration: Users can now customize the user prompt template with `{prompt}` placeholder.
- Language Switch: Toggle between Chinese and English defaults for system prompt and user template.
- Reset Buttons: Restore system prompt or user template to language-specific defaults.
- Gemini API Key via URL Query: API key is now sent both as `x-goog-api-key` header and `?key=` query parameter for compatibility.

### Fixed

- English user prompt template now correctly uses `{prompt}` placeholder instead of hardcoded "Write a story".
- Section collapse/expand now responds to clicking anywhere on the title bar, not just the arrow icon.

### Removed

- Unused `.status-configured` and `.status-unconfigured` CSS classes.

## [0.1.1] - 2026-06-06

### Changed

- Updated extension icon to a simplified SVG design.
- Replaced main-app screenshot with a lighter, optimized image.
- Refreshed project metadata and display name to **Prompt Alchemy**.

## [0.1.0] - 2026-06-06

### Added

- Model Configuration: Support for OpenAI, Gemini, DeepSeek, and custom providers with secure API key storage.
- One-Click Optimization: Paste or type your prompt, click "Optimize", and get an improved version instantly.
- Editor Integration: Right-click selected text in the editor to send it directly to the optimizer sidebar.
- One-Click Copy: Copy the optimized prompt to your clipboard with a single click.
