import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'Persona'>;

type Persona = {
  id: string;
  name: string;
  style: string;
  sample: string;
};

const PERSONAS: Persona[] = [
  {
    id: 'p1',
    name: 'Gentle companion',
    style: 'Focuses on emotional soothing and acceptance',
    sample: "I'm here with you. Take your time.",
  },
  {
    id: 'p2',
    name: 'Structured coach',
    style: 'Focuses on breaking down problems and actionable steps',
    sample: "Let's break this into three steps, then start with the smallest one.",
  },
  {
    id: 'p3',
    name: 'Short & direct',
    style: 'Focuses on fast conclusions and key points',
    sample: 'Got it. What you need most right now is: rest + a concrete plan.',
  },
];

export function PersonaScreen({ navigation }: Props) {
  const [selectedId, setSelectedId] = useState(PERSONAS[0].id);
  const [tone, setTone] = useState<'Gentle' | 'Rational' | 'Direct'>('Gentle');
  const [length, setLength] = useState<'Brief' | 'Balanced' | 'Detailed'>('Balanced');
  const [pace, setPace] = useState<'Slower' | 'Normal' | 'Faster'>('Normal');
  const [boundary, setBoundary] = useState<'Privacy-first' | 'More probing'>('Privacy-first');

  const selected = useMemo(
    () => PERSONAS.find((p) => p.id === selectedId) ?? PERSONAS[0],
    [selectedId],
  );

  const summary = useMemo(() => {
    return `Style: ${selected.name} · Tone: ${tone} · Detail: ${length} · Pace: ${pace} · Boundary: ${boundary}`;
  }, [selected.name, tone, length, pace, boundary]);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Customize AI persona</Text>
        <Text style={styles.subtitle}>A local mock to demonstrate a preferences screen.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Choose a style</Text>
        <View style={styles.stack}>
          {PERSONAS.map((p) => (
            <PrimaryButton
              key={p.id}
              title={`${p.name} · ${p.style}`}
              variant={p.id === selectedId ? 'primary' : 'ghost'}
              onPress={() => setSelectedId(p.id)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Text style={styles.subtitle}>A mock of configurable items. Later this can be saved to the backend.</Text>

        <Text style={styles.subLabel}>Tone</Text>
        <View style={styles.row}>
          {(['Gentle', 'Rational', 'Direct'] as const).map((t) => (
            <PrimaryButton
              key={t}
              title={t}
              variant={tone === t ? 'primary' : 'ghost'}
              onPress={() => setTone(t)}
              style={styles.flex}
            />
          ))}
        </View>

        <Text style={styles.subLabel}>Answer length</Text>
        <View style={styles.row}>
          {(['Brief', 'Balanced', 'Detailed'] as const).map((t) => (
            <PrimaryButton
              key={t}
              title={t}
              variant={length === t ? 'primary' : 'ghost'}
              onPress={() => setLength(t)}
              style={styles.flex}
            />
          ))}
        </View>

        <Text style={styles.subLabel}>Pace</Text>
        <View style={styles.row}>
          {(['Slower', 'Normal', 'Faster'] as const).map((t) => (
            <PrimaryButton
              key={t}
              title={t}
              variant={pace === t ? 'primary' : 'ghost'}
              onPress={() => setPace(t)}
              style={styles.flex}
            />
          ))}
        </View>

        <Text style={styles.subLabel}>Boundaries</Text>
        <View style={styles.row}>
          {(['Privacy-first', 'More probing'] as const).map((t) => (
            <PrimaryButton
              key={t}
              title={t}
              variant={boundary === t ? 'primary' : 'ghost'}
              onPress={() => setBoundary(t)}
              style={styles.flex}
            />
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Example</Text>
        <Text style={styles.sample}>{selected.sample}</Text>
        <Text style={styles.summary}>{summary}</Text>
        <View style={styles.row}>
          <PrimaryButton title="Back to chat" onPress={() => navigation.navigate('ChatHome')} />
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
  subLabel: {
    marginTop: 10,
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
  },
  stack: {
    gap: 10,
  },
  sample: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  summary: {
    marginTop: 10,
    fontSize: 12,
    lineHeight: 16,
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
