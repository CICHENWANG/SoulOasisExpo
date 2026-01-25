import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CommunityStackParamList } from '../../../app/navigation/types';
import { useAuth } from '../../../app/providers/AuthProvider';
import { noteApi, type NoteListItem } from '../../../services/community/noteApi';
import { colors } from '../../../ui/theme/colors';

type Props = NativeStackScreenProps<CommunityStackParamList, 'CommunityFeed'>;

const PAGE_SIZE = 20;

const CJK_RE = /[\u4e00-\u9fff]/g;

function stripCjk(input: string) {
  return input.replace(CJK_RE, '');
}

const mascot = require('../../../../assets/Group 37.png');

const LIKED_NOTES_KEY = 'community:likedNotes';

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

function getCoverHeight(id: string) {
  const h = hashToInt(id) % 100;
  return 140 + (h % 70);
}

function getFallbackCoverUrl(seedText: string, w: number, h: number) {
  const seed = hashToInt(seedText);
  const ww = Math.max(200, w);
  const hh = Math.max(200, h);
  return `https://picsum.photos/seed/${seed}/${ww}/${hh}`;
}

export function CommunityScreen({ navigation, route }: Props) {
  const { accessToken } = useAuth();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const { width: winW } = useWindowDimensions();

  const horizontalPadding = 16;
  const gap = 12;
  const itemWidth = useMemo(() => {
    const w = winW - horizontalPadding * 2 - gap;
    return Math.max(150, w / 2);
  }, [winW]);

  const [searchText, setSearchText] = useState('');
  const [keyword, setKeyword] = useState('');

  const [items, setItems] = useState<NoteListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [likedNotes, setLikedNotes] = useState<Set<string>>(new Set());

  const canRequest = Boolean(accessToken);

  const fetchPage = useCallback(
    (p: number) => {
      if (!accessToken) {
        return Promise.reject(new Error('Not signed in'));
      }
      return noteApi.listNotes({
        token: accessToken,
        page: p,
        pageSize: PAGE_SIZE,
        keyword: keyword || undefined,
      });
    },
    [accessToken, keyword],
  );

  const reload = useCallback(
    async (mode: 'loading' | 'refresh') => {
      if (!canRequest) {
        setLoading(false);
        return;
      }

      if (mode === 'refresh') {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await fetchPage(1);
        setItems(data.items);
        setPage(data.page);
        setHasMore(Boolean(data.hasMore));
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Load failed.';
        Alert.alert('Load Failed', msg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canRequest, fetchPage],
  );

  useEffect(() => {
    void reload('loading');
  }, [keyword, route.params?.refreshKey, reload]);

  useEffect(() => {
    void (async () => {
      const liked = await loadLikedNotes();
      setLikedNotes(liked);
    })();
  }, []);

  const toggleLike = useCallback((noteId: string) => {
    setLikedNotes((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      void saveLikedNotes(next);
      return next;
    });
  }, []);

  const onSearch = () => {
    const next = searchText.trim();
    if (next === keyword) {
      void reload('loading');
      return;
    }
    setKeyword(next);
  };

  const onEndReached = async () => {
    if (!canRequest) return;
    if (loading || refreshing || loadingMore) return;
    if (!hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchPage(nextPage);
      setItems((prev) => [...prev, ...data.items]);
      setPage(data.page);
      setHasMore(Boolean(data.hasMore));
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Load failed.';
      Alert.alert('Load Failed', msg);
    } finally {
      setLoadingMore(false);
    }
  };

  const tabPadBottom = Math.max(insets.bottom, 12);
  const tabMinHeight = 76 + tabPadBottom;
  const tabH = Math.max(tabBarHeight, tabMinHeight);
  const fabBottom = tabH + 18;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={styles.title}>Community</Text>
        <View style={styles.headerPanel}>
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <TextInput
                value={searchText}
                onChangeText={(t) => setSearchText(stripCjk(t))}
                placeholder="Search"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
                returnKeyType="search"
                onSubmitEditing={onSearch}
              />
              <Pressable
                accessibilityRole="button"
                onPress={onSearch}
                style={({ pressed }) => [styles.searchIconBtn, pressed && styles.pressed]}
              >
                <Text style={styles.searchIcon}>⌕</Text>
              </Pressable>
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => void reload('refresh')}
              style={({ pressed }) => [styles.mascotBtn, pressed && styles.pressed]}
            >
              <Image source={mascot} style={styles.mascotImg} />
            </Pressable>
          </View>
        </View>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 12,
          paddingBottom: fabBottom + 160,
        }}
        columnWrapperStyle={{ gap }}
        refreshing={refreshing}
        onRefresh={() => void reload('refresh')}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
        renderItem={({ item }) => {
          const coverHeight = getCoverHeight(item.id);
          const cover = (item.coverUrl ?? '').trim();
          const coverUri = cover || getFallbackCoverUrl(item.id, Math.round(itemWidth), Math.round(coverHeight));
          const liked = likedNotes.has(item.id);
          const displayLikeCount = item.likeCount + (liked ? 1 : 0);
          return (
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('NoteDetail', { noteId: item.id })}
              style={({ pressed }) => [
                styles.cardOuter,
                { width: itemWidth, marginBottom: gap },
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.card}>
                <Image
                  source={{ uri: coverUri }}
                  style={[styles.cover, { height: coverHeight }]}
                  resizeMode="cover"
                />
                <View style={styles.cardBody}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {item.author}
                  </Text>
                  <Text style={styles.cardCounts}>{`Likes ${displayLikeCount} · Comments ${item.commentCount}`}</Text>

                  <Pressable
                    accessibilityRole="button"
                    hitSlop={10}
                    onPress={() => toggleLike(item.id)}
                    style={({ pressed }) => [styles.likeBtn, pressed && styles.pressed]}
                  >
                    <Text style={[styles.likeText, liked && styles.likeTextOn]}>{liked ? '♥' : '♡'}</Text>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={() => {
          if (!canRequest) {
            return (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>Not signed in</Text>
                <Text style={styles.emptyText}>Please sign in to view community posts.</Text>
              </View>
            );
          }

          if (loading) {
            return (
              <View style={styles.empty}>
                <ActivityIndicator />
              </View>
            );
          }

          return (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No posts yet</Text>
              <Text style={styles.emptyText}>Create the first post, or try searching with a keyword.</Text>
            </View>
          );
        }}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <ActivityIndicator />
            </View>
          ) : null
        }
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('PostNote')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: fabBottom },
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 6,
    paddingBottom: 10,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.muted,
  },
  headerPanel: {
    backgroundColor: colors.panel,
    borderRadius: 22,
    padding: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    height: 46,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 46,
    color: colors.text,
    paddingVertical: 0,
  },
  searchIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderWidth: 2,
    borderColor: colors.primarySoft,
  },
  searchIcon: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    marginTop: -2,
  },
  mascotBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  mascotImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  searchBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primaryText,
  },
  pressed: {
    opacity: 0.85,
  },
  cardOuter: {
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.92,
  },
  cover: {
    width: '100%',
    backgroundColor: colors.border,
  },
  coverPlaceholder: {
    width: '100%',
    backgroundColor: colors.panel,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
  },
  cardBody: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 6,
    position: 'relative',
  },
  likeBtn: {
    position: 'absolute',
    right: 8,
    top: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    zIndex: 2,
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
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 19,
    paddingRight: 46,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.muted,
    paddingRight: 46,
  },
  cardCounts: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.muted,
    paddingRight: 46,
  },
  empty: {
    paddingTop: 40,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: colors.muted,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 10,
  },
  fab: {
    position: 'absolute',
    right: 18,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 20,
    zIndex: 9999,
  },
  fabPressed: {
    opacity: 0.88,
  },
  fabText: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primaryText,
    marginTop: -2,
  },
});
