import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'SleepTheme'>;

type Habit = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

const INITIAL: Habit[] = [
  { id: 'h1', title: '睡前 30 分钟离开屏幕', detail: '让大脑有时间慢下来。', done: false },
  { id: 'h2', title: '固定起床时间', detail: '比固定入睡更容易坚持。', done: false },
  { id: 'h3', title: '一杯温水 + 拉伸', detail: '给身体一个“可以休息了”的信号。', done: false },
];

export function SleepThemeScreen({}: Props) {
  const [habits, setHabits] = useState<Habit[]>(INITIAL);

  const doneCount = useMemo(() => habits.filter((h) => h.done).length, [habits]);

  const toggle = (id: string) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, done: !h.done } : h)));
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>睡眠主题</Text>
        <Text style={styles.subtitle}>把睡眠拆成可执行的小动作，降低焦虑感。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>今日习惯</Text>
        <Text style={styles.muted}>{`完成 ${doneCount} / ${habits.length}`}</Text>
      </Card>

      {habits.map((h) => (
        <Card key={h.id}>
          <Text style={styles.itemTitle}>{h.title}</Text>
          <Text style={styles.itemDetail}>{h.detail}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={h.done ? '已完成' : '标记完成'}
              variant={h.done ? 'primary' : 'ghost'}
              onPress={() => toggle(h.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>小结</Text>
        <Text style={styles.muted}>睡眠并不是“必须马上睡着”，而是先把身体放回安全感里。</Text>
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
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  itemDetail: {
    marginTop: 6,
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
});
