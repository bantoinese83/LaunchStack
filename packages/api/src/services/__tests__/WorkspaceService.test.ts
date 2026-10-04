import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceService } from '../WorkspaceService';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase Client — needs both `from` and `rpc` since createWorkspace
// now uses the create_workspace_with_owner RPC (atomic, single transaction).
const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
} as unknown as SupabaseClient;

describe('WorkspaceService', () => {
  let workspaceService: WorkspaceService;

  beforeEach(() => {
    vi.clearAllMocks();
    workspaceService = new WorkspaceService(mockSupabase);
  });

  describe('createWorkspace', () => {
    it('should call the create_workspace_with_owner RPC and return the workspace', async () => {
      const mockWorkspace = { id: 'ws-123', name: 'Test WS', slug: 'test-ws' };

      (mockSupabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: mockWorkspace,
        error: null,
      });

      const result = await workspaceService.createWorkspace('user-1', 'Test WS', 'test-ws');

      expect(mockSupabase.rpc).toHaveBeenCalledWith('create_workspace_with_owner', {
        p_name: 'Test WS',
        p_slug: 'test-ws',
        p_user_id: 'user-1',
      });

      // Ensure the old non-atomic two-step pattern is NOT used anymore
      expect(mockSupabase.from).not.toHaveBeenCalled();

      expect(result).toEqual(mockWorkspace);
    });

    it('should throw an error if the RPC fails', async () => {
      const error = new Error('Database Error');

      (mockSupabase.rpc as ReturnType<typeof vi.fn>).mockResolvedValue({
        data: null,
        error,
      });

      await expect(
        workspaceService.createWorkspace('user-1', 'Fail WS', 'fail-ws')
      ).rejects.toThrow('Database Error');
    });
  });

  describe('updateWorkspace', () => {
    it('updates workspace fields and returns the row', async () => {
      const updated = { id: 'ws-1', name: 'Renamed', slug: 'test-ws', logo_url: null };
      const fromMock = vi.fn().mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: updated, error: null }),
            }),
          }),
        }),
      });
      mockSupabase.from = fromMock as typeof mockSupabase.from;

      const result = await workspaceService.updateWorkspace('ws-1', { name: 'Renamed' });

      expect(fromMock).toHaveBeenCalledWith('workspaces');
      expect(result).toEqual(updated);
    });

    it('persists logo_url when provided', async () => {
      const updated = {
        id: 'ws-1',
        name: 'Acme',
        slug: 'acme',
        logo_url: 'https://cdn.example.com/logo.png',
      };
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updated, error: null }),
          }),
        }),
      });
      const fromMock = vi.fn().mockReturnValue({ update: updateMock });
      mockSupabase.from = fromMock as typeof mockSupabase.from;

      const result = await workspaceService.updateWorkspace('ws-1', {
        logoUrl: 'https://cdn.example.com/logo.png',
      });

      expect(updateMock).toHaveBeenCalledWith({ logo_url: 'https://cdn.example.com/logo.png' });
      expect(result.logo_url).toBe('https://cdn.example.com/logo.png');
    });
  });

  describe('getWorkspaceMembers', () => {
    it('loads members with profile relations for a workspace', async () => {
      const members = [{ id: 'm-1', workspace_id: 'ws-1', role: 'workspace_owner' }];
      const fromMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: members, error: null }),
        }),
      });
      mockSupabase.from = fromMock as typeof mockSupabase.from;

      const result = await workspaceService.getWorkspaceMembers('ws-1');

      expect(fromMock).toHaveBeenCalledWith('workspace_members');
      expect(result).toEqual(members);
    });
  });
});
