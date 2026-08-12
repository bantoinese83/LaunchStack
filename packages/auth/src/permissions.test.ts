import { expect, test, describe } from 'vitest';
import {
  isWorkspaceOwner,
  isWorkspaceAdmin,
  isSuperAdmin,
  isWorkspaceMember,
  canManageBilling,
  canManageMembers,
  canModerateFeedback,
} from './index';

describe('Permissions Matrix', () => {
  test('isWorkspaceOwner', () => {
    expect(isWorkspaceOwner('workspace_owner')).toBe(true);
    expect(isWorkspaceOwner('workspace_admin')).toBe(false);
    expect(isWorkspaceOwner('workspace_member')).toBe(false);
  });

  test('isWorkspaceAdmin', () => {
    expect(isWorkspaceAdmin('workspace_owner')).toBe(true);
    expect(isWorkspaceAdmin('workspace_admin')).toBe(true);
    expect(isWorkspaceAdmin('workspace_member')).toBe(false);
  });

  test('isSuperAdmin', () => {
    expect(isSuperAdmin('super_admin')).toBe(true);
    expect(isSuperAdmin('user')).toBe(false);
  });

  test('isWorkspaceMember rejects unknown roles', () => {
    expect(isWorkspaceMember('workspace_owner')).toBe(true);
    expect(isWorkspaceMember('workspace_admin')).toBe(true);
    expect(isWorkspaceMember('workspace_member')).toBe(true);
    expect(isWorkspaceMember(null)).toBe(false);
    expect(isWorkspaceMember(undefined)).toBe(false);
    expect(isWorkspaceMember('not_a_role' as never)).toBe(false);
  });

  test('canManageBilling mirrors owner check', () => {
    expect(canManageBilling('workspace_owner')).toBe(true);
    expect(canManageBilling('workspace_admin')).toBe(false);
    expect(canManageBilling('workspace_member')).toBe(false);
  });

  test('canManageMembers mirrors admin check', () => {
    expect(canManageMembers('workspace_owner')).toBe(true);
    expect(canManageMembers('workspace_admin')).toBe(true);
    expect(canManageMembers('workspace_member')).toBe(false);
  });

  test('canModerateFeedback allows super admin or workspace admin', () => {
    expect(canModerateFeedback('super_admin', 'workspace_member')).toBe(true);
    expect(canModerateFeedback('user', 'workspace_admin')).toBe(true);
    expect(canModerateFeedback('user', 'workspace_member')).toBe(false);
  });
});
