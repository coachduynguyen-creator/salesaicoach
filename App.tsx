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
import { setSyncContext } from './src/services/storageService';
import { setAISyncContext } from './src/services/aiService';
import { migrateLocalToCloud } from './src/services/syncService';
import ErrorBoundary from './src/components/ErrorBoundary';
import OfflineBanner from './src/components/OfflineBanner';
import FloatingBugReport from './src/components/FloatingBugReport';
import { initErrorTracking } from './src/services/errorTrackingService';
import FirstExperienceScreen, { shouldShowFirstExperience } from './src/screens/FirstExperienceScreen';

const ONBOARDING_KEY = '@salescoach_onboarding_done';

function AppContent() {
  const { isLoading, isAuthenticated, profile, team } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [showFirstExp, setShowFirstExp] = useState(false);

  useEffect(() => {
    // API keys now live server-side only (Edge Function)
    initErrorTracking();
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setShowOnboarding(val !== 'true');
    });
  }, []);

  // Check first experience
  useEffect(() => {
    if (profile?.id && team?.id) {
      shouldShowFirstExperience().then(show => setShowFirstExp(show));
    }
  }, [profile?.id, team?.id]);

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
    // Hỏi quyền notification sau khi onboarding xong
    import('./src/services/notificationService')
      .then(({ enableDailyReminders }) => enableDailyReminders())
      .catch(() => {});
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

  // Kiểm tra first experience sau khi có team
  if (showFirstExp) {
    return <FirstExperienceScreen onComplete={() => setShowFirstExp(false)} />;
  }

  return (
    <KnowledgeProvider>
      <BusinessProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <OfflineBanner />
          <AppNavigator />
          <FloatingBugReport />
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
