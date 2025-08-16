import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, useColorScheme } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const colorScheme = useColorScheme();
  const colorSet = Colors[colorScheme ?? 'light'];

  // Define some fallback colors for borders, placeholders, and errors
  const borderColor = colorScheme === 'dark' ? '#444' : '#ccc';
  const placeholderColor = colorScheme === 'dark' ? '#888' : '#999';
  const errorColor = '#ff4d4f'; // a nice red

  const handleLogin = async () => {
    setError(null);
    try {
      await login(email, password);
    } catch (e) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colorSet.background }]}>
      <TextInput
        placeholder="Email"
        placeholderTextColor={placeholderColor}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[styles.input, { borderColor, color: colorSet.text }]}
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor={placeholderColor}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, { borderColor, color: colorSet.text }]}
      />
      {error && <Text style={[styles.error, { color: errorColor }]}>{error}</Text>}
      <Button title={isLoading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={isLoading} />
      <View style={{ height: 16 }} />
      <Button title="Create New Account" onPress={() => router.push('/(auth)/register')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'center', 
    padding: 20,
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
  },
});
