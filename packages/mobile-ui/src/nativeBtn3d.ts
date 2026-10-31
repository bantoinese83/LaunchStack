import { Platform, type TextStyle, type ViewStyle } from 'react-native';
import { theme } from './theme';

export const nativeBtn3dMetrics = {
  minHeight: 48,
  paddingVertical: 14,
  paddingHorizontal: 32,
  pressDepth: 3,
  lipDrop: 5,
  borderRadius: theme.radii.pill,
} as const;

type Variant = 'primary' | 'secondary' | 'outline' | 'danger';

function lipColor(variant: Variant): string {
  switch (variant) {
    case 'primary':
      return '#0E110E';
    case 'danger':
      return '#8A1C12';
    case 'secondary':
    case 'outline':
    default:
      return '#D4CEC2';
  }
}

function faceColors(variant: Variant): {
  backgroundColor: string;
  borderColor: string;
  text: TextStyle;
} {
  switch (variant) {
    case 'primary':
      return {
        backgroundColor: theme.shell,
        borderColor: 'rgba(196, 169, 98, 0.35)',
        text: { color: theme.paper },
      };
    case 'danger':
      return {
        backgroundColor: theme.danger,
        borderColor: 'rgba(255, 255, 255, 0.18)',
        text: { color: '#FFFFFF' },
      };
    case 'secondary':
    case 'outline':
    default:
      return {
        backgroundColor: theme.surface,
        borderColor: 'rgba(229, 224, 214, 0.95)',
        text: { color: theme.ink },
      };
  }
}

function faceShadow(variant: Variant, pressed: boolean): ViewStyle {
  if (Platform.OS === 'android') {
    return { elevation: pressed ? 1 : 4 };
  }
  const soft =
    variant === 'primary'
      ? 'rgba(26, 31, 24, 0.55)'
      : variant === 'danger'
        ? 'rgba(180, 35, 24, 0.35)'
        : 'rgba(26, 31, 24, 0.28)';
  return pressed
    ? {
        shadowColor: soft,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
      }
    : {
        shadowColor: soft,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.38,
        shadowRadius: 16,
      };
}

export function nativeBtn3dStyles(variant: Variant, pressed: boolean, disabled: boolean) {
  const colors = faceColors(variant === 'outline' ? 'outline' : variant);
  const depth = disabled ? 0 : pressed ? nativeBtn3dMetrics.pressDepth : 0;
  const lipVisible = !disabled;

  const wrap: ViewStyle = {
    position: 'relative',
    width: '100%',
    minHeight: nativeBtn3dMetrics.minHeight + nativeBtn3dMetrics.lipDrop,
    justifyContent: 'flex-start',
  };

  const lip: ViewStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    top: nativeBtn3dMetrics.lipDrop,
    bottom: 0,
    borderRadius: nativeBtn3dMetrics.borderRadius,
    backgroundColor: lipColor(variant),
    opacity: lipVisible ? 1 : 0,
  };

  const face: ViewStyle = {
    borderRadius: nativeBtn3dMetrics.borderRadius,
    minHeight: nativeBtn3dMetrics.minHeight,
    paddingVertical: nativeBtn3dMetrics.paddingVertical,
    paddingHorizontal: nativeBtn3dMetrics.paddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundColor,
    borderWidth: 1,
    borderColor: colors.borderColor,
    transform: [{ translateY: depth }],
    ...faceShadow(variant, pressed || disabled),
  };

  const label: TextStyle = {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    ...colors.text,
  };

  return { wrap, lip, face, label };
}
