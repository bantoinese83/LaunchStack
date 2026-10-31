# Google sign-in (Supabase Auth)

Project: **`ipwubzqckiubrvrouzye`**  
Dashboard: [Auth → Providers → Google](https://supabase.com/dashboard/project/ipwubzqckiubrvrouzye/auth/providers)

App code already calls `signInWithOAuth({ provider: 'google' })` on web and mobile. You only need **Google Cloud OAuth credentials** wired into **Supabase**.

## 1. Google Cloud Console

1. Open [Google Cloud Console](https://console.cloud.google.com/) and pick (or create) a project for Mystic Hair Co.
2. **APIs & Services → OAuth consent screen**
   - User type: **External** (or Internal if Workspace-only).
   - App name: `Mystic Hair Co.`
   - User support email + developer contact: your email.
   - Scopes: add **`.../auth/userinfo.email`**, **`.../auth/userinfo.profile`**, **`openid`** (defaults are fine for sign-in).
   - Add test users while app is in **Testing** (any Gmail you sign in with must be listed).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - Name: `Mystic Hair Co. — Supabase`
   - **Authorized JavaScript origins** (add each environment you use):
     - `http://localhost:3000`
     - `https://YOUR_PRODUCTION_DOMAIN` (e.g. Vercel URL)
   - **Authorized redirect URIs** — add **exactly one** Supabase callback (copy/paste):

     ```text
     https://ipwubzqckiubrvrouzye.supabase.co/auth/v1/callback
     ```

     Do **not** put `/auth/callback` from your Next app here; Google redirects to **Supabase**, then Supabase redirects to your app.

4. Copy the **Client ID** and **Client secret**.

## 2. Supabase — enable Google

1. [Auth → Providers → Google](https://supabase.com/dashboard/project/ipwubzqckiubrvrouzye/auth/providers)
2. Turn **Google** **Enabled**.
3. Paste **Client ID** and **Client secret** from step 1.
4. Save.

## 3. Supabase — redirect URLs

[Auth → URL Configuration](https://supabase.com/dashboard/project/ipwubzqckiubrvrouzye/auth/url-configuration)

| Setting           | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| **Site URL**      | Dev: `http://localhost:3000` — Prod: `https://YOUR_PRODUCTION_DOMAIN` |
| **Redirect URLs** | Add each line below (one per row):                                    |

```text
http://localhost:3000/auth/callback
https://YOUR_PRODUCTION_DOMAIN/auth/callback
mystichair://auth/callback
```

Web OAuth uses `{origin}/auth/callback?next=…` (see `getAuthCallbackUrl` in the app). Mobile uses `mystichair://auth/callback`.

## 4. Local env (already in repo)

Ensure `apps/web/.env.local` has:

- `NEXT_PUBLIC_SUPABASE_URL=https://ipwubzqckiubrvrouzye.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase → Settings → API → anon public)
- `NEXT_PUBLIC_APP_URL=http://localhost:3000`

Mobile (`apps/mobile/.env`):

- `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_ANON_KEY` (same anon key)
- `EXPO_PUBLIC_APP_URL` pointing at your web API origin

Run `node scripts/print-google-oauth-uris.mjs` to print the callback URI and redirect checklist for your env.

## 5. Verify

**Web**

1. `pnpm dev:web` → open `http://localhost:3000/login`
2. **Continue with Google** → Google account → should land on `/account` (or `?next=` target).

**Mobile**

1. Dev build / simulator with scheme `mystichair` (see `app.json`).
2. Login → **Continue with Google** → browser sheet → return to app → signed in.

## Troubleshooting

| Symptom                                      | Fix                                                                                                |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `redirect_uri_mismatch` in Google            | Redirect URI in Google must be exactly `https://ipwubzqckiubrvrouzye.supabase.co/auth/v1/callback` |
| `Access blocked: app not verified`           | OAuth consent in **Testing** — add your Google account as a test user                              |
| Returns to login with error                  | Check Supabase redirect URL list includes your `/auth/callback` origin                             |
| Mobile opens browser but app doesn’t sign in | Add `mystichair://auth/callback` in Supabase redirect URLs; rebuild app if scheme changed          |
| Instant error “OAuth sign-in failed”         | Google provider disabled or wrong Client ID/secret in Supabase                                     |
