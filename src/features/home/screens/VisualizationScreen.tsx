import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { TextField } from '../../../ui/components/TextField';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Visualization'>;

type Metrics = {
  mood: number;
  stress: number;
  sleepHours: number;
};

type DailyRecord = Metrics & {
  id: string;
  dateLabel: string;
  note: string;
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

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function makeRecord(dateLabel: string, note: string): DailyRecord {
  const m = randomMetrics();
  return { id: id('rec'), dateLabel, note, ...m };
}

function getWeekSeed(): DailyRecord[] {
  const labels = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const notes = ['睡得还行', '有点分心', '状态不错', '压力偏高', '需要休息', '和朋友聊了聊', '慢慢来'];
  return labels.map((l, i) => makeRecord(l, notes[i] ?? '记录一下')).slice(-7);
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
  const [records, setRecords] = useState<DailyRecord[]>(() => getWeekSeed());
  const latest = records[records.length - 1] ?? makeRecord('今天', '');
  const [note, setNote] = useState('');
  const [quickMood, setQuickMood] = useState<'不错' | '一般' | '低落'>('一般');

  const metrics = useMemo<Metrics>(
    () => ({ mood: latest.mood, stress: latest.stress, sleepHours: latest.sleepHours }),
    [latest.mood, latest.stress, latest.sleepHours],
  );

  const moodRatio = useMemo(() => metrics.mood / 100, [metrics.mood]);
  const sleepRatio = useMemo(() => metrics.sleepHours / 10, [metrics.sleepHours]);
  const stressRatio = useMemo(() => metrics.stress / 100, [metrics.stress]);

  const avgMood = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((acc, r) => acc + r.mood, 0) / records.length);
  }, [records]);

  const avgStress = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.round(records.reduce((acc, r) => acc + r.stress, 0) / records.length);
  }, [records]);

  const avgSleep = useMemo(() => {
    if (records.length === 0) return 0;
    return Math.round((records.reduce((acc, r) => acc + r.sleepHours, 0) / records.length) * 10) / 10;
  }, [records]);

  const addRecord = () => {
    const label = `第 ${records.length + 1} 次`;
    const next = makeRecord(label, note.trim() || `当下感觉：${quickMood}`);
    setRecords((prev) => [...prev.slice(-6), next]);
    setNote('');
  };

  const refreshLatest = () => {
    setRecords((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (!last) return [makeRecord('今天', '记录一下')];
      next[next.length - 1] = { ...last, ...randomMetrics() };
      return next;
    });
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>数据可视化</Text>
        <Text style={styles.subtitle}>用于展示“记录-统计-反馈”的链路（本地模拟）。</Text>
      </Card>

      <Card>
        <Meter label="心情" valueText={`${metrics.mood}/100`} ratio={moodRatio} />
        <Meter label="压力" valueText={`${metrics.stress}/100`} ratio={stressRatio} />
        <Meter label="睡眠" valueText={`${metrics.sleepHours}h`} ratio={sleepRatio} />
        <View style={styles.row}>
          <PrimaryButton title="刷新今日" variant="ghost" onPress={refreshLatest} style={styles.flex} />
          <PrimaryButton title="新增一条记录" onPress={addRecord} style={styles.flex} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>快速记录</Text>
        <Text style={styles.muted}>用一个小动作把状态留下来，后续可对接后端存储。</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="不错"
            variant={quickMood === '不错' ? 'primary' : 'ghost'}
            onPress={() => setQuickMood('不错')}
            style={styles.flex}
          />
          <PrimaryButton
            title="一般"
            variant={quickMood === '一般' ? 'primary' : 'ghost'}
            onPress={() => setQuickMood('一般')}
            style={styles.flex}
          />
          <PrimaryButton
            title="低落"
            variant={quickMood === '低落' ? 'primary' : 'ghost'}
            onPress={() => setQuickMood('低落')}
            style={styles.flex}
          />
        </View>
        <TextField
          label="备注"
          value={note}
          onChangeText={setNote}
          placeholder="写一句话：发生了什么/我需要什么（可选）"
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>本周趋势</Text>
        <Text style={styles.muted}>{`平均心情 ${avgMood} / 100 · 平均压力 ${avgStress} / 100 · 平均睡眠 ${avgSleep}h`}</Text>
        <View style={styles.trendList}>
          {records.map((r) => (
            <View key={r.id} style={styles.trendItem}>
              <Text style={styles.trendLabel}>{r.dateLabel}</Text>
              <View style={styles.trendBars}>
                <View style={styles.trendBarBlock}>
                  <Text style={styles.trendMeta}>心情</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${Math.round(clamp01(r.mood / 100) * 100)}%` }]} />
                  </View>
                </View>
                <View style={styles.trendBarBlock}>
                  <Text style={styles.trendMeta}>压力</Text>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${Math.round(clamp01(r.stress / 100) * 100)}%` }]} />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>解读</Text>
        <Text style={styles.muted}>
          目前为前端模拟：记录会生成一份本地数据结构，后续可替换为后端 API 与数据库。
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
  row: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
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
  trendList: {
    marginTop: 12,
    gap: 12,
  },
  trendItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  trendLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  trendBars: {
    gap: 10,
  },
  trendBarBlock: {
    gap: 8,
  },
  trendMeta: {
    fontSize: 12,
    color: colors.muted,
  },
});
