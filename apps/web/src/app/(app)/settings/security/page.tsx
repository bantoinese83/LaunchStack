'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Alert, Button, Card, Input } from '@template/ui';
import { getErrorMessage } from '@template/validation';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';
import { getAuthCallbackUrl, getBrowserSupabaseClient } from '@/lib/supabase/browser-session';
import { OAUTH_PROVIDERS } from '@/lib/auth/oauth';

type Factor = { id: string; status: string; factor_type: string };

export default function SecuritySettingsPage() {
  const [factors, setFactors] = useState<Factor[]>([]);
  const [qr, setQr] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [identities, setIdentities] = useState<Array<{ id: string; provider: string }>>([]);

  const refreshFactors = async () => {
    const supabase = getBrowserSupabaseClient();
    const { data, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) throw listError;
    setFactors([
      ...data.totp.map((factor) => ({ ...factor, factor_type: 'totp' })),
      ...data.phone.map((factor) => ({ ...factor, factor_type: 'phone' })),
    ]);
    const { data: userData } = await supabase.auth.getUser();
    setIdentities(
      (userData.user?.identities ?? []).map((identity) => ({
        id: identity.identity_id,
        provider: identity.provider,
      }))
    );
  };

  const enrollTotp = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Authenticator',
      });
      if (enrollError) throw enrollError;
      setQr(data.totp.qr_code);
      setFactorId(data.id);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not start authenticator enrollment'));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTotp = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!factorId) return;
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId,
      });
      if (challengeError) throw challengeError;
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });
      if (verifyError) throw verifyError;
      setQr(null);
      setFactorId(null);
      setCode('');
      setMessage('Authenticator app is now required at sign-in.');
      await refreshFactors();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not verify authenticator code'));
    } finally {
      setIsLoading(false);
    }
  };

  const unenroll = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const supabase = getBrowserSupabaseClient();
      const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId: id });
      if (unenrollError) throw unenrollError;
      setMessage('Factor removed.');
      await refreshFactors();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not remove factor'));
    } finally {
      setIsLoading(false);
    }
  };

  const enrollPasskey = async () => {
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const supabase = getBrowserSupabaseClient();
      const mfa = supabase.auth.mfa as typeof supabase.auth.mfa & {
        enroll: (args: {
          factorType: 'totp' | 'phone' | 'webauthn';
          friendlyName?: string;
        }) => Promise<{
          error: Error | null;
        }>;
      };
      const { error: enrollError } = await mfa.enroll({
        factorType: 'webauthn',
        friendlyName: 'Passkey',
      });
      if (enrollError) throw enrollError;
      setMessage('Passkey enrolled. Use it on the next sign-in.');
      await refreshFactors();
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Passkeys are not enabled on this Auth project yet. Enable WebAuthn in Supabase Auth settings.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          Security
        </h1>
        <p className="mt-2 text-sm text-muted">
          Authenticator apps and passkeys raise the assurance level after password sign-in.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Authenticator app (TOTP)</h2>
        <Button variant="ghost" size="sm" onClick={() => void refreshFactors()}>
          Refresh enrolled factors
        </Button>
        {factors
          .filter((factor) => factor.factor_type === 'totp')
          .map((factor) => (
            <div
              key={factor.id}
              className="flex items-center justify-between rounded-lg border border-line p-3"
            >
              <p className="text-sm text-ink">
                {factor.status === 'verified' ? 'Active authenticator' : 'Pending authenticator'}
              </p>
              <Button variant="outline" size="sm" onClick={() => void unenroll(factor.id)}>
                Remove
              </Button>
            </div>
          ))}
        {qr ? (
          <form onSubmit={verifyTotp} className="space-y-4">
            <Image
              src={qr}
              alt="Authenticator QR code"
              width={160}
              height={160}
              unoptimized
              className="h-40 w-40 rounded-md border border-line"
            />
            <Input
              label="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              required
            />
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Confirm authenticator
            </Button>
          </form>
        ) : (
          <Button variant="primary" onClick={() => void enrollTotp()} isLoading={isLoading}>
            Enroll authenticator
          </Button>
        )}
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Passkeys</h2>
        <p className="text-sm text-muted">
          Uses Supabase WebAuthn when the Auth project has passkeys enabled.
        </p>
        <Button variant="outline" onClick={() => void enrollPasskey()} isLoading={isLoading}>
          Add a passkey
        </Button>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Recovery codes</h2>
        <p className="text-sm text-muted">
          Generate one-time codes you can use if you lose your authenticator.
        </p>
        <Button
          variant="outline"
          isLoading={isLoading}
          onClick={async () => {
            setIsLoading(true);
            setError(null);
            try {
              const response = await authorizedFetch('/api/security/recovery-codes', {
                method: 'POST',
              });
              if (!response.ok) {
                throw new Error(await readApiError(response, 'Could not generate recovery codes'));
              }
              const payload = (await response.json()) as { codes: string[] };
              setRecoveryCodes(payload.codes);
              setMessage('Store these codes now. They will not be shown again.');
            } catch (err) {
              setError(getErrorMessage(err, 'Could not generate recovery codes'));
            } finally {
              setIsLoading(false);
            }
          }}
        >
          Generate recovery codes
        </Button>
        {recoveryCodes.length > 0 ? (
          <ul className="grid grid-cols-2 gap-2 font-mono text-xs">
            {recoveryCodes.map((code) => (
              <li key={code} className="rounded-md border border-line bg-paper px-2 py-1">
                {code}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-medium text-ink">Connected identities</h2>
        <p className="text-sm text-muted">
          Link Google or GitHub so you can sign in with either provider.
        </p>
        <div className="space-y-2">
          {identities.map((identity) => (
            <div
              key={identity.id}
              className="flex items-center justify-between rounded-lg border border-line p-3 text-sm"
            >
              <span className="capitalize text-ink">{identity.provider}</span>
              <span className="text-xs text-muted">Linked</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          {OAUTH_PROVIDERS.map((provider) => (
            <Button
              key={provider}
              variant="outline"
              size="sm"
              onClick={async () => {
                setIsLoading(true);
                setError(null);
                try {
                  const supabase = getBrowserSupabaseClient();
                  const { error: linkError } = await supabase.auth.linkIdentity({
                    provider,
                    options: { redirectTo: getAuthCallbackUrl('/settings/security') },
                  });
                  if (linkError) throw linkError;
                } catch (err) {
                  setError(getErrorMessage(err, 'Could not link identity'));
                  setIsLoading(false);
                }
              }}
            >
              Link {provider}
            </Button>
          ))}
        </div>
      </Card>
    </div>
  );
}
