import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { AuthProvider } from './providers/AuthProvider';
import { SkinProvider } from './providers/SkinProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SkinProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SkinProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
