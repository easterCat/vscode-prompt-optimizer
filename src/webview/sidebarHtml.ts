import * as vscode from 'vscode';

/**
 * Generate the full HTML for the Prompt Optimizer sidebar webview.
 * Uses VSCode's CSS variables for theme integration.
 */
export function getSidebarHtml(
  webview: vscode.Webview,
  _extensionUri: vscode.Uri
): string {
  // Use nonce for CSP
  const nonce = getNonce();

  return /*html*/ `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>Prompt Optimizer</title>
  <style>
    :root {
      --input-border: var(--vscode-input-border, #3c3c3c);
      --input-bg: var(--vscode-input-background, #3c3c3c);
      --input-fg: var(--vscode-input-foreground, #cccccc);
      --button-bg: var(--vscode-button-background, #0e639c);
      --button-fg: var(--vscode-button-foreground, #ffffff);
      --button-hover: var(--vscode-button-hoverBackground, #1177bb);
      --section-bg: var(--vscode-sideBarSectionHeader-background, #252526);
      --text-fg: var(--vscode-foreground, #cccccc);
      --error-fg: var(--vscode-errorForeground, #f44747);
      --success-fg: #4ec9b0;
      --description-fg: var(--vscode-descriptionForeground, #999999);
      --textarea-bg: var(--vscode-input-background, #3c3c3c);
      --scrollbar-bg: var(--vscode-scrollbarSlider-background, #7f7f7f4d);
      --badge-bg: var(--vscode-badge-background, #4d4d4d);
      --badge-fg: var(--vscode-badge-foreground, #cccccc);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: var(--vscode-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
      font-size: var(--vscode-font-size, 12px);
      color: var(--text-fg);
      background: var(--vscode-sideBar-background, #252526);
      padding: 8px 12px;
      line-height: 1.5;
    }

    /* Section headers */
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 0;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--description-fg);
      border-bottom: 1px solid var(--input-border);
      margin-bottom: 8px;
    }

    .section-header > span:first-child {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .section-icon {
      width: 14px;
      height: 14px;
      opacity: 0.8;
      flex-shrink: 0;
    }

    #config-toggle .section-icon {
      transform: translateY(3px);
    }

    .section-header .toggle {
      font-size: 10px;
      transition: transform 0.15s ease;
      cursor: pointer;
      padding: 2px 4px;
      border-radius: 3px;
    }

    .section-header .toggle:hover {
      color: var(--text-fg);
      background: var(--input-bg);
    }

    .section-header.collapsed .toggle {
      transform: rotate(-90deg);
    }

    .section-body {
      margin-bottom: 12px;
      overflow: hidden;
      transition: max-height 0.2s ease, margin-bottom 0.2s ease;
    }

    .section-body.collapsed {
      max-height: 0 !important;
      margin-bottom: 0 !important;
    }

    /* Form elements */
    .form-group {
      margin-bottom: 10px;
    }

    .form-group label {
      display: block;
      font-size: 12px;
      color: var(--description-fg);
      margin-bottom: 4px;
    }

    input[type="text"],
    input[type="password"],
    select,
    textarea {
      width: 100%;
      padding: 5px 8px;
      background: var(--input-bg);
      color: var(--input-fg);
      border: 1px solid var(--input-border);
      border-radius: 3px;
      font-family: inherit;
      font-size: 13px;
      outline: none;
    }

    input:focus, select:focus, textarea:focus {
      border-color: var(--button-bg);
      outline: 1px solid var(--button-bg);
    }

    select {
      cursor: pointer;
      appearance: auto;
    }

    textarea {
      resize: vertical;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
      line-height: 1.5;
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 5px 14px;
      border: none;
      border-radius: 3px;
      cursor: pointer;
      font-size: 13px;
      font-family: inherit;
      transition: background 0.15s ease;
    }

    .btn-primary {
      background: var(--button-bg);
      color: var(--button-fg);
    }
    .btn-primary:hover { background: var(--button-hover); }
    .btn-primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: transparent;
      color: var(--button-bg);
      border: 1px solid var(--button-bg);
    }
    .btn-secondary:hover {
      background: var(--button-bg);
      color: var(--button-fg);
    }

    .btn-small {
      padding: 3px 8px;
      font-size: 11px;
    }

    .btn-icon {
      padding: 4px 6px;
      background: transparent;
      border: 1px solid var(--input-border);
      color: var(--text-fg);
      border-radius: 3px;
      cursor: pointer;
    }
    .btn-icon:hover {
      background: var(--input-bg);
    }

    /* Status badge */
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 500;
    }
    .status-configured {
      background: rgba(78, 201, 176, 0.15);
      color: var(--success-fg);
    }
    .status-unconfigured {
      background: rgba(244, 71, 71, 0.15);
      color: var(--error-fg);
    }

    /* Input/Output areas */
    .prompt-input {
      min-height: 150px;
      max-height: 400px;
    }

    .prompt-output {
      min-height: 80px;
      max-height: 300px;
      background: var(--textarea-bg);
      border: 1px solid var(--input-border);
      border-radius: 3px;
      padding: 8px;
      white-space: pre-wrap;
      word-wrap: break-word;
      overflow-y: auto;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
      line-height: 1.5;
      color: var(--input-fg);
    }

    .prompt-output.empty {
      color: var(--description-fg);
      font-style: italic;
    }

    /* Optimize button area */
    .optimize-area {
      display: flex;
      justify-content: center;
      margin: 12px 0;
    }

    .optimize-btn {
      width: 100%;
      max-width: 280px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 4px;
    }

    /* Loading spinner */
    .spinner {
      display: inline-block;
      width: 14px;
      height: 14px;
      border: 2px solid var(--button-fg);
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Error message */
    .error-msg {
      padding: 8px 10px;
      background: rgba(244, 71, 71, 0.1);
      border-left: 3px solid var(--error-fg);
      border-radius: 3px;
      color: var(--error-fg);
      font-size: 12px;
      margin-top: 6px;
      word-wrap: break-word;
    }

    /* Config action row */
    .config-actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    /* Divider */
    .divider {
      height: 1px;
      background: var(--input-border);
      margin: 12px 0;
    }

    /* Placeholder for empty output */
    .output-placeholder {
      color: var(--description-fg);
      font-style: italic;
      text-align: center;
      padding: 20px 0;
    }

    /* API key indicator */
    .api-key-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: var(--description-fg);
    }

    /* Toast notifications */
    .toast-container {
      position: fixed;
      top: 8px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      pointer-events: none;
    }
    .toast {
      padding: 6px 14px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      transform: translateY(-8px);
      animation: toastIn 0.25s ease forwards;
      pointer-events: auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .toast.success {
      background: rgba(78, 201, 176, 0.2);
      border: 1px solid var(--success-fg);
      color: var(--success-fg);
    }
    .toast.error {
      background: rgba(244, 71, 71, 0.2);
      border: 1px solid var(--error-fg);
      color: var(--error-fg);
    }
    .toast.fadeout {
      animation: toastOut 0.3s ease forwards;
    }
    @keyframes toastIn {
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes toastOut {
      to { opacity: 0; transform: translateY(-8px); }
    }
  </style>
</head>
<body>
  <!-- Toast container -->
  <div class="toast-container" id="toastContainer"></div>

  <!-- Prompt Input Section -->
  <div class="section-header" id="input-toggle">
    <span><svg class="section-icon" viewBox="0 0 16 16" width="14" height="14"><path d="M14 1H2a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z" fill="currentColor"/><path d="M3 4h10v1H3V4zm0 3h10v1H3V7zm0 3h6v1H3v-1z" fill="currentColor"/></svg> Original</span>
    <span class="toggle">▼</span>
  </div>
  <div class="section-body" id="input-body">
    <textarea
      class="prompt-input"
      id="promptInput"
      placeholder="Enter your prompt here...&#10;&#10;Or select text in the editor and use the context menu:&#10;Send to Prompt Optimizer"
    ></textarea>
  </div>

  <!-- Optimize Button -->
  <div class="optimize-area">
    <button class="btn btn-primary optimize-btn" id="optimizeBtn">
      🚀 Optimize
    </button>
  </div>

  <div id="errorMsg" style="display:none;"></div>

  <div class="divider"></div>

  <!-- Output Section -->
  <div class="section-header" id="output-toggle">
    <span><svg class="section-icon" viewBox="0 0 16 16" width="14" height="14"><path d="M8 1l2 5h5l-4 3.5 1.5 5L8 11.5 3.5 14.5 5 9.5 1 6h5l2-5z" fill="currentColor"/></svg> Optimized <svg id="copyIcon" class="section-icon" viewBox="0 0 16 16" width="14" height="14" style="display:none;cursor:pointer;" title="Copy to clipboard"><path d="M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 010 1.5h-1.5a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 019.25 16h-7.5A1.75 1.75 0 010 14.25v-7.5z" fill="currentColor"/><path d="M5 1.75C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0114.25 11h-7.5A1.75 1.75 0 015 9.25v-7.5zm1.75-.25a.25.25 0 00-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 00.25-.25v-7.5a.25.25 0 00-.25-.25h-7.5z" fill="currentColor"/></svg></span>
    <span class="toggle">▼</span>
  </div>
  <div class="section-body" id="output-body">
    <div class="prompt-output empty" id="promptOutput">
      <div class="output-placeholder">Optimized prompt will appear here...</div>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Model Configuration Section -->
  <div class="section-header" id="config-toggle">
    <span><svg class="section-icon" viewBox="0 0 16 16" width="14" height="14"><path d="M8 0a8.2 8.2 0 01.701.031C9.444.095 9.99.645 10.16 1.29l.288 1.107c.018.066.079.158.212.224.231.114.454.243.668.386.123.08.233.09.305.071l1.103-.303c.644-.176 1.392.021 1.82.63.27.385.506.792.704 1.218.076.165.12.262.143.305l.607 1.16c.146.283.078.664-.213.856a8.1 8.1 0 01-1.578.848c-.03.035-.039.066-.04.09l-.033.628c-.01.685-.554 1.233-1.238 1.233H9.24c-.684 0-1.228-.548-1.238-1.233l-.033-.628c-.001-.024-.01-.055-.04-.09a8.1 8.1 0 01-1.578-.848c-.291-.192-.36-.573-.213-.856l.607-1.16c.023-.043.067-.14.143-.305.198-.426.434-.833.704-1.218.428-.609 1.176-.806 1.82-.63l1.102.302c.072.02.182.011.305-.071a6.5 6.5 0 00.668-.386c.133-.066.194-.158.212-.224l.288-1.107c.17-.645.716-1.195 1.458-1.26A8.2 8.2 0 018 0zM5.562 4.343c-.586-.586-1.535-.586-2.121 0L2.043 5.74c-.586.586-.586 1.535 0 2.121l1.399 1.399c.586.586 1.535.586 2.121 0l1.398-1.399c.586-.586.586-1.535 0-2.121L5.562 4.343zM10.438 4.343l-1.399 1.399c-.586.586-.586 1.535 0 2.121l1.399 1.399c.586.586 1.535.586 2.121 0l1.399-1.399c.586-.586.586-1.535 0-2.121l-1.399-1.399c-.586-.586-1.535-.586-2.121 0z" fill="currentColor"/></svg> Model Configuration</span>
    <span class="toggle">▼</span>
  </div>
  <div class="section-body" id="config-body">
    <div class="form-group">
      <label for="language">Language</label>
      <select id="language">
        <option value="zh">中文</option>
        <option value="en">English</option>
      </select>
    </div>
    <div class="form-group">
      <label for="provider">Provider</label>
      <select id="provider">
        <option value="openai">OpenAI</option>
        <option value="gemini">Gemini</option>
        <option value="deepseek">DeepSeek</option>
        <option value="custom">Custom (OpenAI-compatible)</option>
      </select>
    </div>
    <div class="form-group">
      <label for="apiKey">API Key</label>
      <input type="password" id="apiKey" placeholder="sk-..." />
      <div class="api-key-indicator" id="apiKeyStatus"></div>
    </div>
    <div class="form-group">
      <label for="baseUrl">Base URL <span style="opacity:0.6">(optional)</span></label>
      <input type="text" id="baseUrl" placeholder="https://api.openai.com/v1" />
    </div>
    <div class="form-group">
      <label for="modelName">Model Name</label>
      <input type="text" id="modelName" placeholder="gpt-4o" />
    </div>

    <!-- System Prompt -->
    <div class="form-group" style="margin-top: 14px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <label for="systemPrompt" style="margin-bottom:0;">System Prompt</label>
        <button class="btn btn-secondary btn-small" id="resetSystemPromptBtn" title="Reset to default system prompt">Reset</button>
        <span class="api-key-indicator" id="systemPromptStatus"></span>
      </div>
      <textarea
        id="systemPrompt"
        class="prompt-input"
        style="min-height: 120px; max-height: 300px;"
        placeholder="Customize the system prompt for optimization..."
      ></textarea>
    </div>

    <!-- User Prompt Template -->
    <div class="form-group" style="margin-top: 14px;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <label for="userPromptTemplate" style="margin-bottom:0;">User Prompt Template</label>
        <button class="btn btn-secondary btn-small" id="resetUserPromptTemplateBtn" title="Reset to default user prompt template">Reset</button>
        <span class="api-key-indicator" id="userPromptTemplateStatus"></span>
      </div>
      <textarea
        id="userPromptTemplate"
        class="prompt-input"
        style="min-height: 120px; max-height: 300px;"
        placeholder="Customize the user prompt template for optimization..."
      ></textarea>
      <div style="margin-top:4px;font-size:11px;color:var(--description-fg);">
        Use <code>{prompt}</code> as a placeholder for the user's original prompt.
      </div>
    </div>

    <div class="config-actions">
      <button class="btn btn-primary btn-small" id="saveBtn">Save</button>
      <button class="btn btn-secondary btn-small" id="testBtn">Test</button>
    </div>
    <div id="configStatus" style="margin-top:6px;"></div>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    // State
    let currentConfig = {
      provider: 'openai',
      baseUrl: '',
      modelName: 'gpt-4o',
      systemPrompt: '',
      userPromptTemplate: '',
      language: 'zh',
    };
    let hasApiKey = false;
    let isOptimizing = false;
    let defaultSystemPrompt = '';
    let defaultUserPromptTemplate = '';
    let defaultSystemPromptEn = '';
    let defaultUserPromptTemplateEn = '';

    // --- Section Toggle ---
    function toggleSection(id) {
      const header = document.getElementById(id + '-toggle');
      const body = document.getElementById(id + '-body');
      const isCollapsing = !body.classList.contains('collapsed');

      if (isCollapsing) {
        // Collapsing: set max-height to current scrollHeight first, then to 0
        body.style.maxHeight = body.scrollHeight + 'px';
        // Force reflow to apply the current height before transitioning
        body.offsetHeight;
        body.classList.add('collapsed');
        header.classList.add('collapsed');
      } else {
        // Expanding: set max-height from 0 to scrollHeight
        body.classList.remove('collapsed');
        header.classList.remove('collapsed');
        body.style.maxHeight = body.scrollHeight + 'px';
        // After transition, remove maxHeight so content can resize dynamically
        const onTransitionEnd = () => {
          body.style.maxHeight = '';
          body.removeEventListener('transitionend', onTransitionEnd);
        };
        body.addEventListener('transitionend', onTransitionEnd);
      }
    }

    // --- Provider Change ---
    const DEFAULT_URLS = {
      openai: 'https://api.openai.com/v1',
      gemini: 'https://generativelanguage.googleapis.com/v1beta',
      deepseek: 'https://api.deepseek.com/v1',
      custom: '',
    };
    const DEFAULT_MODELS = {
      openai: 'gpt-4o',
      gemini: 'gemini-1.5-pro',
      deepseek: 'deepseek-chat',
      custom: '',
    };

    function onProviderChange() {
      const provider = document.getElementById('provider').value;
      document.getElementById('baseUrl').placeholder = DEFAULT_URLS[provider] || '';
      // Only auto-fill if the field is empty
      if (!document.getElementById('baseUrl').value) {
        document.getElementById('baseUrl').value = DEFAULT_URLS[provider] || '';
      }
      // Suggest a default model if the current one looks like a previous provider's default
      const currentModel = document.getElementById('modelName').value;
      const prevModels = Object.values(DEFAULT_MODELS);
      if (prevModels.includes(currentModel) || !currentModel) {
        document.getElementById('modelName').value = DEFAULT_MODELS[provider] || '';
      }
    }

    // --- Config ---
    function saveConfig() {
      const config = {
        provider: document.getElementById('provider').value,
        baseUrl: document.getElementById('baseUrl').value || DEFAULT_URLS[document.getElementById('provider').value],
        modelName: document.getElementById('modelName').value,
        systemPrompt: document.getElementById('systemPrompt').value,
        userPromptTemplate: document.getElementById('userPromptTemplate').value,
        language: document.getElementById('language').value,
      };
      const apiKey = document.getElementById('apiKey').value;
      vscode.postMessage({ type: 'saveConfig', config, apiKey });
    }

    function testConnection() {
      vscode.postMessage({ type: 'testConnection' });
    }

    // --- Optimize ---
    function optimize() {
      if (isOptimizing) return;

      const prompt = document.getElementById('promptInput').value.trim();
      if (!prompt) {
        showError('Please enter a prompt to optimize.');
        return;
      }

      isOptimizing = true;
      updateOptimizeButton(true);
      hideError();

      vscode.postMessage({ type: 'optimize', prompt });
    }

    function updateOptimizeButton(loading) {
      const btn = document.getElementById('optimizeBtn');
      if (loading) {
        btn.innerHTML = '<span class="spinner"></span> Optimizing...';
        btn.disabled = true;
      } else {
        btn.innerHTML = '🚀 Optimize';
        btn.disabled = false;
      }
    }

    // --- Copy ---
    function copyOutput() {
      const outputEl = document.getElementById('promptOutput');
      const text = outputEl.innerText;
      if (text && !outputEl.classList.contains('empty')) {
        vscode.postMessage({ type: 'copyToClipboard', text });
      }
    }

    // --- Error Handling ---
    function showError(msg) {
      const el = document.getElementById('errorMsg');
      el.innerHTML = '<div class="error-msg">' + escapeHtml(msg) + '</div>';
      el.style.display = 'block';
    }

    function hideError() {
      const el = document.getElementById('errorMsg');
      el.style.display = 'none';
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // --- Language Helpers ---
    function getDefaultSystemPrompt() {
      return currentConfig.language === 'en' ? defaultSystemPromptEn : defaultSystemPrompt;
    }

    function getDefaultUserPromptTemplate() {
      return currentConfig.language === 'en' ? defaultUserPromptTemplateEn : defaultUserPromptTemplate;
    }

    function onLanguageChange() {
      const language = document.getElementById('language').value;
      currentConfig.language = language;
      // Update prompts to show the appropriate language defaults
      document.getElementById('systemPrompt').value = getDefaultSystemPrompt();
      document.getElementById('userPromptTemplate').value = getDefaultUserPromptTemplate();
      // Send language change to extension
      vscode.postMessage({ type: 'changeLanguage', language });
    }

    // --- Toast Notifications ---
    function showToast(msg, type) {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      toast.textContent = msg;
      container.appendChild(toast);
      setTimeout(() => {
        toast.classList.add('fadeout');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }

    // --- Messages from Extension ---
    window.addEventListener('message', (event) => {
      const msg = event.data;
      switch (msg.type) {
        case 'loadConfig':
          currentConfig = msg.config;
          hasApiKey = msg.hasApiKey;
          defaultSystemPrompt = msg.defaultSystemPrompt || '';
          defaultUserPromptTemplate = msg.defaultUserPromptTemplate || '';
          defaultSystemPromptEn = msg.defaultSystemPromptEn || '';
          defaultUserPromptTemplateEn = msg.defaultUserPromptTemplateEn || '';
          applyConfig();
          break;

        case 'configSaved':
          if (msg.success) {
            showToast('✅ Configuration saved.', 'success');
          }
          break;

        case 'setInput':
          document.getElementById('promptInput').value = msg.text;
          // Expand input section if collapsed
          const inputHeader = document.getElementById('input-toggle');
          if (inputHeader.classList.contains('collapsed')) {
            toggleSection('input');
          }
          break;

        case 'optimizing':
          isOptimizing = true;
          updateOptimizeButton(true);
          hideError();
          break;

        case 'optimizeResult':
          isOptimizing = false;
          updateOptimizeButton(false);
          showOutput(msg.optimizedPrompt);
          break;

        case 'optimizeError':
          isOptimizing = false;
          updateOptimizeButton(false);
          showError(msg.error);
          break;

        case 'testing':
          const testBtn = document.getElementById('testBtn');
          testBtn.innerHTML = '<span class="spinner"></span>';
          testBtn.disabled = true;
          break;

        case 'testResult':
          const testBtn2 = document.getElementById('testBtn');
          testBtn2.innerHTML = 'Test';
          testBtn2.disabled = false;
          if (msg.success) {
            // Add delay before showing success toast
            setTimeout(() => {
              showToast('✅ Connection successful!', 'success');
            }, 200);
          } else {
            showToast('❌ ' + msg.error, 'error');
          }
          break;

        case 'resetSystemPromptResult':
          document.getElementById('systemPrompt').value = msg.systemPrompt || '';
          showToast('✅ System prompt reset to default.', 'success');
          break;

        case 'resetUserPromptTemplateResult':
          document.getElementById('userPromptTemplate').value = msg.userPromptTemplate || '';
          showToast('✅ User prompt template reset to default.', 'success');
          break;
      }
    });

    function applyConfig() {
      document.getElementById('language').value = currentConfig.language || 'zh';
      document.getElementById('provider').value = currentConfig.provider || 'openai';
      document.getElementById('baseUrl').value = currentConfig.baseUrl || '';
      document.getElementById('modelName').value = currentConfig.modelName || '';
      document.getElementById('systemPrompt').value = currentConfig.systemPrompt || getDefaultSystemPrompt();
      document.getElementById('userPromptTemplate').value = currentConfig.userPromptTemplate || getDefaultUserPromptTemplate();
      document.getElementById('apiKey').value = '';

      const indicator = document.getElementById('apiKeyStatus');
      if (hasApiKey) {
        indicator.innerHTML = '🔒 API Key is set (hidden for security)';
        indicator.style.color = 'var(--success-fg)';
      } else {
        indicator.innerHTML = '⚠️ No API Key configured';
        indicator.style.color = 'var(--error-fg)';
      }
    }

    function showOutput(text) {
      const el = document.getElementById('promptOutput');
      el.classList.remove('empty');
      el.innerHTML = '';
      el.textContent = text;
      document.getElementById('copyIcon').style.display = 'inline-block';
    }

    function showConfigStatus(msg, color) {
      const el = document.getElementById('configStatus');
      el.innerHTML = '<span style="color:' + color + ';font-size:12px;">' + msg + '</span>';
      setTimeout(() => { el.innerHTML = ''; }, 5000);
    }

    // Request initial config load
    vscode.postMessage({ type: 'loadConfig' });

    // --- Event Listeners (using addEventListener instead of inline handlers for CSP compliance) ---
    document.addEventListener('DOMContentLoaded', () => {
      // Section toggle - only on toggle button click
      document.querySelectorAll('.toggle').forEach((toggle, index) => {
        toggle.addEventListener('click', (e) => {
          e.stopPropagation();
          const sectionIds = ['input', 'output', 'config'];
          toggleSection(sectionIds[index]);
        });
      });

      // Action buttons
      document.getElementById('optimizeBtn').addEventListener('click', optimize);
      document.getElementById('copyIcon').addEventListener('click', copyOutput);
      document.getElementById('saveBtn').addEventListener('click', saveConfig);
      document.getElementById('testBtn').addEventListener('click', testConnection);

      // Reset system prompt to default
      document.getElementById('resetSystemPromptBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'resetSystemPrompt' });
      });

      // Reset user prompt template to default
      document.getElementById('resetUserPromptTemplateBtn').addEventListener('click', () => {
        vscode.postMessage({ type: 'resetUserPromptTemplate' });
      });

      // Provider select
      document.getElementById('provider').addEventListener('change', onProviderChange);

      // Language select
      document.getElementById('language').addEventListener('change', onLanguageChange);
    });
  </script>
</body>
</html>`;
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
