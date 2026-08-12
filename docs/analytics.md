# Analytics & Telemetry Event Taxonomy (`LaunchStack`)

All application telemetry is tracked using the PostHog helper in `@template/analytics`.

## Event Taxonomy Reference

| Event Name              | Trigger Location           | Tracked Properties                       |
| ----------------------- | -------------------------- | ---------------------------------------- |
| `marketing_page_viewed` | `apps/web`                 | `{ path, referrer }`                     |
| `cta_clicked`           | `apps/web`                 | `{ button_id, location }`                |
| `signup_started`        | `apps/web` / `apps/mobile` | `{ provider }`                           |
| `signup_completed`      | `apps/web` / `apps/mobile` | `{ user_id, email }`                     |
| `workspace_created`     | `apps/web`                 | `{ workspace_id, workspace_name, slug }` |
| `member_invited`        | `apps/web`                 | `{ workspace_id, invited_email, role }`  |
| `subscription_started`  | Stripe Webhook             | `{ workspace_id, plan_id, amount }`      |
| `subscription_canceled` | Stripe Webhook             | `{ workspace_id, plan_id }`              |
| `feedback_submitted`    | `apps/web` / `apps/mobile` | `{ workspace_id, post_id, category }`    |
| `feedback_upvoted`      | `apps/web` / `apps/mobile` | `{ post_id }`                            |
