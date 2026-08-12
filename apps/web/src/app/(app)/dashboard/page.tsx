'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Badge, Modal, Input, StatsCard, Avatar } from '@template/ui';
import { createSupabaseBrowserClient, DomainAPI } from '@template/api';
import { Workspace, Profile, WorkspaceMember } from '@template/types';
import { inviteMemberSchema } from '@template/validation';
import { BrevoEmailService } from '@template/email';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  MessageSquare,
  LogOut,
  Plus,
  Shield,
  Copy,
  Check,
  Settings,
  UserPlus,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals & Interactivity
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'workspace_admin' | 'workspace_member'>(
    'workspace_member'
  );
  const [wsName, setWsName] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopySlug = () => {
    if (!selectedWorkspace) return;
    navigator.clipboard.writeText(selectedWorkspace.slug);
    setCopiedSlug(true);
    showToast('Workspace slug copied to clipboard!');
    setTimeout(() => setCopiedSlug(false), 2000);
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
      const emailService = new BrevoEmailService();
      await emailService.sendWorkspaceInvite(
        inviteEmail,
        profile.full_name || profile.email,
        selectedWorkspace.name,
        `https://launchstack.com/login?invite=${selectedWorkspace.id}`
      );

      setShowInviteModal(false);
      setInviteEmail('');
      showToast(`Invitation sent to ${inviteEmail}`);
    } catch (err: any) {
      setModalError(err.message || 'Failed to send invite');
    }
  };

  const handleSignOut = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-300 px-4 py-3 text-sm shadow-xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <Check className="h-4 w-4" /> {toastMessage}
        </div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 font-bold text-white shadow-md">
              LS
            </div>
            <span className="text-lg font-bold text-white">LaunchStack</span>
          </div>

          {/* WORKSPACE SELECTOR */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
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
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-blue-600/10 text-blue-400 font-medium text-sm"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview</span>
            </Link>
            <Link
              href="/feedback"
              className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 text-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Feedback Engine</span>
            </Link>
            {profile?.system_role === 'super_admin' && (
              <a
                href="http://localhost:3002"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-purple-400 hover:bg-purple-950/40 text-sm"
              >
                <Shield className="h-4 w-4" />
                <span>Admin Portal</span>
              </a>
            )}
          </nav>
        </div>

        <div>
          <div className="border-t border-slate-800 pt-4 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar name={profile?.full_name || profile?.email || 'User'} size="sm" />
              <div>
                <p className="text-sm font-semibold text-white leading-none">
                  {profile?.full_name || 'User'}
                </p>
                <p className="text-xs text-slate-400 truncate max-w-[120px] mt-1">
                  {profile?.email}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut} title="Sign Out">
              <LogOut className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{selectedWorkspace?.name}</h1>
              <Badge variant="success">Stripe Pro Active</Badge>
              <button
                onClick={handleCopySlug}
                className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800"
              >
                {copiedSlug ? (
                  <Check className="h-3 w-3 text-emerald-400" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
                slug: {selectedWorkspace?.slug}
              </button>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Manage team seats, customer roadmap, and Stripe entitlements.
            </p>
          </div>

          <div className="flex items-center space-x-3">
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
              <UserPlus className="h-4 w-4" /> Invite Member
            </Button>
          </div>
        </header>

        {/* METRICS STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Team Seat Usage"
            value={`${members.length || 1} / 20`}
            change="80% Available"
            isPositive={true}
            subtext="Pro tier allows up to 20 seats"
          />

          <StatsCard
            title="Roadmap Feedback"
            value="18 Posts"
            change="+5 This Week"
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

        {/* TEAM MEMBERS TABLE */}
        <Card className="border-slate-800 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Workspace Teammates</h2>
            <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>
              + Invite Teammate
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Workspace Role</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {members.map((mem) => (
                  <tr key={mem.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <Avatar
                        name={mem.profile?.full_name || mem.profile?.email || 'User'}
                        size="sm"
                      />
                      <div>
                        <p className="font-semibold text-white leading-none">
                          {mem.profile?.full_name || 'Member'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">{mem.profile?.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={mem.role === 'workspace_owner' ? 'purple' : 'info'}>
                        {mem.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-xs font-mono text-slate-400">
                      {new Date(mem.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* MODAL: INVITE TEAMMATE */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Invite Team Member"
          description="Send an email invitation link powered by Brevo API."
        >
          {modalError && <div className="mb-4 text-xs text-red-400">{modalError}</div>}
          <form onSubmit={handleInviteMember} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-300 uppercase">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200"
              >
                <option value="workspace_member">Workspace Member</option>
                <option value="workspace_admin">Workspace Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="ghost" type="button" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Send Invitation
              </Button>
            </div>
          </form>
        </Modal>

        {/* MODAL: WORKSPACE SETTINGS */}
        <Modal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          title="Workspace Settings"
          description="Update workspace name and view tenant identifier."
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setShowSettingsModal(false);
              showToast('Workspace settings saved!');
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
              label="Workspace Slug (Immutable)"
              value={selectedWorkspace?.slug || ''}
              disabled
            />
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="ghost" type="button" onClick={() => setShowSettingsModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
}
