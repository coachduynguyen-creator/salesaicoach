import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import TeamSetupScreen from './src/screens/TeamSetupScreen';
import { KnowledgeProvider } from './src/contexts/KnowledgeContext';
import { BusinessProvider } from './src/contexts/BusinessContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AlertProvider } from './src/contexts/AlertContext';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { loadApiKeys, setSyncContext } from './src/services/storageService';
import { setApiKeys, setAISyncContext } from './src/services/aiService';
import { DEFAULT_CLAUDE_KEY, DEFAULT_OPENAI_KEY } from './src/config/defaultKeys';
import { migrateLocalToCloud } from './src/services/syncService';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';

const ONBOARDING_KEY = '@salescoach_onboarding_done';

function AppContent() {
  const { isLoading, isAuthenticated, profile, team } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    loadApiKeys().then(({ claudeKey, openaiKey }) => {
      const finalClaude = claudeKey || DEFAULT_CLAUDE_KEY;
      const finalOpenai = openaiKey || DEFAULT_OPENAI_KEY;
      setApiKeys(finalOpenai, finalClaude);
    });
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setShowOnboarding(val !== 'true');
    });
  }, []);

  // Set sync context + auto-migrate khi có team
  useEffect(() => {
    if (profile?.id && team?.id) {
      setSyncContext(profile.id, team.id);
      setAISyncContext(profile.id, team.id);
      migrateLocalToCloud(profile.id, team.id);
    } else {
      setSyncContext(null, null);
      setAISyncContext(null, null);
    }
  }, [profile?.id, team?.id]);

  const handleOnboardingComplete = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding === null || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F3' }}>
        <ActivityIndicator size="large" color="#1A7F64" />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  if (!team) {
    return <TeamSetupScreen />;
  }

  return (
    <KnowledgeProvider>
      <BusinessProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <OfflineBanner />
          <AppNavigator />
        </NavigationContainer>
      </BusinessProvider>
    </KnowledgeProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <ThemeProvider>
          <AlertProvider>
            <AuthProvider>
              <StatusBar style="dark" />
              <AppContent />
            </AuthProvider>
          </AlertProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
