/**
 * Twilio SMS — transactional + blast helpers.
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_MESSAGING_FROM.
 */

export type SmsSendInput = {
  to: string;
  body: string;
};

export type SmsSendResult =
  | { status: 'sent'; sid: string }
  | { status: 'skipped'; reason: string }
  | { status: 'error'; message: string };

function twilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_MESSAGING_FROM
  );
}

/** E.164-ish normalization for US numbers during MVP. */
export function normalizeUsPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (input.startsWith('+')) return input;
  return `+${digits}`;
}

export async function sendSms(input: SmsSendInput): Promise<SmsSendResult> {
  if (!twilioConfigured()) {
    return { status: 'skipped', reason: 'Twilio env vars not configured' };
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const from = process.env.TWILIO_MESSAGING_FROM!;
  const to = normalizeUsPhone(input.to);

  const body = new URLSearchParams({
    To: to,
    From: from,
    Body: input.body,
  });

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body,
      }
    );

    const payload = (await response.json()) as { sid?: string; message?: string };
    if (!response.ok) {
      return { status: 'error', message: payload.message ?? 'Twilio request failed' };
    }
    return { status: 'sent', sid: payload.sid ?? 'unknown' };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Twilio network error',
    };
  }
}

export const SMS_TEMPLATES = {
  bookingConfirmed: (when: string) =>
    `Mystic Hair Co.: You're booked for ${when}. House-call policies are in your confirmation email.`,
  onTheWay: (etaMinutes: number, mapUrl?: string) =>
    mapUrl
      ? `Luke is on the way (~${etaMinutes} min). Live map: ${mapUrl}`
      : `Luke is on the way — about ${etaMinutes} min. Reply if you need anything.`,
  doorTimer: (minutes: number) =>
    `Luke is at your door. Please answer within ${minutes} minutes to keep your appointment.`,
} as const;
