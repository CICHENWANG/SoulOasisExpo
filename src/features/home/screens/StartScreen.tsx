import React, { useMemo } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../../../app/providers/AuthProvider';
import { RootStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Start'>;

export function StartScreen({ navigation }: Props) {
  const { user } = useAuth();
  const splash = useMemo(() => require('../../../../assets/imgs/start/开屏.png'), []);
  const buttonImg = useMemo(() => require('../../../../assets/imgs/start/Component 1.png'), []);

  const nextRouteName = user ? 'Main' : 'Auth';

  const handleStart = () => {
    console.log('[StartScreen] pressed, next =', nextRouteName);
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: nextRouteName as any }],
      }),
    );
  };

  return (
    <SafeAreaView
      style={styles.safe}
      edges={['top', 'left', 'right', 'bottom']}
      pointerEvents="box-none"
    >
      <View style={styles.container} pointerEvents="box-none">
        <View pointerEvents="none" style={styles.background}>
          <Image source={splash} style={styles.backgroundImage} resizeMode="contain" />
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Let's start"
          activeOpacity={0.7}
          onPress={handleStart}
          style={styles.buttonWrap}
        >
          <Image source={buttonImg} style={styles.button} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FBF3E8',
  },
  container: {
    flex: 1,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  buttonWrap: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
    height: 72,
    zIndex: 10,
    elevation: 10,
  },
  button: {
    width: '100%',
    height: 72,
  },
});
