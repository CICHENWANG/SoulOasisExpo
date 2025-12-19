import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'HealingHub'>;

type Mood = '平稳' | '疲惫' | '焦虑';

type PlanItem = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

export function HealingHubScreen({ navigation }: Props) {
  const [mood, setMood] = useState<Mood>('平稳');
  const [plan, setPlan] = useState<PlanItem[]>([
    { id: 'h1', title: '呼吸训练 1 轮', detail: '稳定身体信号', done: false },
    { id: 'h2', title: '冥想 3-5 分钟', detail: '放下反复思考', done: false },
    { id: 'h3', title: '选择一个主题', detail: '睡眠/学业/关系三选一', done: false },
  ]);

  const doneCount = useMemo(() => plan.filter((x) => x.done).length, [plan]);

  const suggestion = useMemo(() => {
    if (mood === '疲惫') return '优先睡眠主题：把目标缩小到“今晚更好入睡一点”。';
    if (mood === '焦虑') return '先做 2 分钟呼吸训练，再决定要不要进入主题。';
    return '从一个主题开始，坚持 7 天会更有感。';
  }, [mood]);

  const togglePlan = (id: string) => {
    setPlan((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>疗愈中心</Text>
        <Text style={styles.subtitle}>从主题计划到日常练习，帮助你把情绪照顾得更具体。</Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>今日状态</Text>
        <Text style={styles.muted}>{`当前：${mood}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="平稳"
            variant={mood === '平稳' ? 'primary' : 'ghost'}
            onPress={() => setMood('平稳')}
            style={styles.flex}
          />
          <PrimaryButton
            title="疲惫"
            variant={mood === '疲惫' ? 'primary' : 'ghost'}
            onPress={() => setMood('疲惫')}
            style={styles.flex}
          />
          <PrimaryButton
            title="焦虑"
            variant={mood === '焦虑' ? 'primary' : 'ghost'}
            onPress={() => setMood('焦虑')}
            style={styles.flex}
          />
        </View>
        <Text style={styles.muted}>{suggestion}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>主题入口</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="睡眠主题"
            onPress={() => navigation.navigate('SleepTheme')}
            style={styles.flex}
          />
          <PrimaryButton
            title="学业主题"
            variant="ghost"
            onPress={() => navigation.navigate('StudyTheme')}
            style={styles.flex}
          />
        </View>
        <PrimaryButton
          title="人际关系主题"
          variant="ghost"
          onPress={() => navigation.navigate('RelationshipTheme')}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>快速练习</Text>
        <Text style={styles.muted}>
          练习用于帮助你在 1-3 分钟内稳定状态，后续可扩展为音频/动画引导。
        </Text>
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

      <Card>
        <Text style={styles.sectionTitle}>今日计划</Text>
        <Text style={styles.muted}>{`完成 ${doneCount} / ${plan.length}`}</Text>
        <View style={styles.planList}>
          {plan.map((x) => (
            <View key={x.id} style={styles.planItem}>
              <View style={styles.planText}>
                <Text style={styles.planTitle}>{x.title}</Text>
                <Text style={styles.planDetail}>{x.detail}</Text>
              </View>
              <PrimaryButton
                title={x.done ? '已完成' : '完成'}
                variant={x.done ? 'primary' : 'ghost'}
                onPress={() => togglePlan(x.id)}
              />
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>建议</Text>
        <Text style={styles.muted}>
          先选一个你最在意的主题，坚持 7 天做小调整，比一次性改变所有更可持续。
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    paddingVertical: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
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
    marginBottom: 10,
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
  planList: {
    marginTop: 12,
    gap: 10,
  },
  planItem: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  planText: {
    flex: 1,
    gap: 4,
  },
  planTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  planDetail: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.muted,
  },
});
