import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'ActiveCare'>;

type Task = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

const INITIAL: Task[] = [
  { id: 't1', title: '喝一杯温水', detail: '给身体一点补给。', done: false },
  { id: 't2', title: '站起来走 2 分钟', detail: '让注意力回到身体。', done: false },
  { id: 't3', title: '发一条关心给自己', detail: '例如：我已经很努力了。', done: false },
];

export function ActiveCareScreen({}: Props) {
  const [tasks, setTasks] = useState<Task[]>(INITIAL);

  const doneCount = useMemo(() => tasks.filter((t) => t.done).length, [tasks]);

  const toggleDone = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>主动关怀</Text>
        <Text style={styles.subtitle}>用很小的行动，把自己照顾回来。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>今日清单</Text>
        <Text style={styles.muted}>{`完成 ${doneCount} / ${tasks.length}`}</Text>
      </Card>

      {tasks.map((t) => (
        <Card key={t.id}>
          <Text style={styles.taskTitle}>{t.title}</Text>
          <Text style={styles.taskDetail}>{t.detail}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={t.done ? '已完成' : '标记完成'}
              variant={t.done ? 'primary' : 'ghost'}
              onPress={() => toggleDone(t.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}
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
    color: colors.muted,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  taskDetail: {
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
