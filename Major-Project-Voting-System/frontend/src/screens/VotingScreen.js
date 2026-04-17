import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar,
  TouchableOpacity, Alert, Modal, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { CLUB_POSITIONS } from '../constants/iilm';
import { getCandidatesByClubAndPosition } from '../data/candidates';
import { castVote, hasVoted } from '../services/api';

export default function VotingScreen({ navigation, route }) {
  const { club, position, student, token } = route.params || {};
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [voted, setVoted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [votedCandidateName, setVotedCandidateName] = useState('');

  const studentEmail = student?.email || '';

  // Get candidates from local data (real names from Excel)
  const candidates = club && position
    ? getCandidatesByClubAndPosition(club.id, position)
    : [];

  // Check if already voted on mount
  useEffect(() => {
    checkVoteStatus();
  }, []);

  const checkVoteStatus = async () => {
    if (!studentEmail || !club?.id || !position) {
      setChecking(false);
      return;
    }
    try {
      const alreadyVoted = await hasVoted(studentEmail, club.id, position);
      if (alreadyVoted) {
        setVoted(true);
      }
    } catch (err) {
      console.warn('Vote check failed:', err);
    } finally {
      setChecking(false);
    }
  };

  if (!club || !position) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Missing data</Text>
      </View>
    );
  }

  const handleVote = () => {
    if (!selectedCandidate) {
      Alert.alert('Select a candidate', 'Please select a candidate before voting.');
      return;
    }
    setShowConfirm(true);
  };

  const confirmVote = async () => {
    setShowConfirm(false);
    setLoading(true);

    try {
      const result = await castVote({
        studentEmail: studentEmail,
        candidateId: selectedCandidate.id,
        clubId: club.id,
        position: position,
      });

      if (result.success) {
        setVoted(true);
        setVotedCandidateName(selectedCandidate.name);
      } else {
        Alert.alert(
          'Vote Failed',
          result.error || 'Could not cast your vote. Please try again.'
        );
      }
    } catch (err) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
      console.error('Vote error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Loading state while checking vote status
  if (checking) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={club.color} />
        <LinearGradient colors={[club.color, club.color + 'CC']} style={styles.emptyHero}>
          <ActivityIndicator size="large" color={colors.white} />
          <Text style={[styles.emptySubtitle, { marginTop: 16 }]}>
            Checking vote status...
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  if (candidates.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor={club.color} />
        <LinearGradient colors={[club.color, club.color + 'CC']} style={styles.emptyHero}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Ionicons name="alert-circle" size={60} color="rgba(255,255,255,0.6)" />
          <Text style={styles.emptyTitle}>No Nominations</Text>
          <Text style={styles.emptySubtitle}>
            No one has nominated for {position} in {club.name}
          </Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={club.color} />
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        {/* Header */}
        <LinearGradient colors={[club.color, club.color + 'CC']} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerClub}>{club.name}</Text>
          <Text style={styles.headerPosition}>{position}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{candidates.length} Candidates</Text>
          </View>
        </LinearGradient>

        {/* Candidates List */}
        <View style={styles.content}>
          {voted ? (
            <View style={styles.successCard}>
              <View style={styles.successIconBg}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
              </View>
              <Text style={styles.successTitle}>Vote Submitted!</Text>
              <Text style={styles.successSubtitle}>
                {votedCandidateName
                  ? `You voted for ${votedCandidateName} as ${position}`
                  : `You have already voted for ${position}`
                }
              </Text>
              <Text style={styles.successClub}>{club.name}</Text>
              <TouchableOpacity
                style={[styles.doneButton, { backgroundColor: club.color }]}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.doneButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.instruction}>
                Select one candidate and tap "Cast Vote"
              </Text>

              {candidates.map((candidate) => {
                const isSelected = selectedCandidate?.id === candidate.id;
                const initials = candidate.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2);

                return (
                  <TouchableOpacity
                    key={candidate.id}
                    style={[
                      styles.candidateCard,
                      isSelected && { borderColor: club.color, borderWidth: 2 },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => setSelectedCandidate(candidate)}
                  >
                    <View style={styles.radioOuter}>
                      {isSelected && (
                        <View style={[styles.radioInner, { backgroundColor: club.color }]} />
                      )}
                    </View>
                    <View style={[styles.candidateAvatar, { backgroundColor: club.color + '20' }]}>
                      <Text style={[styles.candidateInitials, { color: club.color }]}>
                        {initials}
                      </Text>
                    </View>
                    <View style={styles.candidateInfo}>
                      <Text style={styles.candidateName}>{candidate.name}</Text>
                      <Text style={styles.candidateMeta}>
                        {candidate.rollNo} · {candidate.year} Year · {candidate.program}
                      </Text>
                    </View>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={22} color={club.color} />
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* Cast Vote Button */}
              <TouchableOpacity
                style={[
                  styles.voteButton,
                  { backgroundColor: selectedCandidate ? club.color : colors.divider },
                ]}
                disabled={!selectedCandidate || loading}
                onPress={handleVote}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-done"
                      size={20}
                      color={selectedCandidate ? colors.white : colors.textHint}
                    />
                    <Text
                      style={[
                        styles.voteButtonText,
                        { color: selectedCandidate ? colors.white : colors.textHint },
                      ]}
                    >
                      Cast Vote
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Voter info */}
              <View style={styles.voterInfo}>
                <Ionicons name="shield-checkmark" size={14} color={colors.textHint} />
                <Text style={styles.voterInfoText}>
                  Voting as: {studentEmail || student?.id || 'Unknown'}
                </Text>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalIcon, { backgroundColor: club.color + '18' }]}>
              <Ionicons name="shield-checkmark" size={36} color={club.color} />
            </View>
            <Text style={styles.modalTitle}>Confirm Your Vote</Text>
            <Text style={styles.modalSubtitle}>
              You are voting for:
            </Text>
            <Text style={styles.modalCandidate}>{selectedCandidate?.name}</Text>
            <Text style={styles.modalPosition}>
              as {position} — {club.shortName}
            </Text>
            <Text style={styles.modalWarning}>
              ⚠️ This action cannot be undone
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirm, { backgroundColor: club.color }]}
                onPress={confirmVote}
              >
                <Text style={styles.modalConfirmText}>Confirm Vote</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 14, color: colors.textHint },

  // Header
  header: {
    paddingTop: 16,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  headerClub: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    marginBottom: 4,
  },
  headerPosition: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 12,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },

  // Content
  content: { padding: 20 },
  instruction: {
    fontSize: 14,
    color: colors.textSub,
    marginBottom: 16,
    textAlign: 'center',
  },

  // Candidate Card
  candidateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.textHint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  candidateAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  candidateInitials: {
    fontSize: 16,
    fontWeight: '800',
  },
  candidateInfo: { flex: 1 },
  candidateName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textMain,
    marginBottom: 2,
  },
  candidateMeta: {
    fontSize: 12,
    color: colors.textSub,
  },

  // Vote Button
  voteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 12,
  },
  voteButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },

  // Voter info
  voterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  voterInfoText: {
    fontSize: 12,
    color: colors.textHint,
  },

  // Success
  successCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  successIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.success,
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 15,
    color: colors.textSub,
    textAlign: 'center',
    marginBottom: 4,
  },
  successClub: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textHint,
    marginBottom: 24,
  },
  doneButton: {
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },

  // Empty Hero
  emptyHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.white,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
  },
  modalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textMain,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.textSub,
    marginBottom: 4,
  },
  modalCandidate: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  modalPosition: {
    fontSize: 13,
    color: colors.textSub,
    marginBottom: 16,
  },
  modalWarning: {
    fontSize: 12,
    color: colors.danger,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSub,
  },
  modalConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
});
