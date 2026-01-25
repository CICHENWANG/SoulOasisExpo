import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { TextField } from '../../../ui/components/TextField';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'MeditationGuide'>;

const DURATIONS = [3, 5, 10] as const;

type Duration = (typeof DURATIONS)[number];

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

type Script = {
  id: 'breath' | 'body' | 'sleep';
  name: string;
  outline: string[];
};

const SCRIPTS: Script[] = [
  {
    id: 'breath',
    name: 'Breath to the present',
    outline: [
      'Find a comfortable seated posture',
      'Bring attention to the tip of your nose',
      'Gently return when your mind wanders',
      'Do a short stretch before finishing',
    ],
  },
  {
    id: 'body',
    name: 'Body scan',
    outline: ['From head to toes', 'Notice areas of tension', 'Soften on the exhale', 'Allow everything to be here'],
  },
  {
    id: 'sleep',
    name: 'Pre-sleep relaxation',
    outline: ['Slow down your breathing', 'Imagine warm light', 'Set worries outside the mind', 'Let your only task be rest'],
  },
];

type Log = {
  id: string;
  scriptName: string;
  duration: number;
  rating: 1 | 2 | 3 | 4 | 5;
  note: string;
};

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function MeditationGuideScreen({}: Props) {
  const [duration, setDuration] = useState<Duration>(5);
  const [scriptId, setScriptId] = useState<Script['id']>('breath');
  const [state, setState] = useState<'idle' | 'started' | 'done'>('idle');
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<Log[]>([
    { id: id('m'), scriptName: 'Breath to the present', duration: 5, rating: 4, note: 'Quick midday reset' },
  ]);

  const script = useMemo(() => SCRIPTS.find((s) => s.id === scriptId) ?? SCRIPTS[0], [scriptId]);

  const stateText = useMemo(() => {
    if (state === 'idle') return 'Ready';
    if (state === 'started') return 'In progress...';
    return 'Completed';
  }, [state]);

  const save = () => {
    setHistory((prev) =>
      [
        {
          id: id('m'),
          scriptName: script.name,
          duration,
          rating,
          note: stripCjk(note).trim() || 'Completed a practice',
        },
        ...prev,
      ].slice(0, 5),
    );
    setNote('');
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Meditation guide</Text>
        <Text style={styles.subtitle}>Bring your attention back to your body and breath in a short session.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Choose a script</Text>
        <View style={styles.stack}>
          {SCRIPTS.map((s) => (
            <PrimaryButton
              key={s.id}
              title={s.name}
              variant={s.id === scriptId ? 'primary' : 'ghost'}
              onPress={() => {
                setScriptId(s.id);
                setState('idle');
              }}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Choose duration</Text>
        <View style={styles.row}>
          {DURATIONS.map((m) => (
            <PrimaryButton
              key={m}
              title={`${m} min`}
              variant={m === duration ? 'primary' : 'ghost'}
              onPress={() => setDuration(m)}
              style={styles.flex}
            />
          ))}
        </View>

        <View style={styles.block}>
          <Text style={styles.status}>{stateText}</Text>
          {state !== 'started' ? (
            <PrimaryButton title="Start" onPress={() => setState('started')} />
          ) : (
            <PrimaryButton title="Finish" onPress={() => setState('done')} />
          )}
          <PrimaryButton title="Reset" variant="ghost" onPress={() => setState('idle')} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Outline</Text>
        {script.outline.map((line, idx) => (
          <Text key={line} style={styles.muted}>{`${idx + 1}) ${line}`}</Text>
        ))}
        <Text style={[styles.muted, { marginTop: 8 }]}>{`Recommended duration: ${duration} min`}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Session log</Text>
        <Text style={styles.muted}>Rate this session and write a short note (local mock).</Text>
        <View style={styles.row}>
          {[1, 2, 3, 4, 5].map((r) => (
            <PrimaryButton
              key={r}
              title={`${r}`}
              variant={rating === r ? 'primary' : 'ghost'}
              onPress={() => setRating(r as 1 | 2 | 3 | 4 | 5)}
              style={styles.flex}
            />
          ))}
        </View>
        <TextField
          label="Note"
          value={note}
          onChangeText={(t) => setNote(stripCjk(t))}
          placeholder="e.g., my heart rate slowed down"
        />
        <View style={styles.block}>
          <PrimaryButton title="Save to history" onPress={save} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Recent history</Text>
        <View style={styles.historyList}>
          {history.map((h) => (
            <View key={h.id} style={styles.historyItem}>
              <Text style={styles.historyTitle}>{h.scriptName}</Text>
              <Text style={styles.historyMeta}>{`${h.duration} min · Rating ${h.rating}/5`}</Text>
              <Text style={styles.historyNote}>{h.note}</Text>
            </View>
          ))}
        </View>
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
  stack: {
    gap: 10,
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
