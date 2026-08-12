import { expect, test, describe } from 'vitest';
import { isWorkspaceOwner, isWorkspaceAdmin, isSuperAdmin } from './index';

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
});
