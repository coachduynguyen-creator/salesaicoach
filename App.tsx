import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { KnowledgeProvider } from './src/contexts/KnowledgeContext';
import { BusinessProvider } from './src/contexts/BusinessContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AlertProvider } from './src/contexts/AlertContext';
import { loadApiKeys } from './src/services/storageService';
import { setApiKeys } from './src/services/aiService';
import { DEFAULT_CLAUDE_KEY, DEFAULT_OPENAI_KEY } from './src/config/defaultKeys';

const ONBOARDING_KEY = '@salescoach_onboarding_done';

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    loadApiKeys().then(({ claudeKey, openaiKey }) => {
      // Ưu tiên key user đã lưu, fallback sang key nhúng sẵn
      const finalClaude = claudeKey || DEFAULT_CLAUDE_KEY;
      const finalOpenai = openaiKey || DEFAULT_OPENAI_KEY;
      setApiKeys(finalOpenai, finalClaude);
    });
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setShowOnboarding(val !== 'true');
    });
  }, []);

  const handleOnboardingComplete = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  };

  if (showOnboarding === null) return null;

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AlertProvider>
          <KnowledgeProvider>
            <BusinessProvider>
              <NavigationContainer>
                <StatusBar style="dark" />
                <AppNavigator />
              </NavigationContainer>
            </BusinessProvider>
          </KnowledgeProvider>
        </AlertProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
