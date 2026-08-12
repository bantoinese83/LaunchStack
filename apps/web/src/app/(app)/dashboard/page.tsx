'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Avatar,
  Badge,
  BrandMark,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageLoader,
  StatsCard,
  Toast,
  fieldSelectClassName,
} from '@template/ui';
import { createSupabaseBrowserClient, DomainAPI } from '@template/api';
import {
  Workspace,
  Profile,
  WorkspaceMember,
  InvitableWorkspaceRole,
  INVITABLE_WORKSPACE_ROLES,
} from '@template/types';
import { inviteMemberSchema } from '@template/validation';
import { isSuperAdmin, isWorkspaceOwner } from '@template/auth';
import { getPlanLimits } from '@template/feature-flags';
import {
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Shield,
  Copy,
  Check,
  Settings,
  UserPlus,
} from 'lucide-react';

const ADMIN_PORTAL_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002';
const INVITE_ROLE_LABELS: Record<InvitableWorkspaceRole, string> = {
  workspace_member: 'Workspace Member',
  workspace_admin: 'Workspace Admin',
};

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<InvitableWorkspaceRole>('workspace_member');
  const [wsName, setWsName] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push('/login');
          return;
        }

        const api = new DomainAPI(supabase);
        const userProfile = await api.getProfile(session.user.id);
        const userWorkspaces = await api.getUserWorkspaces(session.user.id);

        setProfile(userProfile);
        setWorkspaces(userWorkspaces);

        if (userWorkspaces.length > 0) {
          const ws = userWorkspaces[0];
          setSelectedWorkspace(ws);
          setWsName(ws.name);
          const wsMembers = await api.getWorkspaceMembers(ws.id);
          setMembers(wsMembers);
        } else {
          router.push('/onboarding');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [router]);

  const planLimits = getPlanLimits('active');
  const seatCount = members.length || 1;
  const seatsRemainingPct = Math.max(
    0,
    Math.round(((planLimits.maxMembers - seatCount) / planLimits.maxMembers) * 100)
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopySlug = async () => {
    if (!selectedWorkspace) return;
    try {
      await navigator.clipboard.writeText(selectedWorkspace.slug);
      setCopiedSlug(true);
      showToast('Workspace slug copied');
      setTimeout(() => setCopiedSlug(false), 2000);
    } catch {
      showToast('Could not copy slug');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const validation = inviteMemberSchema.safeParse({ email: inviteEmail, role: inviteRole });
    if (!validation.success) {
      setModalError(validation.error.errors[0].message);
      return;
    }

    try {
      if (!selectedWorkspace || !profile) return;
      setInviteLoading(true);

      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const inviteUrl = `${origin}/login?invite=${selectedWorkspace.id}`;
      const response = await fetch('/api/email/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: inviteEmail,
          inviterName: profile.full_name || profile.email,
          workspaceName: selectedWorkspace.name,
          inviteUrl,
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error || 'Failed to send invite');
      }

      setShowInviteModal(false);
      setInviteEmail('');
      showToast(`Invitation sent to ${inviteEmail}`);
    } catch (err: unknown) {
      setModalError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return <PageLoader label="Loading workspace" />;
  }

  return (
    <div className="flex min-h-screen bg-paper text-ink">
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}

      <aside className="flex w-64 shrink-0 flex-col justify-between border-r border-line bg-surface p-5">
        <div>
          <div className="mb-8 flex items-center gap-3 px-1">
            <BrandMark size="sm" />
            <span className="font-display text-lg font-semibold tracking-tight">LaunchStack</span>
          </div>

          <div className="mb-6 px-1">
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
              Workspace
            </label>
            <select
              value={selectedWorkspace?.id || ''}
              onChange={(e) => {
                const ws = workspaces.find((w) => w.id === e.target.value);
                if (ws) {
                  setSelectedWorkspace(ws);
                  setWsName(ws.name);
                }
              }}
              className={fieldSelectClassName}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <nav className="space-y-0.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-md bg-accent/10 px-3 py-2.5 text-sm font-medium text-accent"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            <Link
              href="/feedback"
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted transition-colors hover:bg-paper hover:text-ink"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </Link>
            {isSuperAdmin(profile?.system_role) && (
              <a
                href={ADMIN_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-accent transition-colors hover:bg-accent-soft"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Portal</span>
              </a>
            )}
          </nav>
        </div>

        <div className="border-t border-line pt-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <Avatar name={profile?.full_name || profile?.email || 'User'} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold leading-none text-ink">
                  {profile?.full_name || 'User'}
                </p>
                <p className="mt-1 truncate text-xs text-muted">{profile?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              title="Sign Out"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4 text-muted" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
                {selectedWorkspace?.name}
              </h1>
              <Badge variant="success">Pro Active</Badge>
              <button
                type="button"
                onClick={handleCopySlug}
                className="inline-flex items-center gap-1.5 rounded-md border border-line bg-surface px-2.5 py-1 text-xs text-muted transition-colors hover:border-ink/30 hover:text-ink"
              >
                {copiedSlug ? (
                  <Check className="h-3 w-3 text-success" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                {selectedWorkspace?.slug}
              </button>
            </div>
            <p className="mt-1.5 text-sm text-muted">
              Manage team seats, customer roadmap, and Stripe entitlements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettingsModal(true)}
              className="gap-1.5"
            >
              <Settings className="h-4 w-4" /> Settings
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowInviteModal(true)}
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" /> Invite
            </Button>
          </div>
        </header>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
          <StatsCard
            title="Team Seat Usage"
            value={`${seatCount} / ${planLimits.maxMembers}`}
            change={`${seatsRemainingPct}% free`}
            isPositive={true}
            subtext={`Pro tier allows up to ${planLimits.maxMembers} seats`}
          />
          <StatsCard
            title="Roadmap Feedback"
            value="18"
            change="+5 this week"
            isPositive={true}
            subtext="5 items marked as Planned"
          />
          <StatsCard
            title="Stripe Subscription"
            value="$49 / mo"
            change="Active"
            isPositive={true}
            subtext="Next invoice on Aug 30, 2026"
          />
        </div>

        <Card className="border-line">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">
              Workspace teammates
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>
              Invite teammate
            </Button>
          </div>

          {members.length === 0 ? (
            <EmptyState
              title="No teammates yet"
              description="Invite your first collaborator to share this workspace."
              action={
                <Button size="sm" onClick={() => setShowInviteModal(true)}>
                  Invite member
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted">
                <thead className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  <tr>
                    <th className="px-3 py-3">Member</th>
                    <th className="px-3 py-3">Role</th>
                    <th className="px-3 py-3">Joined</th>
                    <th className="px-3 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {members.map((mem) => (
                    <tr key={mem.id} className="transition-colors hover:bg-paper/70">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            name={mem.profile?.full_name || mem.profile?.email || 'User'}
                            size="sm"
                          />
                          <div>
                            <p className="font-semibold leading-none text-ink">
                              {mem.profile?.full_name || 'Member'}
                            </p>
                            <p className="mt-1 text-xs text-muted">{mem.profile?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant={isWorkspaceOwner(mem.role) ? 'purple' : 'info'}>
                          {mem.role.replaceAll('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-muted">
                        {new Date(mem.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Modal
          isOpen={showInviteModal}
          onClose={() => {
            setShowInviteModal(false);
            setModalError(null);
          }}
          title="Invite team member"
          description="Send an email invitation powered by Brevo."
        >
          {modalError && (
            <Alert className="mb-4" variant="error">
              {modalError}
            </Alert>
          )}
          <form onSubmit={handleInviteMember} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Role
              </label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as InvitableWorkspaceRole)}
                className={fieldSelectClassName}
              >
                {INVITABLE_WORKSPACE_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {INVITE_ROLE_LABELS[role]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setShowInviteModal(false);
                  setModalError(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={inviteLoading}>
                Send invitation
              </Button>
            </div>
          </form>
        </Modal>

        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Workspace settings"
          description="Update workspace name and view tenant identifier."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowSettingsModal(false);
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
              <Button variant="ghost" type="button" onClick={() => setShowSettingsModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save changes
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
