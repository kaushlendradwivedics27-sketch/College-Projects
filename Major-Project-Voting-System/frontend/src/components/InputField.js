import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import colors from '../constants/colors';

/**
 * InputField — with label, error, hint, and icon support
 */
export default function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  hint,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  editable = true,
  style,
  multiline = false,
}) {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          error ? styles.inputError : null,
          !editable && styles.inputDisabled,
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, multiline && styles.multiline]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textHint}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          editable={editable}
          multiline={multiline}
          autoCapitalize="none"
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
    height: '100%',
  },
  inputWithIcon: {
    marginLeft: 8,
  },
  multiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  inputError: {
    borderColor: colors.danger,
    borderWidth: 2,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  iconContainer: {
    marginRight: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    marginTop: 4,
    marginLeft: 4,
  },
  hintText: {
    fontSize: 12,
    color: colors.textHint,
    marginTop: 4,
    marginLeft: 4,
  },
});
