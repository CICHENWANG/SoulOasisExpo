import React, { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HomeStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'MoodCalendar'>;

export function MoodCalendarScreen({ navigation }: Props) {
  const calendarGrid = useMemo(() => require('../../../../assets/date/Group 11.png'), []);
  const lineChart = useMemo(
    () =>
      require('../../../../assets/date/40601c46813b448cbd1508b1e2fb0e6fpreview.jpeg~tplv-a9rns2rl98-downsize_watermark_1_6_b 1.png'),
    [],
  );
  const bars = useMemo(
    () => require('../../../../assets/date/beff0542a3e4a975e6042f4920af1a07 1.png'),
    [],
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>{'‹'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>心情月历（数据分析）</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.monthRow}>
          <Pressable accessibilityRole="button" onPress={() => {}} hitSlop={10}>
            <Text style={styles.monthArrow}>{'‹'}</Text>
          </Pressable>
          <Text style={styles.month}>2025.10</Text>
          <Pressable accessibilityRole="button" onPress={() => {}} hitSlop={10}>
            <Text style={styles.monthArrow}>{'›'}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Image source={calendarGrid} style={styles.calendarImg} resizeMode="contain" />
        </View>

        <View style={styles.card}>
          <Image source={lineChart} style={styles.chartImg} resizeMode="contain" />
        </View>

        <View style={[styles.card, styles.lastCard]}>
          <Image source={bars} style={styles.chartImg} resizeMode="contain" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFF7EA',
    paddingHorizontal: 18,
  },
  scrollContent: {
    paddingBottom: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  backText: {
    fontSize: 34,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 4,
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  headerRight: {
    width: 44,
    height: 44,
  },
  monthRow: {
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FAD08A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 12,
  },
  month: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  monthArrow: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 14,
    marginBottom: 14,
  },
  lastCard: {
    marginBottom: 0,
  },
  calendarImg: {
    width: '100%',
    height: 260,
  },
  chartImg: {
    width: '100%',
    height: 180,
  },
});
