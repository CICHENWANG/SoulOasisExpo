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

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const bg = useMemo(() => require('../../../../assets/imgs/start/auth_bg.png'), []);
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
      const message = e instanceof Error ? e.message : 'Login failed. Please try again later.';
      Alert.alert('Login Failed', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPasskeyLogin = async () => {
    Alert.alert('Not implemented', 'Passkey sign-in will be added later. Please use email + password for now.');
  };

  const onSetupPasskey = async () => {
    Alert.alert('Not implemented', 'Passkey setup will be added later.');
  };

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <View pointerEvents="none" style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheet}>
          <Text style={styles.title}>Sign in</Text>
          <Text style={styles.subtitle}>Welcome back. Please use your email and password.</Text>

          <View style={styles.sectionGap} />

          <Text style={styles.label}>Email</Text>
          <View style={styles.inputRow}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>@</Text>
            </View>
            <View style={styles.prefixDivider} />
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

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={password}
              onChangeText={(t) => setPassword(stripCjk(t))}
              placeholder="Enter your password"
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
            <Text style={styles.fidoBtnText}>Login with Passkey</Text>
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
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.12)',
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
    marginBottom: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1B1B1B',
    letterSpacing: 0.2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: '#7A6F66',
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: '#1B1B1B',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 54,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
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
    height: 14,
  },
  sectionBigGap: {
    height: 20,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 7,
  },
  primaryBtnPressed: {
    opacity: 0.85,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
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
    justifyContent: 'center',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 8,
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
