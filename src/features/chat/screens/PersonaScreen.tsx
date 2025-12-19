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

  const selected = useMemo(
    () => PERSONAS.find((p) => p.id === selectedId) ?? PERSONAS[0],
    [selectedId],
  );

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
        <Text style={styles.sectionTitle}>示例语气</Text>
        <Text style={styles.sample}>{selected.sample}</Text>
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
  stack: {
    gap: 10,
  },
  sample: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  row: {
    marginTop: 12,
  },
});
