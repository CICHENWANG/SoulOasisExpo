import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'VoiceChat'>;

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

export function VoiceChatScreen({ navigation }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [lastResult, setLastResult] = useState('');

  const status = useMemo(() => {
    if (isRecording) return 'Recording...';
    return 'Idle';
  }, [isRecording]);

  const toggle = () => {
    setIsRecording((prev) => {
      const next = !prev;
      if (!prev && next) {
        setLastResult('');
      }
      if (prev && !next) {
        setLastResult(stripCjk("Transcript: I want to relax, but I'm not sure how to start."));
      }
      return next;
    });
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>Voice chat</Text>
        <Text style={styles.subtitle}>A UI-only mock. No real recording capability is integrated.</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Status</Text>
        <Text style={styles.status}>{status}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title={isRecording ? 'Stop' : 'Start'}
            onPress={toggle}
            style={styles.flex}
          />
          <PrimaryButton
            title="Back to chat"
            variant="ghost"
            onPress={() => navigation.navigate('ChatHome')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Transcript</Text>
        <Text style={styles.muted}>{stripCjk(lastResult) || 'A sample transcript will appear after you stop.'}</Text>
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
  status: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  muted: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  flex: {
    flex: 1,
  },
});
