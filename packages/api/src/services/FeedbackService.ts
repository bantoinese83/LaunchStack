import { SupabaseClient } from '@supabase/supabase-js';
import { FeedbackCategory, FeedbackPost, FeedbackStatus } from '@template/types';

export class FeedbackService {
  constructor(private client: SupabaseClient) {}

  async getWorkspaceFeedback(workspaceId: string): Promise<FeedbackPost[]> {
    const { data, error } = await this.client
      .from('feedback_posts')
      .select('*, author:profiles(*)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data as FeedbackPost[];
  }

  async createFeedbackPost(
    workspaceId: string,
    authorId: string,
    title: string,
    description: string,
    category: FeedbackCategory
  ): Promise<FeedbackPost> {
    const { data, error } = await this.client
      .from('feedback_posts')
      .insert({
        workspace_id: workspaceId,
        author_id: authorId,
        title,
        description,
        category,
      })
      .select('*, author:profiles(*)')
      .single();
    if (error) throw new Error(error.message);
    return data as FeedbackPost;
  }

  async upvoteFeedback(postId: string, userId: string): Promise<void> {
    const { error } = await this.client.from('feedback_votes').insert({
      post_id: postId,
      user_id: userId,
    });
    if (error) throw new Error(error.message);
  }

  async updateFeedbackStatus(postId: string, status: FeedbackStatus): Promise<FeedbackPost> {
    const { data, error } = await this.client
      .from('feedback_posts')
      .update({ status })
      .eq('id', postId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data as FeedbackPost;
  }
}
