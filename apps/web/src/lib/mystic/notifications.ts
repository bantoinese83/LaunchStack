import { BrevoEmailService, escapeHtml } from '@template/email';
import { sendSms, SMS_TEMPLATES } from '@template/sms';

function logNotifyWarning(channel: string, detail: string) {
  console.warn(`[mystic.notify] ${channel}: ${detail}`);
}

export async function notifyBookingConfirmed(input: {
  email: string;
  phone?: string;
  whenLabel: string;
  /** @deprecated use transactionalSms for house-call updates */
  smsOptIn?: boolean;
  transactionalSms?: boolean;
}): Promise<{ email: 'sent' | 'skipped' | 'failed'; sms: 'sent' | 'skipped' | 'failed' }> {
  const result: { email: 'sent' | 'skipped' | 'failed'; sms: 'sent' | 'skipped' | 'failed' } = {
    email: 'skipped',
    sms: 'skipped',
  };
  const email = new BrevoEmailService();
  const emailResult = await email.sendEmail({
    to: input.email,
    subject: 'Mystic Hair Co. — booking confirmed',
    htmlContent: `<p>You're confirmed for <strong>${escapeHtml(input.whenLabel)}</strong>.</p><p>House-call policies are in the app.</p>`,
  });
  if (emailResult.success) result.email = 'sent';
  else {
    result.email = 'failed';
    logNotifyWarning('email', emailResult.error ?? 'send failed');
  }

  const sendText = input.phone && (input.transactionalSms === true || input.smsOptIn === true);
  if (sendText && input.phone) {
    const smsResult = await sendSms({
      to: input.phone,
      body: SMS_TEMPLATES.bookingConfirmed(input.whenLabel),
    });
    if (smsResult.status === 'sent') result.sms = 'sent';
    else if (smsResult.status === 'error') {
      result.sms = 'failed';
      logNotifyWarning('sms', smsResult.message);
    }
  }

  return result;
}

export async function notifyEnRoute(input: { phone: string; etaMinutes: number }) {
  const smsResult = await sendSms({
    to: input.phone,
    body: SMS_TEMPLATES.onTheWay(input.etaMinutes),
  });
  if (smsResult.status === 'error') {
    logNotifyWarning('sms', smsResult.message);
  }
  return smsResult;
}

export async function notifyDoorTimer(input: { phone: string; minutes: number }) {
  const smsResult = await sendSms({
    to: input.phone,
    body: SMS_TEMPLATES.doorTimer(input.minutes),
  });
  if (smsResult.status === 'error') {
    logNotifyWarning('sms', smsResult.message);
  }
  return smsResult;
}

export async function sendMarketingBlast(input: {
  recipients: { email?: string; phone?: string; name?: string }[];
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  body: string;
}) {
  const emailService = new BrevoEmailService();
  const outcomes = await Promise.all(
    input.recipients.flatMap((recipient) => {
      const jobs: Promise<boolean>[] = [];
      if ((input.channel === 'email' || input.channel === 'both') && recipient.email) {
        jobs.push(
          emailService
            .sendEmail({
              to: recipient.email,
              toName: recipient.name,
              subject: input.subject ?? 'Mystic Hair Co.',
              htmlContent: `<p>${input.body.replace(/\n/g, '<br/>')}</p>`,
              textContent: input.body,
            })
            .then((result) => {
              if (!result.success) logNotifyWarning('email', result.error ?? 'blast failed');
              return result.success;
            })
        );
      }
      if ((input.channel === 'sms' || input.channel === 'both') && recipient.phone) {
        jobs.push(
          sendSms({ to: recipient.phone, body: input.body }).then((result) => {
            if (result.status === 'error') logNotifyWarning('sms', result.message);
            return result.status === 'sent';
          })
        );
      }
      return jobs;
    })
  );

  return outcomes.filter(Boolean).length;
}
