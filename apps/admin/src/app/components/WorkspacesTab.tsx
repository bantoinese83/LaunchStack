import React from 'react';
import { Card, Badge, Button } from '@template/ui';

export function WorkspacesTab() {
  return (
    <Card className="animate-[rise_350ms_ease-out]">
      <h3 className="mb-1 font-display text-lg font-semibold tracking-tight text-ink">
        Platform workspaces
      </h3>
      <p className="mb-6 text-sm text-muted">
        Manage customer tenants, inspect RLS state, and override subscription plans.
      </p>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-md border border-line bg-paper p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="font-semibold text-ink">Acme Corp</h4>
            <p className="mt-0.5 text-xs text-muted">
              slug: acme-corp · Owner: alex@launchstack.com · Stripe: sub_mock_12345
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Pro Active</Badge>
            <Button variant="outline" size="sm">
              Inspect
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
