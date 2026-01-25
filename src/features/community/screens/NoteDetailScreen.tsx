import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
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
import Markdown from 'react-native-markdown-display';

import type { CommunityStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { noteApi, type NoteComment, type NoteDetail } from '../../../services/community/noteApi';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<CommunityStackParamList, 'NoteDetail'>;

const COMMENT_PAGE_SIZE = 20;

const LIKED_NOTES_KEY = 'community:likedNotes';

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

async function loadLikedNotes(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(LIKED_NOTES_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x) => typeof x === 'string'));
  } catch {
    return new Set();
  }
}

async function saveLikedNotes(set: Set<string>) {
  try {
    await AsyncStorage.setItem(LIKED_NOTES_KEY, JSON.stringify(Array.from(set)));
  } catch {
  }
}

function hashToInt(str: string) {
  let acc = 0;
  for (let i = 0; i < str.length; i += 1) {
    acc = (acc * 31 + str.charCodeAt(i)) >>> 0;
  }
  return acc;
}

function getFallbackCoverUrl(seedText: string, w: number, h: number) {
  const seed = hashToInt(seedText);
  const ww = Math.max(320, w);
  const hh = Math.max(240, h);
  return `https://picsum.photos/seed/${seed}/${ww}/${hh}`;
}

export function NoteDetailScreen({ navigation, route }: Props) {
  const { accessToken } = useAuth();
  const noteId = route.params.noteId;

  const [note, setNote] = useState<NoteDetail | null>(null);
  const [comments, setComments] = useState<NoteComment[]>([]);

  const [loadingNote, setLoadingNote] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);

  const [liked, setLiked] = useState(false);

  useEffect(() => {
    void (async () => {
      const set = await loadLikedNotes();
      setLiked(set.has(noteId));
    })();
  }, [noteId]);

  const toggleLike = useCallback(() => {
    setLiked((prev) => {
      const nextLiked = !prev;
      void (async () => {
        const set = await loadLikedNotes();
        if (nextLiked) set.add(noteId);
        else set.delete(noteId);
        await saveLikedNotes(set);
      })();
      return nextLiked;
    });
  }, [noteId]);

  const canRequest = Boolean(accessToken);

  const fetchNote = useCallback(async () => {
    if (!accessToken) return;
    const detail = await noteApi.getNoteDetail({ token: accessToken, noteId });
    setNote(detail);
  }, [accessToken, noteId]);

  const fetchComments = useCallback(
    async (params: { reset: boolean }) => {
      if (!accessToken) return;

      const nextPage = params.reset ? 1 : Math.floor(comments.length / COMMENT_PAGE_SIZE) + 1;
      const list = await noteApi.listComments({
        token: accessToken,
        noteId,
        page: nextPage,
        pageSize: COMMENT_PAGE_SIZE,
      });

      setHasMore(list.length >= COMMENT_PAGE_SIZE);
      setComments((prev) => (params.reset ? list : [...prev, ...list]));
    },
    [accessToken, comments.length, noteId],
  );

  const reloadAll = useCallback(async () => {
    if (!canRequest) return;

    setRefreshing(true);
    try {
      await Promise.all([fetchNote(), fetchComments({ reset: true })]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Load failed.';
      Alert.alert('Load Failed', msg);
    } finally {
      setRefreshing(false);
    }
  }, [canRequest, fetchComments, fetchNote]);

  useEffect(() => {
    const run = async () => {
      if (!canRequest) {
        setLoadingNote(false);
        return;
      }

      setLoadingNote(true);
      try {
        await Promise.all([fetchNote(), fetchComments({ reset: true })]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Load failed.';
        Alert.alert('Load Failed', msg);
      } finally {
        setLoadingNote(false);
      }
    };

    void run();
  }, [canRequest, fetchComments, fetchNote]);

  const onEndReached = async () => {
    if (!canRequest) return;
    if (loadingMore || refreshing || loadingNote) return;
    if (!hasMore) return;

    setLoadingMore(true);
    try {
      await fetchComments({ reset: false });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Load failed.';
      Alert.alert('Load Failed', msg);
    } finally {
      setLoadingMore(false);
    }
  };

  const onSend = async () => {
    if (!accessToken) {
      Alert.alert('Not signed in', 'Please sign in first.');
      return;
    }
    if (posting) return;

    const content = commentText.trim();
    if (!content) {
      Alert.alert('Tip', 'Comment cannot be empty.');
      return;
    }

    setPosting(true);
    try {
      await noteApi.postComment({ token: accessToken, noteId, content });
      setCommentText('');
      await reloadAll();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Comment failed.';
      Alert.alert('Comment Failed', msg);
    } finally {
      setPosting(false);
    }
  };

  const header = useMemo(() => {
    if (!canRequest) {
      return (
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Not signed in</Text>
          <Text style={styles.headerMeta}>Please sign in to view this post.</Text>
        </View>
      );
    }

    if (loadingNote && !note) {
      return (
        <View style={styles.headerCard}>
          <ActivityIndicator />
        </View>
      );
    }

    if (!note) {
      return (
        <View style={styles.headerCard}>
          <Text style={styles.headerTitle}>Post not found</Text>
        </View>
      );
    }

    const cover = (note.coverUrl ?? '').trim();
    const coverUri = cover || getFallbackCoverUrl(`note-${note.id}`, 1200, 900);
    const gallery = [
      getFallbackCoverUrl(`note-${note.id}-g1`, 800, 800),
      getFallbackCoverUrl(`note-${note.id}-g2`, 800, 800),
      getFallbackCoverUrl(`note-${note.id}-g3`, 800, 800),
    ];

    let md = note.contentMarkdown ?? '';
    if (md.startsWith('# ')) {
      const firstLineEnd = md.indexOf('\n');
      const firstLine = firstLineEnd === -1 ? md : md.slice(0, firstLineEnd);
      if (firstLine.includes(note.title)) {
        md = (firstLineEnd === -1 ? '' : md.slice(firstLineEnd + 1)).trimStart();
      }
    }

    const displayLikeCount = note.likeCount + (liked ? 1 : 0);

    return (
      <View style={styles.headerCard}>
        <Image source={{ uri: coverUri }} style={styles.cover} resizeMode="cover" />
        <Text style={styles.noteTitle}>{note.title}</Text>
        <Text style={styles.noteMeta}>{`${note.author} · ${String(note.createTime ?? '')}`}</Text>
        <View style={styles.galleryRow}>
          {gallery.map((uri) => (
            <Image key={uri} source={{ uri }} style={styles.galleryImg} resizeMode="cover" />
          ))}
        </View>
        <Markdown style={markdownStyles}>{md}</Markdown>
        <View style={styles.countRow}>
          <Text style={styles.noteCounts}>{`Likes ${displayLikeCount} · Comments ${note.commentCount}`}</Text>
          <Pressable
            accessibilityRole="button"
            hitSlop={10}
            onPress={toggleLike}
            style={({ pressed }) => [styles.likeBtn, pressed && styles.pressed]}
          >
            <Text style={[styles.likeText, liked && styles.likeTextOn]}>{liked ? '♥' : '♡'}</Text>
          </Pressable>
        </View>
      </View>
    );
  }, [canRequest, liked, loadingNote, note, toggleLike]);

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
        <Text style={styles.topTitle}>Note Detail</Text>
        <View style={styles.topRight} />
      </View>

      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={header}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          refreshing={refreshing}
          onRefresh={() => void reloadAll()}
          renderItem={({ item }) => (
            <View style={styles.commentCard}>
              <View style={styles.commentTopRow}>
                <Text style={styles.commentAuthor}>{item.author}</Text>
                <Text style={styles.commentTime}>{String(item.createTime ?? '')}</Text>
              </View>
              <Text style={styles.commentContent}>{item.content}</Text>
            </View>
          )}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.footer}>
                <ActivityIndicator />
              </View>
            ) : null
          }
        />

        <View style={styles.composer}>
          <TextInput
            value={commentText}
            onChangeText={(t) => setCommentText(stripCjk(t))}
            placeholder="Write a comment..."
            placeholderTextColor={colors.muted}
            editable={canRequest && !posting}
            style={styles.composerInput}
          />
          <Pressable
            accessibilityRole="button"
            onPress={() => void onSend()}
            disabled={!canRequest || posting}
            style={({ pressed }) => [
              styles.sendBtn,
              (pressed || posting) && styles.sendBtnPressed,
              (!canRequest || posting) && styles.sendBtnDisabled,
            ]}
          >
            <Text style={styles.sendText}>{posting ? 'Sending...' : 'Send'}</Text>
          </Pressable>
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 96,
    gap: 12,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cover: {
    width: '100%',
    height: 220,
    borderRadius: 14,
    backgroundColor: colors.border,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  headerMeta: {
    marginTop: 6,
    fontSize: 13,
    color: colors.muted,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  noteMeta: {
    marginTop: 8,
    fontSize: 13,
    color: colors.muted,
  },
  noteContent: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  galleryRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  galleryImg: {
    flex: 1,
    height: 94,
    borderRadius: 12,
    backgroundColor: colors.border,
  },
  noteCounts: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '700',
    color: colors.muted,
  },
  countRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  likeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.muted,
    marginTop: -1,
  },
  likeTextOn: {
    color: '#E11D48',
  },
  commentCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  commentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  commentTime: {
    fontSize: 12,
    color: colors.muted,
  },
  commentContent: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  footer: {
    paddingVertical: 8,
  },
  composer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  composerInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },
  sendBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: colors.primary,
  },
  sendBtnPressed: {
    opacity: 0.85,
  },
  sendBtnDisabled: {
    opacity: 0.5,
  },
  sendText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryText,
  },
});

const markdownStyles = {
  body: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
  heading1: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '900',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  heading2: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  heading3: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: colors.text,
    marginTop: 10,
    marginBottom: 6,
  },
  bullet_list: {
    marginTop: 6,
    marginBottom: 6,
  },
  ordered_list: {
    marginTop: 6,
    marginBottom: 6,
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primarySoft,
    paddingLeft: 10,
    color: colors.muted,
  },
  image: {
    borderRadius: 12,
  },
} as const;
