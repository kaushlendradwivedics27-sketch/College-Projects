import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import colors from '../constants/colors';

/**
 * PrimaryButton — 4 variants: primary (maroon), outline, ghost, gold
 * Clean, no-animation button for premium feel
 */
export default function PrimaryButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
  icon,
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          container: styles.outlineContainer,
          text: styles.outlineText,
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText,
        };
      case 'gold':
        return {
          container: styles.goldContainer,
          text: styles.goldText,
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        variantStyles.container,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'gold' ? colors.white : colors.primary}
          size="small"
        />
      ) : (
        <>
          {icon && icon}
          <Text style={[styles.baseText, variantStyles.text, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 28,
  },
  baseText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  primaryContainer: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryText: {
    color: colors.white,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  outlineText: {
    color: colors.primary,
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  goldContainer: {
    backgroundColor: colors.accent,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  goldText: {
    color: colors.white,
  },
  disabled: {
    opacity: 0.45,
  },
});
