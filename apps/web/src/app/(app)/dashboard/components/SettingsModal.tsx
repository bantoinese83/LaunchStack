import React from 'react';
import { Button, Input, Modal } from '@template/ui';
import { Workspace } from '@template/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWorkspace: Workspace | null;
  wsName: string;
  setWsName: (name: string) => void;
  showToast: (msg: string) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  selectedWorkspace,
  wsName,
  setWsName,
  showToast,
}: SettingsModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Workspace settings"
      description="Update workspace name and view tenant identifier."
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
          showToast('Workspace settings saved');
        }}
        className="space-y-4"
      >
        <Input
          label="Workspace Name"
          value={wsName}
          onChange={(e) => setWsName(e.target.value)}
          required
        />
        <Input
          label="Workspace Slug"
          helperText="Immutable after creation"
          value={selectedWorkspace?.slug || ''}
          disabled
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
