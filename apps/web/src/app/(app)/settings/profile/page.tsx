'use client';

import { useRef, useState } from 'react';
import { Alert, Avatar, Button, Card } from '@template/ui';
import { getErrorMessage } from '@template/validation';
import { authorizedFetch } from '@/lib/api/authorized-fetch';
import { readApiError } from '@/lib/api/read-api-error';
import { useI18n } from '@/lib/i18n/I18nProvider';
import { useAppWorkspace } from '../../context/AppWorkspaceContext';

export default function ProfileSettingsPage() {
  const { t } = useI18n();
  const { profile, patchProfile } = useAppWorkspace();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await authorizedFetch('/api/profile/avatar', {
        method: 'POST',
        body: form,
        headers: {},
      });
      if (!response.ok) throw new Error(await readApiError(response, 'Upload failed'));
      const payload = (await response.json()) as { url: string };
      setAvatarUrl(payload.url);
      patchProfile({ avatar_url: payload.url });
      setMessage('Avatar updated.');
    } catch (err) {
      setError(getErrorMessage(err, 'Upload failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-8">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">Account</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink">
          {t.profile}
        </h1>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.full_name || profile?.email || 'User'} src={avatarUrl} size="lg" />
          <div>
            <p className="font-medium text-ink">{profile?.full_name || 'Member'}</p>
            <p className="text-sm text-muted">{profile?.email}</p>
          </div>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            disabled={isLoading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = '';
            }}
          />
          <Button
            variant="outline"
            isLoading={isLoading}
            type="button"
            onClick={() => fileInputRef.current?.click()}
          >
            {isLoading ? 'Uploading…' : 'Upload new avatar'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
