import { StyleSheet } from 'react-native';
import { theme } from '@template/mobile-ui';

const H_PAD = 20;
const MAX_CONTENT_WIDTH = 560;

/** Flat road-trip screens — hairlines instead of floating cards */
export const nativeScreenStyles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.paper },
  container: {
    flexGrow: 1,
    paddingHorizontal: H_PAD,
    paddingTop: 8,
    paddingBottom: 48,
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    gap: 0,
  },
  stack: {
    width: '100%',
    maxWidth: MAX_CONTENT_WIDTH,
    flexDirection: 'column',
    gap: 0,
  },
  /** @deprecated Prefer roadTrip.flatRow — kept for gradual migration */
  card: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
    marginBottom: 0,
  },
  cardAndroid: {},
  toolbarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    width: '100%',
    paddingVertical: 8,
  },
});
