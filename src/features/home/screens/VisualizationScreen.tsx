import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Visualization'>;

type Metrics = {
  mood: number;
  stress: number;
  sleepHours: number;
};

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function randomMetrics(): Metrics {
  const mood = Math.floor(60 + Math.random() * 35);
  const stress = Math.floor(20 + Math.random() * 60);
  const sleepHours = Math.round((5 + Math.random() * 4) * 10) / 10;
  return { mood, stress, sleepHours };
}

function Meter({ label, valueText, ratio }: { label: string; valueText: string; ratio: number }) {
  return (
    <View style={styles.meter}>
      <View style={styles.meterTop}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={styles.meterValue}>{valueText}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(clamp01(ratio) * 100)}%` }]} />
      </View>
    </View>
  );
}

export function VisualizationScreen({}: Props) {
  const [metrics, setMetrics] = useState<Metrics>(() => randomMetrics());

  const moodRatio = useMemo(() => metrics.mood / 100, [metrics.mood]);
  const sleepRatio = useMemo(() => metrics.sleepHours / 10, [metrics.sleepHours]);
  const stressRatio = useMemo(() => metrics.stress / 100, [metrics.stress]);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>数据可视化</Text>
        <Text style={styles.subtitle}>用于展示数据结构与页面组织（本地模拟）。</Text>
      </Card>

      <Card>
        <Meter label="心情" valueText={`${metrics.mood}/100`} ratio={moodRatio} />
        <Meter label="压力" valueText={`${metrics.stress}/100`} ratio={stressRatio} />
        <Meter label="睡眠" valueText={`${metrics.sleepHours}h`} ratio={sleepRatio} />
        <PrimaryButton title="刷新模拟数据" variant="ghost" onPress={() => setMetrics(randomMetrics())} />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>解读</Text>
        <Text style={styles.muted}>
          数据页面用于把“记录 - 统计 - 反馈”的链路串起来，后续可对接真实后端。
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  meter: {
    marginBottom: 12,
  },
  meterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  meterLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  meterValue: {
    fontSize: 13,
    color: colors.muted,
  },
  track: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: 10,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
});
