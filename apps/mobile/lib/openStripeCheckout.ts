import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

/**
 * Opens Stripe Checkout in an in-app browser session (not full Safari/Chrome).
 * Closes automatically when Stripe redirects to `returnUrlPrefix` (e.g. mystichair://book/success).
 */
export async function openStripeCheckoutSession(
  checkoutUrl: string,
  returnUrlPrefix: string
): Promise<{ ok: true; url: string } | { ok: false; reason: 'cancel' | 'dismiss' }> {
  const result = await WebBrowser.openAuthSessionAsync(checkoutUrl, returnUrlPrefix);
  if (result.type === 'success' && result.url) {
    return { ok: true, url: result.url };
  }
  if (result.type === 'cancel') {
    return { ok: false, reason: 'cancel' };
  }
  return { ok: false, reason: 'dismiss' };
}
