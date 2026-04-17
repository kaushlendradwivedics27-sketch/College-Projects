import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import colors from '../constants/colors';

/**
 * RadioButton — maroon radio with animated selection
 */
export default function RadioButton({ selected, label, onPress, style }) {
  const scale = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1 : 0,
      damping: 12,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, [selected]);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, style]}
      activeOpacity={0.7}
    >
      <View style={[styles.outer, selected && styles.outerSelected]}>
        <Animated.View style={[styles.inner, { transform: [{ scale }], opacity: scale }]} />
      </View>
      {label && (
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  outer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.textHint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerSelected: {
    borderColor: colors.primary,
  },
  inner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  label: {
    marginLeft: 12,
    fontSize: 15,
    color: colors.textSub,
  },
  labelSelected: {
    color: colors.textMain,
    fontWeight: '600',
  },
});
