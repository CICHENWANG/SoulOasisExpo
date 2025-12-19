import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'RelationshipTheme'>;

type ActionItem = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

const INITIAL: ActionItem[] = [
  {
    id: 'r1',
    title: '说清楚需求',
    detail: '用“我需要…”开头，避免指责式表达。',
    done: false,
  },
  {
    id: 'r2',
    title: '设定边界',
    detail: '边界不是拒绝，是对关系的保护。',
    done: false,
  },
  {
    id: 'r3',
    title: '给关系留空间',
    detail: '允许沉默，也允许慢慢靠近。',
    done: false,
  },
];

export function RelationshipThemeScreen({ navigation }: Props) {
  const [items, setItems] = useState<ActionItem[]>(INITIAL);

  const doneCount = useMemo(() => items.filter((x) => x.done).length, [items]);

  const toggle = (id: string) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>人际关系主题</Text>
        <Text style={styles.subtitle}>关系里也要把自己放在重要的位置。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>今日练习</Text>
        <Text style={styles.muted}>{`完成 ${doneCount} / ${items.length}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="呼吸训练"
            variant="ghost"
            onPress={() => navigation.navigate('BreathingTraining')}
            style={styles.flex}
          />
          <PrimaryButton
            title="冥想引导"
            variant="ghost"
            onPress={() => navigation.navigate('MeditationGuide')}
            style={styles.flex}
          />
        </View>
      </Card>

      {items.map((x) => (
        <Card key={x.id}>
          <Text style={styles.itemTitle}>{x.title}</Text>
          <Text style={styles.itemDetail}>{x.detail}</Text>
          <View style={styles.row}>
            <PrimaryButton
              title={x.done ? '已尝试' : '标记已尝试'}
              variant={x.done ? 'primary' : 'ghost'}
              onPress={() => toggle(x.id)}
              style={styles.flex}
            />
          </View>
        </Card>
      ))}

      <Card>
        <Text style={styles.sectionTitle}>一句话提醒</Text>
        <Text style={styles.muted}>好的关系，会让你更像自己，而不是更怕自己。</Text>
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
