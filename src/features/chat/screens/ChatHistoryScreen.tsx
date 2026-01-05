import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { TextField } from '../../../ui/components/TextField';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatHistory'>;

type Session = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
  pinned: boolean;
  tags: string[];
};

const INITIAL: Session[] = [
  {
    id: 's1',
    title: '睡眠焦虑',
    preview: '晚上脑子停不下来…',
    updatedAt: '今天',
    pinned: true,
    tags: ['睡眠', '焦虑'],
  },
  {
    id: 's2',
    title: '学习压力',
    preview: '担心赶不上进度…',
    updatedAt: '昨天',
    pinned: false,
    tags: ['学习', '压力'],
  },
  {
    id: 's3',
    title: '人际关系',
    preview: '不知道怎么表达边界…',
    updatedAt: '3 天前',
    pinned: false,
    tags: ['关系', '沟通'],
  },
  {
    id: 's4',
    title: '情绪低落',
    preview: '感觉提不起劲…',
    updatedAt: '上周',
    pinned: false,
    tags: ['情绪', '自我关怀'],
  },
];

function id(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ChatHistoryScreen({ navigation }: Props) {
  const [sessions, setSessions] = useState<Session[]>(INITIAL);
  const [selectedId, setSelectedId] = useState<string>(INITIAL[0].id);
  const [query, setQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newPreview, setNewPreview] = useState('');

  const selected = useMemo(
    () => sessions.find((s) => s.id === selectedId) ?? sessions[0],
    [sessions, selectedId],
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    const list = q
      ? sessions.filter((s) => {
          const hay = `${s.title} ${s.preview} ${s.tags.join(' ')}`;
          return hay.includes(q);
        })
      : sessions;
    const pinned = list.filter((s) => s.pinned);
    const rest = list.filter((s) => !s.pinned);
    return [...pinned, ...rest];
  }, [sessions, query]);

  const pinnedCount = useMemo(() => sessions.filter((s) => s.pinned).length, [sessions]);

  const togglePin = (idToToggle: string) => {
    setSessions((prev) => prev.map((s) => (s.id === idToToggle ? { ...s, pinned: !s.pinned } : s)));
  };

  const remove = (idToRemove: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== idToRemove));
    if (selectedId === idToRemove) {
      setSelectedId((prev) => {
        const next = sessions.find((s) => s.id !== idToRemove)?.id;
        return next ?? prev;
      });
    }
  };

  const add = () => {
    const title = newTitle.trim();
    if (!title) return;
    const preview = newPreview.trim() || '新会话';
    const next: Session = {
      id: id('s'),
      title,
      preview,
      updatedAt: '刚刚',
      pinned: false,
      tags: ['未分类'],
    };
    setSessions((prev) => [next, ...prev]);
    setSelectedId(next.id);
    setNewTitle('');
    setNewPreview('');
  };

  const backToChat = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('ChatHome');
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>历史对话</Text>
        <Text style={styles.subtitle}>用于展示列表结构与详情联动（本地模拟）。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>概览</Text>
        <Text style={styles.muted}>{`会话 ${sessions.length} 个 · 置顶 ${pinnedCount} 个`}</Text>
        <TextField
          label="搜索"
          value={query}
          onChangeText={setQuery}
          placeholder="输入关键词：睡眠 / 学习 / 情绪 / 关系…"
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>新建会话</Text>
        <TextField label="标题" value={newTitle} onChangeText={setNewTitle} placeholder="例如：这周睡眠很乱" />
        <View style={styles.spacer} />
        <TextField
          label="摘要"
          value={newPreview}
          onChangeText={setNewPreview}
          placeholder="用一句话描述要聊的内容（可选）"
        />
        <View style={styles.row}>
          <PrimaryButton title="创建" onPress={add} style={styles.flex} />
          <PrimaryButton title="继续聊" variant="ghost" onPress={backToChat} style={styles.flex} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>会话列表</Text>
        <View style={styles.stack}>
          {filtered.map((s) => (
            <View key={s.id} style={styles.sessionRow}>
              <PrimaryButton
                title={`${s.pinned ? '置顶 · ' : ''}${s.title} · ${s.updatedAt}`}
                variant={s.id === selectedId ? 'primary' : 'ghost'}
                onPress={() => setSelectedId(s.id)}
                style={styles.flex}
              />
              <PrimaryButton
                title={s.pinned ? '取消' : '置顶'}
                variant="ghost"
                onPress={() => togglePin(s.id)}
              />
            </View>
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
            <Text style={styles.detailMeta}>{`标签：${selected.tags.join(' / ')}${selected.pinned ? ' · 已置顶' : ''}`}</Text>
            <View style={styles.row}>
              <PrimaryButton
                title="继续聊"
                onPress={backToChat}
                style={styles.flex}
              />
              <PrimaryButton
                title="语音沟通"
                variant="ghost"
                onPress={() => navigation.navigate('VoiceChat')}
                style={styles.flex}
              />
            </View>
            <View style={styles.row}>
              <PrimaryButton
                title={selected.pinned ? '取消置顶' : '置顶会话'}
                variant="ghost"
                onPress={() => togglePin(selected.id)}
                style={styles.flex}
              />
              <PrimaryButton
                title="删除"
                variant="danger"
                onPress={() => remove(selected.id)}
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
  spacer: {
    height: 8,
  },
  stack: {
    gap: 10,
  },
  sessionRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
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
  detailMeta: {
    marginTop: 10,
    fontSize: 12,
    color: colors.muted,
  },
  muted: {
    fontSize: 13,
    color: colors.muted,
  },
});
