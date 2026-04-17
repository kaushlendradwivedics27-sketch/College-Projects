import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../constants/colors';

/**
 * StudentProfileCard — Avatar circle with initials, maroon header
 */
export default function StudentProfileCard({ student }) {
  const initials = student.name
    ? student.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : '?';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.gradientStart, colors.gradientEnd]}
        style={styles.header}
      >
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{student.name}</Text>
        <Text style={styles.id}>{student.id}</Text>
        <Text style={styles.programme}>{student.programme}</Text>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  header: {
    padding: 28,
    alignItems: 'center',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.25)',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.white,
  },
  id: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  programme: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '600',
    marginTop: 4,
  },
});
