export type AnalyticsEvent =
  | { name: 'marketing_page_viewed'; properties: { path: string; referrer?: string } }
  | { name: 'cta_clicked'; properties: { button_id: string; location: string } }
  | { name: 'signup_started'; properties: { provider: 'email' | 'google' | 'github' } }
  | { name: 'signup_completed'; properties: { user_id: string; email: string } }
  | {
      name: 'workspace_created';
      properties: { workspace_id: string; workspace_name: string; slug: string };
    }
  | {
      name: 'member_invited';
      properties: { workspace_id: string; invited_email: string; role: string };
    }
  | {
      name: 'subscription_started';
      properties: { workspace_id: string; plan_id: string; amount: number };
    }
  | { name: 'subscription_canceled'; properties: { workspace_id: string; plan_id: string } }
  | {
      name: 'feedback_submitted';
      properties: { workspace_id: string; post_id: string; category: string };
    }
  | { name: 'feedback_upvoted'; properties: { post_id: string } };

export class AnalyticsTracker {
  private apiKey: string;
  private apiHost: string;

  constructor(apiKey?: string, apiHost?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
    this.apiHost = apiHost || process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  }

  track<T extends AnalyticsEvent>(event: T, userId?: string): void {
    if (!this.apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[Analytics Mock Track]:',
          event.name,
          event.properties,
          userId ? `(User: ${userId})` : ''
        );
      }
      return;
    }

    try {
      fetch(`${this.apiHost}/capture/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_key: this.apiKey,
          event: event.name,
          properties: {
            ...event.properties,
            distinct_id: userId || 'anonymous',
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch((err) => console.error('[PostHog Capture Error]', err));
    } catch (err) {
      console.error('[Analytics Tracker Exception]', err);
    }
  }
}

export const analytics = new AnalyticsTracker();
