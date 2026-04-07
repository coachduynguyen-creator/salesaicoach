import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { useTheme } from '../contexts/ThemeContext';

import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ResultScreen from '../screens/ResultScreen';
import TrainingCenterScreen from '../screens/TrainingCenterScreen';
import LessonDetailScreen from '../screens/LessonDetailScreen';
import AiCoachScreen from '../screens/AiCoachScreen';
import ConversationListScreen from '../screens/ConversationListScreen';
import SessionDetailScreen from '../screens/SessionDetailScreen';
import BusinessProfileScreen from '../screens/BusinessProfileScreen';
import TeamDashboardScreen from '../screens/TeamDashboardScreen';
import CustomerListScreen from '../screens/CustomerListScreen';
import CustomerDetailScreen from '../screens/CustomerDetailScreen';
import AboutScreen from '../screens/AboutScreen';
import TeamManageScreen from '../screens/TeamManageScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import PaywallScreen from '../screens/PaywallScreen';
import ScriptGeneratorScreen from '../screens/ScriptGeneratorScreen';
import AIToolsScreen from '../screens/AIToolsScreen';
import GoalSettingScreen from '../screens/GoalSettingScreen';
import CommissionScreen from '../screens/CommissionScreen';

export type RootTabParamList = {
  TrangChu: undefined;
  GhiAm: undefined;
  KhachHang: undefined;
  AiCoach: undefined;
  DaoTao: undefined;
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
  BusinessProfile: undefined;
  TeamDashboard: undefined;
  CustomerDetail: { customerId: string };
  About: undefined;
  TeamManage: undefined;
  AdminDashboard: undefined;
  Paywall: undefined;
  ScriptGenerator: undefined;
  AITools: { tool: string };
  GoalSetting: undefined;
  Commission: undefined;
  LichSu: undefined;
  AiCoachChat: {
    conversationId: string;
    title: string;
    customerId?: string;
  };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createStackNavigator<RootStackParamList>();

function MainTabs() {
  const { theme, isDark } = useTheme();
  const bgCard = isDark ? '#0D1117' : COLORS.CARD;
  const bgBorder = isDark ? '#21262D' : COLORS.DIVIDER;
  const inactiveColor = isDark ? '#B0BAC5' : COLORS.TEXT_LIGHT;
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.PRIMARY,
        tabBarInactiveTintColor: inactiveColor,
        tabBarStyle: {
          backgroundColor: bgCard,
          borderTopColor: bgBorder,
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
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'GhiAm') {
            iconName = focused ? 'radio' : 'radio-outline';
          } else if (route.name === 'KhachHang') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'AiCoach') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'DaoTao') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'CaiDat') {
            iconName = focused ? 'person-circle' : 'person-circle-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="TrangChu"
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang Chủ', tabBarAccessibilityLabel: 'Trang chủ' }}
      />
      <Tab.Screen
        name="GhiAm"
        component={RecordScreen}
        options={{ tabBarLabel: 'Ghi Âm', tabBarAccessibilityLabel: 'Ghi âm buổi tư vấn' }}
      />
      <Tab.Screen
        name="KhachHang"
        component={CustomerListScreen}
        options={{ tabBarLabel: 'Khách Hàng', tabBarAccessibilityLabel: 'Danh sách khách hàng' }}
      />
      <Tab.Screen
        name="AiCoach"
        component={ConversationListScreen}
        options={{ tabBarLabel: 'AI Coach', tabBarAccessibilityLabel: 'AI Coach chat' }}
      />
      <Tab.Screen
        name="DaoTao"
        component={TrainingCenterScreen}
        options={{ tabBarLabel: 'Đào Tạo', tabBarAccessibilityLabel: 'Đào tạo bài học' }}
      />
      <Tab.Screen
        name="CaiDat"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Cài Đặt', tabBarAccessibilityLabel: 'Cài đặt tài khoản' }}
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
      <Stack.Screen
        name="BusinessProfile"
        component={BusinessProfileScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="TeamDashboard"
        component={TeamDashboardScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="AiCoachChat"
        component={AiCoachScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={CustomerDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="TeamManage"
        component={TeamManageScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen name="ScriptGenerator" component={ScriptGeneratorScreen} options={{ presentation: 'card' }} />
      <Stack.Screen name="AITools" component={AIToolsScreen} options={{ presentation: 'card' }} />
      <Stack.Screen name="GoalSetting" component={GoalSettingScreen} options={{ presentation: 'card' }} />
      <Stack.Screen name="Commission" component={CommissionScreen} options={{ presentation: 'card' }} />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="LichSu"
        component={HistoryScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}
