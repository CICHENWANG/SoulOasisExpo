import React, { useMemo, useState } from 'react';
import {
  Alert,
  Image,
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
import { useSkin } from '../../../app/providers/SkinProvider';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { register, enableFido } = useAuth();
  const { skins, skinId, setSkinId } = useSkin();
  const bg = useMemo(() => require('../../../../assets/imgs/start/登陆界面.png'), []);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pickedIdx, setPickedIdx] = useState(0);
  const [enablePasskey, setEnablePasskey] = useState(false);

  const onSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await register({ email, password, displayName });
      if (enablePasskey) {
        await enableFido({ email });
      }
      (navigation.getParent() as any)?.reset?.({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      const message = e instanceof Error ? e.message : '注册失败，请稍后重试';
      Alert.alert('注册失败', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topArea}>
          <Text style={styles.heroTitle}>Hello!</Text>
          <Text style={styles.heroTitle}>Create your Soul Oasis</Text>

          <View style={styles.avatarRow}>
            {skins.map((s, idx) => {
              const active = s.id === skinId || idx === pickedIdx;
              return (
                <Pressable
                  key={String(idx)}
                  accessibilityRole="button"
                  onPress={() => {
                    setPickedIdx(idx);
                    void setSkinId(s.id);
                  }}
                  style={({ pressed }) => [
                    styles.avatarWrap,
                    active && styles.avatarWrapActive,
                    pressed && styles.avatarWrapPressed,
                  ]}
                >
                  <Image source={s.source} style={styles.avatar} resizeMode="contain" />
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.sheet}>
          <Text style={styles.label}>Nickname</Text>
          <View style={styles.inputRow}>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Please input your name"
              placeholderTextColor="#B9B0A6"
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.sectionGap} />

          <Text style={styles.label}>Account</Text>
          <View style={styles.inputRow}>
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
              placeholder="At least 6 characters"
              placeholderTextColor="#B9B0A6"
              secureTextEntry
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.sectionGap} />

          <Pressable
            accessibilityRole="button"
            onPress={() => setEnablePasskey((v) => !v)}
            style={({ pressed }) => [styles.passkeyRow, pressed && styles.passkeyRowPressed]}
          >
            <View style={[styles.passkeyCheck, enablePasskey && styles.passkeyCheckActive]} />
            <Text style={styles.passkeyText}>Enable Passkey (FIDO) for this account</Text>
          </Pressable>

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
              {isSubmitting ? 'Creating...' : 'Create account'}
            </Text>
          </Pressable>

          <View style={styles.bottomRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.replace('Login')}
            >
              <Text style={styles.linkText}>Back to login</Text>
            </Pressable>
            <Text style={styles.tipText}>Avatar is UI-only in demo.</Text>
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
  topArea: {
    marginHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 10,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1B1B1B',
    lineHeight: 32,
  },
  avatarRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  avatarWrap: {
    width: 68,
    height: 68,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.0)',
  },
  avatarWrapActive: {
    borderColor: '#FDB650',
  },
  avatarWrapPressed: {
    opacity: 0.85,
  },
  avatar: {
    width: 54,
    height: 54,
  },
  sheet: {
    marginHorizontal: 22,
    marginTop: 0,
    paddingHorizontal: 22,
    paddingTop: 20,
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
    height: 16,
  },
  passkeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 2,
  },
  passkeyRowPressed: {
    opacity: 0.85,
  },
  passkeyCheck: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  passkeyCheckActive: {
    backgroundColor: '#FDB650',
    borderColor: '#FDB650',
  },
  passkeyText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#7A6F66',
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
  primaryBtnPressed: {
    opacity: 0.85,
  },
  primaryBtnText: {
    fontSize: 16,
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
  tipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B9B0A6',
  },
});
