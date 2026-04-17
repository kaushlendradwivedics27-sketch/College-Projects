import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const BATCH_TURNOUT = [
  { batch: 'BBA 2022', turnout: 82 },
  { batch: 'MBA 2023', turnout: 78 },
  { batch: 'B.Tech 2022', turnout: 71 },
  { batch: 'BA LLB 2021', turnout: 85 },
  { batch: 'B.Sc 2023', turnout: 69 },
];

// Data-driven animated bar
function AnimBar({ pct, delay = 0, color = colors.primary }) {
  const w = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(w, {
      toValue: pct,
      duration: 600,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);
  const width = w.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'], extrapolate: 'clamp' });
  return (
    <View style={s.compBarBg}>
      <Animated.View style={[s.compBarFill, { width, backgroundColor: color }]} />
    </View>
  );
}

// Batch bar chart
function BatchBar({ pct, delay = 0 }) {
  const h = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(h, {
      toValue: pct,
      duration: 600,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct]);
  const height = h.interpolate({ inputRange: [0, 100], outputRange: [0, 80], extrapolate: 'clamp' });
  return (
    <View style={s.batchBarWrapper}>
      <Animated.View style={[s.batchBarFill, { height }]} />
    </View>
  );
}

export default function CandidateResultScreen({ navigation, route }) {
  const { candidate, candidates = [], postTotal = 0 } = route.params || {};
  const initials = candidate?.name?.split(' ').map(n => n[0]).join('') || '??';
  const pct = postTotal > 0 ? ((candidate?.votes / postTotal) * 100).toFixed(1) : 0;
  const sorted = [...candidates].sort((a, b) => b.votes - a.votes);
  const isWinner = sorted.length > 0 && sorted[0]?.id === candidate?.id;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.textMain} />
          </TouchableOpacity>
          <View style={s.headerInfo}>
            <Text style={s.headerName}>{candidate?.name}</Text>
            <Text style={s.headerPost}>{candidate?.post}</Text>
          </View>
        </View>

        <View style={s.content}>
          {/* Total votes card */}
          <View style={s.totalCard}>
            <View style={[s.lgAvatar, { backgroundColor: candidate?.color || colors.primary }]}>
              <Text style={s.lgAvatarText}>{initials}</Text>
            </View>
            <Text style={s.totalVotes}>{candidate?.votes || 0}</Text>
            <Text style={s.totalLabel}>Total Votes Received</Text>
            <View style={s.pctBadge}>
              <Text style={s.pctText}>{pct}%</Text>
            </View>
            {isWinner && (
              <View style={s.winnerBadge}>
                <Text style={s.winnerText}>🏆 Leading Candidate</Text>
              </View>
            )}
          </View>

          {/* Comparison bars */}
          <View style={s.compCard}>
            <Text style={s.compTitle}>Comparison — {candidate?.post}</Text>
            {sorted.map((c, i) => {
              const cPct = postTotal > 0 ? ((c.votes / postTotal) * 100) : 0;
              const isCurrent = c.id === candidate?.id;
              return (
                <View key={c.id} style={s.compRow}>
                  <Text style={[s.compName, isCurrent && s.compNameActive]}>{c.name}</Text>
                  <AnimBar pct={cPct} delay={i * 100} color={isCurrent ? colors.accent : colors.primary} />
                  <Text style={s.compPct}>{cPct.toFixed(1)}%</Text>
                </View>
              );
            })}
          </View>

          {/* Batch turnout */}
          <View style={s.batchCard}>
            <Text style={s.batchTitle}>Voter Turnout by Batch</Text>
            <View style={s.batchChartRow}>
              {BATCH_TURNOUT.map((b, i) => (
                <View key={i} style={s.batchCol}>
                  <BatchBar pct={b.turnout} delay={i * 80} />
                  <Text style={s.batchPctLabel}>{b.turnout}%</Text>
                  <Text style={s.batchName} numberOfLines={1}>{b.batch.split(' ')[0]}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Trend */}
          <View style={s.trendCard}>
            <Ionicons name="trending-up" size={22} color={colors.success} />
            <Text style={s.trendText}>↑ 12% increase vs last election</Text>
          </View>
        </View>
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 18, fontWeight: '700', color: colors.textMain },
  headerPost: { fontSize: 13, color: colors.textSub },
  content: { padding: 20, gap: 16 },
  totalCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  lgAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  lgAvatarText: { fontSize: 26, fontWeight: '800', color: colors.white },
  totalVotes: { fontSize: 44, fontWeight: '900', color: colors.primary },
  totalLabel: { fontSize: 14, color: colors.textSub, marginTop: 4 },
  pctBadge: { backgroundColor: colors.primaryLight, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, marginTop: 10 },
  pctText: { fontSize: 14, fontWeight: '700', color: colors.primary },
  winnerBadge: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 100,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(184,134,11,0.2)',
  },
  winnerText: { fontSize: 13, fontWeight: '700', color: colors.accent },
  compCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  compTitle: { fontSize: 16, fontWeight: '700', color: colors.textMain, marginBottom: 14 },
  compRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  compName: { width: 90, fontSize: 13, color: colors.textSub },
  compNameActive: { fontWeight: '700', color: colors.accent },
  compBarBg: { flex: 1, height: 10, backgroundColor: colors.primaryLight, borderRadius: 5, overflow: 'hidden' },
  compBarFill: { height: '100%', borderRadius: 5 },
  compPct: { width: 45, textAlign: 'right', fontSize: 13, fontWeight: '600', color: colors.textMain },
  // Batch chart
  batchCard: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  batchTitle: { fontSize: 16, fontWeight: '700', color: colors.textMain, marginBottom: 16 },
  batchChartRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 120 },
  batchCol: { alignItems: 'center', flex: 1 },
  batchBarWrapper: { width: 28, height: 80, backgroundColor: colors.primaryLight, borderRadius: 6, overflow: 'hidden', justifyContent: 'flex-end' },
  batchBarFill: { width: '100%', backgroundColor: colors.primary, borderRadius: 6 },
  batchPctLabel: { fontSize: 11, fontWeight: '700', color: colors.primary, marginTop: 6 },
  batchName: { fontSize: 10, color: colors.textHint, marginTop: 2, textAlign: 'center' },
  // Trend
  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.successLight,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(26,122,60,0.15)',
  },
  trendText: { fontSize: 14, fontWeight: '600', color: colors.success },
});
