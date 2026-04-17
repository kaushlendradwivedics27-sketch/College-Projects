import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import InputField from '../components/InputField';
import colors from '../constants/colors';
import { SECTIONS, YEARS, IILM_EMAIL_DOMAIN } from '../constants/iilm';
import { sendOtpToEmail } from '../services/supabase';
import CustomAlert from '../components/CustomAlert';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [section, setSection] = useState('');
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'error' });

  // Modal visibility
  const [showSectionPicker, setShowSectionPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  /**
   * Validate that the email ends with a valid IILM domain
   */
  const isValidIilmEmail = (emailStr) => {
    const lowerEmail = emailStr.toLowerCase().trim();
    return (
      lowerEmail.endsWith('@iilm.edu') ||
      lowerEmail.endsWith('@iilm.ac.in') ||
      lowerEmail.endsWith('@iilmmail.edu')
    );
  };

  /**
   * Mask the email for display on OTP screen
   * e.g. arjun.mehta@iilm.edu → ar****@iilm.edu
   */
  const maskEmail = (emailStr) => {
    const [local, domain] = emailStr.split('@');
    if (local.length <= 2) return local + '****@' + domain;
    return local.substring(0, 2) + '****@' + domain;
  };

  const showAlert = (title, message, type = 'error') =>
    setAlertConfig({ visible: true, title, message, type });

  const handleSendOtp = async () => {
    // Validate email
    if (!email.trim()) {
      showAlert('Required', 'Please enter your IILM Gmail address');
      return;
    }
    if (!isValidIilmEmail(email)) {
      showAlert('Invalid Email', 'Please use your IILM email (e.g. yourname@iilm.edu)');
      return;
    }

    // Validate Roll No
    if (!rollNo.trim()) {
      showAlert('Required', 'Please enter your Roll Number');
      return;
    }

    // Validate Section
    if (!section) {
      showAlert('Required', 'Please select your Section');
      return;
    }

    // Validate Year
    if (!year) {
      showAlert('Required', 'Please select your Year');
      return;
    }

    setLoading(true);
    try {
      const result = await sendOtpToEmail(email.trim().toLowerCase());

      if (result.success) {
        navigation.navigate('OTP', {
          email: email.trim().toLowerCase(),
          maskedEmail: maskEmail(email.trim()),
          rollNo: rollNo.trim(),
          section,
          year,
        });
      } else {
        showAlert('Error', result.error || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      showAlert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPickerModal = (
    visible,
    onClose,
    title,
    options,
    selectedValue,
    onSelect,
    iconName
  ) => (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>{title}</Text>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.pickerOption,
                selectedValue === opt && styles.pickerOptionActive,
              ]}
              activeOpacity={0.7}
              onPress={() => {
                onSelect(opt);
                onClose();
              }}
            >
              <Ionicons
                name={iconName}
                size={18}
                color={
                  selectedValue === opt ? colors.primary : colors.textSub
                }
              />
              <Text
                style={[
                  styles.pickerOptionText,
                  selectedValue === opt && styles.pickerOptionTextActive,
                ]}
              >
                {opt}
              </Text>
              {selectedValue === opt && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBg}>
              <Text style={styles.logoEmoji}>🏛️</Text>
            </View>
          </View>

          <Text style={styles.title}>Student Login</Text>
          <Text style={styles.subtitle}>IILM VotingSystem Portal</Text>

          {/* Form */}
          <View style={styles.form}>
            {/* IILM Gmail */}
            <InputField
              label="IILM Gmail"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. yourname@iilm.edu"
              keyboardType="email-address"
              icon={
                <Ionicons name="mail" size={18} color={colors.textHint} />
              }
            />

            {/* Roll Number */}
            <InputField
              label="Roll Number"
              value={rollNo}
              onChangeText={setRollNo}
              placeholder="e.g. CS-23411341"
              icon={
                <Ionicons name="card" size={18} color={colors.textHint} />
              }
            />

            {/* Year Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Year</Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  year ? styles.dropdownFilled : null,
                ]}
                activeOpacity={0.7}
                onPress={() => setShowYearPicker(true)}
              >
                <Ionicons
                  name="calendar"
                  size={18}
                  color={year ? colors.primary : colors.textHint}
                />
                <Text
                  style={[
                    styles.dropdownText,
                    !year && styles.dropdownPlaceholder,
                  ]}
                >
                  {year || 'Select your year'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textHint}
                />
              </TouchableOpacity>
            </View>

            {/* Section Selector */}
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Section</Text>
              <TouchableOpacity
                style={[
                  styles.dropdown,
                  section ? styles.dropdownFilled : null,
                ]}
                activeOpacity={0.7}
                onPress={() => setShowSectionPicker(true)}
              >
                <Ionicons
                  name="grid"
                  size={18}
                  color={section ? colors.primary : colors.textHint}
                />
                <Text
                  style={[
                    styles.dropdownText,
                    !section && styles.dropdownPlaceholder,
                  ]}
                >
                  {section || 'Select your section'}
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={colors.textHint}
                />
              </TouchableOpacity>
            </View>

            {/* Send OTP Button */}
            <PrimaryButton
              title="Send OTP"
              onPress={handleSendOtp}
              loading={loading}
              style={styles.loginButton}
              icon={
                !loading && (
                  <Ionicons name="mail" size={18} color={colors.white} />
                )
              }
            />

            <View style={styles.infoNote}>
              <Ionicons
                name="information-circle"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.infoText}>
                OTP will be sent to your IILM Gmail address
              </Text>
            </View>

            {/* Supabase connect note */}
            <View style={styles.connectNote}>
              <View style={styles.connectNoteHeader}>
                <Ionicons name="server" size={16} color={colors.success} />
                <Text style={styles.connectNoteTitle}>
                  Powered by Supabase
                </Text>
              </View>
              <Text style={styles.connectNoteText}>
                Secure authentication with email OTP verification
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Section Picker Modal */}
      {renderPickerModal(
        showSectionPicker,
        () => setShowSectionPicker(false),
        'Select Section',
        SECTIONS,
        section,
        setSection,
        'grid'
      )}

      {/* Year Picker Modal */}
      {renderPickerModal(
        showYearPicker,
        () => setShowYearPicker(false),
        'Select Year',
        YEARS,
        year,
        setYear,
        'calendar'
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 44,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 42,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSub,
    textAlign: 'center',
    marginBottom: 36,
  },
  form: {
    gap: 0,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 52,
    paddingHorizontal: 16,
    gap: 10,
  },
  dropdownFilled: {
    borderColor: colors.accent,
    backgroundColor: colors.accentLight,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    color: colors.textMain,
  },
  dropdownPlaceholder: {
    color: colors.textHint,
  },
  loginButton: {
    marginTop: 8,
    marginBottom: 16,
  },
  infoNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSub,
  },
  connectNote: {
    backgroundColor: colors.successLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(26,122,60,0.12)',
  },
  connectNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  connectNoteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
  connectNoteText: {
    fontSize: 12,
    color: colors.textSub,
    marginLeft: 24,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 16,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  pickerOptionActive: {
    backgroundColor: colors.primaryLight,
  },
  pickerOptionText: {
    flex: 1,
    fontSize: 15,
    color: colors.textSub,
  },
  pickerOptionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});