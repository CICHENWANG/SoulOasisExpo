import React from 'react';
import {
  type BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { CommunityScreen } from '../../features/community/screens/CommunityScreen';
import { SkinScreen } from '../../features/home/screens/SkinScreen';
import { MineScreen } from '../../features/mine/screens/MineScreen';
import { MoodCalendarScreen } from '../../features/date/screens/MoodCalendarScreen';

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

const iconHealing = require('../../../assets/bar/Frame.png');
const iconCommunity = require('../../../assets/bar/People Working Together.png');
const iconMine = require('../../../assets/bar/Group 32.png');

const TAB_ICON_SIZE = 24;
const TAB_ICON_WRAP_SIZE = 28;
const TAB_ICON_WRAP_SIZE_ACTIVE = 32;

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
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
      <HomeStack.Screen
        name="MoodCalendar"
        component={MoodCalendarScreen}
        options={{ title: '心情月历' }}
      />
      <HomeStack.Screen name="Skin" component={SkinScreen} options={{ title: '换肤' }} />
    </HomeStack.Navigator>
  );
}

function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  const activeRoute = state.routes[state.index];
  const focusedRouteName = getFocusedRouteNameFromRoute(activeRoute as any);
  const shouldHideTabBar =
    activeRoute.name === 'HealingTab' || focusedRouteName === 'MoodCalendar' || focusedRouteName === 'Skin';

  if (shouldHideTabBar) {
    return null;
  }

  return (
    <View style={[styles.tabBarOuter, { paddingBottom: Math.max(insets.bottom, 12) }]}
    >
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : typeof options.title === 'string'
                ? options.title
                : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const color = isFocused ? '#FFFFFF' : '#F29B1A';

          const renderIcon = () => {
            if (route.name === 'HealingTab') {
              return (
                <Image
                  source={iconHealing}
                  style={[styles.icon, { tintColor: color, transform: [{ scale: 1.06 }] }]}
                />
              );
            }
            if (route.name === 'CommunityTab') {
              return (
                <Image
                  source={iconCommunity}
                  style={[styles.icon, { tintColor: color, transform: [{ scale: 1.12 }] }]}
                />
              );
            }
            if (route.name === 'MineTab') {
              return (
                <Image
                  source={iconMine}
                  style={[styles.icon, { tintColor: color, transform: [{ scale: 0.96 }] }]}
                />
              );
            }
            return <Text style={[styles.homeIcon, { color }]}>{'⌂'}</Text>;
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabItem,
                isFocused && styles.tabItemActive,
                pressed && styles.tabItemPressed,
              ]}
            >
              <View style={[styles.tabIconWrap, isFocused && styles.tabIconWrapActive]}>
                {renderIcon()}
              </View>
              <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function HealingStackNavigator() {
  return (
    <HealingStack.Navigator screenOptions={{ headerShown: false }}>
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
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
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
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <AppTabBar {...props} />}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Home' }} />
      <Tab.Screen name="HealingTab" component={ChatStackNavigator} options={{ title: 'AI' }} />
      <Tab.Screen name="CommunityTab" component={CommunityScreen} options={{ title: 'Community' }} />
      <Tab.Screen name="MineTab" component={MineScreen} options={{ title: 'Mine' }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  tabBarInner: {
    width: '100%',
    backgroundColor: '#FDEFD9',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 22,
  },
  tabItemActive: {
    backgroundColor: '#F7C98A',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  tabItemPressed: {
    opacity: 0.85,
  },
  tabIconWrap: {
    height: TAB_ICON_WRAP_SIZE,
    width: TAB_ICON_WRAP_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    height: TAB_ICON_WRAP_SIZE_ACTIVE,
    width: TAB_ICON_WRAP_SIZE_ACTIVE,
  },
  icon: {
    width: TAB_ICON_SIZE,
    height: TAB_ICON_SIZE,
    resizeMode: 'contain',
  },
  homeIcon: {
    fontSize: TAB_ICON_SIZE - 2,
    fontWeight: '900',
    lineHeight: TAB_ICON_SIZE - 2,
  },
  tabLabel: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '800',
  },
});
