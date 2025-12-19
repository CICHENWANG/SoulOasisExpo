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

type Mode = {
  id: '446' | '478' | 'box';
  name: string;
  steps: Step[];
  hint: string;
};

const MODES: Mode[] = [
  {
    id: '446',
    name: '稳态 4-4-6',
    steps: [
      { label: '吸气', seconds: 4 },
      { label: '停留', seconds: 4 },
      { label: '呼气', seconds: 6 },
    ],
    hint: '适合日常稳定情绪，呼气更长更放松。',
  },
  {
    id: '478',
    name: '入睡 4-7-8',
    steps: [
      { label: '吸气', seconds: 4 },
      { label: '停留', seconds: 7 },
      { label: '呼气', seconds: 8 },
    ],
    hint: '适合睡前，若觉得憋气不舒服可缩短停留。',
  },
  {
    id: 'box',
    name: '方形 4-4-4-4',
    steps: [
      { label: '吸气', seconds: 4 },
      { label: '停留', seconds: 4 },
      { label: '呼气', seconds: 4 },
      { label: '停留', seconds: 4 },
    ],
    hint: '适合专注前，节奏均匀，更好跟随。',
  },
];

type Phase = {
  stepIndex: number;
  remaining: number;
  round: number;
};

function initialPhase(steps: Step[]): Phase {
  return { stepIndex: 0, remaining: steps[0]?.seconds ?? 1, round: 1 };
}

type Session = {
  id: string;
  modeName: string;
  rounds: number;
  durationSec: number;
  note: string;
};

function sid(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function BreathingTrainingScreen({}: Props) {
  const [isRunning, setIsRunning] = useState(false);
  const [modeId, setModeId] = useState<Mode['id']>('446');
  const [targetRounds, setTargetRounds] = useState<1 | 2 | 3 | 5>(3);
  const mode = useMemo(() => MODES.find((m) => m.id === modeId) ?? MODES[0], [modeId]);
  const steps = mode.steps;

  const [phase, setPhase] = useState<Phase>(() => initialPhase(steps));
  const [elapsedSec, setElapsedSec] = useState(0);
  const [history, setHistory] = useState<Session[]>([
    {
      id: sid('s'),
      modeName: '稳态 4-4-6',
      rounds: 3,
      durationSec: 120,
      note: '中午短练一下',
    },
  ]);

  const step = steps[phase.stepIndex] ?? steps[0];

  useEffect(() => {
    if (!isRunning) return;

    const id = setInterval(() => {
      setElapsedSec((s) => s + 1);
      setPhase((prev) => {
        if (prev.remaining > 1) {
          return { ...prev, remaining: prev.remaining - 1 };
        }
        const nextIndex = (prev.stepIndex + 1) % steps.length;
        const nextRemaining = steps[nextIndex]?.seconds ?? 1;
        const isRoundComplete = nextIndex === 0;
        const nextRound = isRoundComplete ? prev.round + 1 : prev.round;
        return { stepIndex: nextIndex, remaining: nextRemaining, round: nextRound };
      });
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, steps]);

  const statusText = useMemo(() => {
    if (!isRunning) return '准备开始';
    return `${step.label} · ${phase.remaining}s`;
  }, [isRunning, step.label, phase.remaining]);

  const progressText = useMemo(() => {
    if (!isRunning) return `目标 ${targetRounds} 轮`; 
    const current = Math.min(phase.round, targetRounds);
    return `第 ${current} / ${targetRounds} 轮 · 已用时 ${elapsedSec}s`;
  }, [isRunning, targetRounds, phase.round, elapsedSec]);

  const start = () => {
    setElapsedSec(0);
    setPhase(initialPhase(steps));
    setIsRunning(true);
  };

  const stop = () => {
    setIsRunning(false);
  };

  const reset = () => {
    setIsRunning(false);
    setElapsedSec(0);
    setPhase(initialPhase(steps));
  };

  useEffect(() => {
    if (isRunning && phase.round > targetRounds) {
      setIsRunning(false);
      setHistory((prev) => [
        {
          id: sid('s'),
          modeName: mode.name,
          rounds: targetRounds,
          durationSec: elapsedSec,
          note: '自动完成',
        },
        ...prev,
      ].slice(0, 5));
    }
  }, [isRunning, phase.round, targetRounds, elapsedSec, mode.name]);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>呼吸训练</Text>
        <Text style={styles.subtitle}>{mode.hint}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>模式</Text>
        <View style={styles.row}>
          {MODES.map((m) => (
            <PrimaryButton
              key={m.id}
              title={m.name}
              variant={m.id === modeId ? 'primary' : 'ghost'}
              onPress={() => {
                setModeId(m.id);
                setElapsedSec(0);
                setIsRunning(false);
                setPhase(initialPhase(m.steps));
              }}
              style={styles.flex}
            />
          ))}
        </View>
        <Text style={styles.muted}>目标轮次</Text>
        <View style={styles.row}>
          {[1, 2, 3, 5].map((n) => (
            <PrimaryButton
              key={n}
              title={`${n} 轮`}
              variant={targetRounds === n ? 'primary' : 'ghost'}
              onPress={() => setTargetRounds(n as 1 | 2 | 3 | 5)}
              style={styles.flex}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.status}>{statusText}</Text>
        <Text style={styles.progress}>{progressText}</Text>
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
        <Text style={styles.sectionTitle}>最近记录</Text>
        <View style={styles.historyList}>
          {history.map((s) => (
            <View key={s.id} style={styles.historyItem}>
              <Text style={styles.historyTitle}>{s.modeName}</Text>
              <Text style={styles.historyMeta}>{`${s.rounds} 轮 · ${s.durationSec}s`}</Text>
              <Text style={styles.historyNote}>{s.note}</Text>
            </View>
          ))}
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
  progress: {
    fontSize: 13,
    color: colors.muted,
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
  historyList: {
    marginTop: 12,
    gap: 10,
  },
  historyItem: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  historyMeta: {
    fontSize: 12,
    color: colors.muted,
  },
  historyNote: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
});
