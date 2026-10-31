import { NextResponse } from 'next/server';
import { z } from 'zod';
import { DICEBEAR_STYLES, buildDiceBearAvatarUrl, type DiceBearStyleId } from '@template/mystic';
import { firstZodIssueMessage } from '@template/validation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { requireAuthenticatedUser, routeErrorResponse } from '@/lib/api/route-auth';

const diceBearStyleSchema = z.enum(
  DICEBEAR_STYLES.map((s) => s.id) as [DiceBearStyleId, ...DiceBearStyleId[]]
);

const diceBearBodySchema = z.object({
  style: diceBearStyleSchema,
  seed: z.string().max(64),
});

export async function PUT(req: Request) {
  try {
    const auth = await requireAuthenticatedUser(req);
    if (auth.response) return auth.response;
    const parsed = diceBearBodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstZodIssueMessage(parsed.error) }, { status: 400 });
    }
    const url = buildDiceBearAvatarUrl(parsed.data.style, parsed.data.seed, 256);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: url })
      .eq('id', auth.user.id);
    if (error) throw error;
    return NextResponse.json({ url });
  } catch (err) {
    return routeErrorResponse(err, '[Avatar DiceBear]');
  }
}

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
