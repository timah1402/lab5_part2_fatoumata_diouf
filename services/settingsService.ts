// services/settingsService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

const SETTINGS_KEY_PREFIX = '@NotesApp:settings:';

// Default settings
const defaultSettings: AppSettings = {
  theme: 'light',
  sortBy: 'date',
  fontSize: 'medium'
};

// 3.1 Save Setting
export const saveSetting = async (key: keyof AppSettings, value: any): Promise<void> => {
  try {
    const storageKey = `${SETTINGS_KEY_PREFIX}${key}`;
    await AsyncStorage.setItem(storageKey, JSON.stringify(value));
    console.log(`Setting saved: ${key} = ${value}`);
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
};

// 3.2 Load Setting
export const getSetting = async <K extends keyof AppSettings>(
  key: K
): Promise<AppSettings[K]> => {
  try {
    const storageKey = `${SETTINGS_KEY_PREFIX}${key}`;
    const value = await AsyncStorage.getItem(storageKey);
    
    if (value !== null) {
      return JSON.parse(value) as AppSettings[K];
    }
    
    // Return default value if none is found
    return defaultSettings[key];
  } catch (error) {
    console.error('Error loading setting:', error);
    return defaultSettings[key];
  }
};

// Load all settings
export const getAllSettings = async (): Promise<AppSettings> => {
  try {
    const theme = await getSetting('theme');
    const sortBy = await getSetting('sortBy');
    const fontSize = await getSetting('fontSize');
    
    return {
      theme,
      sortBy,
      fontSize
    };
  } catch (error) {
    console.error('Error loading all settings:', error);
    return defaultSettings;
  }
};

// Save all settings at once
export const saveAllSettings = async (settings: Partial<AppSettings>): Promise<void> => {
  try {
    const promises = Object.entries(settings).map(([key, value]) => 
      saveSetting(key as keyof AppSettings, value)
    );
    await Promise.all(promises);
    console.log('All settings saved successfully');
  } catch (error) {
    console.error('Error saving all settings:', error);
    throw error;
  }
};

// Clear all settings (reset to defaults)
export const clearAllSettings = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const settingsKeys = keys.filter(key => key.startsWith(SETTINGS_KEY_PREFIX));
    await AsyncStorage.multiRemove(settingsKeys);
    console.log('All settings cleared');
  } catch (error) {
    console.error('Error clearing settings:', error);
    throw error;
  }
};

// 3.3 Theme helper functions
export const getThemeColors = (theme: 'light' | 'dark') => {
  const themes = {
    light: {
      background: '#ffffff',
      text: '#000000',
      primary: '#007AFF',
      secondary: '#F2F2F7',
      border: '#C6C6C8',
      danger: '#FF3B30',
      success: '#34C759'
    },
    dark: {
      background: '#000000',
      text: '#ffffff',
      primary: '#0A84FF',
      secondary: '#1C1C1E',
      border: '#38383A',
      danger: '#FF453A',
      success: '#32D74B'
    }
  };
  
  return themes[theme];
};

// Font size helper
export const getFontSizes = (size: 'small' | 'medium' | 'large') => {
  const sizes = {
    small: {
      body: 14,
      title: 18,
      header: 22
    },
    medium: {
      body: 16,
      title: 20,
      header: 24
    },
    large: {
      body: 18,
      title: 22,
      header: 26
    }
  };
  
  return sizes[size];
};