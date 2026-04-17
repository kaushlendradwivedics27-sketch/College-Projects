import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../constants/colors';
import { ELECTION_STATS, IMPORTANT_DATES, UNIVERSITY_NAME, ELECTION_YEAR, DEPARTMENT_NAME } from '../constants/iilm';

export default function ElectionInfoScreen({ navigation }) {
  const stats = [
    { label: 'Total Nominations', value: ELECTION_STATS.totalNominations, icon: 'people' },
    { label: 'SCSE Clubs', value: ELECTION_STATS.totalClubs, icon: 'business' },
    { label: 'Positions', value: ELECTION_STATS.positions, icon: 'trophy' },
    { label: 'Voting Duration', value: ELECTION_STATS.votingDuration, icon: 'time' },
  ];

  const dates = [
    { label: 'Nomination Last Date', value: IMPORTANT_DATES.nominationLastDate, icon: 'document-text' },
    { label: 'Voting Day', value: IMPORTANT_DATES.votingDay, icon: 'checkmark-circle' },
    { label: 'Result Announcement', value: IMPORTANT_DATES.resultAnnouncement, icon: 'megaphone' },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          style={styles.hero}
        >
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>📢 Official Notice</Text>
          </View>
          <Text style={styles.heroTitle}>
            {UNIVERSITY_NAME}{'\n'}SCSE Club{'\n'}Elections {ELECTION_YEAR}
          </Text>
          <Text style={styles.heroSubtitle}>
            Vote for your club leaders — {DEPARTMENT_NAME}
          </Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.icon} size={22} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Important Dates */}
          <View style={styles.datesCard}>
            <View style={styles.datesHeader}>
              <Ionicons name="calendar" size={20} color={colors.accent} />
              <Text style={styles.datesTitle}>Important Dates</Text>
            </View>
            {dates.map((date, index) => (
              <View key={index} style={styles.dateRow}>
                <View style={styles.dateIconWrapper}>
                  <Ionicons name={date.icon} size={18} color={colors.primary} />
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>{date.label}</Text>
                  <Text style={styles.dateValue}>{date.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* CTA */}
          <PrimaryButton
            title="Proceed to Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.ctaButton}
            icon={<Ionicons name="arrow-forward" size={18} color={colors.white} />}
          />
          <Text style={styles.disclaimer}>
            Only registered IILM SCSE students with a valid IILM email are eligible to vote.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 50,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroBadge: {
    backgroundColor: 'rgba(184,134,11,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(184,134,11,0.25)',
  },
  heroBadgeText: { fontSize: 13, color: colors.accent, fontWeight: '600' },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    lineHeight: 36,
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  heroSubtitle: { fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 22 },
  content: { padding: 20, marginTop: -20 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary, marginBottom: 4 },
  statLabel: { fontSize: 12, color: colors.textSub, textAlign: 'center', fontWeight: '500' },
  datesCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  datesHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  datesTitle: { fontSize: 17, fontWeight: '700', color: colors.textMain },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  dateIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dateInfo: { flex: 1 },
  dateLabel: { fontSize: 13, color: colors.textSub, marginBottom: 2 },
  dateValue: { fontSize: 15, fontWeight: '700', color: colors.textMain },
  ctaButton: { marginBottom: 16 },
  disclaimer: {
    fontSize: 12,
    color: colors.textHint,
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: 20,
  },
});
