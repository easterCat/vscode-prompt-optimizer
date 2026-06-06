import * as vscode from 'vscode';
import { ModelConfigManager, ModelConfigData, ModelProvider } from '../config/modelConfig';
import { PromptOptimizer } from '../optimizer/promptOptimizer';
import { DEFAULT_OPTIMIZATION_SYSTEM_PROMPT, DEFAULT_OPTIMIZATION_SYSTEM_PROMPT_EN } from '../optimizer/systemPrompt';
import { DEFAULT_USER_PROMPT_TEMPLATE, DEFAULT_USER_PROMPT_TEMPLATE_EN } from '../optimizer/userPromptTemplate';
import { getSidebarHtml } from './sidebarHtml';

export class PromptSidebarProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'easyPromptOptimizer.sidebar';

  private _view?: vscode.WebviewView;
  private _configManager: ModelConfigManager;
  private _optimizer: PromptOptimizer;

  constructor(
    private readonly _extensionUri: vscode.Uri,
    private readonly _context: vscode.ExtensionContext
  ) {
    this._configManager = new ModelConfigManager(_context);
    this._optimizer = new PromptOptimizer(this._configManager);
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    // Set initial HTML
    webviewView.webview.html = await this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message) => {
      switch (message.type) {
        case 'optimize':
          await this._handleOptimize(message.prompt);
          break;
        case 'saveConfig':
          await this._handleSaveConfig(message.config, message.apiKey);
          break;
        case 'loadConfig':
          await this._handleLoadConfig();
          break;
        case 'testConnection':
          await this._handleTestConnection();
          break;
        case 'copyToClipboard':
          await vscode.env.clipboard.writeText(message.text);
          vscode.window.showInformationMessage('Copied to clipboard!');
          break;
        case 'resetSystemPrompt':
          await this._handleResetSystemPrompt();
          break;
        case 'resetUserPromptTemplate':
          await this._handleResetUserPromptTemplate();
          break;
        case 'changeLanguage':
          await this._handleChangeLanguage(message.language);
          break;
      }
    });

    // Load and send current config to webview
    await this._handleLoadConfig();
  }

  /** Send text to the input area in the webview */
  public sendTextToInput(text: string) {
    if (this._view) {
      this._view.webview.postMessage({ type: 'setInput', text });
    }
  }

  /** Handle optimization request */
  private async _handleOptimize(prompt: string) {
    if (!this._view) { return; }

    // Send loading state
    this._view.webview.postMessage({ type: 'optimizing' });

    const result = await this._optimizer.optimize(prompt);

    if (result.success) {
      this._view.webview.postMessage({
        type: 'optimizeResult',
        optimizedPrompt: result.optimizedPrompt,
      });
    } else {
      this._view.webview.postMessage({
        type: 'optimizeError',
        error: result.error,
      });
    }
  }

  /** Handle saving model configuration */
  private async _handleSaveConfig(config: ModelConfigData, apiKey: string) {
    await this._configManager.setConfig(config);
    if (apiKey) {
      await this._configManager.setApiKey(apiKey);
    }
    this._view?.webview.postMessage({
      type: 'configSaved',
      success: true,
    });
    // Refresh the config status in the webview so hasApiKey updates
    await this._handleLoadConfig();
    vscode.window.showInformationMessage('Model configuration saved.');
  }

  /** Handle loading model configuration */
  private async _handleLoadConfig() {
    if (!this._view) { return; }
    const config = this._configManager.getConfig();
    const hasApiKey = !!(await this._configManager.getApiKey());
    this._view.webview.postMessage({
      type: 'loadConfig',
      config,
      hasApiKey,
      defaultSystemPrompt: DEFAULT_OPTIMIZATION_SYSTEM_PROMPT,
      defaultUserPromptTemplate: DEFAULT_USER_PROMPT_TEMPLATE,
      defaultSystemPromptEn: DEFAULT_OPTIMIZATION_SYSTEM_PROMPT_EN,
      defaultUserPromptTemplateEn: DEFAULT_USER_PROMPT_TEMPLATE_EN,
    });
  }

  /** Handle test connection */
  private async _handleTestConnection() {
    if (!this._view) { return; }
    this._view.webview.postMessage({ type: 'testing' });

    // Quick validation: try to optimize a simple test prompt
    const result = await this._optimizer.optimize('Hello');
    if (result.success) {
      this._view.webview.postMessage({ type: 'testResult', success: true });
      vscode.window.showInformationMessage('Connection test successful!');
    } else {
      this._view.webview.postMessage({
        type: 'testResult',
        success: false,
        error: result.error,
      });
    }
  }

  /** Handle resetting the system prompt to default */
  private async _handleResetSystemPrompt() {
    if (!this._view) { return; }
    const config = this._configManager.getConfig();
    config.systemPrompt = '';
    await this._configManager.setConfig(config);
    const defaultPrompt = config.language === 'en' ? DEFAULT_OPTIMIZATION_SYSTEM_PROMPT_EN : DEFAULT_OPTIMIZATION_SYSTEM_PROMPT;
    this._view.webview.postMessage({
      type: 'resetSystemPromptResult',
      systemPrompt: defaultPrompt,
    });
    vscode.window.showInformationMessage('System prompt reset to default.');
  }

  /** Handle resetting the user prompt template to default */
  private async _handleResetUserPromptTemplate() {
    if (!this._view) { return; }
    const config = this._configManager.getConfig();
    config.userPromptTemplate = '';
    await this._configManager.setConfig(config);
    const defaultTemplate = config.language === 'en' ? DEFAULT_USER_PROMPT_TEMPLATE_EN : DEFAULT_USER_PROMPT_TEMPLATE;
    this._view.webview.postMessage({
      type: 'resetUserPromptTemplateResult',
      userPromptTemplate: defaultTemplate,
    });
    vscode.window.showInformationMessage('User prompt template reset to default.');
  }

  /** Handle language change */
  private async _handleChangeLanguage(language: string) {
    if (!this._view) { return; }
    const config = this._configManager.getConfig();
    config.language = language as 'zh' | 'en';
    await this._configManager.setConfig(config);
    vscode.window.showInformationMessage(`Language switched to ${language === 'en' ? 'English' : '中文'}.`);
  }

  /** Generate the HTML content for the webview */
  private async _getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    return getSidebarHtml(webview, this._extensionUri);
  }
}
