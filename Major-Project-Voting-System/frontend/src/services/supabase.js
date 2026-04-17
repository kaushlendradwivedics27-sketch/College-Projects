// Supabase Client Configuration — IILM VotingSystem
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// IILM VotingSystem — Supabase Project Credentials
const SUPABASE_URL = 'https://ocwdbuksaozcqgkchfyi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9cvbazDUvB9ix-iSizYedQ_WNgKICKS';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Send OTP to student's IILM Gmail
 * Uses Supabase Auth's built-in OTP/Magic Link feature
 * @param {string} email - e.g. student.name@iilm.edu or student@iilmmail.edu
 * @returns {{ success: boolean, error?: string }}
 */
export const sendOtpToEmail = async (email) => {
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true, // Auto-create user if not exists
      },
    });

    if (error) {
      console.error('Supabase OTP Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Send OTP Error:', err);
    return { success: false, error: 'Failed to send OTP. Please try again.' };
  }
};

/**
 * Verify the OTP entered by the student
 * @param {string} email - The email the OTP was sent to
 * @param {string} otp - The 6-digit OTP code
 * @returns {{ success: boolean, session?: object, user?: object, error?: string }}
 */
export const verifyOtpCode = async (email, otp) => {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email: email,
      token: otp,
      type: 'email',
    });

    if (error) {
      console.error('Supabase Verify Error:', error.message);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      session: data.session,
      user: data.user,
    };
  } catch (err) {
    console.error('Verify OTP Error:', err);
    return { success: false, error: 'Verification failed. Please try again.' };
  }
};

/**
 * Store/Update student profile in Supabase 'students' table
 * @param {object} studentData - { email, rollNo, section, year, ... }
 * @returns {{ success: boolean, error?: string }}
 */
export const upsertStudentProfile = async (studentData) => {
  try {
    const { data, error } = await supabase
      .from('students')
      .upsert(
        {
          email: studentData.email,
          roll_no: studentData.rollNo,
          section: studentData.section,
          year: studentData.year,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select();

    if (error) {
      console.error('Upsert Student Error:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Upsert Error:', err);
    return { success: false, error: 'Failed to save student data.' };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { success: !error, error: error?.message };
};

/**
 * Get current session
 */
export const getSession = async () => {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
};

export default supabase;
