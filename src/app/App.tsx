import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './navigation/RootNavigator';
import { AuthProvider } from './providers/AuthProvider';
import { SkinProvider } from './providers/SkinProvider';
import { StressProvider } from './providers/StressProvider';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SkinProvider>
          <StressProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </StressProvider>
        </SkinProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
