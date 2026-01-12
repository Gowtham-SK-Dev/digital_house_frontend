/**
 * OTP Verification Screen
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { apiService } from '@services/api.service';
import { useAuthStore } from '@store/index';
import { storageService } from '@services/storage.service';

interface Props {
  navigation: any;
  route: any;
}

export default function OTPVerificationScreen({ navigation, route }: Props) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(300);
  const [showForm, setShowForm] = useState(false);

  const setUser = useAuthStore((state) => state.setUser);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);
  const setAuthToken = useAuthStore((state) => state.setAuthToken);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter 6-digit OTP');
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.verifyOTP(
        email,
        otp,
        firstName,
        lastName
      );

      if (response.success) {
        const { user, tokens } = response.data;

        // Save to store and storage
        setUser(user);
        setAuthenticated(true);
        setAuthToken(tokens.accessToken);

        await storageService.setAuthToken(tokens.accessToken);
        await storageService.setCurrentUser(user);

        Alert.alert('Success', 'Welcome to Digital House!');
        navigation.replace('AppStack');
      } else {
        Alert.alert('Error', response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await apiService.sendOTP(email);
      Alert.alert('Success', 'OTP sent again to your email');
      setTimer(300);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to resend OTP');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {email}
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>OTP Code</Text>
          <TextInput
            style={styles.input}
            placeholder="000000"
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={6}
            editable={!isLoading}
          />

          {!showForm ? (
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleVerifyOTP}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify & Continue</Text>
              )}
            </TouchableOpacity>
          ) : (
            <>
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstName}
                onChangeText={setFirstName}
              />

              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastName}
                onChangeText={setLastName}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleVerifyOTP}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Complete Profile</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={styles.resendContainer}>
            <Text style={styles.timerText}>
              Expires in {formatTime(timer)}
            </Text>
            {timer === 0 ? (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={styles.resendLink}>Resend OTP</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 12,
    color: '#999',
  },
  resendLink: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '600',
  },
});
