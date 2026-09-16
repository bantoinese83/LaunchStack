import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WorkspaceService } from '../WorkspaceService';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase Client
const mockSupabase = {
  from: vi.fn(),
} as unknown as SupabaseClient;

describe('WorkspaceService', () => {
  let workspaceService: WorkspaceService;

  beforeEach(() => {
    vi.clearAllMocks();
    workspaceService = new WorkspaceService(mockSupabase);
  });

  describe('createWorkspace', () => {
    it('should insert a workspace and a member record, then return the workspace', async () => {
      // Setup mock returns
      const mockWorkspace = { id: 'ws-123', name: 'Test WS', slug: 'test-ws' };

      const singleMock = vi.fn().mockResolvedValue({ data: mockWorkspace, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnThis();
      const insertMemberMock = vi.fn().mockResolvedValue({ error: null });

      // Mock from('workspaces')
      (mockSupabase.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
        if (table === 'workspaces') {
          return { insert: insertMock, select: selectMock };
        }
        if (table === 'workspace_members') {
          return { insert: insertMemberMock };
        }
        return {};
      });

      const result = await workspaceService.createWorkspace('user-1', 'Test WS', 'test-ws');

      expect(mockSupabase.from).toHaveBeenCalledWith('workspaces');
      expect(mockSupabase.from).toHaveBeenCalledWith('workspace_members');

      expect(insertMock).toHaveBeenCalledWith({
        name: 'Test WS',
        slug: 'test-ws',
      });

      expect(insertMemberMock).toHaveBeenCalledWith({
        workspace_id: 'ws-123',
        user_id: 'user-1',
        role: 'workspace_owner',
      });

      expect(result).toEqual(mockWorkspace);
    });

    it('should throw an error if workspace creation fails', async () => {
      const error = new Error('Database Error');
      const singleMock = vi.fn().mockResolvedValue({ data: null, error });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const insertMock = vi.fn().mockReturnThis();

      (mockSupabase.from as ReturnType<typeof vi.fn>).mockImplementation(() => ({
        insert: insertMock,
        select: selectMock,
      }));

      await expect(
        workspaceService.createWorkspace('user-1', 'Fail WS', 'fail-ws')
      ).rejects.toThrow('Database Error');
    });
  });
});
