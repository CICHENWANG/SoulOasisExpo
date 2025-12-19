import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HealingStackParamList } from '../../../app/navigation/types';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HealingStackParamList, 'HealingHub'>;

export function HealingHubScreen({ navigation }: Props) {
  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>疗愈中心</Text>
        <Text style={styles.subtitle}>从主题计划到日常练习，帮助你把情绪照顾得更具体。</Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>主题入口</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="睡眠主题"
            onPress={() => navigation.navigate('SleepTheme')}
            style={styles.flex}
          />
          <PrimaryButton
            title="学业主题"
            variant="ghost"
            onPress={() => navigation.navigate('StudyTheme')}
            style={styles.flex}
          />
        </View>
        <PrimaryButton
          title="人际关系主题"
          variant="ghost"
          onPress={() => navigation.navigate('RelationshipTheme')}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>快速练习</Text>
        <Text style={styles.muted}>
          练习用于帮助你在 1-3 分钟内稳定状态，后续可扩展为音频/动画引导。
        </Text>
        <View style={styles.row}>
          <PrimaryButton
            title="呼吸训练"
            variant="ghost"
            onPress={() => navigation.navigate('BreathingTraining')}
            style={styles.flex}
          />
          <PrimaryButton
            title="冥想引导"
            variant="ghost"
            onPress={() => navigation.navigate('MeditationGuide')}
            style={styles.flex}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>建议</Text>
        <Text style={styles.muted}>
          先选一个你最在意的主题，坚持 7 天做小调整，比一次性改变所有更可持续。
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    paddingVertical: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
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
  muted: {
    fontSize: 13,
    lineHeight: 18,
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
