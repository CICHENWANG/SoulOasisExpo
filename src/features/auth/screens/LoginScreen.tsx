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

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
    } catch (e) {
      const message = e instanceof Error ? e.message : '登录失败，请稍后重试';
      Alert.alert('登录失败', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>Soul Oasis</Text>
        <Text style={styles.subtitle}>一个更温柔的自我照护空间</Text>
      </View>

      <Card>
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
          placeholder="请输入密码"
        />
        <View style={styles.actions}>
          <PrimaryButton
            title={isSubmitting ? '登录中...' : '登录'}
            onPress={onSubmit}
            disabled={isSubmitting}
          />
          <PrimaryButton
            title="注册新账号"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </Card>

      <Card>
        <Text style={styles.hintTitle}>快速提示</Text>
        <Text style={styles.hintText}>支持假注册/假登录，用于课程展示与页面联动。</Text>
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
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  spacer: {
    height: 8,
  },
  actions: {
    marginTop: 12,
    gap: 10,
  },
  hintTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  hintText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});
