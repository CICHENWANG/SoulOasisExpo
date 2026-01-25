import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  ImageBackground,
  PanResponder,
  Pressable,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { HomeStackParamList } from '../../../app/navigation/types';
import { useSkin } from '../../../app/providers/SkinProvider';
import { useStress } from '../../../app/providers/StressProvider';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { skinSource } = useSkin();
  const { stress01, setStress01 } = useStress();
  const { width: winW, height: winH } = useWindowDimensions();
  const bgGood = useMemo(() => require('../../../../assets/home/home_bg_good.png'), []);
  const bgBad = useMemo(() => require('../../../../assets/home/home_bg_bad.png'), []);
  const quickClothes = useMemo(() => require('../../../../assets/home/Group 32.png'), []);
  const quickMood = useMemo(() => require('../../../../assets/home/Group 21.png'), []);
  const quickNotes = useMemo(() => require('../../../../assets/home/Group 22.png'), []);
  const sliderTrack = useMemo(() => require('../../../../assets/home/Rectangle 73.png'), []);
  const knobHappy = useMemo(() => require('../../../../assets/home/Group 24.png'), []);
  const knobAngry = useMemo(() => require('../../../../assets/home/Group 23.png'), []);

  const [mood, setMood] = useState(stress01);
  const [trackWidth, setTrackWidth] = useState(0);

  const moodRef = useRef(mood);
  const trackWidthRef = useRef(trackWidth);
  const dragStartMoodRef = useRef(0);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    setMood(stress01);
  }, [stress01]);

  useEffect(() => {
    trackWidthRef.current = trackWidth;
  }, [trackWidth]);

  const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

  const knobSize = 44;
  const usableWidth = Math.max(0, trackWidth - knobSize);

  const onPressTrack = (x: number) => {
    if (usableWidth <= 0) return;
    const next = clamp01((x - knobSize / 2) / usableWidth);
    setMood(next);
    void setStress01(next);
  };

  const knobLeft = mood * usableWidth;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_evt, gestureState) =>
          Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
        onPanResponderGrant: () => {
          dragStartMoodRef.current = moodRef.current;
        },
        onPanResponderMove: (_evt, gestureState) => {
          const w = trackWidthRef.current;
          const usable = Math.max(0, w - knobSize);
          if (usable <= 0) return;
          const next = clamp01(dragStartMoodRef.current + gestureState.dx / usable);
          setMood(next);
          void setStress01(next);
        },
      }),
    [],
  );

  const toTab = (name: 'HealingTab' | 'CommunityTab' | 'MineTab') => {
    (navigation.getParent() as any)?.navigate?.(name);
  };

  const ghostWrapTop = Math.max(78, winH * 0.11);
  const ghostWrapHeight = Math.max(360, winH * 0.54);
  const ghostImgSize = Math.min(winW * 1.42, 640);
  const ghostTranslateY = -ghostImgSize * 0.13;
  const bg = mood >= 0.5 ? bgBad : bgGood;

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <ImageBackground source={bg} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay}>
          <View
            style={[styles.avatarOverlay, { top: ghostWrapTop, height: ghostWrapHeight }]}
            pointerEvents="none"
          >
            <Image
              source={skinSource}
              style={[
                styles.avatarImg,
                {
                  width: ghostImgSize,
                  height: ghostImgSize,
                  transform: [
                    { scaleX: 0.96 },
                    { scaleY: 1.08 },
                    { translateX: -8 },
                    { translateY: ghostTranslateY },
                  ],
                },
              ]}
              resizeMode="contain"
              blurRadius={14}
            />
          </View>

          <View style={styles.rightTools}>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('Skin')}
              style={({ pressed }) => [styles.toolBtn, pressed && styles.toolBtnPressed]}
            >
              <Image source={quickClothes} style={styles.toolImg} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => toTab('HealingTab')}
              style={({ pressed }) => [styles.toolBtn, pressed && styles.toolBtnPressed]}
            >
              <Image source={quickMood} style={styles.toolImg} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => navigation.navigate('MoodCalendar')}
              style={({ pressed }) => [styles.toolBtn, pressed && styles.toolBtnPressed]}
            >
              <Image source={quickNotes} style={styles.toolImg} />
            </Pressable>
          </View>

          <View style={styles.sliderArea}>
            <Pressable
              accessibilityRole="adjustable"
              onPress={(e) => onPressTrack(e.nativeEvent.locationX)}
              onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
              style={styles.trackWrap}
            >
              <Image source={sliderTrack} style={styles.trackImg} resizeMode="stretch" />
              <View style={[styles.knob, { left: knobLeft }]} {...panResponder.panHandlers}>
                <Image
                  source={mood >= 0.5 ? knobAngry : knobHappy}
                  style={styles.knobIcon}
                  resizeMode="contain"
                />
              </View>
            </Pressable>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  avatarOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    overflow: 'hidden',
    opacity: 0.22,
  },
  avatarImg: {
    alignSelf: 'center',
  },
  rightTools: {
    position: 'absolute',
    right: 18,
    top: 96,
    gap: 18,
  },
  toolBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolBtnPressed: {
    opacity: 0.86,
  },
  toolImg: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  },
  sliderArea: {
    position: 'absolute',
    left: 22,
    right: 22,
    bottom: 124,
    alignItems: 'center',
  },
  trackWrap: {
    width: '100%',
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackImg: {
    width: '100%',
    height: 54,
  },
  knob: {
    position: 'absolute',
    top: -5,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#FDB650',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  knobIcon: {
    width: 30,
    height: 30,
    transform: [{ translateY: 0 }],
  },
});
