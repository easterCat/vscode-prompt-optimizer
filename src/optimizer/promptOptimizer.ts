import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';
import { ModelConfigManager, ModelConfigData } from '../config/modelConfig';
import { DEFAULT_OPTIMIZATION_SYSTEM_PROMPT } from './systemPrompt';
import { DEFAULT_USER_PROMPT_TEMPLATE, fillUserPromptTemplate } from './userPromptTemplate';

/** The structure of a Chat Completions message */
interface ChatMessage {
  role: 'system' | 'user';
  content: string;
}

/** OpenAI-compatible Chat Completions request body */
interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
}

/** Result of an optimization attempt */
export interface OptimizationResult {
  success: boolean;
  optimizedPrompt?: string;
  error?: string;
}

export class PromptOptimizer {
  constructor(private readonly configManager: ModelConfigManager) {}

  /**
   * Optimize the given prompt using the configured model provider.
   * Uses OpenAI-compatible Chat Completions API format.
   */
  async optimize(userPrompt: string): Promise<OptimizationResult> {
    // Validate inputs
    const apiKey = await this.configManager.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API Key is not configured. Please set it in the sidebar settings.' };
    }

    const config = this.configManager.getConfig();
    if (!config.modelName) {
      return { success: false, error: 'Model name is not configured. Please set it in the sidebar settings.' };
    }

    if (!userPrompt.trim()) {
      return { success: false, error: 'Please enter a prompt to optimize.' };
    }

    // Use configured user prompt template, falling back to default
    const userTemplate = config.userPromptTemplate || DEFAULT_USER_PROMPT_TEMPLATE;

    // Build request
    const requestBody: ChatCompletionRequest = {
      model: config.modelName,
      messages: [
        { role: 'system', content: config.systemPrompt || DEFAULT_OPTIMIZATION_SYSTEM_PROMPT },
        { role: 'user', content: fillUserPromptTemplate(userPrompt, userTemplate) },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    };

    // Determine endpoint URL
    const endpointUrl = this.buildEndpointUrl(config);

    try {
      const responseText = await this.makeRequest(endpointUrl, apiKey, requestBody);
      // Extract content from OpenAI-compatible response
      const parsed = JSON.parse(responseText);
      const content = parsed?.choices?.[0]?.message?.content;
      if (!content) {
        return { success: false, error: 'Unexpected API response format. No content in response.' };
      }
      return { success: true, optimizedPrompt: content.trim() };
    } catch (err: any) {
      return { success: false, error: err.message || 'Unknown error occurred during optimization.' };
    }
  }

  /** Build the full endpoint URL for chat completions */
  private buildEndpointUrl(config: ModelConfigData): string {
    let base = config.baseUrl.replace(/\/+$/, '');

    // For Gemini, append the model path differently
    if (config.provider === 'gemini') {
      return `${base}/models/${config.modelName}:generateContent?key=`;
    }

    // OpenAI-compatible providers (openai, deepseek, custom)
    return `${base}/chat/completions`;
  }

  /** Make an HTTPS/HTTP POST request and return the response body */
  private makeRequest(
    url: string,
    apiKey: string,
    body: ChatCompletionRequest
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsedUrl = new URL(url);
      const isHttps = parsedUrl.protocol === 'https:';
      const transport = isHttps ? https : http;

      // For Gemini, append API key as query parameter
      let finalUrl = url;
      if (body.model && url.endsWith('key=')) {
        finalUrl = url + apiKey;
      }

      const finalParsedUrl = new URL(finalUrl);

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Gemini uses x-goog-api-key header
      if (finalParsedUrl.hostname.includes('googleapis.com')) {
        headers['x-goog-api-key'] = apiKey;
      } else {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      const postData = JSON.stringify(body);

      const options: https.RequestOptions = {
        hostname: finalParsedUrl.hostname,
        port: finalParsedUrl.port || (isHttps ? 443 : 80),
        path: finalParsedUrl.pathname + finalParsedUrl.search,
        method: 'POST',
        headers: {
          ...headers,
          'Content-Length': Buffer.byteLength(postData),
        },
      };

      const req = transport.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            let errorMsg = `API request failed with status ${res.statusCode}`;
            try {
              const errorBody = JSON.parse(data);
              errorMsg += `: ${errorBody?.error?.message || data}`;
            } catch {
              errorMsg += `: ${data}`;
            }
            reject(new Error(errorMsg));
          }
        });
      });

      req.on('error', (err) => {
        reject(new Error(`Network error: ${err.message}`));
      });

      req.setTimeout(60000, () => {
        req.destroy();
        reject(new Error('Request timed out after 60 seconds.'));
      });

      req.write(postData);
      req.end();
    });
  }
}
