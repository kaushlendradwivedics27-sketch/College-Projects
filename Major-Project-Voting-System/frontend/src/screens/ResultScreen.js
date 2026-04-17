import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { CLUBS, CLUB_POSITIONS } from '../constants/iilm';
import { supabase } from '../services/supabase';
import { CANDIDATES } from '../data/candidates';

export default function ResultScreen() {
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [voteData, setVoteData] = useState([]);  // raw votes from Supabase
  const [totalVotes, setTotalVotes] = useState(0);

  const fetchVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('candidate_id, club_id, position, student_email');

      if (error) {
        console.warn('Fetch votes error:', error.message);
        setVoteData([]);
        setTotalVotes(0);
        return;
      }

      setVoteData(data || []);
      setTotalVotes(data?.length || 0);
    } catch (err) {
      console.warn('fetchVotes error:', err);
      setVoteData([]);
      setTotalVotes(0);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchVotes();
      setLoading(false);
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVotes();
    setRefreshing(false);
  }, []);

  // ─── Compute aggregated data ───

  // Votes per club
  const getClubVotes = (clubId) =>
    voteData.filter((v) => v.club_id === clubId).length;

  // Votes per club+position
  const getPositionVotes = (clubId, position) =>
    voteData.filter((v) => v.club_id === clubId && v.position === position).length;

  // Total votes per position across all clubs
  const getPositionTotal = (position) =>
    voteData.filter((v) => v.position === position).length;

  // Unique voters
  const uniqueVoters = new Set(voteData.map((v) => v.student_email)).size;

  // Top candidate for a position in a club
  const getTopCandidate = (clubId, position) => {
    const posVotes = voteData.filter(
      (v) => v.club_id === clubId && v.position === position
    );
    if (posVotes.length === 0) return null;

    const counts = {};
    posVotes.forEach((v) => {
      counts[v.candidate_id] = (counts[v.candidate_id] || 0) + 1;
    });

    const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const candidate = CANDIDATES.find((c) => c.id === topId[0]);
    return {
      name: candidate?.name || topId[0],
      votes: topId[1],
      total: posVotes.length,
    };
  };

  // Sort clubs by votes received
  const sortedClubs = [...CLUBS].sort(
    (a, b) => getClubVotes(b.id) - getClubVotes(a.id)
  );

  const maxClubVotes = Math.max(...sortedClubs.map((c) => getClubVotes(c.id)), 1);

  // Position totals
  const positionTotals = CLUB_POSITIONS.map((pos) => ({
    position: pos,
    total: getPositionTotal(pos),
  }));
  const maxPositionTotal = Math.max(...positionTotals.map((p) => p.total), 1);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.pageTitle}>Live Results</Text>
            <Text style={styles.pageSubtitle}>SCSE Club Elections 2025</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
            <Ionicons name="refresh" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{totalVotes}</Text>
            <Text style={styles.summaryLabel}>Total Votes</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{uniqueVoters}</Text>
            <Text style={styles.summaryLabel}>Voters</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{CLUBS.length}</Text>
            <Text style={styles.summaryLabel}>Clubs</Text>
          </View>
        </View>

        {totalVotes === 0 && (
          <View style={styles.emptyCard}>
            <Ionicons name="ballot-outline" size={40} color={colors.textHint} />
            <Text style={styles.emptyTitle}>No Votes Yet</Text>
            <Text style={styles.emptySubtitle}>
              Results will appear here once voting begins. Pull down to refresh.
            </Text>
          </View>
        )}

        {/* Position-wise Overview */}
        {totalVotes > 0 && (
          <>
            <Text style={styles.sectionTitle}>📊 Votes by Position</Text>
            <View style={styles.positionSection}>
              {positionTotals.map((item) => {
                const barPercent = maxPositionTotal > 0
                  ? (item.total / maxPositionTotal) * 100
                  : 0;
                return (
                  <View key={item.position} style={styles.positionRow}>
                    <View style={styles.positionLabelRow}>
                      <Text style={styles.positionName}>{item.position}</Text>
                      <Text style={styles.positionTotal}>{item.total} votes</Text>
                    </View>
                    <View style={styles.barBg}>
                      <View
                        style={[
                          styles.barFill,
                          { width: `${barPercent}%`, backgroundColor: colors.primary },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Club Rankings */}
        <Text style={styles.sectionTitle}>
          {totalVotes > 0 ? '🏆 Club Rankings (by votes)' : '🏛️ Clubs'}
        </Text>
        {sortedClubs.map((club, index) => {
          const clubVotes = getClubVotes(club.id);
          const barPercent = maxClubVotes > 0
            ? (clubVotes / maxClubVotes) * 100
            : 0;

          return (
            <TouchableOpacity
              key={club.id}
              style={styles.rankCard}
              activeOpacity={0.7}
              onPress={() =>
                setSelectedClub(selectedClub === club.id ? null : club.id)
              }
            >
              {/* Rank badge */}
              <View style={[
                styles.rankBadge,
                index === 0 && clubVotes > 0 && { backgroundColor: '#FFD700' },
                index === 1 && clubVotes > 0 && { backgroundColor: '#C0C0C0' },
                index === 2 && clubVotes > 0 && { backgroundColor: '#CD7F32' },
              ]}>
                <Text style={[
                  styles.rankText,
                  index < 3 && clubVotes > 0 && { color: colors.white },
                ]}>
                  {index + 1}
                </Text>
              </View>

              <View style={styles.rankInfo}>
                <View style={styles.rankHeader}>
                  <Ionicons name={club.icon} size={16} color={club.color} />
                  <Text style={styles.rankName} numberOfLines={1}>{club.name}</Text>
                </View>
                {clubVotes > 0 && (
                  <View style={styles.barBg}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${barPercent}%`, backgroundColor: club.color },
                      ]}
                    />
                  </View>
                )}
              </View>

              <Text style={[styles.rankCount, { color: club.color }]}>
                {clubVotes}
              </Text>

              <Ionicons
                name={selectedClub === club.id ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={colors.textHint}
                style={{ marginLeft: 6 }}
              />

              {/* Expanded detail — votes per position with leading candidate */}
              {selectedClub === club.id && (
                <View style={styles.expandedDetail}>
                  {CLUB_POSITIONS.map((pos) => {
                    const posVotes = getPositionVotes(club.id, pos);
                    const top = getTopCandidate(club.id, pos);

                    return (
                      <View key={pos} style={styles.expandedRow}>
                        <View style={styles.expandedLeft}>
                          <Text style={styles.expandedPos}>{pos}</Text>
                          {top && (
                            <Text style={styles.expandedLeader} numberOfLines={1}>
                              👑 {top.name} ({top.votes}/{top.total})
                            </Text>
                          )}
                        </View>
                        <View style={styles.expandedRight}>
                          {posVotes > 0 ? (
                            <View style={[styles.voteBadge, { backgroundColor: club.color + '18' }]}>
                              <Text style={[styles.voteBadgeText, { color: club.color }]}>
                                {posVotes} {posVotes === 1 ? 'vote' : 'votes'}
                              </Text>
                            </View>
                          ) : (
                            <Text style={styles.noVotesText}>No votes</Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  loadingText: { fontSize: 14, color: colors.textSub },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textMain,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSub,
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Summary
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSub,
    marginTop: 2,
  },

  // Empty
  emptyCard: {
    marginHorizontal: 20,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSub,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMain,
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  // Position Overview
  positionSection: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  positionRow: {
    marginBottom: 12,
  },
  positionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  positionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
  },
  positionTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
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

  // Rank Card
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    flexWrap: 'wrap',
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.divider,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSub,
  },
  rankInfo: {
    flex: 1,
    gap: 6,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    flex: 1,
  },
  rankCount: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 10,
  },

  // Expanded
  expandedDetail: {
    width: '100%',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  expandedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  expandedLeft: { flex: 1 },
  expandedPos: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMain,
  },
  expandedLeader: {
    fontSize: 11,
    color: colors.accent,
    marginTop: 2,
  },
  expandedRight: {
    marginLeft: 10,
  },
  voteBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  voteBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  noVotesText: {
    fontSize: 12,
    color: colors.textHint,
  },
});
