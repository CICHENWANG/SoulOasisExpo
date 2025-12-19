import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

type CheckInTag = '睡眠' | '学习' | '情绪' | '关系';

type PlanItem = {
  id: string;
  title: string;
  detail: string;
  done: boolean;
};

export function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  const [focus, setFocus] = useState<CheckInTag>('情绪');
  const [moodLevel, setMoodLevel] = useState<'轻松' | '一般' | '紧张'>('一般');
  const [plan, setPlan] = useState<PlanItem[]>([
    { id: 'p1', title: '喝水/吃点东西', detail: '先照顾身体，再处理情绪。', done: false },
    { id: 'p2', title: '2 分钟呼吸', detail: '把注意力带回身体。', done: false },
    { id: 'p3', title: '写一句自我肯定', detail: '例如：我已经很努力了。', done: false },
  ]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 11) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  }, []);

  const doneCount = useMemo(() => plan.filter((x) => x.done).length, [plan]);

  const togglePlan = (id: string) => {
    setPlan((prev) => prev.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>首页</Text>
        <Text style={styles.subtitle}>
          {user ? `${greeting}，${user.displayName}` : greeting}
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>今日状态</Text>
        <Text style={styles.body}>{`关注主题：${focus} · 当前感受：${moodLevel}`}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="睡眠"
            variant={focus === '睡眠' ? 'primary' : 'ghost'}
            onPress={() => setFocus('睡眠')}
            style={styles.flex}
          />
          <PrimaryButton
            title="学习"
            variant={focus === '学习' ? 'primary' : 'ghost'}
            onPress={() => setFocus('学习')}
            style={styles.flex}
          />
          <PrimaryButton
            title="情绪"
            variant={focus === '情绪' ? 'primary' : 'ghost'}
            onPress={() => setFocus('情绪')}
            style={styles.flex}
          />
          <PrimaryButton
            title="关系"
            variant={focus === '关系' ? 'primary' : 'ghost'}
            onPress={() => setFocus('关系')}
            style={styles.flex}
          />
        </View>
        <View style={styles.row}>
          <PrimaryButton
            title="轻松"
            variant={moodLevel === '轻松' ? 'primary' : 'ghost'}
            onPress={() => setMoodLevel('轻松')}
            style={styles.flex}
          />
          <PrimaryButton
            title="一般"
            variant={moodLevel === '一般' ? 'primary' : 'ghost'}
            onPress={() => setMoodLevel('一般')}
            style={styles.flex}
          />
          <PrimaryButton
            title="紧张"
            variant={moodLevel === '紧张' ? 'primary' : 'ghost'}
            onPress={() => setMoodLevel('紧张')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>快速入口</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="治愈语录"
            onPress={() => navigation.navigate('Quotes')}
            style={styles.flex}
          />
          <PrimaryButton
            title="主动关怀"
            variant="ghost"
            onPress={() => navigation.navigate('ActiveCare')}
            style={styles.flex}
          />
        </View>
        <PrimaryButton
          title="数据可视化"
          variant="ghost"
          onPress={() => navigation.navigate('Visualization')}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>今日计划</Text>
        <Text style={styles.body}>{`完成 ${doneCount} / ${plan.length}`}</Text>
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

      <PrimaryButton title="退出登录" variant="danger" onPress={() => void signOut()} />
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
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
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
