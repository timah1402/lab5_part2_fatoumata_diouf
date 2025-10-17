// services/authService.ts
import * as SecureStore from 'expo-secure-store';
import { Credentials } from '../types';

const SECURE_KEY_PREFIX = 'NotesApp_';

// 4.1 Save Credential
export const saveCredential = async (key: keyof Credentials, value: string): Promise<void> => {
  try {
    const secureKey = `${SECURE_KEY_PREFIX}${key}`;
    await SecureStore.setItemAsync(secureKey, value);
    console.log(`Credential saved: ${key}`);
  } catch (error) {
    console.error('Error saving credential:', error);
    throw error;
  }
};

// 4.2 Load Credential
export const getCredential = async (key: keyof Credentials): Promise<string | null> => {
  try {
    const secureKey = `${SECURE_KEY_PREFIX}${key}`;
    const value = await SecureStore.getItemAsync(secureKey);
    return value;
  } catch (error) {
    console.error('Error loading credential:', error);
    return null;
  }
};

// 4.3 App Unlock Functions
export const setAppPin = async (pin: string): Promise<void> => {
  if (pin.length < 4) {
    throw new Error('PIN must be at least 4 digits');
  }
  await saveCredential('pin', pin);
};

export const verifyPin = async (inputPin: string): Promise<boolean> => {
  try {
    const storedPin = await getCredential('pin');
    return storedPin === inputPin;
  } catch (error) {
    console.error('Error verifying PIN:', error);
    return false;
  }
};

export const isPinSet = async (): Promise<boolean> => {
  const pin = await getCredential('pin');
  return pin !== null && pin !== '';
};

// API Token functions
export const saveApiToken = async (token: string): Promise<void> => {
  await saveCredential('apiToken', token);
};

export const getApiToken = async (): Promise<string | null> => {
  return await getCredential('apiToken');
};

export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getApiToken();
  return token !== null && token !== '';
};

// User ID functions
export const saveUserId = async (userId: string): Promise<void> => {
  await saveCredential('userId', userId);
};

export const getUserId = async (): Promise<string | null> => {
  return await getCredential('userId');
};

// 4.4 Clear Credential
export const clearCredential = async (key: keyof Credentials): Promise<void> => {
  try {
    const secureKey = `${SECURE_KEY_PREFIX}${key}`;
    await SecureStore.deleteItemAsync(secureKey);
    console.log(`Credential cleared: ${key}`);
  } catch (error) {
    console.error('Error clearing credential:', error);
    throw error;
  }
};

// Clear all credentials (sign out)
export const clearAllCredentials = async (): Promise<void> => {
  try {
    await clearCredential('pin');
    await clearCredential('apiToken');
    await clearCredential('userId');
    console.log('All credentials cleared');
  } catch (error) {
    console.error('Error clearing all credentials:', error);
    throw error;
  }
};

// Check if app is locked
export const isAppLocked = async (): Promise<boolean> => {
  const pinSet = await isPinSet();
  const authenticated = await isAuthenticated();
  return pinSet || !authenticated;
};

// Complete sign out
export const signOut = async (): Promise<void> => {
  await clearAllCredentials();
  console.log('User signed out successfully');
};