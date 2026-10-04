import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }
    const supabase = await createSupabaseServerClient();
    const path = `${auth.user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', auth.user.id);
    return NextResponse.json({ url: data.publicUrl });
  } catch (err) {
    return routeErrorResponse(err, '[Avatar Upload]');
  }
}
