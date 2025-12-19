import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { Card } from '../../../ui/components/Card';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { Screen } from '../../../ui/components/Screen';
import { TextField } from '../../../ui/components/TextField';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await register({ email, password, displayName });
    } catch (e) {
      const message = e instanceof Error ? e.message : '注册失败，请稍后重试';
      Alert.alert('注册失败', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>创建账号</Text>
        <Text style={styles.subtitle}>用于保存你的偏好与历史记录（本地模拟）。</Text>
      </View>

      <Card>
        <TextField
          label="昵称"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="比如：Nick"
        />
        <View style={styles.spacer} />
        <TextField
          label="邮箱"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          placeholder="name@example.com"
        />
        <View style={styles.spacer} />
        <TextField
          label="密码"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          placeholder="至少 6 位"
        />

        <View style={styles.actions}>
          <PrimaryButton
            title={isSubmitting ? '创建中...' : '创建账号'}
            onPress={onSubmit}
            disabled={isSubmitting}
          />
          <PrimaryButton
            title="返回登录"
            variant="ghost"
            onPress={() => navigation.replace('Login')}
          />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
    paddingVertical: 8,
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
  spacer: {
    height: 8,
  },
  actions: {
    marginTop: 12,
    gap: 10,
  },
});
