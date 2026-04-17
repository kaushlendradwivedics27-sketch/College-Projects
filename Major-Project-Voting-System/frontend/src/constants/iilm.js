// IILM University — SCSE Club Election Constants
// School of Computer Science & Engineering
// Date: 18-09-2025

export const CAMPUSES = [
  'IILM Greater Noida',
];

export const PROGRAMMES = [
  'B.Tech CSE',
];

// Sections for IILM students (CSE1 to CSE11 in every year)
export const SECTIONS = [
  'CSE1', 'CSE2', 'CSE3', 'CSE4', 'CSE5', 'CSE6',
  'CSE7', 'CSE8', 'CSE9', 'CSE10', 'CSE11',
];

// Academic years
export const YEARS = [
  '1st Year',
  '2nd Year',
  '3rd Year',
  '4th Year',
];

// Club positions (5 posts per club)
export const CLUB_POSITIONS = [
  'President',
  'Vice President',
  'Secretary',
  'Joint Secretary',
  'Treasurer',
];

// All 13 SCSE Clubs
export const CLUBS = [
  {
    id: 'acm',
    name: 'ACM Student Chapter',
    shortName: 'ACM',
    nominations: { President: 7, 'Vice President': 2, Secretary: 2, 'Joint Secretary': 1, Treasurer: 1 },
    totalNominations: 13,
    color: '#1565C0',
    icon: 'code-slash',
  },
  {
    id: 'aiml',
    name: 'AI and Machine Learning Club',
    shortName: 'AI/ML',
    nominations: { President: 16, 'Vice President': 19, Secretary: 14, 'Joint Secretary': 20, Treasurer: 3 },
    totalNominations: 72,
    color: '#6A1B9A',
    icon: 'hardware-chip',
  },
  {
    id: 'dsba',
    name: 'Data Science and Big Data Analytics Club',
    shortName: 'DS & BDA',
    nominations: { President: 4, 'Vice President': 9, Secretary: 8, 'Joint Secretary': 11, Treasurer: 5 },
    totalNominations: 37,
    color: '#00838F',
    icon: 'analytics',
  },
  {
    id: 'cloud',
    name: 'Cloud Computing Club',
    shortName: 'Cloud',
    nominations: { President: 7, 'Vice President': 5, Secretary: 1, 'Joint Secretary': 3, Treasurer: 0 },
    totalNominations: 16,
    color: '#EF6C00',
    icon: 'cloud',
  },
  {
    id: 'sports',
    name: 'Sports and Music Club',
    shortName: 'Sports & Music',
    nominations: { President: 15, 'Vice President': 25, Secretary: 22, 'Joint Secretary': 27, Treasurer: 6 },
    totalNominations: 95,
    color: '#2E7D32',
    icon: 'football',
  },
  {
    id: 'cyber',
    name: 'Cyber Security Club',
    shortName: 'Cyber Sec',
    nominations: { President: 6, 'Vice President': 10, Secretary: 7, 'Joint Secretary': 9, Treasurer: 3 },
    totalNominations: 35,
    color: '#C62828',
    icon: 'shield-half',
  },
  {
    id: 'core',
    name: 'Core Programming Club',
    shortName: 'Core Prog',
    nominations: { President: 3, 'Vice President': 10, Secretary: 2, 'Joint Secretary': 8, Treasurer: 0 },
    totalNominations: 23,
    color: '#283593',
    icon: 'terminal',
  },
  {
    id: 'iete',
    name: 'IETE Student Chapter',
    shortName: 'IETE',
    nominations: { President: 2, 'Vice President': 3, Secretary: 1, 'Joint Secretary': 0, Treasurer: 0 },
    totalNominations: 6,
    color: '#4527A0',
    icon: 'pulse',
  },
  {
    id: 'photo',
    name: 'Photography and Social Media Club',
    shortName: 'Photo & Media',
    nominations: { President: 5, 'Vice President': 13, Secretary: 5, 'Joint Secretary': 9, Treasurer: 1 },
    totalNominations: 33,
    color: '#AD1457',
    icon: 'camera',
  },
  {
    id: 'ecell',
    name: 'Entrepreneurship Cell',
    shortName: 'E-Cell',
    nominations: { President: 3, 'Vice President': 11, Secretary: 4, 'Joint Secretary': 8, Treasurer: 3 },
    totalNominations: 29,
    color: '#F57F17',
    icon: 'rocket',
  },
  {
    id: 'flc',
    name: 'Foreign Language Club',
    shortName: 'FLC',
    nominations: { President: 0, 'Vice President': 1, Secretary: 2, 'Joint Secretary': 1, Treasurer: 1 },
    totalNominations: 5,
    color: '#00695C',
    icon: 'language',
  },
  {
    id: 'literary',
    name: 'Literary Club',
    shortName: 'Literary',
    nominations: { President: 2, 'Vice President': 7, Secretary: 2, 'Joint Secretary': 6, Treasurer: 1 },
    totalNominations: 18,
    color: '#5D4037',
    icon: 'book',
  },
  {
    id: 'ios',
    name: 'IOS Club',
    shortName: 'iOS',
    nominations: { President: 1, 'Vice President': 11, Secretary: 1, 'Joint Secretary': 5, Treasurer: 1 },
    totalNominations: 19,
    color: '#37474F',
    icon: 'phone-portrait',
  },
];

export const ELECTION_YEAR = 2025;

export const APP_NAME = 'SCSE VotingSystem';

export const UNIVERSITY_NAME = 'IILM University';

export const DEPARTMENT_NAME = 'School of Computer Science & Engineering';

// Valid IILM email domain for validation
export const IILM_EMAIL_DOMAIN = '@iilm.edu';

export const TAGLINE = 'SCSE Club Elections 2025';

export const IMPORTANT_DATES = {
  nominationLastDate: 'September 18, 2025',
  votingDay: 'September 25, 2025',
  resultAnnouncement: 'September 26, 2025',
};

export const ELECTION_STATS = {
  totalNominations: 401,
  totalClubs: 13,
  positions: 5,
  votingDuration: '8:00 AM – 5:00 PM',
};
