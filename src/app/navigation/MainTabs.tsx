import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChatHomeScreen } from '../../features/chat/screens/ChatHomeScreen';
import { ChatHistoryScreen } from '../../features/chat/screens/ChatHistoryScreen';
import { PersonaScreen } from '../../features/chat/screens/PersonaScreen';
import { VoiceChatScreen } from '../../features/chat/screens/VoiceChatScreen';
import { ActiveCareScreen } from '../../features/home/screens/ActiveCareScreen';
import { HomeScreen } from '../../features/home/screens/HomeScreen';
import { QuotesScreen } from '../../features/home/screens/QuotesScreen';
import { VisualizationScreen } from '../../features/home/screens/VisualizationScreen';
import { BreathingTrainingScreen } from '../../features/healing/screens/BreathingTrainingScreen';
import { HealingHubScreen } from '../../features/healing/screens/HealingHubScreen';
import { MeditationGuideScreen } from '../../features/healing/screens/MeditationGuideScreen';
import { RelationshipThemeScreen } from '../../features/healing/screens/RelationshipThemeScreen';
import { SleepThemeScreen } from '../../features/healing/screens/SleepThemeScreen';
import { StudyThemeScreen } from '../../features/healing/screens/StudyThemeScreen';

import {
  ChatStackParamList,
  HealingStackParamList,
  HomeStackParamList,
  MainTabParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HealingStack = createNativeStackNavigator<HealingStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
      <HomeStack.Screen name="Quotes" component={QuotesScreen} options={{ title: '治愈语录' }} />
      <HomeStack.Screen
        name="ActiveCare"
        component={ActiveCareScreen}
        options={{ title: '主动关怀' }}
      />
      <HomeStack.Screen
        name="Visualization"
        component={VisualizationScreen}
        options={{ title: '数据可视化' }}
      />
    </HomeStack.Navigator>
  );
}

function HealingStackNavigator() {
  return (
    <HealingStack.Navigator>
      <HealingStack.Screen
        name="HealingHub"
        component={HealingHubScreen}
        options={{ title: '疗愈' }}
      />
      <HealingStack.Screen
        name="SleepTheme"
        component={SleepThemeScreen}
        options={{ title: '睡眠主题' }}
      />
      <HealingStack.Screen
        name="StudyTheme"
        component={StudyThemeScreen}
        options={{ title: '学业主题' }}
      />
      <HealingStack.Screen
        name="RelationshipTheme"
        component={RelationshipThemeScreen}
        options={{ title: '人际关系主题' }}
      />
      <HealingStack.Screen
        name="BreathingTraining"
        component={BreathingTrainingScreen}
        options={{ title: '呼吸训练' }}
      />
      <HealingStack.Screen
        name="MeditationGuide"
        component={MeditationGuideScreen}
        options={{ title: '冥想引导' }}
      />
    </HealingStack.Navigator>
  );
}

function ChatStackNavigator() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen
        name="ChatHome"
        component={ChatHomeScreen}
        options={{ title: 'AI聊天' }}
      />
      <ChatStack.Screen
        name="Persona"
        component={PersonaScreen}
        options={{ title: '自定义AI形象' }}
      />
      <ChatStack.Screen
        name="ChatHistory"
        component={ChatHistoryScreen}
        options={{ title: '历史对话' }}
      />
      <ChatStack.Screen
        name="VoiceChat"
        component={VoiceChatScreen}
        options={{ title: '语音沟通' }}
      />
    </ChatStack.Navigator>
  );
}

export function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: '首页' }} />
      <Tab.Screen
        name="HealingTab"
        component={HealingStackNavigator}
        options={{ title: '疗愈' }}
      />
      <Tab.Screen name="ChatTab" component={ChatStackNavigator} options={{ title: 'AI聊天' }} />
    </Tab.Navigator>
  );
}
