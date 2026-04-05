import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResultScreen from '../screens/ResultScreen';
import TrainingCenterScreen from '../screens/TrainingCenterScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import AiCoachScreen from '../screens/AiCoachScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';

export type RootTabParamList = {
  TrangChu: undefined;
  GhiAm: undefined;
  AiCoach: undefined;
  DaoTao: undefined;
  LichSu: undefined;
  CaiDat: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  ResultScreen: {
    audioUri?: string | null;
    manualMode?: boolean;
    duration?: number;
    customerName?: string;
    companyName?: string;
  };
  LessonDetail: {
    lesson: any;
  };
  SessionDetail: {
    session: any;
  };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.TEXT_LIGHT,
        tabBarStyle: {
          backgroundColor: COLORS.CARD,
          borderTopColor: COLORS.DIVIDER,
          borderTopWidth: 0.5,
          height: 70,
          paddingBottom: 12,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color, focused }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'TrangChu') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'GhiAm') {
            iconName = focused ? 'mic' : 'mic-outline';
          } else if (route.name === 'AiCoach') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'DaoTao') {
            iconName = focused ? 'book' : 'book-outline';
          } else if (route.name === 'LichSu') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'CaiDat') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="TrangChu"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang Chủ' }}
      />
      <Tab.Screen
        name="GhiAm"
        component={RecordScreen}
        options={{ tabBarLabel: 'Ghi Âm' }}
      />
      <Tab.Screen
        name="AiCoach"
        component={AiCoachScreen}
        options={{
          tabBarLabel: 'AI Coach',
          tabBarBadge: undefined,
        }}
      />
      <Tab.Screen
        name="DaoTao"
        component={TrainingCenterScreen}
        options={{ tabBarLabel: 'Đào Tạo' }}
      />
      <Tab.Screen
        name="LichSu"
        component={HistoryScreen}
        options={{ tabBarLabel: 'Lịch Sử' }}
      />
      <Tab.Screen
        name="CaiDat"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Cài Đặt' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="ResultScreen"
        component={ResultScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="LessonDetail"
        component={LessonDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionDetailScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}
