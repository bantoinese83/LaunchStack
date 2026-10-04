'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Card } from '@template/ui';
import { getErrorMessage } from '@template/validation';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { LOCALES, type Locale } from '@/lib/i18n/dictionaries';

export default function PrivacySettingsPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const exportData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authorizedFetch('/api/privacy/export', { method: 'POST' });
      if (!response.ok) throw new Error(await readApiError(response, 'Export failed'));
      const payload = await response.json();
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'launchstack-data-export.json';
      link.click();
      URL.revokeObjectURL(url);
      setMessage('Export downloaded.');
    } catch (err) {
      setError(getErrorMessage(err, 'Export failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('This deletes your Auth user and anonymizes your profile. Continue?')) {
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await authorizedFetch('/api/privacy/delete', { method: 'POST' });
      if (!response.ok) throw new Error(await readApiError(response, 'Delete failed'));
      router.push('/login');
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err, 'Delete failed'));
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          {t.privacy}
        </h1>
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}

      <Card className="space-y-3 p-6">
        <h2 className="font-display text-lg font-medium text-ink">{t.language}</h2>
        <select
          value={locale}
          onChange={(event) => setLocale(event.target.value as Locale)}
          className="rounded-md border border-line bg-surface px-3 py-2 text-sm"
        >
          {LOCALES.map((value) => (
            <option key={value} value={value}>
              {value.toUpperCase()}
            </option>
          ))}
        </select>
      </Card>

      <Card className="space-y-4 p-6">
        <h2 className="font-display text-lg font-medium text-ink">GDPR export and deletion</h2>
        <p className="text-sm text-muted">
          Download the profile, memberships, feedback, invites, and consent we store for your
          account, or request deletion.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void exportData()} isLoading={isLoading}>
            Export my data
          </Button>
          <Button variant="danger" onClick={() => void deleteAccount()} isLoading={isLoading}>
            Delete account
          </Button>
        </div>
      </Card>
    </div>
  );
}
