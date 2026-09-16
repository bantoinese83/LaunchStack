export interface SendEmailPayload {
  to: string;
  toName?: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
}
