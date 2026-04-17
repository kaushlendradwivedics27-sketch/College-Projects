import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ElectionInfoScreen from '../screens/ElectionInfoScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import StudentProfileScreen from '../screens/StudentProfileScreen';
import DashboardScreen from '../screens/DashboardScreen';
import CandidatesScreen from '../screens/CandidatesScreen';
import NewsScreen from '../screens/NewsScreen';
import ResultScreen from '../screens/ResultScreen';
import CandidateDetailScreen from '../screens/CandidateDetailScreen';
import CandidateResultScreen from '../screens/CandidateResultScreen';
import VerificationFlow from '../screens/VerificationFlow';
import SuccessScreen from '../screens/SuccessScreen';
import VotingScreen from '../screens/VotingScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }) {
  const student = route.params?.student;
  const token = route.params?.token;

  return (
    <Tab.Navigator
      screenOptions={({ route: tabRoute }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textHint,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopWidth: 1,
          borderTopColor: colors.divider,
          elevation: 0,
          shadowOpacity: 0,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (tabRoute.name) {
            case 'Home': iconName = 'home'; break;
            case 'Candidates': iconName = 'people'; break;
            case 'News': iconName = 'newspaper'; break;
            case 'Results': iconName = 'stats-chart'; break;
            default: iconName = 'ellipse';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        initialParams={{ student, token }}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Candidates"
        component={CandidatesScreen}
        initialParams={{ student, token }}
      />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Results" component={ResultScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="ElectionInfo" component={ElectionInfoScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="OTP" component={OtpScreen} />
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen
          name="CandidateDetail"
          component={CandidateDetailScreen}
        />
        <Stack.Screen
          name="Voting"
          component={VotingScreen}
        />
        <Stack.Screen
          name="CandidateResult"
          component={CandidateResultScreen}
        />
        <Stack.Screen
          name="VerificationFlow"
          component={VerificationFlow}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
          options={{ presentation: 'modal', animation: 'fade' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
