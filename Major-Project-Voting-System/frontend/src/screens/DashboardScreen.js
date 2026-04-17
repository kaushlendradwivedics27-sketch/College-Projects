import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { CLUBS, ELECTION_STATS, CLUB_POSITIONS } from '../constants/iilm';

export default function DashboardScreen({ navigation, route }) {
  const student = route.params?.student || { name: 'Student', id: 'CS-000' };
  const token = route.params?.token;
  const [searchQuery, setSearchQuery] = useState('');

  const firstName = student?.name?.split(' ')[0] || 'Student';

  const filteredClubs = searchQuery
    ? CLUBS.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.shortName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : CLUBS;

  // Stats
  const topClub = [...CLUBS].sort((a, b) => b.totalNominations - a.totalNominations)[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>SCSE</Text>
          </View>
          <View style={styles.greeting}>
            <Text style={styles.greetingText}>Hello,</Text>
            <Text style={styles.greetingName}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarSmall}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Profile', { student, token })}
          >
            <Text style={styles.avatarSmallText}>{firstName.charAt(0)}</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{ELECTION_STATS.totalClubs}</Text>
            <Text style={styles.statLabel}>Clubs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{ELECTION_STATS.totalNominations}</Text>
            <Text style={styles.statLabel}>Nominations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{ELECTION_STATS.positions}</Text>
            <Text style={styles.statLabel}>Positions</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.textHint} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clubs..."
              placeholderTextColor={colors.textHint}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textHint} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Alert Banner */}
        <View style={styles.alertBannerWrap}>
          <View style={styles.alertBanner}>
            <View style={styles.alertDotWrap}>
              <View style={styles.alertDot} />
            </View>
            <Text style={styles.alertText}>
              SCSE Club Elections <Text style={styles.alertBold}>2025</Text> · {ELECTION_STATS.totalNominations} Nominations
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.accent} />
          </View>
        </View>

        {/* Clubs List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🏛️ All Clubs</Text>
          <View style={styles.countBadgeWrap}>
            <Text style={styles.countBadge}>{filteredClubs.length}</Text>
          </View>
        </View>

        {filteredClubs.map((club) => (
          <TouchableOpacity
            key={club.id}
            style={styles.clubCard}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('CandidateDetail', {
                club,
                student,
                token,
              })
            }
          >
            <View style={[styles.clubIconBg, { backgroundColor: club.color + '18' }]}>
              <Ionicons name={club.icon} size={22} color={club.color} />
            </View>
            <View style={styles.clubInfo}>
              <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
              <View style={styles.clubMeta}>
                <Text style={styles.clubNominations}>
                  {club.totalNominations} nominations
                </Text>
                <View style={styles.clubDot} />
                <Text style={styles.clubPositions}>5 positions</Text>
              </View>
            </View>
            <View style={styles.clubArrow}>
              <Ionicons name="chevron-forward" size={18} color={colors.textHint} />
            </View>
          </TouchableOpacity>
        ))}

        {/* Position-wise breakdown */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📊 Nominations by Position</Text>
        </View>
        <View style={styles.positionsGrid}>
          {CLUB_POSITIONS.map((pos) => {
            const total = CLUBS.reduce((sum, c) => sum + (c.nominations[pos] || 0), 0);
            return (
              <View key={pos} style={styles.positionCard}>
                <Text style={styles.positionCount}>{total}</Text>
                <Text style={styles.positionName} numberOfLines={1}>{pos}</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  logoBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 1,
  },
  greeting: { flex: 1, marginLeft: 12 },
  greetingText: { fontSize: 13, color: colors.textSub },
  greetingName: { fontSize: 17, fontWeight: '700', color: colors.textMain },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: { fontSize: 16, fontWeight: '700', color: colors.white },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 6,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSub,
    marginTop: 2,
  },

  // Search
  searchContainer: { paddingHorizontal: 20, paddingVertical: 10 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textMain },

  // Alert Banner
  alertBannerWrap: { paddingHorizontal: 20, marginBottom: 4 },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  alertDotWrap: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
  },
  alertText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  alertBold: { fontWeight: '800', color: colors.accent },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textMain },
  countBadgeWrap: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 100,
  },
  countBadge: { fontSize: 12, fontWeight: '700', color: colors.white },

  // Club Cards
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  clubIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  clubInfo: {
    flex: 1,
  },
  clubName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 4,
  },
  clubMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  clubNominations: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  clubDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: colors.textHint,
  },
  clubPositions: {
    fontSize: 12,
    color: colors.textSub,
  },
  clubArrow: {
    marginLeft: 8,
  },

  // Position Grid
  positionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },
  positionCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  positionCount: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent,
  },
  positionName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSub,
    marginTop: 4,
    textAlign: 'center',
  },

  bottomPadding: { height: 30 },
});