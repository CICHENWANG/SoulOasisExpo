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
    name: 'Steady 4-4-6',
    steps: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 6 },
    ],
    hint: 'For daily regulation. A longer exhale often feels more relaxing.',
  },
  {
    id: '478',
    name: 'Sleep 4-7-8',
    steps: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 7 },
      { label: 'Exhale', seconds: 8 },
    ],
    hint: 'Good before bed. Shorten the hold if it feels uncomfortable.',
  },
  {
    id: 'box',
    name: 'Box 4-4-4-4',
    steps: [
      { label: 'Inhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
      { label: 'Exhale', seconds: 4 },
      { label: 'Hold', seconds: 4 },
    ],
    hint: 'Good before focused work. Even rhythm and easy to follow.',
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
      modeName: 'Steady 4-4-6',
      rounds: 3,
      durationSec: 120,
      note: 'Quick midday practice',
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
    if (!isRunning) return 'Ready';
    return `${step.label} · ${phase.remaining}s`;
  }, [isRunning, step.label, phase.remaining]);

  const progressText = useMemo(() => {
    if (!isRunning) return `Target: ${targetRounds} round${targetRounds === 1 ? '' : 's'}`;
    const current = Math.min(phase.round, targetRounds);
    return `Round ${current} / ${targetRounds} · Elapsed ${elapsedSec}s`;
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
          note: 'Completed automatically',
        },
        ...prev,
      ].slice(0, 5));
    }
  }, [isRunning, phase.round, targetRounds, elapsedSec, mode.name]);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Breathing training</Text>
        <Text style={styles.subtitle}>{mode.hint}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Mode</Text>
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
        <Text style={styles.muted}>Target rounds</Text>
        <View style={styles.row}>
          {[1, 2, 3, 5].map((n) => (
            <PrimaryButton
              key={n}
              title={`${n} round${n === 1 ? '' : 's'}`}
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
            <PrimaryButton title="Start" onPress={start} style={styles.flex} />
          ) : (
            <PrimaryButton title="Pause" variant="ghost" onPress={stop} style={styles.flex} />
          )}
          <PrimaryButton title="Reset" variant="ghost" onPress={reset} style={styles.flex} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent sessions</Text>
        <View style={styles.historyList}>
          {history.map((s) => (
            <View key={s.id} style={styles.historyItem}>
              <Text style={styles.historyTitle}>{s.modeName}</Text>
              <Text style={styles.historyMeta}>{`${s.rounds} round${s.rounds === 1 ? '' : 's'} · ${s.durationSec}s`}</Text>
              <Text style={styles.historyNote}>{s.note}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Tip</Text>
        <Text style={styles.muted}>If holding your breath feels uncomfortable, shorten the hold or skip it.</Text>
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
