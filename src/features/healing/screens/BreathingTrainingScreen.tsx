import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'BreathingTraining'>;

type Step = {
  label: string;
  seconds: number;
};

const STEPS: Step[] = [
  { label: '吸气', seconds: 4 },
  { label: '停留', seconds: 4 },
  { label: '呼气', seconds: 6 },
];

type Phase = {
  stepIndex: number;
  remaining: number;
};

function initialPhase(): Phase {
  return { stepIndex: 0, remaining: STEPS[0].seconds };
}

export function BreathingTrainingScreen({}: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>(() => initialPhase());

  const step = STEPS[phase.stepIndex] ?? STEPS[0];

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setPhase((prev) => {
        if (prev.remaining > 1) {
          return { ...prev, remaining: prev.remaining - 1 };
        }
        const nextIndex = (prev.stepIndex + 1) % STEPS.length;
        return { stepIndex: nextIndex, remaining: STEPS[nextIndex].seconds };
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning]);

  const statusText = useMemo(() => {
    if (!isRunning) return '准备开始';
    return `${step.label} · ${phase.remaining}s`;
  }, [isRunning, step.label, phase.remaining]);

  const start = () => {
    setPhase(initialPhase());
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setPhase(initialPhase());
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>呼吸训练</Text>
        <Text style={styles.subtitle}>一个简单的 4-4-6 节奏，帮助你稳定当下。</Text>
      </Card>

      <Card>
        <Text style={styles.status}>{statusText}</Text>
        <View style={styles.row}>
          {!isRunning ? (
            <PrimaryButton title="开始" onPress={start} style={styles.flex} />
          ) : (
            <PrimaryButton title="暂停" variant="ghost" onPress={stop} style={styles.flex} />
          )}
          <PrimaryButton title="重置" variant="ghost" onPress={reset} style={styles.flex} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>提示</Text>
        <Text style={styles.muted}>如果觉得憋气不舒服，把“停留”缩短或直接跳过即可。</Text>
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
  status: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 12,
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
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
});
