import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import OTPInput from '../components/OTPInput';
import colors from '../constants/colors';
import { verifyOtpCode, sendOtpToEmail, upsertStudentProfile } from '../services/supabase';

export default function OtpScreen({ navigation, route }) {
  const { email, maskedEmail, rollNo, section, year } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit OTP from your email');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpCode(email, otp);

      if (result.success) {
        // Save student profile data in Supabase
        await upsertStudentProfile({
          email,
          rollNo,
          section,
          year,
        });

        // Build student object for the app
        const student = {
          id: rollNo,
          name: result.user?.user_metadata?.full_name || rollNo,
          enrollment: rollNo,
          programme: '',
          year: year,
          section: section,
          campus: '',
          email: email,
          votingStatus: 'Eligible',
        };

        navigation.navigate('StudentProfile', {
          student,
          token: result.session?.access_token || 'tok_supabase',
        });
      } else {
        Alert.alert(
          'Verification Failed',
          result.error || 'Invalid OTP. Please try again.'
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCountdown(60);
    setCanResend(false);
    setOtp('');

    try {
      const result = await sendOtpToEmail(email);
      if (result.success) {
        Alert.alert('OTP Resent', 'A new OTP has been sent to your IILM Gmail.');
      } else {
        Alert.alert('Error', result.error || 'Failed to resend OTP.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend. Please try again.');
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.lockIcon}>
            <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to
          </Text>
          <Text style={styles.email}>{maskedEmail || email}</Text>
        </View>

        {/* Student Info Summary */}
        <View style={styles.infoSummary}>
          <View style={styles.infoRow}>
            <Ionicons name="card" size={14} color={colors.textHint} />
            <Text style={styles.infoLabel}>Roll No:</Text>
            <Text style={styles.infoValue}>{rollNo}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="grid" size={14} color={colors.textHint} />
            <Text style={styles.infoLabel}>Section:</Text>
            <Text style={styles.infoValue}>{section}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={14} color={colors.textHint} />
            <Text style={styles.infoLabel}>Year:</Text>
            <Text style={styles.infoValue}>{year}</Text>
          </View>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <OTPInput value={otp} onChange={setOtp} length={6} />
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          {!canResend ? (
            <View style={styles.timerRow}>
              <Ionicons name="time-outline" size={16} color={colors.textHint} />
              <Text style={styles.timerText}>
                Resend code in{' '}
                <Text style={styles.timerCount}>{formatTime(countdown)}</Text>
              </Text>
            </View>
          ) : (
            <PrimaryButton
              title="Resend OTP"
              onPress={handleResend}
              variant="outline"
              style={styles.resendButton}
            />
          )}
        </View>

        {/* Verify Button */}
        <PrimaryButton
          title="Verify & Login"
          onPress={handleVerify}
          loading={loading}
          disabled={otp.length !== 6}
          style={styles.verifyButton}
        />

        {/* Supabase indicator */}
        <View style={styles.supabaseNote}>
          <Ionicons name="lock-closed" size={14} color={colors.success} />
          <Text style={styles.supabaseNoteText}>
            Secured by Supabase Authentication
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  lockIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(122,21,32,0.08)',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSub,
  },
  email: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 4,
  },
  infoSummary: {
    backgroundColor: colors.accentLight,
    borderRadius: 14,
    padding: 14,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(184,134,11,0.12)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSub,
    width: 65,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMain,
  },
  otpContainer: {
    marginBottom: 28,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    color: colors.textHint,
  },
  timerCount: {
    fontWeight: '700',
    color: colors.primary,
  },
  resendButton: {
    paddingHorizontal: 32,
    height: 44,
  },
  verifyButton: {
    marginBottom: 20,
  },
  supabaseNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  supabaseNoteText: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '600',
  },
});
