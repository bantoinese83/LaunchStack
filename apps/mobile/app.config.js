/** Dynamic Expo config — extends static fields from app.json. */
const googleMapsApiKey =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

/** @param {{ config: import('@expo/config').ExpoConfig }} ctx */
module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    appUrl: process.env.EXPO_PUBLIC_APP_URL ?? config.extra?.appUrl,
    googleMapsApiKey,
  },
  plugins: [
    ...(config.plugins ?? []),
    [
      'react-native-maps',
      googleMapsApiKey
        ? {
            iosGoogleMapsApiKey: googleMapsApiKey,
            androidGoogleMapsApiKey: googleMapsApiKey,
          }
        : {},
    ],
  ],
});
