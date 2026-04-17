import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated, Easing } from 'react-native';
import colors from '../constants/colors';

export default function SplashScreen({ navigation }) {
  const fadeIn = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    // Single, clean entrance
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentY, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Subtle ambient glow */}
      <View style={styles.ambientGlow} />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeIn, transform: [{ translateY: contentY }] },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoOuter}>
          <View style={styles.logoInner}>
            <Text style={styles.logoText}>IILM</Text>
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>
          VOTING<Text style={styles.appNameAccent}>SYSTEM</Text>
        </Text>

        {/* Tagline */}
        <View style={styles.taglineRow}>
          <View style={styles.taglineLine} />
          <Text style={styles.taglineText}>YOUR VOICE · YOUR CAMPUS</Text>
          <View style={styles.taglineLine} />
        </View>
      </Animated.View>

      {/* Footer */}
      <Animated.Text style={[styles.footer, { opacity: fadeIn }]}>
        EST. 1993
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2C0A10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ambientGlow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(184, 134, 11, 0.06)',
  },
  content: {
    alignItems: 'center',
  },
  logoOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: 'rgba(184, 134, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  logoInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: 'rgba(184, 134, 11, 0.5)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#B8860B',
    letterSpacing: 3,
  },
  appName: {
    fontSize: 26,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 8,
    fontWeight: '200',
    textAlign: 'center',
    marginBottom: 20,
  },
  appNameAccent: {
    fontWeight: '800',
    color: '#B8860B',
  },
  taglineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  taglineLine: {
    width: 28,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  taglineText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
    letterSpacing: 3,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    color: 'rgba(184, 134, 11, 0.3)',
    fontSize: 10,
    letterSpacing: 5,
    fontWeight: '500',
  },
});