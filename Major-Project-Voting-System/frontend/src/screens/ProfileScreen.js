import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { CLUBS, CLUB_POSITIONS } from '../constants/iilm';
import { CANDIDATES } from '../data/candidates';
import { supabase } from '../services/supabase';
import { signOut } from '../services/supabase';
import CustomAlert from '../components/CustomAlert';

export default function ProfileScreen({ navigation, route }) {
  const student = route.params?.student || {};
  const token = route.params?.token;
  const [votingHistory, setVotingHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const initials = student.name
    ? student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()
    : student.id?.substring(0, 2)?.toUpperCase() || '??';

  const fetchVotingHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('student_email', student.email)
        .order('voted_at', { ascending: false });

      if (error) {
        console.warn('Fetch history error:', error.message);
        setVotingHistory([]);
        return;
      }
      setVotingHistory(data || []);
    } catch (err) {
      console.warn('fetchVotingHistory error:', err);
      setVotingHistory([]);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchVotingHistory();
      setLoading(false);
    })();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchVotingHistory();
    setRefreshing(false);
  }, []);

  const handleLogout = () => setShowLogoutAlert(true);

  const confirmLogout = async () => {
    setShowLogoutAlert(false);
    await signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  // Resolve vote data to readable info
  const resolveVote = (vote) => {
    const club = CLUBS.find((c) => c.id === vote.club_id);
    const candidate = CANDIDATES.find((c) => c.id === vote.candidate_id);
    return {
      clubName: club?.name || vote.club_id,
      clubShort: club?.shortName || vote.club_id,
      clubColor: club?.color || colors.primary,
      clubIcon: club?.icon || 'ellipse',
      candidateName: candidate?.name || vote.candidate_id,
      position: vote.position,
      votedAt: vote.voted_at,
    };
  };

  const totalPositions = CLUBS.length * CLUB_POSITIONS.length; // 13 clubs × 5 positions = 65
  const votedCount = votingHistory.length;

  const profileRows = [
    { icon: 'mail', label: 'Email', value: student.email || '—' },
    { icon: 'card', label: 'Roll No', value: student.enrollment || student.id || '—' },
    { icon: 'grid', label: 'Section', value: student.section || '—' },
    { icon: 'calendar', label: 'Year', value: student.year || '—' },
    { icon: 'school', label: 'Programme', value: student.programme || 'B.Tech CSE' },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
            tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Hero */}
        <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={s.hero}>
          <View style={s.avatarCircle}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.heroName}>{student.name || student.id || 'Student'}</Text>
          <Text style={s.heroEmail}>{student.email || ''}</Text>
          <View style={s.heroBadgeRow}>
            <View style={s.heroBadge}>
              <Ionicons name="shield-checkmark" size={12} color={colors.success} />
              <Text style={s.heroBadgeText}>Verified</Text>
            </View>
            <View style={s.heroBadge}>
              <Ionicons name="checkmark-done" size={12} color={colors.accent} />
              <Text style={s.heroBadgeText}>{votedCount} Votes Cast</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={s.content}>
          {/* Profile Info Card */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Student Information</Text>
            {profileRows.map((row, i) => (
              <View key={i} style={[s.infoRow, i < profileRows.length - 1 && s.infoRowBorder]}>
                <View style={s.infoIconWrap}>
                  <Ionicons name={row.icon} size={16} color={colors.primary} />
                </View>
                <Text style={s.infoLabel}>{row.label}</Text>
                <Text style={s.infoValue} numberOfLines={1}>{row.value}</Text>
              </View>
            ))}
          </View>

          {/* Voting Progress */}
          <View style={s.card}>
            <View style={s.cardTitleRow}>
              <Text style={s.cardTitle}>Voting Progress</Text>
              <Text style={s.progressCount}>
                {votedCount} / {totalPositions}
              </Text>
            </View>
            <View style={s.progressBarBg}>
              <View
                style={[
                  s.progressBarFill,
                  { width: `${totalPositions > 0 ? (votedCount / totalPositions) * 100 : 0}%` },
                ]}
              />
            </View>
            <Text style={s.progressHint}>
              {votedCount === 0
                ? 'You haven\'t voted yet. Head to a club to cast your vote!'
                : `You've voted for ${votedCount} out of ${totalPositions} positions across all clubs.`
              }
            </Text>
          </View>

          {/* Voting History */}
          <View style={s.card}>
            <Text style={s.cardTitle}>Voting History</Text>
            {loading ? (
              <Text style={s.emptyText}>Loading...</Text>
            ) : votingHistory.length === 0 ? (
              <View style={s.emptyHistory}>
                <Ionicons name="document-text-outline" size={32} color={colors.textHint} />
                <Text style={s.emptyText}>No votes recorded yet</Text>
              </View>
            ) : (
              votingHistory.map((vote, i) => {
                const info = resolveVote(vote);
                const time = info.votedAt
                  ? new Date(info.votedAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : '';
                return (
                  <View key={i} style={[s.historyRow, i < votingHistory.length - 1 && s.historyRowBorder]}>
                    <View style={[s.historyIcon, { backgroundColor: info.clubColor + '18' }]}>
                      <Ionicons name={info.clubIcon} size={18} color={info.clubColor} />
                    </View>
                    <View style={s.historyInfo}>
                      <Text style={s.historyClub}>{info.clubShort}</Text>
                      <Text style={s.historyPosition}>{info.position}</Text>
                      <Text style={s.historyCandidate}>Voted for: {info.candidateName}</Text>
                      {time ? <Text style={s.historyTime}>{time}</Text> : null}
                    </View>
                    <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  </View>
                );
              })
            )}
          </View>

          {/* Actions */}
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={s.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={s.version}>SCSE VotingSystem v1.0</Text>
        </View>

        <CustomAlert
          visible={showLogoutAlert}
          title="Sign Out"
          message="Are you sure you want to sign out? You'll need to verify your email again to log back in."
          icon="log-out-outline"
          type="warning"
          buttons={[
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: confirmLogout, keepOpen: true },
          ]}
          onClose={() => setShowLogoutAlert(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.primary },
  scroll: { flex: 1, backgroundColor: colors.background },

  // Hero
  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 36,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 14,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 2,
  },
  heroName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  heroEmail: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.65)',
    marginBottom: 14,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  heroBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },

  // Content
  content: {
    padding: 20,
    marginTop: -12,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  progressCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: colors.textSub,
    width: 80,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMain,
    textAlign: 'right',
  },

  // Progress
  progressBarBg: {
    height: 10,
    backgroundColor: colors.divider,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
    borderRadius: 5,
  },
  progressHint: {
    fontSize: 13,
    color: colors.textSub,
    lineHeight: 18,
  },

  // History
  emptyHistory: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textHint,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: { flex: 1 },
  historyClub: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
  },
  historyPosition: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 1,
  },
  historyCandidate: {
    fontSize: 12,
    color: colors.textSub,
    marginTop: 2,
  },
  historyTime: {
    fontSize: 11,
    color: colors.textHint,
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dangerLight,
    marginBottom: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
  },

  // Version
  version: {
    fontSize: 12,
    color: colors.textHint,
    textAlign: 'center',
    marginBottom: 20,
  },
});
