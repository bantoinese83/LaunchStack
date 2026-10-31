# Google Maps (Mystic Hair Co.)

Maps on web:

- **Default (no billing):** **OpenStreetMap** via Leaflet + **Nominatim** geocoding (`NEXT_PUBLIC_MYSTIC_MAPS_PROVIDER=osm`).
- **After billing:** set provider to `auto` or `google` and configure keys below.

Uses:

- Branded live maps on **Visits** (Luke en route + client pin)
- **Studio → Today** map of house calls + Luke’s live location
- **Booking** address autocomplete & distance (Nominatim, or Google Places/Geocoding when enabled)
- **Directions** links for Luke from Studio ops (always opens Google Maps in the browser)

## 1. Google Cloud (project: `mystic-hair-co`)

1. Open [Maps APIs overview](https://console.cloud.google.com/google/maps-apis/overview?project=mystic-hair-co).
2. **Enable billing** on the project (required; Google includes ~$200/mo Maps credit).
3. Enable these APIs:
   - **Maps JavaScript API**
   - **Maps Embed API** (optional fallback)
   - **Geocoding API**
   - **Places API**
4. **Keys & Credentials** → create keys:

| Key                  | Use                               | Restrictions                                                                                             |
| -------------------- | --------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Browser              | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | HTTP referrers: `http://localhost:3000/*`, `https://mystic-hair-co.vercel.app/*`, your production domain |
| Server (recommended) | `GOOGLE_MAPS_GEOCODING_KEY`       | IP restrict to Vercel or “none” for local dev only                                                       |

For a quick local test you may use **one key** for both env vars; use **two keys** in production.

5. Optional branded map: **Map Management → Map IDs** → create a map ID → set `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`. If unset, the app uses `DEMO_MAP_ID` + inline sage styling.

## 2. Environment variables

**Local** — `apps/web/.env.local`:

```bash
NEXT_PUBLIC_MYSTIC_MAPS_PROVIDER=osm
# When billing is enabled:
# NEXT_PUBLIC_MYSTIC_MAPS_PROVIDER=auto

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
GOOGLE_MAPS_GEOCODING_KEY=
# optional
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
```

**Vercel** — same names on the web project (Production + Preview).

Restart `pnpm dev:web` after changing env.

## 3. Verify

1. **Book** → address typeahead should feel snappier (Places when keyed).
2. **Visits** → en-route visit shows Google map with Luke + home pins.
3. **Studio → Today** → “Today on the map” with client pins and “Directions to next stop”.
4. Ops row → **Directions in Google Maps**.

## 4. Code map

| Piece                        | Path                                                            |
| ---------------------------- | --------------------------------------------------------------- |
| Provider config              | `lib/mystic/mystic-maps-config.ts`                              |
| Maps provider (OSM / Google) | `MysticMap.tsx`, `MysticOsmMap.tsx`, `MysticGoogleMapInner.tsx` |
| Google JS wrapper            | `MysticGoogleMapsProvider.tsx`                                  |
| Branded Google styles        | `mysticGoogleMapStyles.ts`                                      |
| Live client map              | `MysticLiveMapEmbed.tsx`                                        |
| Studio day map               | `StudioTodayMap.tsx`                                            |
| Batch geocode (studio)       | `POST /api/mystic/geocode/batch`                                |
| Server geocode               | `lib/mystic/geocode.ts`                                         |

## 5. Mobile

The Expo app uses **react-native-maps** (Apple Maps on iOS; Google Maps on Android when keyed):

- **Visits** — Luke + your house-call pin when en route; directions open in Google Maps.
- **Book → Location** — map preview after address geocode / autocomplete.
- **Studio** — “Today on the map” with client stops (+ Luke live when en route).

Optional (recommended for Android): in `apps/mobile/.env` or root `.env.local`:

```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=   # same browser key as NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
```

`app.config.js` wires the key into the `react-native-maps` config plugin. iOS works without a key (Apple Maps). Restart Expo after changing env (`pnpm mobile` / `expo start --clear`).
