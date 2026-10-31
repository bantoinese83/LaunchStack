import { StyleSheet } from 'react-native';
import { theme, monoLabel, displayTitle } from './theme';

/** 1960s road-trip poster rhythm — flat surfaces, hairlines, plum + sage + gold. */
export const roadTrip = StyleSheet.create({
  canvas: {
    flex: 1,
    backgroundColor: theme.paper,
  },
  stripe: {
    flexDirection: 'row',
    height: 3,
    marginBottom: 14,
    overflow: 'hidden',
    borderRadius: 1,
  },
  stripeGold: { flex: 5, backgroundColor: theme.gold },
  stripePlum: { flex: 2, backgroundColor: theme.plum },
  stripeSage: { flex: 3, backgroundColor: theme.accent },
  kicker: {
    ...monoLabel,
    color: theme.plum,
    marginBottom: 6,
  },
  title: {
    ...displayTitle,
    color: theme.ink,
    letterSpacing: -0.8,
  },
  lede: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: theme.muted,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.line,
    width: '100%',
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
  },
  sectionLast: {
    paddingVertical: 16,
  },
  flatRow: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
    backgroundColor: 'transparent',
  },
  flatRowSelected: {
    backgroundColor: theme.goldSoft,
    borderLeftWidth: 3,
    borderLeftColor: theme.gold,
    paddingLeft: 13,
  },
  flatInput: {
    borderWidth: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: theme.ink,
    backgroundColor: 'transparent',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.line,
    backgroundColor: theme.paper,
  },
  chipActive: {
    backgroundColor: theme.shell,
    borderColor: theme.shell,
  },
  chipText: { fontSize: 12, fontWeight: '500', color: theme.ink },
  chipTextActive: { color: theme.paper },
  bandPlum: {
    backgroundColor: theme.plum,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bandPlumText: {
    ...monoLabel,
    color: theme.goldSoft,
    fontSize: 9,
  },
});

export const roadTripSegment = StyleSheet.create({
  shell: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.line,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: theme.gold,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: theme.muted,
  },
  tabTextActive: {
    color: theme.plum,
  },
});
