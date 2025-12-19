import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'StudyTheme'>;

type FocusBlock = {
  id: string;
  title: string;
  minutes: number;
  done: boolean;
};

const INITIAL: FocusBlock[] = [
  { id: 'f1', title: '专注 25 分钟', minutes: 25, done: false },
  { id: 'f2', title: '休息 5 分钟', minutes: 5, done: false },
  { id: 'f3', title: '复盘 2 分钟', minutes: 2, done: false },
];

export function StudyThemeScreen({}: Props) {
  const [blocks, setBlocks] = useState<FocusBlock[]>(INITIAL);

  const doneCount = useMemo(() => blocks.filter((b) => b.done).length, [blocks]);

  const toggle = (id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, done: !b.done } : b)));
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>学业主题</Text>
        <Text style={styles.subtitle}>把学习压力拆成“可完成”的节奏，先做一点点就够。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>今日节奏</Text>
        <Text style={styles.muted}>{`完成 ${doneCount} / ${blocks.length}`}</Text>
      </Card>

      {blocks.map((b) => (
        <Card key={b.id}>
          <Text style={styles.itemTitle}>{b.title}</Text>
          <Text style={styles.itemDetail}>{`建议时长：${b.minutes} 分钟`}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={b.done ? '已完成' : '完成这一段'}
              variant={b.done ? 'primary' : 'ghost'}
              onPress={() => toggle(b.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>提示</Text>
        <Text style={styles.muted}>不是“我必须完美”，而是“我可以先开始”。</Text>
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
