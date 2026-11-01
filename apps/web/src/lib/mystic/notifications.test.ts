import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendSms: vi.fn(async () => ({ status: 'sent' as const, sid: 'SM1' })),
}));

vi.mock('@template/sms', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@template/sms')>();
  return { ...actual, sendSms: mocks.sendSms };
});

vi.mock('@template/email', () => ({
  BrevoEmailService: class {
    sendEmail = vi.fn(async () => ({ success: true }));
  },
  escapeHtml: (value: string) => value,
}));

import { notifyDoorTimer, notifyEnRoute } from './notifications';

const PHONE = '+13125550100';

describe('appointment texts honour the client opt-out', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('skips the on-the-way text when the client opted out', async () => {
    const result = await notifyEnRoute({ phone: PHONE, etaMinutes: 20, smsOptIn: false });

    expect(mocks.sendSms).not.toHaveBeenCalled();
    expect(result.status).toBe('skipped');
  });

  test('sends the on-the-way text when the client is opted in', async () => {
    const result = await notifyEnRoute({ phone: PHONE, etaMinutes: 20, smsOptIn: true });

    expect(mocks.sendSms).toHaveBeenCalledTimes(1);
    expect(result.status).toBe('sent');
  });

  test('skips the door-timer text when the client opted out', async () => {
    const result = await notifyDoorTimer({ phone: PHONE, minutes: 15, smsOptIn: false });

    expect(mocks.sendSms).not.toHaveBeenCalled();
    expect(result.status).toBe('skipped');
  });

  test('sends the door-timer text when the client is opted in', async () => {
    await notifyDoorTimer({ phone: PHONE, minutes: 15, smsOptIn: true });

    expect(mocks.sendSms).toHaveBeenCalledTimes(1);
  });
});
