'use client';

import React, { useState } from 'react';
import { Alert, Button, Input, Modal } from '@template/ui';
import { Workspace } from '@template/types';
import { getErrorMessage } from '@template/validation';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorkspace: Workspace | null;
  wsName: string;
  setWsName: (name: string) => void;
  wsLogoUrl: string;
  setWsLogoUrl: (url: string) => void;
  onSave: (input: { name: string; logoUrl: string }) => Promise<void>;
  showToast: (msg: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  selectedWorkspace,
  wsName,
  setWsName,
  wsLogoUrl,
  setWsLogoUrl,
  onSave,
  showToast,
}: SettingsModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await onSave({ name: wsName, logoUrl: wsLogoUrl });
      handleClose();
      showToast('Workspace settings saved');
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save workspace settings'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Workspace settings"
      description="Update workspace name, logo, and view tenant identifier."
    >
      {error && (
        <Alert className="mb-4" variant="error">
          {error}
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Workspace Name"
          value={wsName}
          onChange={(e) => setWsName(e.target.value)}
          required
        />
        <Input
          label="Logo URL"
          type="url"
          placeholder="https://cdn.example.com/logo.png"
          helperText="Public HTTPS URL for your workspace logo. Leave empty to remove."
          value={wsLogoUrl}
          onChange={(e) => setWsLogoUrl(e.target.value)}
        />
        <Input
          label="Workspace Slug"
          helperText="Immutable after creation"
          value={selectedWorkspace?.slug || ''}
          disabled
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isSaving}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
