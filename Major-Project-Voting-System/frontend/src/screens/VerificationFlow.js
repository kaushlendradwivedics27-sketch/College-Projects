import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from '../components/ProgressBar';
import InputField from '../components/InputField';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../constants/colors';
import { castVote } from '../services/api';

const STEPS = ['Identity', 'Selfie', 'Confirm'];

export default function VerificationFlow({ navigation, route }) {
  const { candidate, student, token } = route.params || {};
  const [currentStep, setCurrentStep] = useState(0);
  const [dob, setDob] = useState('');
  const [selfieTaken, setSelfieTaken] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentStep === 2) {
      // Auto-simulate biometric after 2s
      const timer = setTimeout(() => {
        setBiometricSuccess(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep === 0) {
      if (!dob) {
        Alert.alert('Required', 'Please enter your Date of Birth');
        return;
      }
      setCurrentStep(1);
    } else if (currentStep === 1) {
      setSelfieTaken(true);
      setCurrentStep(2);
    }
  };

  const handleConfirmVote = async () => {
    if (!biometricSuccess) {
      Alert.alert('Verification', 'Please wait for biometric verification');
      return;
    }

    setLoading(true);
    try {
      const result = await castVote({
        studentId: student?.id,
        candidateId: candidate?.id,
        post: candidate?.post,
        token,
      });
      if (result.success) {
        navigation.navigate('Success', {
          candidate,
          student,
          receiptNumber: result.receiptNumber,
          timestamp: result.timestamp,
        });
      } else {
        Alert.alert('Error', 'Failed to cast vote. Please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIcon}>
              <Ionicons name="person-circle" size={48} color={colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Identity Verification</Text>
            <Text style={styles.stepSubtitle}>
              Confirm your identity to proceed with voting
            </Text>
            <InputField
              label="Student ID"
              value={student?.id || ''}
              editable={false}
              icon={<Ionicons name="card" size={18} color={colors.textHint} />}
            />
            <InputField
              label="Date of Birth"
              value={dob}
              onChangeText={setDob}
              placeholder="DD/MM/YYYY"
              keyboardType="number-pad"
              icon={<Ionicons name="calendar" size={18} color={colors.textHint} />}
            />
            <PrimaryButton
              title="Next"
              onPress={handleNext}
              style={styles.nextButton}
            />
          </View>
        );
      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={styles.stepIcon}>
              <Ionicons name="camera" size={48} color={colors.primary} />
            </View>
            <Text style={styles.stepTitle}>Selfie Verification</Text>
            <Text style={styles.stepSubtitle}>
              Take a selfie for identity verification
            </Text>
            <View style={styles.selfieFrame}>
              <View style={styles.selfieCircle}>
                <Ionicons name="person" size={64} color={colors.textHint} />
                <View style={styles.faceDetection}>
                  <Text style={styles.faceDetectionText}>
                    📸 Face detected
                  </Text>
                </View>
              </View>
              <View style={styles.selfieCornerTL} />
              <View style={styles.selfieCornerTR} />
              <View style={styles.selfieCornerBL} />
              <View style={styles.selfieCornerBR} />
            </View>
            <PrimaryButton
              title="Capture & Continue"
              onPress={handleNext}
              style={styles.nextButton}
              icon={<Ionicons name="camera" size={18} color={colors.white} />}
            />
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Confirm Your Vote</Text>
            <Text style={styles.stepSubtitle}>
              Authenticate with biometric to confirm
            </Text>

            {/* Fingerprint */}
            <View style={styles.biometricContainer}>
              <TouchableOpacity
                style={[
                  styles.fingerprintButton,
                  biometricSuccess && styles.fingerprintSuccess,
                ]}
                activeOpacity={0.7}
                onPress={() => setBiometricSuccess(true)}
              >
                <Ionicons
                  name={biometricSuccess ? 'checkmark-circle' : 'finger-print'}
                  size={48}
                  color={biometricSuccess ? colors.success : colors.primary}
                />
              </TouchableOpacity>
              <Text style={styles.biometricLabel}>
                {biometricSuccess
                  ? '✅ Biometric Verified'
                  : 'Tap to authenticate'}
              </Text>
            </View>

            {/* Vote Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Vote Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Candidate</Text>
                <Text style={styles.summaryValue}>{candidate?.name}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Post</Text>
                <Text style={styles.summaryValue}>{candidate?.post}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Programme</Text>
                <Text style={styles.summaryValue}>{candidate?.programme}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Your ID</Text>
                <Text style={styles.summaryValue}>{student?.id}</Text>
              </View>
            </View>

            <PrimaryButton
              title="Confirm My Vote"
              onPress={handleConfirmVote}
              loading={loading}
              disabled={!biometricSuccess}
              style={styles.confirmButton}
              icon={
                !loading && (
                  <Ionicons name="checkmark-done" size={18} color={colors.white} />
                )
              }
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color={colors.textMain} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification</Text>
        <View style={{ width: 36 }} />
      </View>

      <ProgressBar currentStep={currentStep} steps={STEPS} />
      {renderStep()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMain,
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
    padding: 24,
  },
  stepIcon: {
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textMain,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 20,
  },
  nextButton: {
    marginTop: 12,
  },
  // Selfie
  selfieFrame: {
    width: 220,
    height: 220,
    alignSelf: 'center',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selfieCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  faceDetection: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
  },
  faceDetectionText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  selfieCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.accent,
    borderTopLeftRadius: 8,
  },
  selfieCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.accent,
    borderTopRightRadius: 8,
  },
  selfieCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.accent,
    borderBottomLeftRadius: 8,
  },
  selfieCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.accent,
    borderBottomRightRadius: 8,
  },
  // Biometric
  biometricContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  fingerprintButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  fingerprintSuccess: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  biometricLabel: {
    fontSize: 14,
    color: colors.textSub,
    fontWeight: '500',
  },
  // Summary
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSub,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  confirmButton: {
    marginTop: 8,
  },
});
