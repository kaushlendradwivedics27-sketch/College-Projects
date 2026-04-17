import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../constants/colors';

export default function StudentProfileScreen({ navigation, route }) {
  const { student, token } = route.params || {};

  const initials = student?.name
    ? student.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : '??';

  const profileRows = [
    { label: 'Enrollment', value: student?.enrollment, icon: 'document-text' },
    { label: 'Programme', value: student?.programme || 'B.Tech CSE', icon: 'school' },
    { label: 'Year', value: student?.year, icon: 'calendar' },
    { label: 'Section', value: student?.section, icon: 'grid' },
    { label: 'Campus', value: student?.campus || 'IILM University', icon: 'location' },
    { label: 'Voting Status', value: student?.votingStatus || 'Eligible', icon: 'shield-checkmark', isStatus: true },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        style={styles.scroll}
      >
        {/* Hero */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.hero}
        >
          <Text style={styles.heroLabel}>Student Profile</Text>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{student?.name}</Text>
          <Text style={styles.heroId}>{student?.id}</Text>
          <View style={styles.programmeBadge}>
            <Text style={styles.programmeBadgeText}>{student?.programme}</Text>
          </View>
        </LinearGradient>

        {/* Profile Info */}
        <View style={styles.content}>
          <View style={styles.infoCard}>
            {profileRows.map((row, index) => (
              <View
                key={index}
                style={[
                  styles.infoRow,
                  index < profileRows.length - 1 && styles.infoRowBorder,
                ]}
              >
                <View style={styles.infoIconWrapper}>
                  <Ionicons name={row.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.infoTextContainer}>
                  <Text style={styles.infoLabel}>{row.label}</Text>
                  <View style={styles.infoValueRow}>
                    <Text style={[styles.infoValue, row.isStatus && styles.statusValue]}>
                      {row.value}
                    </Text>
                    {row.isStatus && (
                      <View style={styles.statusBadge}>
                        <Ionicons name="checkmark-circle" size={14} color={colors.success} />
                        <Text style={styles.statusBadgeText}>Verified</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          <PrimaryButton
            title="Proceed to Vote"
            onPress={() => navigation.navigate('MainTabs', { student, token })}
            style={styles.ctaButton}
            icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
          />

          <Text style={styles.disclaimer}>
            Your identity has been verified with IILM student records
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 40,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 2,
  },
  heroName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  heroId: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 12,
  },
  programmeBadge: {
    backgroundColor: 'rgba(184,134,11,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(184,134,11,0.3)',
  },
  programmeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  content: {
    padding: 20,
    marginTop: -16,
  },
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textHint,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  infoValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusValue: {
    color: colors.success,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  ctaButton: {
    marginBottom: 16,
  },
  disclaimer: {
    fontSize: 12,
    color: colors.textHint,
    textAlign: 'center',
    marginBottom: 20,
  },
});
