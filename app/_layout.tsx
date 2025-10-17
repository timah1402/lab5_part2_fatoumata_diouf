// app/_layout.tsx
import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { PinLock } from '../components/PinLock';
import { initDb } from '../services/dbService';
import { getSetting, getThemeColors, saveSetting } from '../services/settingsService';
import { isAppLocked } from '../services/authService';

// Create Theme Context
interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: ReturnType<typeof getThemeColors>;
  setTheme: (theme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initDb();
      console.log('Database initialized');
      
      // Load theme setting
      const savedTheme = await getSetting('theme');
      setTheme(savedTheme);
      console.log('Theme loaded:', savedTheme);
      
      // Check if app is locked
      const locked = await isAppLocked();
      setIsLocked(locked);
      console.log('App locked status:', locked);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
    }
  };

  const handleUnlock = () => {
    setIsLocked(false);
  };

  const handleSetTheme = async (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    await saveSetting('theme', newTheme);
  };

  const colors = getThemeColors(theme);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isLocked) {
    return <PinLock onUnlock={handleUnlock} />;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme: handleSetTheme }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});