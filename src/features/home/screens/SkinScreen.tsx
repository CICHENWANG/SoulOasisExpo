import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeStackParamList } from '../../../app/navigation/types';
import { useSkin } from '../../../app/providers/SkinProvider';

type Props = NativeStackScreenProps<HomeStackParamList, 'Skin'>;

type TabKey = 'skin' | 'headwear' | 'neckwear';

export function SkinScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { skinId, skins, setSkinId } = useSkin();

  const [tab, setTab] = useState<TabKey>('skin');
  const [pickedId, setPickedId] = useState(skinId);

  useEffect(() => {
    setPickedId(skinId);
  }, [skinId]);

  const pickedSource = useMemo(() => {
    return skins.find((s) => s.id === pickedId)?.source ?? skins[0].source;
  }, [pickedId, skins]);

  const confirm = async () => {
    await setSkinId(pickedId);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
        >
          <Text style={styles.backIcon}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.title}>Choose an image</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.body}>
        <View style={styles.bgWrap} pointerEvents="none">
          <Image source={pickedSource} style={styles.bgImg} resizeMode="contain" />
        </View>

        <View style={[styles.bubble, { marginTop: Math.max(insets.top, 12) }]}>
          <Text style={styles.bubbleText}>How would you like me to address you</Text>
        </View>

        <View style={styles.avatarWrap}>
          <Image source={pickedSource} style={styles.avatar} resizeMode="contain" />
        </View>

        <View style={styles.tabsRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTab('skin')}
            style={({ pressed }) => [
              styles.tabBtn,
              tab === 'skin' && styles.tabBtnActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.tabText}>Skin color</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTab('headwear')}
            style={({ pressed }) => [
              styles.tabBtn,
              tab === 'headwear' && styles.tabBtnActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.tabText}>Headwear</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTab('neckwear')}
            style={({ pressed }) => [
              styles.tabBtn,
              tab === 'neckwear' && styles.tabBtnActive,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.tabText}>Neckwear</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.optionsRow}>
            {skins.map((s) => {
              const active = s.id === pickedId;
              return (
                <Pressable
                  key={s.id}
                  accessibilityRole="button"
                  onPress={() => setPickedId(s.id)}
                  style={({ pressed }) => [
                    styles.option,
                    active && styles.optionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Image source={s.source} style={styles.optionImg} resizeMode="contain" />
                </Pressable>
              );
            })}
          </View>

          <Pressable
            accessibilityRole="button"
            onPress={confirm}
            style={({ pressed }) => [styles.confirmBtn, pressed && styles.confirmBtnPressed]}
          >
            <Text style={styles.confirmText}>Certain</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FDF1DE',
  },
  pressed: {
    opacity: 0.75,
  },
  header: {
    height: 58,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 34,
    lineHeight: 34,
    color: '#2B1A0B',
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2B1A0B',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  bgWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.16,
  },
  bgImg: {
    width: 720,
    height: 720,
  },
  bubble: {
    alignSelf: 'stretch',
    marginTop: 10,
    backgroundColor: '#F7C98A',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  bubbleText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '800',
    color: '#E06B00',
  },
  avatarWrap: {
    marginTop: 12,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  avatar: {
    width: 180,
    height: 180,
  },
  tabsRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignSelf: 'stretch',
    gap: 10,
    backgroundColor: '#F7C98A',
    padding: 10,
    borderRadius: 14,
  },
  tabBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#FFE7B8',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#2B1A0B',
  },
  card: {
    marginTop: 12,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderRadius: 16,
    padding: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  optionActive: {
    borderColor: '#74B1FF',
    shadowColor: '#74B1FF',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  optionImg: {
    width: 62,
    height: 62,
  },
  confirmBtn: {
    marginTop: 12,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#F7C98A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnPressed: {
    opacity: 0.75,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#2B1A0B',
  },
});
