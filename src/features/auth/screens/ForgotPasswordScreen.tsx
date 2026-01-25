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
import { authApi } from '../../../services/auth/authApi';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

export function ForgotPasswordScreen({ navigation }: Props) {
  const bg = useMemo(() => require('../../../../assets/imgs/start/auth_bg.png'), []);

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onRequestCode = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await authApi.requestPasswordReset({ email });
      Alert.alert('Code generated', `Code: ${result.code}\nValid for: ${result.expireSeconds} seconds`);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to get code. Please try again later.';
      Alert.alert('Request Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onConfirmReset = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await authApi.confirmPasswordReset({ email, code, newPassword });
      Alert.alert('Password reset', 'Please sign in with your new password.', [
        {
          text: 'Back to login',
          onPress: () => navigation.replace('Login'),
        },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Reset failed. Please try again later.';
      Alert.alert('Reset Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topCard} pointerEvents="none">
          <Text style={styles.heroTitle}>Reset</Text>
          <Text style={styles.heroTitle}>your password</Text>
        </View>

        <View style={styles.sheet}>
          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={email}
              onChangeText={(t) => setEmail(stripCjk(t))}
              placeholder="Enter your email"
              placeholderTextColor="#B9B0A6"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.sectionGap} />

          <Pressable
            accessibilityRole="button"
            onPress={onRequestCode}
            disabled={isSubmitting}
            style={({ pressed }) => [styles.secondaryBtn, (pressed || isSubmitting) && styles.btnPressed]}
          >
            <Text style={styles.secondaryBtnText}>{isSubmitting ? 'Requesting...' : 'Get Code'}</Text>
          </Pressable>

          <View style={styles.sectionBigGap} />

          <Text style={styles.label}>Code</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={code}
              onChangeText={(t) => setCode(stripCjk(t))}
              placeholder="6-digit code"
              placeholderTextColor="#B9B0A6"
              keyboardType="number-pad"
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.sectionGap} />

          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={newPassword}
              onChangeText={(t) => setNewPassword(stripCjk(t))}
              placeholder="At least 6 characters (letters + numbers)"
              placeholderTextColor="#B9B0A6"
              secureTextEntry
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.sectionBigGap} />

          <Pressable
            accessibilityRole="button"
            onPress={onConfirmReset}
            disabled={isSubmitting}
            style={({ pressed }) => [styles.primaryBtn, (pressed || isSubmitting) && styles.btnPressed]}
          >
            <Text style={styles.primaryBtnText}>{isSubmitting ? 'Submitting...' : 'Reset Password'}</Text>
          </Pressable>

          <View style={styles.bottomRow}>
            <Pressable accessibilityRole="button" onPress={() => navigation.replace('Login')}>
              <Text style={styles.linkText}>Back to login</Text>
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
    fontSize: 18,
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
  input: {
    flex: 1,
    fontSize: 15,
    color: '#3A3A3A',
  },
  sectionGap: {
    height: 18,
  },
  sectionBigGap: {
    height: 26,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1B1B1B',
  },
  secondaryBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1B1B1B',
  },
  btnPressed: {
    opacity: 0.85,
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
});
