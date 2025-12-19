import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'VoiceChat'>;

export function VoiceChatScreen({ navigation }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [lastResult, setLastResult] = useState('');

  const status = useMemo(() => {
    if (isRecording) return '录音中…';
    return '未开始';
  }, [isRecording]);

  const toggle = () => {
    setIsRecording((prev) => {
      const next = !prev;
      if (!prev && next) {
        setLastResult('');
      }
      if (prev && !next) {
        setLastResult('识别结果：我想放松一下，但有点不知道怎么开始。');
      }
      return next;
    });
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>语音沟通</Text>
        <Text style={styles.subtitle}>不接入真实录音能力，保留页面与交互结构用于展示。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>状态</Text>
        <Text style={styles.status}>{status}</Text>
        <View style={styles.row}>
          <PrimaryButton
            title={isRecording ? '停止' : '开始'}
            onPress={toggle}
            style={styles.flex}
          />
          <PrimaryButton
            title="返回聊天"
            variant="ghost"
            onPress={() => navigation.navigate('ChatHome')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>识别结果</Text>
        <Text style={styles.muted}>{lastResult || '停止后会显示一条示例识别文本。'}</Text>
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
