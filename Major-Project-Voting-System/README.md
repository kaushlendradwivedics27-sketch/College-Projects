# IILM VotingSystem — Student Council Election App

A production-ready React Native mobile application built with **Expo** for IILM University's digital Student Council voting system.

## 🎨 Branding
- **Primary**: ![#8B0000](https://placehold.co/15x15/8B0000/8B0000.png) IILM Maroon `#8B0000`
- **Accent**: ![#C8973A](https://placehold.co/15x15/C8973A/C8973A.png) IILM Gold `#C8973A`
- **Background**: `#f9f4f4` warm off-white

## 📱 Screens (12)
1. **SplashScreen** — Animated IILM branding
2. **OnboardingScreen** — 3-slide carousel
3. **ElectionInfoScreen** — Hero gradient + stats grid + important dates
4. **LoginScreen** — Student ID + Enrollment + Campus
5. **OtpScreen** — 4-digit OTP verification
6. **StudentProfileScreen** — Student info with gradient hero
7. **DashboardScreen** — Search, alert banner, candidate cards
8. **CandidateDetailScreen** — 3-tab detail (Manifesto, Profile, Campaign)
9. **VerificationFlow** — 3-step: Identity → Selfie → Biometric confirm
10. **SuccessScreen** — Animated checkmark + vote receipt
11. **ResultScreen** — Live results with progress bars
12. **CandidateResultScreen** — Detailed candidate result comparison

## 🧩 Reusable Components
- `PrimaryButton` — 4 variants: primary, outline, ghost, gold
- `InputField` — Label, error, hint, icon
- `OTPInput` — 4-box auto-focus
- `RadioButton` — Animated selection
- `CandidateCard` — Horizontal (President) + Vertical (others)
- `StudentProfileCard` — Avatar + gradient header
- `ProgressBar` — 3-step stepper
- `Header` — Logo + back + right action

## 🏗️ Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── PrimaryButton.js
│   ├── InputField.js
│   ├── OTPInput.js
│   ├── RadioButton.js
│   ├── CandidateCard.js
│   ├── StudentProfileCard.js
│   ├── ProgressBar.js
│   └── Header.js
├── constants/           # App constants
│   ├── colors.js        # Color palette
│   └── iilm.js          # IILM-specific data
├── navigation/          # React Navigation setup
│   └── AppNavigator.js
├── screens/             # All 12 screens
│   ├── SplashScreen.js
│   ├── OnboardingScreen.js
│   ├── ElectionInfoScreen.js
│   ├── LoginScreen.js
│   ├── OtpScreen.js
│   ├── StudentProfileScreen.js
│   ├── DashboardScreen.js
│   ├── CandidatesScreen.js
│   ├── CandidateDetailScreen.js
│   ├── VerificationFlow.js
│   ├── SuccessScreen.js
│   ├── ResultScreen.js
│   ├── CandidateResultScreen.js
│   └── NewsScreen.js
└── services/            # API services
    └── api.js           # Mock API layer
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`) or use `npx expo`
- Expo Go app on your phone

### Installation
```bash
cd voting
npm install
```

### Running
```bash
npx expo start
```
Scan the QR code with Expo Go to launch on your device.

## 🎯 Demo Credentials
| Field             | Value            |
|-------------------|------------------|
| Student ID        | `2022BBA001`     |
| Enrollment Number | `IILM2022BBA001` |
| Campus            | IILM Gurugram    |
| OTP               | `7412`           |

## 🎨 Customization

### Colors
Edit `src/constants/colors.js` to change the app theme.

### IILM Data
Edit `src/constants/iilm.js` to modify:
- Campus list
- Programme list
- Council posts
- Election year
- Important dates

### Mock Data
Edit `src/services/api.js` to modify:
- Student records
- Candidate profiles
- News items

## 📦 Tech Stack
- **React Native + Expo ~50.0.0** (JS only)
- **React Navigation** (Stack + Bottom Tabs)
- **react-native-reanimated** for animations
- **expo-linear-gradient** for gradient heroes
- **@expo/vector-icons** (Ionicons)

## 📋 Navigation Flow
```
Splash → Onboarding → ElectionInfo → Login → OTP → StudentProfile → MainTabs
                                                                        ├── Home (Dashboard)
                                                                        ├── Candidates
                                                                        ├── News
                                                                        └── Results
Modals: VerificationFlow, SuccessScreen
```
