// API Service — IILM SCSE Club Election System
// Connects to Supabase for real data, with local fallback

import { supabase } from './supabase';
import { CLUBS, CLUB_POSITIONS, ELECTION_STATS } from '../constants/iilm';

// ───────────────────────────────────────
// CANDIDATES — Stored in Supabase 'candidates' table
// Fallback: Generate placeholder structure from nomination data
// ───────────────────────────────────────

/**
 * Get all candidates, optionally filtered by club and/or position
 */
export const getCandidates = async (clubId, position) => {
  try {
    let query = supabase.from('candidates').select('*');

    if (clubId) {
      query = query.eq('club_id', clubId);
    }
    if (position) {
      query = query.eq('position', position);
    }

    const { data, error } = await query.order('club_id').order('position');

    if (error) {
      console.warn('Supabase candidates fetch failed, using local data:', error.message);
      return getLocalCandidates(clubId, position);
    }

    if (data && data.length > 0) {
      return data;
    }

    // Fallback to local data if table is empty
    return getLocalCandidates(clubId, position);
  } catch (err) {
    console.warn('getCandidates error:', err);
    return getLocalCandidates(clubId, position);
  }
};

/**
 * Local fallback — generate candidates from CLUBS nomination data
 */
const getLocalCandidates = (clubId, position) => {
  let candidates = [];

  const clubs = clubId ? CLUBS.filter((c) => c.id === clubId) : CLUBS;

  clubs.forEach((club) => {
    CLUB_POSITIONS.forEach((pos) => {
      const count = club.nominations[pos] || 0;
      for (let i = 1; i <= count; i++) {
        candidates.push({
          id: `${club.id}_${pos.toLowerCase().replace(/\s+/g, '_')}_${i}`,
          name: `Candidate ${i}`,
          club_id: club.id,
          club_name: club.name,
          club_short: club.shortName,
          club_color: club.color,
          club_icon: club.icon,
          position: pos,
          photo: null,
          manifesto: [],
          votes: 0,
        });
      }
    });
  });

  if (position) {
    candidates = candidates.filter((c) => c.position === position);
  }

  return candidates;
};

// ───────────────────────────────────────
// VOTING
// ───────────────────────────────────────

/**
 * Cast a vote — stores in Supabase 'votes' table
 */
