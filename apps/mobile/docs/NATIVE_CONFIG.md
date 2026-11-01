# Native folders + Expo config

This app commits `ios/` and `android/` (bare workflow). EAS Build does **not** re-sync `orientation`, `icon`, `scheme`, `plugins`, etc. from `app.json` into those folders — native projects are the source of truth for those fields.

When changing icons, URL schemes, or permissions, update **both** `app.json` (for documentation and OTA metadata) and the native project files, or run `expo prebuild` in a branch and merge native diffs deliberately.

`expo-doctor`’s “app config fields not synced” check is disabled in `app.json` because this mismatch is intentional.
