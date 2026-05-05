# 🗳️ IILM VotingSystem

A secure, modern, and transparent campus voting application built for IILM University. This application leverages React Native for a beautiful cross-platform mobile experience, Supabase for secure OTP-based authentication, and a custom Python Blockchain to ensure the immutability and integrity of every cast vote.

---

## ✨ Key Features

- **🔒 Secure Authentication:** Students authenticate exclusively using their `@iilm.edu` email addresses via secure 6-digit One-Time Passwords (OTP).
- **⛓️ Blockchain Integrity:** Every vote is cryptographically hashed (SHA-256) and stored on a custom blockchain server. Once a vote is cast, it cannot be tampered with or altered.
- **📱 Premium Mobile Experience:** Built with React Native & Expo, featuring high-quality glassmorphic designs, micro-animations, and fluid staggered screen transitions.
- **📊 Live Election Results:** Real-time, beautifully animated bar charts and turnout gauges using the native React Native `Animated` API.
- **🎓 Student Profiles:** Centralized student data capturing Enrollment/Roll Numbers, Batches, and Voting Eligibility status.

---

## 🛠️ Technology Stack

### Frontend (Mobile App)
- **Framework:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 55)
- **Navigation:** React Navigation
- **Styling:** Custom CSS/StyleSheet with a dedicated IILM color palette (Maroon & Gold).
- **Animations:** React Native Core `Animated` API (No heavy 3rd-party dependencies to ensure maximum stability).
- **Icons:** Ionicons

### Backend & Database
- **Database & Auth:** [Supabase](https://supabase.com/) (PostgreSQL + Magic Link / OTP Email Auth).
- **Blockchain Server:** Python 3 + Flask API for maintaining the immutable ledger.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Python 3.8+](https://www.python.org/)
- [Expo Go](https://expo.dev/client) app installed on your iOS/Android device.

### 1. Running the Blockchain Server
Before starting the mobile app, you need to spin up the blockchain ledger to record votes.

```bash
# Navigate to the blockchain directory
cd blockchain_server

# Install the required Python dependencies
pip install -r requirements.txt

# Start the Flask API server
python app.py
```
*The server will start at `http://localhost:5000`.*

### 2. Running the Mobile Application
Open a **new terminal window** in the root directory of the project.

```bash
# Install NPM dependencies
npm install

# Start the Expo development server
npx expo start --clear
```

- **Testing on your phone:** Scan the QR code provided in the terminal using your phone's camera (iOS) or the Expo Go app (Android).
- **Testing on an emulator:** Press `a` in the terminal to open the Android emulator, or `i` for the iOS simulator.

---

## 📦 Building the APK (Android)

To generate a standalone `.apk` file that you can share and install on Android devices without Expo Go:

1. Install the Expo Application Services (EAS) CLI globally:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Trigger the cloud build using the predefined `preview` profile:
   ```bash
   eas build -p android --profile preview
   ```
4. Wait for the build to finish on Expo's servers (usually 5-10 minutes). Once complete, you will be provided with a direct download link for your `VotingSystem.apk` file.

---

## 🔗 Blockchain API Reference

The Python server provides the following endpoints for transparency and auditing:

- `GET /api/chain` - View the entire live blockchain ledger.
- `GET /api/verify` - Run a cryptographic audit to ensure no blocks have been tampered with.
- `GET /api/latest` - Fetch the most recently added vote block.
- `POST /api/vote` - Record a new hashed vote (Called automatically by the mobile app).

---

## 👥 Authors
Designed and Developed for the Major Project.
