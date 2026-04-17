import React, { useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import colors from '../constants/colors';

/**
 * OTPInput — 4-box OTP input with auto-focus and gold border on fill
 */
export default function OTPInput({ value, onChange, length = 4 }) {
  const inputRefs = useRef([]);

  const digits = value.split('').concat(Array(length - value.length).fill(''));

  const handleChange = (text, index) => {
    const newValue = digits.slice();
    newValue[index] = text;
    const joined = newValue.join('').substring(0, length);
    onChange(joined);

    if (text && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      {digits.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
          ]}
          value={digit}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          selectTextOnFocus
          autoFocus={index === 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.white,
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  boxFilled: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
});
