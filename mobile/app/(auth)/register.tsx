import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const colorSet = Colors[theme];
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // 1. Register the account
  const res = await fetch('https://taskmanagermobile.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Registration failed');
      }

      // 2. Immediately log in
  const loginRes = await fetch('https://taskmanagermobile.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const errData = await loginRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Login after registration failed');
      }

      const loginData = await loginRes.json();
      // Save token if your app uses authentication
      // e.g., await SecureStore.setItemAsync('authToken', loginData.token);

      Alert.alert('Welcome!', 'Your account has been created and you are now logged in.');

      // 3. Navigate to your main screen
      router.replace('/(tabs)/tasksScreen');

      // 4. Clear form fields
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorSet.background }]}>
      <Text style={[styles.title, { color: colorSet.text }]}>Create Account</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={colorSet.icon}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { borderColor: colorSet.border, color: colorSet.text }]}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={colorSet.icon}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { borderColor: colorSet.border, color: colorSet.text }]}
      />

      <TextInput
        placeholder="Confirm Password"
        placeholderTextColor={colorSet.icon}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        style={[styles.input, { borderColor: colorSet.border, color: colorSet.text }]}
      />

      {error && <Text style={[styles.error, { color: 'red' }]}>{error}</Text>}

      <Button
        title={loading ? 'Creating...' : 'Create Account'}
        onPress={handleRegister}
        disabled={loading}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 32,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  error: {
    marginBottom: 12,
    textAlign: 'center',
  },
});
