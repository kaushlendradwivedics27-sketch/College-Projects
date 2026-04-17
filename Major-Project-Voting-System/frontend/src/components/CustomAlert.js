// Custom Alert Modal — IILM VotingSystem
// Replaces all native Alert.alert dialogs with themed modal
import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

/**
 * Usage:
 *   <CustomAlert
 *     visible={showAlert}
 *     title="Sign Out"
 *     message="Are you sure you want to sign out?"
 *     icon="log-out-outline"           // optional Ionicon name
 *     type="warning"                    // 'info' | 'success' | 'warning' | 'error'
 *     buttons={[
 *       { text: 'Cancel', style: 'cancel', onPress: () => setShowAlert(false) },
 *       { text: 'Sign Out', style: 'destructive', onPress: handleLogout },
 *     ]}
 *     onClose={() => setShowAlert(false)}
 *   />
 */

const TYPE_CONFIG = {
  info: { icon: 'information-circle', color: colors.primary, bg: colors.primaryLight },
  success: { icon: 'checkmark-circle', color: colors.success, bg: colors.successLight },
  warning: { icon: 'warning', color: colors.warning, bg: '#FFF3E0' },
  error: { icon: 'close-circle', color: colors.danger, bg: colors.dangerLight },
};

export default function CustomAlert({
  visible = false,
  title = '',
  message = '',
  icon,
  type = 'info',
  buttons = [],
  onClose,
}) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;
  const alertIcon = icon || config.icon;

  // Default single "OK" button if none provided
  const alertButtons = buttons.length > 0
    ? buttons
    : [{ text: 'OK', onPress: onClose }];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={s.overlay}>
        <View style={s.card}>
          {/* Icon */}
          <View style={[s.iconCircle, { backgroundColor: config.bg }]}>
            <Ionicons name={alertIcon} size={32} color={config.color} />
          </View>

          {/* Title */}
          {title ? <Text style={s.title}>{title}</Text> : null}

          {/* Message */}
          {message ? <Text style={s.message}>{message}</Text> : null}

          {/* Buttons */}
          <View style={[
            s.buttonRow,
            alertButtons.length === 1 && { justifyContent: 'center' },
          ]}>
            {alertButtons.map((btn, i) => {
              const isCancel = btn.style === 'cancel';
              const isDestructive = btn.style === 'destructive';

              return (
                <TouchableOpacity
                  key={i}
                  style={[
                    s.button,
                    alertButtons.length > 1 && { flex: 1 },
                    alertButtons.length === 1 && { minWidth: 140 },
                    isCancel && s.cancelButton,
                    isDestructive && s.destructiveButton,
                    !isCancel && !isDestructive && s.primaryButton,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => {
                    btn.onPress?.();
                    if (!btn.keepOpen) onClose?.();
                  }}
                >
                  <Text style={[
                    s.buttonText,
                    isCancel && s.cancelButtonText,
                    isDestructive && s.destructiveButtonText,
                    !isCancel && !isDestructive && s.primaryButtonText,
                  ]}>
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Cancel (outline)
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSub,
  },
  // Destructive (danger filled)
  destructiveButton: {
    backgroundColor: colors.danger,
  },
  destructiveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  // Primary (brand filled)
  primaryButton: {
    backgroundColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
