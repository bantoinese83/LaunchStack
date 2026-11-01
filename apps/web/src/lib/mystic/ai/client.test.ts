import { describe, expect, it } from 'vitest';
import {
  MYSTIC_AI_FALLBACK_MODEL,
  MYSTIC_AI_LAST_RESORT_MODEL,
  MYSTIC_AI_PRIMARY_MODEL,
} from './client';
import { bookingConciergeSchema, messageSuggestSchema, stopBriefSchema } from './schemas';

describe('mystic AI models', () => {
  it('defaults to Sonnet with Luna and Haiku fallbacks', () => {
    expect(MYSTIC_AI_PRIMARY_MODEL).toBe('claude-sonnet-5-5');
    expect(MYSTIC_AI_FALLBACK_MODEL).toBe('gpt-6-luna');
    expect(MYSTIC_AI_LAST_RESORT_MODEL).toBe('claude-haiku-5-5');
  });
});

describe('AI schemas', () => {
  it('accepts an enriched stop brief payload', () => {
    expect(
      stopBriefSchema.parse({
        headline: 'Soft glam for Jordan',
        bullets: ['Check gate code in notes', 'Bring curling iron', 'Confirm inspo on phone'],
        bring: 'Hot tools + shine spray',
        vibe: 'Wedding guest',
        opener: 'Hey Jordan — outside in 5, hair still dry?',
        watchouts: ['High-rise elevator lobby'],
        kit: ['Fine barrel', 'Shine spray'],
      })
    ).toMatchObject({ headline: 'Soft glam for Jordan' });
  });

  it('accepts message drafts and richer concierge picks', () => {
    expect(
      messageSuggestSchema.parse({
        replies: [
          'On my way — about 12 min',
          'Outside now, starting the door timer',
          'Got it — soft waves, clean dry hair ready?',
        ],
        situation: 'Client confirming look before arrival',
      }).replies
    ).toHaveLength(3);
    expect(
      bookingConciergeSchema.parse({
        serviceId: 'updo',
        reason: 'Event-ready style matches your wedding guest ask.',
        tip: 'Upload inspo photos on the details step.',
        confidence: 'high',
        alternatives: [{ serviceId: 'blowout', why: 'If you want volume without pins.' }],
        suggestedTags: ['open_to_chat'],
      }).serviceId
    ).toBe('updo');
  });
});
