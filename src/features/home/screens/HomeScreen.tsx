import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>首页</Text>
        <Text style={styles.subtitle}>
          {user ? `${user.displayName} · ${user.email}` : '本地模拟账号'}
        </Text>
      </View>

      <Card>
        <Text style={styles.sectionTitle}>快速入口</Text>
        <View style={styles.row}>
          <PrimaryButton
            title="治愈语录"
            onPress={() => navigation.navigate('Quotes')}
            style={styles.flex}
          />
          <PrimaryButton
            title="主动关怀"
            variant="ghost"
            onPress={() => navigation.navigate('ActiveCare')}
            style={styles.flex}
          />
        </View>
        <PrimaryButton
          title="数据可视化"
          variant="ghost"
          onPress={() => navigation.navigate('Visualization')}
        />
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>今日小结</Text>
        <Text style={styles.body}>
          给自己 30 秒，确认一下：我现在最需要的是什么？
        </Text>
        <View style={styles.tagRow}>
          <Text style={styles.tag}>睡眠</Text>
          <Text style={styles.tag}>学习</Text>
          <Text style={styles.tag}>情绪</Text>
          <Text style={styles.tag}>关系</Text>
        </View>
      </Card>

      <PrimaryButton title="退出登录" variant="danger" onPress={() => void signOut()} />
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
    color: colors.muted,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  flex: {
    flex: 1,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    color: colors.text,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    fontSize: 12,
  },
});
