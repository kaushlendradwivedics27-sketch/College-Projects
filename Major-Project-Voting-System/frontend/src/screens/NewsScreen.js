import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import { getNews } from '../services/api';

const CATEGORY_COLORS = {
  Announcement: colors.primary,
  Update: '#2563eb',
  Event: colors.accent,
  Technology: '#7c3aed',
  Reminder: colors.danger,
};

export default function NewsScreen() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { setNews(await getNews()); } catch (e) {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <View style={s.loadWrap}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.heading}>📰 Election News</Text>
        {news.map((item) => (
          <View key={item.id} style={s.card}>
            <View style={[s.catBadge, { backgroundColor: (CATEGORY_COLORS[item.category] || colors.primary) + '14' }]}>
              <Text style={[s.catText, { color: CATEGORY_COLORS[item.category] || colors.primary }]}>{item.category}</Text>
            </View>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.summary}>{item.summary}</Text>
            <Text style={s.date}>{item.date}</Text>
          </View>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loadWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textMain, padding: 20, paddingBottom: 12 },
  card: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.divider,
  },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, marginBottom: 10 },
  catText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  title: { fontSize: 16, fontWeight: '700', color: colors.textMain, marginBottom: 8, lineHeight: 22 },
  summary: { fontSize: 14, color: colors.textSub, lineHeight: 20, marginBottom: 10 },
  date: { fontSize: 12, color: colors.textHint },
});
