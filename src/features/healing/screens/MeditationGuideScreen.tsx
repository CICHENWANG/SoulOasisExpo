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

type Script = {
  id: 'breath' | 'body' | 'sleep';
  name: string;
  outline: string[];
};

const SCRIPTS: Script[] = [
  {
    id: 'breath',
    name: '呼吸回到当下',
    outline: ['先找到舒适坐姿', '把注意力放到鼻尖', '走神时轻轻带回', '结束前做一次伸展'],
  },
  {
    id: 'body',
    name: '身体扫描',
    outline: ['从头顶到脚趾', '感受紧绷的位置', '呼气时放松', '允许一切存在'],
  },
  {
    id: 'sleep',
    name: '睡前放松',
    outline: ['放慢呼吸节奏', '想象温暖光线', '把担忧写在脑海外', '只做“休息”这件事'],
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
    { id: id('m'), scriptName: '呼吸回到当下', duration: 5, rating: 4, note: '中午短暂停一下' },
  ]);

  const script = useMemo(() => SCRIPTS.find((s) => s.id === scriptId) ?? SCRIPTS[0], [scriptId]);

  const stateText = useMemo(() => {
    if (state === 'idle') return '准备开始';
    if (state === 'started') return '进行中…';
    return '已完成';
  }, [state]);

  const save = () => {
    setHistory((prev) =>
      [
        {
          id: id('m'),
          scriptName: script.name,
          duration,
          rating,
          note: note.trim() || '完成一次练习',
        },
        ...prev,
      ].slice(0, 5),
    );
    setNote('');
  };

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>冥想引导</Text>
        <Text style={styles.subtitle}>用短时间把注意力带回身体与呼吸。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>选择脚本</Text>
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
        <Text style={styles.sectionTitle}>选择时长</Text>
        <View style={styles.row}>
          {DURATIONS.map((m) => (
            <PrimaryButton
              key={m}
              title={`${m} 分钟`}
              variant={m === duration ? 'primary' : 'ghost'}
              onPress={() => setDuration(m)}
              style={styles.flex}
            />
          ))}
        </View>

        <View style={styles.block}>
          <Text style={styles.status}>{stateText}</Text>
          {state !== 'started' ? (
            <PrimaryButton title="开始" onPress={() => setState('started')} />
          ) : (
            <PrimaryButton title="完成" onPress={() => setState('done')} />
          )}
          <PrimaryButton title="重置" variant="ghost" onPress={() => setState('idle')} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>简短流程</Text>
        {script.outline.map((line, idx) => (
          <Text key={line} style={styles.muted}>{`${idx + 1}) ${line}`}</Text>
        ))}
        <Text style={[styles.muted, { marginTop: 8 }]}>{`建议时长：${duration} 分钟`}</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>完成记录</Text>
        <Text style={styles.muted}>给这次练习一个评分，并写一句感受（本地模拟）。</Text>
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
        <TextField label="备注" value={note} onChangeText={setNote} placeholder="例如：心跳慢下来了" />
        <View style={styles.block}>
          <PrimaryButton title="保存到历史" onPress={save} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>最近历史</Text>
        <View style={styles.historyList}>
          {history.map((h) => (
            <View key={h.id} style={styles.historyItem}>
              <Text style={styles.historyTitle}>{h.scriptName}</Text>
              <Text style={styles.historyMeta}>{`${h.duration} 分钟 · 评分 ${h.rating}/5`}</Text>
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
