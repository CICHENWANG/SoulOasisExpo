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
    name: '温柔陪伴',
    style: '更注重情绪安抚与接纳',
    sample: '我在这里，慢慢说也没关系。',
  },
  {
    id: 'p2',
    name: '结构教练',
    style: '更注重拆解问题与行动建议',
    sample: '我们先把问题拆成三步，然后选最小的一步开始。',
  },
  {
    id: 'p3',
    name: '简短直接',
    style: '更注重快速结论与要点',
    sample: '我理解。你现在最需要的是：休息 + 具体计划。',
  },
];

export function PersonaScreen({ navigation }: Props) {
  const [selectedId, setSelectedId] = useState(PERSONAS[0].id);
  const [tone, setTone] = useState<'温柔' | '理性' | '直接'>('温柔');
  const [length, setLength] = useState<'简短' | '适中' | '详细'>('适中');
  const [pace, setPace] = useState<'慢一点' | '正常' | '快一点'>('正常');
  const [boundary, setBoundary] = useState<'更尊重隐私' | '更积极追问'>('更尊重隐私');

  const selected = useMemo(
    () => PERSONAS.find((p) => p.id === selectedId) ?? PERSONAS[0],
    [selectedId],
  );

  const summary = useMemo(() => {
    return `风格：${selected.name} · 语气：${tone} · 详略：${length} · 节奏：${pace} · 边界：${boundary}`;
  }, [selected.name, tone, length, pace, boundary]);

  return (
    <Screen>
      <Card>
        <Text style={styles.title}>自定义 AI 形象</Text>
        <Text style={styles.subtitle}>用于展示“偏好配置”页面结构（本地模拟）。</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>选择风格</Text>
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
        <Text style={styles.sectionTitle}>偏好设置</Text>
        <Text style={styles.subtitle}>用于展示可配置项结构，后续可落到后端保存。</Text>

        <Text style={styles.subLabel}>语气</Text>
        <View style={styles.row}>
          {(['温柔', '理性', '直接'] as const).map((t) => (
            <PrimaryButton
              key={t}
              title={t}
              variant={tone === t ? 'primary' : 'ghost'}
              onPress={() => setTone(t)}
              style={styles.flex}
            />
          ))}
        </View>

        <Text style={styles.subLabel}>回答长度</Text>
        <View style={styles.row}>
          {(['简短', '适中', '详细'] as const).map((t) => (
            <PrimaryButton
              key={t}
              title={t}
              variant={length === t ? 'primary' : 'ghost'}
              onPress={() => setLength(t)}
              style={styles.flex}
            />
          ))}
        </View>

        <Text style={styles.subLabel}>节奏</Text>
        <View style={styles.row}>
          {(['慢一点', '正常', '快一点'] as const).map((t) => (
            <PrimaryButton
              key={t}
              title={t}
              variant={pace === t ? 'primary' : 'ghost'}
              onPress={() => setPace(t)}
              style={styles.flex}
            />
          ))}
        </View>

        <Text style={styles.subLabel}>边界</Text>
        <View style={styles.row}>
          {(['更尊重隐私', '更积极追问'] as const).map((t) => (
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
        <Text style={styles.sectionTitle}>示例语气</Text>
        <Text style={styles.sample}>{selected.sample}</Text>
        <Text style={styles.summary}>{summary}</Text>
        <View style={styles.row}>
          <PrimaryButton title="返回聊天" onPress={() => navigation.navigate('ChatHome')} />
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
