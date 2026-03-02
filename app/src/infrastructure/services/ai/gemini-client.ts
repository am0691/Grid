/**
 * Gemini API Client
 * Low-level wrapper for Google Generative AI
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

export interface GeminiConfig {
  apiKey: string;
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
}

export class GeminiClient {
  private model: GenerativeModel;
  private requestCount = 0;
  private lastResetTime = Date.now();
  private readonly RATE_LIMIT = 15; // Free tier: 15 requests per minute

  constructor(config: GeminiConfig) {
    const client = new GoogleGenerativeAI(config.apiKey);
    this.model = client.getGenerativeModel({
      model: config.model || 'gemini-1.5-flash',
      generationConfig: {
        maxOutputTokens: config.maxOutputTokens || 1024,
        temperature: config.temperature || 0.7,
      },
    });
  }

  /**
   * Generate JSON response from prompt
   */
  async generateJSON<T>(prompt: string): Promise<T | null> {
    if (!this.checkRateLimit()) {
      console.warn('Rate limit exceeded, returning null');
      return null;
    }

    const jsonPrompt = `${prompt}\n\nIMPORTANT: Respond ONLY with valid JSON. Do not include markdown code blocks.`;

    try {
      const result = await this.model.generateContent(jsonPrompt);
      const responseText = result.response.text();

      // Clean up markdown code blocks if present
      const cleaned = responseText
        .replace(/```json\n?|\n?```/g, '')
        .trim();

      return JSON.parse(cleaned) as T;
    } catch (error) {
      console.error('Gemini API error:', error);
      return null;
    }
  }

  /**
   * Check rate limit (15 requests per minute)
   */
  private checkRateLimit(): boolean {
    const now = Date.now();

    // Reset counter every minute
    if (now - this.lastResetTime > 60000) {
      this.requestCount = 0;
      this.lastResetTime = now;
    }

    this.requestCount++;
    return this.requestCount <= this.RATE_LIMIT;
  }

  /**
   * Get current rate limit status
   */
  getRateLimitStatus(): { remaining: number; resetsIn: number } {
    const now = Date.now();
    const remaining = Math.max(0, this.RATE_LIMIT - this.requestCount);
    const resetsIn = Math.max(0, 60000 - (now - this.lastResetTime));

    return { remaining, resetsIn };
  }
}
