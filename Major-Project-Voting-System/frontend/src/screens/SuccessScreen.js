import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Share, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PrimaryButton from '../components/PrimaryButton';
import colors from '../constants/colors';

export default function SuccessScreen({ navigation, route }) {
  const { candidate, student, receiptNumber, timestamp } = route.params || {};
  const checkScale = useRef(new Animated.Value(0.5)).current;
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Quick, clean entrance — just the checkmark pop
    Animated.parallel([
      Animated.spring(checkScale, {
        toValue: 1,
        damping: 12,
        stiffness: 120,
        useNativeDriver: true,
      }),
      Animated.timing(checkOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.timing(contentOpacity, {
      toValue: 1,
      duration: 500,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Dec 1, 2024, 10:30 AM';

  const handleShare = async () => {
    try {
      await Share.share({ message: `I voted for ${candidate?.name} for ${candidate?.post} in IILM Student Council Election 2024! 🗳️` });
    } catch (e) {}
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={s.container}>
        <Animated.View style={[s.checkWrap, { transform: [{ scale: checkScale }], opacity: checkOpacity }]}>
          <View style={s.checkCircle}>
            <Ionicons name="checkmark" size={48} color={colors.white} />
          </View>
        </Animated.View>

        <Animated.View style={[s.content, { opacity: contentOpacity }]}>
          <Text style={s.title}>Vote Cast!</Text>
          <Text style={s.sub}>You've made your voice heard at IILM</Text>

          <View style={s.receipt}>
            <View style={s.rHeader}>
              <Ionicons name="receipt" size={18} color={colors.accent} />
              <Text style={s.rHeaderText}>Vote Receipt</Text>
            </View>
            {[
              ['Candidate', candidate?.name],
              ['Post', candidate?.post],
              ['Receipt #', receiptNumber],
              ['Timestamp', formattedTime],
              ['Campus', student?.campus],
            ].map(([l, v], i) => (
              <View key={i} style={s.rRow}>
                <Text style={s.rLabel}>{l}</Text>
                <Text style={s.rValue}>{v}</Text>
              </View>
            ))}
          </View>

          <PrimaryButton
            title="Download Receipt"
            onPress={() => {}}
            style={s.btn}
            icon={<Ionicons name="download" size={18} color={colors.white} />}
          />
          <PrimaryButton
            title="Share on WhatsApp"
            onPress={handleShare}
            variant="gold"
            style={s.btn}
            icon={<Ionicons name="logo-whatsapp" size={18} color={colors.white} />}
          />
          <PrimaryButton
            title="View Results"
            onPress={() => navigation.navigate('MainTabs', { screen: 'Results' })}
            variant="ghost"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  checkWrap: { marginBottom: 24 },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  content: { width: '100%', alignItems: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: colors.textMain, marginBottom: 8 },
  sub: { fontSize: 15, color: colors.textSub, textAlign: 'center', marginBottom: 28 },
  receipt: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  rHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  rHeaderText: { fontSize: 16, fontWeight: '700', color: colors.textMain },
  rRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  rLabel: { fontSize: 13, color: colors.textSub },
  rValue: { fontSize: 13, fontWeight: '600', color: colors.textMain },
  btn: { width: '100%', marginBottom: 10 },
});
