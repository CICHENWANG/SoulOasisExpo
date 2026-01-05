import React, { useMemo, useState } from 'react';
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../../app/providers/AuthProvider';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const bg = useMemo(() => require('../../../../assets/imgs/start/登陆界面.png'), []);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      (navigation.getParent() as any)?.reset?.({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      const message = e instanceof Error ? e.message : '登录失败，请稍后重试';
      Alert.alert('登录失败', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasskeyLogin = async () => {
    Alert.alert('暂未实现', 'Passkey/FIDO 登录后续再接入。请先使用邮箱+密码登录。');
  };

  const onSetupPasskey = async () => {
    Alert.alert('暂未实现', 'Passkey/FIDO 注册/启用后续再接入。');
  };

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topCard} pointerEvents="none">
          <Text style={styles.heroTitle}>Hello!</Text>
          <Text style={styles.heroTitle}>Welcome to Soul Oasis</Text>
        </View>

        <View style={styles.sheet}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>@</Text>
            </View>
            <View style={styles.prefixDivider} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Please input your email"
              placeholderTextColor="#B9B0A6"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.sectionGap} />

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Please input password"
              placeholderTextColor="#B9B0A6"
              secureTextEntry
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.sectionBigGap} />

          <Pressable
            accessibilityRole="button"
            onPress={onSubmit}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.primaryBtn,
              (pressed || isSubmitting) && styles.primaryBtnPressed,
            ]}
          >
            <Text style={styles.primaryBtnText}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </Pressable>

          <View style={styles.sectionGap} />

          <Pressable
            accessibilityRole="button"
            onPress={onPasskeyLogin}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.fidoBtn,
              (pressed || isSubmitting) && styles.fidoBtnPressed,
            ]}
          >
            <Text style={styles.fidoBtnText}>Login with Passkey (FIDO)</Text>
          </Pressable>

          <View style={styles.bottomRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.linkText}>Create an account</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={onSetupPasskey}
            >
              <Text style={styles.forgotText}>Set up Passkey</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  topCard: {
    marginHorizontal: 22,
    paddingHorizontal: 6,
    paddingTop: 34,
    paddingBottom: 120,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1B1B1B',
    lineHeight: 36,
  },
  sheet: {
    marginHorizontal: 22,
    marginTop: -92,
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 26,
  },
  label: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1B1B1B',
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
  },
  prefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prefixText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#9B9187',
  },
  prefixDivider: {
    width: 1,
    height: 22,
    backgroundColor: '#E8DED4',
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#3A3A3A',
  },
  sectionGap: {
    height: 18,
  },
  sectionBigGap: {
    height: 36,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnPressed: {
    opacity: 0.85,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B1B1B',
  },
  fidoBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fidoBtnPressed: {
    opacity: 0.85,
  },
  fidoBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1B1B1B',
  },
  bottomRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7A6F66',
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B9B0A6',
  },
});
