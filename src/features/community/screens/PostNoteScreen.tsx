import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CommunityStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { noteApi } from '../../../services/community/noteApi';
import { PrimaryButton } from '../../../ui/components/PrimaryButton';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<CommunityStackParamList, 'PostNote'>;

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

export function PostNoteScreen({ navigation }: Props) {
  const { accessToken } = useAuth();

  const [title, setTitle] = useState('');
  const [contentText, setContentText] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    return title.trim().length > 0 && contentText.trim().length > 0 && !isSubmitting;
  }, [contentText, isSubmitting, title]);

  const onSubmit = async () => {
    if (!accessToken) {
      Alert.alert('Not signed in', 'Please sign in first.');
      return;
    }
    if (!canSubmit) {
      Alert.alert('Tip', 'Please fill in the title and content.');
      return;
    }

    setIsSubmitting(true);
    try {
      await noteApi.postNoteText({
        token: accessToken,
        title: title.trim(),
        contentText: contentText.trim(),
        coverUrl: coverUrl.trim() || undefined,
      });

      navigation.reset({
        index: 0,
        routes: [{ name: 'CommunityFeed', params: { refreshKey: Date.now() } }],
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Post failed.';
      Alert.alert('Post Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.topTitle}>New Post</Text>
        <View style={styles.topRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <View style={styles.form}>
          <View style={styles.formCard}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={(t) => setTitle(stripCjk(t))}
              placeholder="Write a catchy title"
              placeholderTextColor={colors.muted}
              style={styles.input}
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Cover Image (optional)</Text>
            <TextInput
              value={coverUrl}
              onChangeText={setCoverUrl}
              placeholder="Paste an image URL (optional)"
              placeholderTextColor={colors.muted}
              style={styles.input}
              autoCapitalize="none"
              editable={!isSubmitting}
            />

            <Text style={styles.label}>Content</Text>
            <TextInput
              value={contentText}
              onChangeText={(t) => setContentText(stripCjk(t))}
              placeholder="Write your post (plain text)"
              placeholderTextColor={colors.muted}
              style={[styles.input, styles.textarea]}
              multiline
              textAlignVertical="top"
              editable={!isSubmitting}
            />

            <PrimaryButton
              title={isSubmitting ? 'Posting...' : 'Post'}
              onPress={() => void onSubmit()}
              disabled={!canSubmit}
              style={!canSubmit ? styles.btnDisabled : undefined}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  backText: {
    fontSize: 34,
    fontWeight: '700',
    color: colors.text,
    marginLeft: 4,
    marginTop: -2,
  },
  topTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.muted,
  },
  topRight: {
    width: 44,
    height: 44,
  },
  body: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  formCard: {
    backgroundColor: colors.panel,
    borderRadius: 22,
    padding: 14,
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    marginTop: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  textarea: {
    minHeight: 160,
  },
  btnDisabled: {
    opacity: 0.6,
  },
});
