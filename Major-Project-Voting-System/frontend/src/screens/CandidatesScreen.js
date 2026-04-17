import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { CLUBS, CLUB_POSITIONS } from '../constants/iilm';

export default function CandidatesScreen({ navigation, route }) {
  const student = route.params?.student;
  const token = route.params?.token;
  const [activePosition, setActivePosition] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const positions = ['All', ...CLUB_POSITIONS];

  // Filter clubs based on position having > 0 nominations
  const filteredClubs = CLUBS.filter((club) => {
    const matchesSearch = searchQuery
      ? club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.shortName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    if (activePosition === 'All') return matchesSearch;
    return matchesSearch && (club.nominations[activePosition] || 0) > 0;
  }).sort((a, b) => {
    if (activePosition === 'All') {
      return b.totalNominations - a.totalNominations;
    }
    return (b.nominations[activePosition] || 0) - (a.nominations[activePosition] || 0);
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Candidates</Text>
        <Text style={styles.pageSubtitle}>SCSE Club Elections 2025</Text>

        {/* Search */}
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
          </View>
        </View>

        {/* Position Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {positions.map((pos) => (
            <TouchableOpacity
              key={pos}
              style={[
                styles.filterChip,
                activePosition === pos && styles.filterChipActive,
              ]}
              onPress={() => setActivePosition(pos)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activePosition === pos && styles.filterChipTextActive,
                ]}
              >
                {pos}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Club List */}
        <View style={styles.listContainer}>
          {filteredClubs.map((club) => {
            const nomCount = activePosition === 'All'
              ? club.totalNominations
              : club.nominations[activePosition] || 0;

            return (
              <TouchableOpacity
                key={club.id}
                style={styles.clubCard}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('CandidateDetail', { club, student, token })
                }
              >
                <View style={[styles.clubIcon, { backgroundColor: club.color + '18' }]}>
                  <Ionicons name={club.icon} size={20} color={club.color} />
                </View>
                <View style={styles.clubInfo}>
                  <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                  <Text style={styles.clubCount}>
                    {nomCount} {activePosition === 'All' ? 'total nominations' : `for ${activePosition}`}
                  </Text>
                </View>
                <View style={[styles.countCircle, { backgroundColor: club.color + '18' }]}>
                  <Text style={[styles.countCircleText, { color: club.color }]}>{nomCount}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {filteredClubs.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={40} color={colors.textHint} />
              <Text style={styles.emptyText}>No clubs found</Text>
            </View>
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textMain,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.textSub,
    paddingHorizontal: 20,
    marginBottom: 16,
  },

  // Search
  searchContainer: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textMain },

  // Filter
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSub,
  },
  filterChipTextActive: {
    color: colors.white,
  },

  // List
  listContainer: { paddingHorizontal: 20 },
  clubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clubIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  clubInfo: { flex: 1 },
  clubName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 2,
  },
  clubCount: {
    fontSize: 12,
    color: colors.textSub,
  },
  countCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countCircleText: {
    fontSize: 14,
    fontWeight: '800',
  },

  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textHint,
  },
});
