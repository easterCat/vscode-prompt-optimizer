import * as vscode from 'vscode';
import { DEFAULT_USER_PROMPT_TEMPLATE } from '../optimizer/userPromptTemplate';

/** Supported model providers */
export type ModelProvider = 'openai' | 'gemini' | 'deepseek' | 'custom';

/** Supported languages */
export type Language = 'zh' | 'en';

/** Non-sensitive configuration stored in globalState */
export interface ModelConfigData {
  provider: ModelProvider;
  baseUrl: string;
  modelName: string;
  systemPrompt: string;
  userPromptTemplate: string;
  language: Language;
}

/** Default Base URLs per provider */
const DEFAULT_BASE_URLS: Record<ModelProvider, string> = {
  openai: 'https://api.openai.com/v1',
  gemini: 'https://generativelanguage.googleapis.com/v1beta',
  deepseek: 'https://api.deepseek.com/v1',
  custom: '',
};

const STORAGE_KEY_API = 'easyPromptOptimizer.apiKey';
const STATE_KEY_CONFIG = 'easyPromptOptimizer.modelConfig';

export class ModelConfigManager {
  private static readonly SECRET_KEY = STORAGE_KEY_API;

  constructor(private readonly context: vscode.ExtensionContext) {}

  /** Get the stored API key from SecretStorage */
  async getApiKey(): Promise<string | undefined> {
    return this.context.secrets.get(ModelConfigManager.SECRET_KEY);
  }

  /** Save the API key to SecretStorage */
  async setApiKey(key: string): Promise<void> {
    await this.context.secrets.store(ModelConfigManager.SECRET_KEY, key);
  }

  /** Delete the API key from SecretStorage */
  async deleteApiKey(): Promise<void> {
    await this.context.secrets.delete(ModelConfigManager.SECRET_KEY);
  }

  /** Get non-sensitive config from globalState */
  getConfig(): ModelConfigData {
    const stored = this.context.globalState.get<ModelConfigData>(STATE_KEY_CONFIG);
    if (stored) {
      return stored;
    }
    // Return defaults
    return {
      provider: 'openai',
      baseUrl: DEFAULT_BASE_URLS.openai,
      modelName: 'gpt-4o',
      systemPrompt: '',
      userPromptTemplate: DEFAULT_USER_PROMPT_TEMPLATE,
      language: 'zh',
    };
  }

  /** Save non-sensitive config to globalState */
  async setConfig(config: ModelConfigData): Promise<void> {
    await this.context.globalState.update(STATE_KEY_CONFIG, config);
  }

  /** Get the default base URL for a given provider */
  getDefaultBaseUrl(provider: ModelProvider): string {
    return DEFAULT_BASE_URLS[provider];
  }

  /** Check if the configuration is complete (API key + model name present) */
  async isConfigured(): Promise<boolean> {
    const apiKey = await this.getApiKey();
    const config = this.getConfig();
    return !!apiKey && !!config.modelName;
  }
}
