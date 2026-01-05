import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { Screen } from '../../../ui/components/Screen';
import { colors } from '../../../ui/theme/colors';

export function CommunityScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Community</Text>
      <Text style={styles.subtitle}>该页面后续补内容（当前为占位页）。</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
  },
});
