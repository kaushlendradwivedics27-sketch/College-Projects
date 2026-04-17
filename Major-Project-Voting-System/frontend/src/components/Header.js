import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

/**
 * Header — IILM logo left, back button, optional right action
 */
export default function Header({
  title,
  showBack = false,
  onBackPress,
  rightAction,
  light = false,
  style,
}) {
  return (
    <View style={[styles.container, light && styles.containerLight, style]}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={light ? colors.white : colors.textMain}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>IILM</Text>
          </View>
        )}
      </View>
      {title && (
        <Text
          style={[styles.title, light && styles.titleLight]}
          numberOfLines={1}
        >
          {title}
        </Text>
      )}
      <View style={styles.right}>
        {rightAction || <View style={styles.placeholder} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  containerLight: {
    backgroundColor: 'transparent',
  },
  left: {
    width: 48,
    alignItems: 'flex-start',
  },
  right: {
    width: 48,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 48,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    flex: 1,
  },
  titleLight: {
    color: colors.white,
  },
});
