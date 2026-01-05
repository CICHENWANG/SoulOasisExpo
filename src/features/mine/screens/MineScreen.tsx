import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAuth } from '../../../app/providers/AuthProvider';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

export function MineScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <Text style={styles.title}>Mine</Text>

      <Card>
        <Text style={styles.sectionTitle}>当前用户</Text>
        <View style={styles.row}>
          <Text style={styles.label}>昵称</Text>
          <Text style={styles.value}>{user?.displayName ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>邮箱</Text>
          <Text style={styles.value}>{user?.email ?? '-'}</Text>
        </View>
      </Card>

      <PrimaryButton title="退出登录" variant="danger" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    fontSize: 13,
    color: colors.muted,
  },
  value: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
  },
});
