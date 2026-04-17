import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { CLUB_POSITIONS } from '../constants/iilm';

export default function CandidateDetailScreen({ navigation, route }) {
  const { club, student, token } = route.params || {};

  if (!club) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Club data not found</Text>
      </View>
    );
  }

  const maxNominations = Math.max(...Object.values(club.nominations));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={club.color} />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Hero */}
        <LinearGradient
          colors={[club.color, club.color + 'CC']}
          style={styles.hero}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>

          <View style={styles.clubIconLarge}>
            <Ionicons name={club.icon} size={40} color={club.color} />
          </View>
          <Text style={styles.clubName}>{club.name}</Text>
          <Text style={styles.clubSubtitle}>
            {club.totalNominations} Total Nominations
          </Text>

          {/* Position badges */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>5 Positions</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>SCSE 2025</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Nominations by Position */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Nominations by Position</Text>

          {CLUB_POSITIONS.map((position) => {
            const count = club.nominations[position] || 0;
            const barWidth = maxNominations > 0 ? (count / maxNominations) * 100 : 0;
            const isEmpty = count === 0;

            return (
              <TouchableOpacity
                key={position}
                style={styles.positionRow}
                activeOpacity={0.7}
                disabled={isEmpty}
                onPress={() =>
                  navigation.navigate('Voting', {
                    club,
                    position,
                    student,
                    token,
                  })
                }
              >
                <View style={styles.positionHeader}>
                  <View style={styles.positionLeft}>
                    <View style={[styles.positionDot, { backgroundColor: isEmpty ? colors.danger : club.color }]} />
                    <Text style={styles.positionName}>{position}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={[
                      styles.countBadge,
                      isEmpty && styles.countBadgeEmpty,
                    ]}>
                      <Text style={[
                        styles.countText,
                        isEmpty && styles.countTextEmpty,
                      ]}>
                        {count} {count === 1 ? 'nomination' : 'nominations'}
                      </Text>
                    </View>
                    {!isEmpty && (
                      <Ionicons name="chevron-forward" size={16} color={colors.textHint} />
                    )}
                  </View>
                </View>
                {/* Progress bar */}
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${barWidth}%`,
                        backgroundColor: isEmpty ? colors.danger : club.color,
                      },
                    ]}
                  />
                </View>
                {isEmpty && (
                  <Text style={styles.emptyWarning}>
                    ⚠️ No nominations for this position
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          {/* Club Summary Card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Ionicons name="people" size={18} color={colors.primary} />
              <Text style={styles.summaryLabel}>Total Nominations</Text>
              <Text style={styles.summaryValue}>{club.totalNominations}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Ionicons name="briefcase" size={18} color={colors.primary} />
              <Text style={styles.summaryLabel}>Positions</Text>
              <Text style={styles.summaryValue}>5</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryRow}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.summaryLabel}>Vacant Positions</Text>
              <Text style={[styles.summaryValue, { color: colors.danger }]}>
                {CLUB_POSITIONS.filter((p) => (club.nominations[p] || 0) === 0).length}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  loadingText: { fontSize: 14, color: colors.textSub },

  // Hero
  hero: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  clubIconLarge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  clubName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  clubSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },

  // Content
  content: {
    padding: 20,
    marginTop: -12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 16,
  },

  // Position Row
  positionRow: {
    marginBottom: 18,
  },
  positionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  positionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  positionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  positionName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textMain,
  },
  countBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
  },
  countBadgeEmpty: {
    backgroundColor: colors.dangerLight,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  countTextEmpty: {
    color: colors.danger,
  },
  barBg: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyWarning: {
    fontSize: 11,
    color: colors.danger,
    marginTop: 4,
  },

  // Summary
  summaryCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  summaryLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.textSub,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textMain,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
});
