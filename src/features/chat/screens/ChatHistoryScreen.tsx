import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatHistory'>;

type Session = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
};

const INITIAL: Session[] = [
  {
    id: 's1',
    title: '睡眠焦虑',
    preview: '晚上脑子停不下来…',
    updatedAt: '今天',
  },
  {
    id: 's2',
    title: '学习压力',
    preview: '担心赶不上进度…',
    updatedAt: '昨天',
  },
  {
    id: 's3',
    title: '人际关系',
    preview: '不知道怎么表达边界…',
    updatedAt: '3 天前',
  },
];

export function ChatHistoryScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<Session[]>(INITIAL);
  const [selectedId, setSelectedId] = useState<string>(INITIAL[0].id);

  const selected = useMemo(
    () => sessions.find((s) => s.id === selectedId) ?? sessions[0],
    [sessions, selectedId],
  );

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>历史对话</Text>
        <Text style={styles.subtitle}>用于展示列表结构与详情联动（本地模拟）。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>会话列表</Text>
        <View style={styles.stack}>
          {sessions.map((s) => (
            <PrimaryButton
              key={s.id}
              title={`${s.title} · ${s.updatedAt}`}
              variant={s.id === selectedId ? 'primary' : 'ghost'}
              onPress={() => setSelectedId(s.id)}
            />
          ))}
        </View>
        <View style={styles.row}>
          <PrimaryButton
            title="清空列表"
            variant="ghost"
            onPress={() => {
              setSessions([]);
            }}
            style={styles.flex}
          />
          <PrimaryButton
            title="恢复示例"
            variant="ghost"
            onPress={() => {
              setSessions(INITIAL);
              setSelectedId(INITIAL[0].id);
            }}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>会话详情</Text>
        {selected ? (
          <>
            <Text style={styles.detailTitle}>{selected.title}</Text>
            <Text style={styles.detailText}>{selected.preview}</Text>
            <View style={styles.row}>
              <PrimaryButton
                title="继续聊"
                onPress={() => navigation.navigate('ChatHome')}
                style={styles.flex}
              />
              <PrimaryButton
                title="语音沟通"
                variant="ghost"
                onPress={() => navigation.navigate('VoiceChat')}
                style={styles.flex}
              />
            </View>
          </>
        ) : (
          <Text style={styles.muted}>当前暂无会话。</Text>
        )}
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
  stack: {
    gap: 10,
  },
  row: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
  },
});
