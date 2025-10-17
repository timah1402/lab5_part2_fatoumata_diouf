// components/PinLock.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration
} from 'react-native';
import { isPinSet, verifyPin, setAppPin } from '../services/authService';

interface PinLockProps {
  onUnlock: () => void;
}

export const PinLock: React.FC<PinLockProps> = ({ onUnlock }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    checkPinStatus();
  }, []);

  const checkPinStatus = async () => {
    const hasPinSet = await isPinSet();
    setIsSettingPin(!hasPinSet);
  };

  const handleNumberPress = (num: string) => {
    const currentPin = isConfirming ? confirmPin : pin;
    if (currentPin.length < 6) {
      if (isConfirming) {
        setConfirmPin(currentPin + num);
      } else {
        setPin(pin + num);
      }
    }
  };

  const handleDelete = () => {
    if (isConfirming) {
      setConfirmPin(confirmPin.slice(0, -1));
    } else {
      setPin(pin.slice(0, -1));
    }
  };

  const handleSubmit = async () => {
    if (pin.length < 4) {
      Alert.alert('Error', 'PIN must be at least 4 digits');
      return;
    }

    if (isSettingPin) {
      if (!isConfirming) {
        setIsConfirming(true);
        return;
      }

      if (pin !== confirmPin) {
        Alert.alert('Error', 'PINs do not match');
        Vibration.vibrate(500);
        setPin('');
        setConfirmPin('');
        setIsConfirming(false);
        return;
      }

      try {
        await setAppPin(pin);
        Alert.alert('Success', 'PIN has been set');
        onUnlock();
      } catch (error) {
        Alert.alert('Error', 'Failed to set PIN');
      }
    } else {
      const isValid = await verifyPin(pin);
      if (isValid) {
        onUnlock();
      } else {
        Vibration.vibrate(500);
        setAttempts(attempts + 1);
        setPin('');
        
        if (attempts >= 2) {
          Alert.alert('Error', 'Too many failed attempts. Please try again later.');
        } else {
          Alert.alert('Error', 'Incorrect PIN');
        }
      }
    }
  };

  const renderPinDots = () => {
    const currentPin = isConfirming ? confirmPin : pin;
    const dots = [];
    for (let i = 0; i < 6; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.pinDot,
            i < currentPin.length && styles.pinDotFilled
          ]}
        />
      );
    }
    return dots;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {isSettingPin 
          ? (isConfirming ? 'Confirm Your PIN' : 'Set Your PIN')
          : 'Enter Your PIN'}
      </Text>
      
      <View style={styles.pinDotsContainer}>
        {renderPinDots()}
      </View>

      <View style={styles.keypad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={styles.key}
            onPress={() => handleNumberPress(num.toString())}
          >
            <Text style={styles.keyText}>{num}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity
          style={styles.key}
          onPress={handleDelete}
        >
          <Text style={styles.keyText}>⌫</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.key}
          onPress={() => handleNumberPress('0')}
        >
          <Text style={styles.keyText}>0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.key, styles.submitKey]}
          onPress={handleSubmit}
          disabled={pin.length < 4}
        >
          <Text style={styles.keyText}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  pinDotsContainer: {
    flexDirection: 'row',
    marginBottom: 50,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginHorizontal: 10,
  },
  pinDotFilled: {
    backgroundColor: '#007AFF',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
  },
  key: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    borderRadius: 40,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitKey: {
    backgroundColor: '#007AFF',
  },
  keyText: {
    fontSize: 24,
    color: '#333',
  },
});