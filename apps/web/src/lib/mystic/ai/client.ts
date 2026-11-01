import { createAihubmix } from '@aihubmix/ai-sdk-provider';
import { generateText, Output } from 'ai';
import { z } from 'zod';

/**
 * Primary: Claude Sonnet 5.5 via AIHubMix — stronger judgment for concierge / briefs / drafts.
 * Override with MYSTIC_AI_MODEL when needed.
 * (AIHubMix model ids use hyphens: claude-sonnet-5-5)
 */
export const MYSTIC_AI_PRIMARY_MODEL = 'claude-sonnet-5-5';
/** Cheap high-throughput fallback. */
export const MYSTIC_AI_FALLBACK_MODEL = 'gpt-6-luna';
/** Last-resort cheap model. */
export const MYSTIC_AI_LAST_RESORT_MODEL = 'claude-haiku-5-5';

export function mysticAiConfigured() {
  return Boolean(process.env.AIHUBMIX_API_KEY?.trim());
}

export function getAihubmix() {
  const apiKey = process.env.AIHUBMIX_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('AIHUBMIX_API_KEY is not configured');
  }
  return createAihubmix({ apiKey });
}

export function mysticAiModelId() {
  return process.env.MYSTIC_AI_MODEL?.trim() || MYSTIC_AI_PRIMARY_MODEL;
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model did not return JSON');
  }
  return JSON.parse(candidate.slice(start, end + 1)) as unknown;
}

function modelCascade() {
  return [
    ...new Set([
      mysticAiModelId(),
      MYSTIC_AI_PRIMARY_MODEL,
      MYSTIC_AI_FALLBACK_MODEL,
      MYSTIC_AI_LAST_RESORT_MODEL,
    ]),
  ];
}

export async function mysticGenerateJson<T>(input: {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
  maxOutputTokens?: number;
  temperature?: number;
}): Promise<{ data: T; model: string }> {
  const aihubmix = getAihubmix();
  const models = modelCascade();
  const temperature = input.temperature ?? 0.4;
  const maxOutputTokens = input.maxOutputTokens ?? 900;

  let lastError: unknown;
  for (const modelId of models) {
    try {
      const result = await generateText({
        model: aihubmix(modelId),
        system: input.system,
        prompt: input.prompt,
        maxOutputTokens,
        temperature,
        output: Output.object({ schema: input.schema }),
      });
      if (result.output == null) {
        throw new Error(`Empty structured output from ${modelId}`);
      }
      return { data: result.output as T, model: modelId };
    } catch (structuredErr) {
      lastError = structuredErr;
      try {
        const { text } = await generateText({
          model: aihubmix(modelId),
          system: `${input.system}\n\nRespond with a single JSON object only. No markdown. No reasoning preamble.`,
          prompt: input.prompt,
          maxOutputTokens,
          temperature,
        });
        if (!text?.trim()) {
          throw new Error(`Empty response from ${modelId}`);
        }
        const parsed = input.schema.parse(extractJsonObject(text));
        return { data: parsed, model: modelId };
      } catch (textErr) {
        lastError = textErr;
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error('AI generation failed');
}
