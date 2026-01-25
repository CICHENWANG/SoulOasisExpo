import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StartScreen } from '../../features/home/screens/StartScreen';
import { useAuth } from '../providers/AuthProvider';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <RootStack.Navigator initialRouteName="Start">
      <RootStack.Screen name="Start" component={StartScreen} options={{ headerShown: false }} />
      {user ? (
        <RootStack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthStack} options={{ headerShown: false }} />
      )}
    </RootStack.Navigator>
  );
}
