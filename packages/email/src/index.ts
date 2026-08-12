export interface SendEmailPayload {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export class BrevoEmailService {
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;

  constructor(apiKey?: string, senderEmail?: string, senderName?: string) {
    this.apiKey = apiKey || process.env.BREVO_API_KEY || '';
    this.senderEmail = senderEmail || process.env.SENDER_EMAIL || 'noreply@launchstack.com';
    this.senderName = senderName || process.env.SENDER_NAME || 'LaunchStack';
  }

  async sendEmail(
    payload: SendEmailPayload
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.apiKey) {
      console.warn(
        '[BrevoEmailService] API key not configured. Mocking email send:',
        payload.subject,
        'to:',
        payload.to
      );
      return { success: true, messageId: 'mock-message-id' };
    }

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': this.apiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: payload.to, name: payload.toName || payload.to }],
          subject: payload.subject,
          htmlContent: payload.htmlContent,
          textContent: payload.textContent || payload.subject,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send email via Brevo');
      }

      const data = await response.json();
      return { success: true, messageId: data.messageId };
    } catch (err: any) {
      console.error('[BrevoEmailService Error]', err);
      return { success: false, error: err.message || 'Unknown email error' };
    }
  }

  // EMAIL TEMPLATES
  async sendWelcomeEmail(to: string, name: string): Promise<any> {
    return this.sendEmail({
      to,
      toName: name,
      subject: 'Welcome to LaunchStack!',
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">Welcome aboard, ${name}! 👋</h2>
          <p style="color: #475569; line-height: 1.6;">Thank you for joining LaunchStack. You can now create your workspace, invite team members, and get started.</p>
          <a href="https://launchstack.com/dashboard" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">Go to Dashboard</a>
        </div>
      `,
    });
  }

  async sendWorkspaceInvite(
    to: string,
    inviterName: string,
    workspaceName: string,
    inviteUrl: string
  ): Promise<any> {
    return this.sendEmail({
      to,
      subject: `You've been invited to join ${workspaceName} on LaunchStack`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">Workspace Invitation</h2>
          <p style="color: #475569; line-height: 1.6;"><strong>${inviterName}</strong> has invited you to collaborate in the workspace <strong>${workspaceName}</strong>.</p>
          <a href="${inviteUrl}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 16px;">Accept Invitation</a>
        </div>
      `,
    });
  }

  async sendFeedbackStatusUpdate(to: string, postTitle: string, newStatus: string): Promise<any> {
    return this.sendEmail({
      to,
      subject: `Update on feedback: "${postTitle}"`,
      htmlContent: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0f172a;">Feedback Status Updated</h2>
          <p style="color: #475569; line-height: 1.6;">The feedback item <strong>"${postTitle}"</strong> has been updated to status: <strong style="text-transform: capitalize; color: #2563eb;">${newStatus.replace('_', ' ')}</strong>.</p>
        </div>
      `,
    });
  }
}
