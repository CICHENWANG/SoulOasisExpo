import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'MeditationGuide'>;

const DURATIONS = [3, 5, 10] as const;

type Duration = (typeof DURATIONS)[number];

export function MeditationGuideScreen({}: Props) {
  const [duration, setDuration] = useState<Duration>(5);
  const [state, setState] = useState<'idle' | 'started' | 'done'>('idle');

  const stateText = useMemo(() => {
    if (state === 'idle') return '准备开始';
    if (state === 'started') return '进行中…';
    return '已完成';
  }, [state]);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>冥想引导</Text>
        <Text style={styles.subtitle}>用短时间把注意力带回身体与呼吸。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>选择时长</Text>
        <View style={styles.row}>
          {DURATIONS.map((m) => (
            <PrimaryButton
              key={m}
              title={`${m} 分钟`}
              variant={m === duration ? 'primary' : 'ghost'}
              onPress={() => setDuration(m)}
              style={styles.flex}
            />
          ))}
        </View>

        <View style={styles.block}>
          <Text style={styles.status}>{stateText}</Text>
          {state !== 'started' ? (
            <PrimaryButton title="开始" onPress={() => setState('started')} />
          ) : (
            <PrimaryButton title="完成" onPress={() => setState('done')} />
          )}
          <PrimaryButton title="重置" variant="ghost" onPress={() => setState('idle')} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>简短流程</Text>
        <Text style={styles.muted}>1) 找到舒适坐姿</Text>
        <Text style={styles.muted}>2) 注意力放到呼吸上</Text>
        <Text style={styles.muted}>3) 走神时轻轻带回来</Text>
        <Text style={[styles.muted, { marginTop: 8 }]}>{`建议时长：${duration} 分钟`}</Text>
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
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  block: {
    marginTop: 12,
    gap: 10,
  },
  status: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
