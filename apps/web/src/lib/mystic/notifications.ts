import { BrevoEmailService } from '@template/email';
import { sendSms, SMS_TEMPLATES } from '@template/sms';

export async function notifyBookingConfirmed(input: {
  email: string;
  phone?: string;
  whenLabel: string;
  /** @deprecated use transactionalSms for house-call updates */
  smsOptIn?: boolean;
  transactionalSms?: boolean;
}) {
  const email = new BrevoEmailService();
  await email.sendEmail({
    to: input.email,
    subject: 'Mystic Hair Co. — booking confirmed',
    htmlContent: `<p>You're confirmed for <strong>${input.whenLabel}</strong>.</p><p>House-call policies are in the app.</p>`,
  });

  const sendText = input.phone && (input.transactionalSms === true || input.smsOptIn === true);
  if (sendText && input.phone) {
    await sendSms({ to: input.phone, body: SMS_TEMPLATES.bookingConfirmed(input.whenLabel) });
  }
}

export async function notifyEnRoute(input: { phone: string; etaMinutes: number }) {
  await sendSms({ to: input.phone, body: SMS_TEMPLATES.onTheWay(input.etaMinutes) });
}

export async function notifyDoorTimer(input: { phone: string; minutes: number }) {
  await sendSms({ to: input.phone, body: SMS_TEMPLATES.doorTimer(input.minutes) });
}

export async function sendMarketingBlast(input: {
  recipients: { email?: string; phone?: string; name?: string }[];
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  body: string;
}) {
  const emailService = new BrevoEmailService();
  let sent = 0;

  for (const recipient of input.recipients) {
    if ((input.channel === 'email' || input.channel === 'both') && recipient.email) {
      const result = await emailService.sendEmail({
        to: recipient.email,
        toName: recipient.name,
        subject: input.subject ?? 'Mystic Hair Co.',
        htmlContent: `<p>${input.body.replace(/\n/g, '<br/>')}</p>`,
        textContent: input.body,
      });
      if (result.success) sent += 1;
    }
    if ((input.channel === 'sms' || input.channel === 'both') && recipient.phone) {
      const result = await sendSms({ to: recipient.phone, body: input.body });
      if (result.status === 'sent') sent += 1;
    }
  }

  return sent;
}
