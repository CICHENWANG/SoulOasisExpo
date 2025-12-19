import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { ChatStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { TextField } from '../../../ui/components/TextField';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<ChatStackParamList, 'ChatHome'>;

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

function id() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ChatHomeScreen({ navigation }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: id(), role: 'assistant', text: '你好，我在。你可以先说说今天发生了什么。' },
  ]);
  const [input, setInput] = useState('');

  const lastHint = useMemo(() => {
    const last = messages[messages.length - 1];
    if (!last) return '';
    return last.role === 'assistant' ? '可以继续补充细节' : '我正在理解…';
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => {
      const userMessage: ChatMessage = { id: id(), role: 'user', text };
      const reply =
        text.length <= 8
          ? '我听到了。我们先把呼吸放慢一点。'
          : '谢谢你愿意说出来。你可以给这件事的压力打个 0-10 分吗？';
      const assistantMessage: ChatMessage = { id: id(), role: 'assistant', text: reply };
      return [...prev, userMessage, assistantMessage];
    });
    setInput('');
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>AI聊天</Text>
        <Text style={styles.subtitle}>本页用于展示聊天模块结构与基本交互（本地模拟）。</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="AI形象"
            variant="ghost"
            onPress={() => navigation.navigate('Persona')}
            style={styles.flex}
          />
          <PrimaryButton
            title="历史对话"
            variant="ghost"
            onPress={() => navigation.navigate('ChatHistory')}
            style={styles.flex}
          />
          <PrimaryButton
            title="语音沟通"
            variant="ghost"
            onPress={() => navigation.navigate('VoiceChat')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>对话片段</Text>
        <View style={styles.chatBox}>
          {messages.slice(-4).map((m) => (
            <View
              key={m.id}
              style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble]}
            >
              <Text style={styles.bubbleText}>{m.text}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.hint}>{lastHint}</Text>
      </Card>

      <Card>
        <TextField
          label="输入"
          value={input}
          onChangeText={setInput}
          placeholder="例如：我最近睡不好，有点焦虑…"
          multiline
          style={styles.input}
        />
        <View style={styles.actions}>
          <PrimaryButton title="发送" onPress={send} />
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
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  chatBox: {
    gap: 8,
  },
  bubble: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.card,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  hint: {
    marginTop: 10,
    fontSize: 12,
    color: colors.muted,
  },
  input: {
    height: 96,
    textAlignVertical: 'top',
  },
  actions: {
    marginTop: 12,
  },
});
