import React from 'react';
import { StyleSheet, Switch } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function SettingsScreen() {
  const { theme, setTheme } = useTheme();
  const { logout, isLoading } = useAuth();
  const colorSet = Colors[theme];
  const isDarkMode = theme === 'dark';
  const toggleSwitch = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Settings</ThemedText>
      <ThemedView style={styles.switchContainer}>
        <ThemedText style={{ marginRight: 10 }}>{isDarkMode ? 'Dark Mode' : 'Light Mode'}</ThemedText>
        <Switch
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={isDarkMode ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={isDarkMode}
        />
      </ThemedView>
      <ThemedView style={{ marginTop: 40 }}>
        <ThemedText
          onPress={logout}
          style={{ color: colorSet.tint, fontWeight: 'bold', fontSize: 18, textAlign: 'center', padding: 12, borderRadius: 6, borderWidth: 1, borderColor: colorSet.tint, opacity: isLoading ? 0.5 : 1 }}
        >
          {isLoading ? 'Logging out...' : 'Logout'}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, marginBottom: 40 },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