export const castVote = async ({ studentEmail, candidateId, clubId, position }) => {
  try {
    // Check if student already voted for this position in this club
    const { data: existing } = await supabase
      .from('votes')
      .select('id')
      .eq('student_email', studentEmail)
      .eq('club_id', clubId)
      .eq('position', position)
      .single();

    if (existing) {
      return { success: false, error: 'You have already voted for this position in this club.' };
    }

    const { data, error } = await supabase
      .from('votes')
      .insert({
        student_email: studentEmail,
        candidate_id: candidateId,
        club_id: clubId,
        position: position,
        voted_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error('Cast vote error:', error.message);
      return { success: false, error: error.message };
    }

    const receiptNumber = 'IILM-' + Date.now().toString(36).toUpperCase();
    return {
      success: true,
      receiptNumber,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.error('castVote error:', err);
    return {
      success: false,
      error: 'Network error. Please check your connection and try again.',
    };
  }
};

/**
 * Check if student has already voted for a specific club+position
 */
export const hasVoted = async (studentEmail, clubId, position) => {
  try {
    const { data, error } = await supabase
      .from('votes')
      .select('id')
      .eq('student_email', studentEmail)
      .eq('club_id', clubId)
      .eq('position', position);

    if (error) return false;
    return data && data.length > 0;
  } catch {
    return false;
  }
};

// ───────────────────────────────────────
// RESULTS
// ───────────────────────────────────────

/**
 * Get voting results — aggregated from Supabase 'votes' table
 */
export const getResults = async (clubId, position) => {
  try {
    let query = supabase.from('votes').select('candidate_id, club_id, position');

    if (clubId) {
      query = query.eq('club_id', clubId);
    }
    if (position && position !== 'All Positions') {
      query = query.eq('position', position);
    }

    const { data: votes, error } = await query;

    if (error || !votes || votes.length === 0) {
      // Return nomination-based fallback data
      return getLocalResults(clubId, position);
    }

    // Aggregate votes by candidate
    const voteCounts = {};
    votes.forEach((v) => {
      voteCounts[v.candidate_id] = (voteCounts[v.candidate_id] || 0) + 1;
    });

    const totalVotes = votes.length;

    const candidates = Object.entries(voteCounts).map(([candidateId, count]) => ({
      id: candidateId,
      votes: count,
      percentage: ((count / totalVotes) * 100).toFixed(1),
    }));

    return {
      candidates: candidates.sort((a, b) => b.votes - a.votes),
      totalVotes,
      turnout: 'Live',
    };
  } catch (err) {
    console.error('getResults error:', err);
    return getLocalResults(clubId, position);
  }
};

/**
 * Local fallback results based on nomination counts
 */
const getLocalResults = (clubId, position) => {
  const clubs = clubId ? CLUBS.filter((c) => c.id === clubId) : CLUBS;

  const clubResults = clubs.map((club) => ({
    clubId: club.id,
    clubName: club.name,
    shortName: club.shortName,
    color: club.color,
    icon: club.icon,
    totalNominations: club.totalNominations,
    nominations: club.nominations,
  }));

  return {
    clubs: clubResults,
    totalNominations: ELECTION_STATS.totalNominations,
    totalClubs: ELECTION_STATS.totalClubs,
  };
};

// ───────────────────────────────────────
// NEWS / ANNOUNCEMENTS
// ───────────────────────────────────────

const NEWS_ITEMS = [
  {
    id: 'n1',
    title: 'SCSE Club Elections 2025 Announced',
    summary: 'The School of Computer Science & Engineering has officially announced club elections for 2025. Nominations are now open for all 13 clubs.',
    date: 'September 1, 2025',
    category: 'Announcement',
  },
  {
    id: 'n2',
    title: '401 Nominations Received Across 13 Clubs',
    summary: 'A record total of 401 nominations have been received across all SCSE clubs for 5 positions — President, Vice President, Secretary, Joint Secretary, and Treasurer.',
    date: 'September 18, 2025',
    category: 'Update',
  },
  {
    id: 'n3',
    title: 'Sports & Music Club Leads with 95 Nominations',
    summary: 'The Sports and Music Club has the highest number of nominations (95), followed by AI and Machine Learning Club (72) and Data Science Club (37).',
    date: 'September 18, 2025',
    category: 'Highlight',
  },
  {
    id: 'n4',
    title: 'Digital Voting System Goes Live',
    summary: 'IILM introduces the SCSE VotingSystem app for secure, transparent club elections. All eligible students from CSE1 to CSE11 can vote using their IILM email.',
    date: 'September 20, 2025',
    category: 'Technology',
  },
  {
    id: 'n5',
    title: 'Voting Day: September 25, 2025',
    summary: 'All SCSE students are reminded to cast their votes on September 25, 2025, between 8:00 AM and 5:00 PM through the VotingSystem app.',
    date: 'September 22, 2025',
    category: 'Reminder',
  },
];

export const getNews = async () => {
  try {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return NEWS_ITEMS;
    }
    return data;
  } catch {
    return NEWS_ITEMS;
  }
};

// ───────────────────────────────────────
// STUDENT LOGIN (kept for compatibility)
// ───────────────────────────────────────

export const loginStudent = async (email, rollNo) => {
  // Now handled by Supabase OTP in supabase.js
  // This is kept for backward compatibility
  const maskedEmail = email.substring(0, 2) + '****@iilm.edu';
  return { success: true, maskedEmail, email };
};

export const verifyOtp = async (email, otp) => {
  // Now handled by Supabase in supabase.js
  return { success: false, message: 'Use Supabase OTP verification' };
};
