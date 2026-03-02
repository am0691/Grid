/**
 * Insights Service Factory
 * Creates appropriate service based on API key availability
 */

import { GeminiClient } from '../../infrastructure/services/ai/gemini-client';
import { AIInsightsService } from './ai-insights-service';
import { RuleBasedInsightsService } from './rule-based-insights-service';

export type InsightsService = AIInsightsService | RuleBasedInsightsService;

/**
 * Create insights service based on API key availability
 */
export function createInsightsService(apiKey?: string): InsightsService {
  // Check if valid Gemini API key is provided
  if (apiKey && apiKey.startsWith('AIza')) {
    console.info('Using AI-powered insights with Gemini API');
    const client = new GeminiClient({ apiKey });
    return new AIInsightsService(client);
  }

  console.info('No valid API key provided, using rule-based insights');
  return new RuleBasedInsightsService();
}

/**
 * Check if service is AI-powered
 */
export function isAIPowered(service: InsightsService): service is AIInsightsService {
  return service instanceof AIInsightsService;
}
