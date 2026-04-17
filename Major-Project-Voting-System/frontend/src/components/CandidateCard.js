import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

/**
 * CandidateCard — Horizontal (large, for President) and Vertical (compact, for others)
 */
export function HorizontalCandidateCard({ candidate, onPress }) {
  const initials = candidate.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <TouchableOpacity
      onPress={() => onPress(candidate)}
      activeOpacity={0.8}
      style={styles.horizontalCard}
    >
      <View style={styles.horizontalImageWrapper}>
        <View style={[styles.avatarLarge, { backgroundColor: candidate.color || colors.primary }]}>
          <Text style={styles.avatarLargeText}>{initials}</Text>
        </View>
      </View>
      <View style={styles.horizontalInfo}>
        <Text style={styles.horizontalName} numberOfLines={1}>{candidate.name}</Text>
        <Text style={styles.horizontalProgramme}>{candidate.programme} · {candidate.year}</Text>
        <Text style={styles.horizontalPost}>{candidate.post}</Text>
        <View style={styles.sloganBadge}>
          <Text style={styles.sloganText} numberOfLines={1}>"{candidate.campaign_slogan}"</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function VerticalCandidateCard({ candidate, onPress, totalVotes }) {
  const initials = candidate.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  const pct = totalVotes > 0 ? (candidate.votes / totalVotes) * 100 : 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(candidate)}
      activeOpacity={0.8}
      style={styles.verticalCard}
    >
      <View style={[styles.avatarSmall, { backgroundColor: candidate.color || colors.primary }]}>
        <Text style={styles.avatarSmallText}>{initials}</Text>
      </View>
      <View style={styles.verticalInfo}>
        <Text style={styles.verticalName} numberOfLines={1}>{candidate.name}</Text>
        <Text style={styles.verticalProgramme}>{candidate.programme} · {candidate.post}</Text>
        {/* Vote progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(pct, 100)}%`, backgroundColor: candidate.color || colors.primary },
              ]}
            />
          </View>
          <Text style={styles.progressPct}>{pct.toFixed(0)}%</Text>
        </View>
      </View>
      <Text style={styles.votesCount}>{candidate.votes}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ---- Horizontal (President) ----
  horizontalCard: {
    width: width * 0.68,
    backgroundColor: colors.card,
    borderRadius: 20,
    marginRight: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  horizontalImageWrapper: {
    backgroundColor: colors.primaryLight,
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  horizontalInfo: {
    padding: 14,
  },
  horizontalName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textMain,
  },
  horizontalProgramme: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 2,
  },
  horizontalPost: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sloganBadge: {
    marginTop: 8,
    backgroundColor: colors.accentLight,
    borderRadius: 100,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  sloganText: {
    fontSize: 11,
    color: colors.accent,
    fontWeight: '600',
    fontStyle: 'italic',
  },

  // ---- Vertical (Others) ----
  verticalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  avatarSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  verticalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  verticalName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
  },
  verticalProgramme: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  progressBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressPct: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSub,
    width: 36,
    textAlign: 'right',
  },
  votesCount: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8,
  },
});
