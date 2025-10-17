// app/(tabs)/settings.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../_layout';
import { 
  saveSetting, 
  getSetting, 
  clearAllSettings,
  getFontSizes
} from '../../services/settingsService';
import { 
  isPinSet, 
  clearAllCredentials,
  setAppPin 
} from '../../services/authService';
import { AppSettings } from '../../types';

export default function SettingsScreen() {
  const { colors, theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === 'dark');
  const [sortBy, setSortBy] = useState<AppSettings['sortBy']>('date');
  const [fontSize, setFontSize] = useState<AppSettings['fontSize']>('medium');
  const [hasPinSet, setHasPinSet] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPinStatus();
  }, []);

  const loadSettings = async () => {
    const savedSortBy = await getSetting('sortBy');
    const savedFontSize = await getSetting('fontSize');
    setSortBy(savedSortBy);
    setFontSize(savedFontSize);
  };

  const checkPinStatus = async () => {
    const pinSet = await isPinSet();
    setHasPinSet(pinSet);
  };

  const handleThemeToggle = async (value: boolean) => {
    const newTheme = value ? 'dark' : 'light';
    setIsDarkMode(value);
    setTheme(newTheme);
    await saveSetting('theme', newTheme);
  };

  const handleSortByChange = async (value: AppSettings['sortBy']) => {
    setSortBy(value);
    await saveSetting('sortBy', value);
  };

  const handleFontSizeChange = async (value: AppSettings['fontSize']) => {
    setFontSize(value);
    await saveSetting('fontSize', value);
  };

  const handleResetPin = () => {
    Alert.alert(
      'Reset PIN',
      'This will remove your current PIN. You will need to set a new one.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearAllCredentials();
            setHasPinSet(false);
            Alert.alert('Success', 'PIN has been reset');
          },
        },
      ]
    );
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will reset all settings and remove your PIN. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllSettings();
            await clearAllCredentials();
            Alert.alert('Success', 'All data has been cleared');
            // Reset to default values
            setIsDarkMode(false);
            setTheme('light');
            setSortBy('date');
            setFontSize('medium');
            setHasPinSet(false);
          },
        },
      ]
    );
  };

  const fontSizes = getFontSizes(fontSize);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Appearance Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Appearance
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.secondary }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="moon" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={handleThemeToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={[styles.settingItem, { backgroundColor: colors.secondary }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="text" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Font Size
            </Text>
          </View>
          <View style={styles.buttonGroup}>
            {(['small', 'medium', 'large'] as const).map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.button,
                  fontSize === size && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleFontSizeChange(size)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: fontSize === size ? '#fff' : colors.text },
                  ]}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Notes Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Notes
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.secondary }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="filter" size={24} color={colors.text} />
            <Text style={[styles.settingText, { color: colors.text }]}>
              Sort By
            </Text>
          </View>
          <View style={styles.buttonGroup}>
            {(['date', 'title', 'category'] as const).map((sort) => (
              <TouchableOpacity
                key={sort}
                style={[
                  styles.button,
                  sortBy === sort && { backgroundColor: colors.primary },
                ]}
                onPress={() => handleSortByChange(sort)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    { color: sortBy === sort ? '#fff' : colors.text },
                  ]}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Security Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Security
        </Text>
        
        <TouchableOpacity
          style={[styles.settingItem, { backgroundColor: colors.secondary }]}
          onPress={handleResetPin}
          disabled={!hasPinSet}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="lock-closed" size={24} color={colors.text} />
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                App PIN
              </Text>
              <Text style={[styles.settingSubtext, { color: colors.text + '80' }]}>
                {hasPinSet ? 'PIN is set' : 'No PIN set'}
              </Text>
            </View>
          </View>
          {hasPinSet && (
            <Text style={[styles.resetText, { color: colors.danger }]}>
              Reset
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Data Management Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Data Management
        </Text>
        
        <TouchableOpacity
          style={[styles.settingItem, styles.dangerItem, { backgroundColor: colors.secondary }]}
          onPress={handleClearData}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="trash" size={24} color={colors.danger} />
            <Text style={[styles.settingText, { color: colors.danger }]}>
              Clear All Data
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          About
        </Text>
        
        <View style={[styles.settingItem, { backgroundColor: colors.secondary }]}>
          <View style={styles.settingLeft}>
            <Ionicons name="information-circle" size={24} color={colors.text} />
            <View>
              <Text style={[styles.settingText, { color: colors.text }]}>
                Notes App
              </Text>
              <Text style={[styles.settingSubtext, { color: colors.text + '80' }]}>
                Version 1.0.0
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
    marginBottom: 10,
    marginTop: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 10,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 15,
  },
  settingSubtext: {
    fontSize: 12,
    marginLeft: 15,
    marginTop: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
});