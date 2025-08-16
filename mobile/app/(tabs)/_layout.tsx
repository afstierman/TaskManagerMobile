import React from 'react';
import { View, Text, StyleSheet, Platform, SafeAreaView } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme, ThemeProvider } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { TasksRefreshProvider } from '@/context/TasksRefreshContext';

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 100, // increase height to create more vertical space
    justifyContent: 'flex-end', // align text at the bottom of the header
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 20, // more top padding on iOS to clear notch
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  headerText: {
    fontSize: 24, // make text bigger if you want
    fontWeight: 'bold',
    marginBottom: 10, // give some space below text
  },
});


let TabBarBackground: React.ComponentType<any> | undefined;
try {
  TabBarBackground = require('@/components/ui/TabBarBackground').default;
} catch {
  TabBarBackground = undefined;
}

function AppHeader() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.header, { backgroundColor: Colors[theme].background }]}>
      <Text style={[styles.headerText, { color: Colors[theme].text }]}>My Tasks App</Text>
    </SafeAreaView>
  );
}

export default function RootLayout() {
  return (
    <View style={styles.container}>
      <AppHeader />
      <TasksRefreshProvider>
        <Tabs
          screenOptions={() => {
            const { theme } = useTheme();
            return {
              tabBarActiveTintColor: Colors[theme].tabIconSelected,
              tabBarInactiveTintColor: Colors[theme].tabIconDefault,
              headerShown: false,
              tabBarButton: HapticTab,
              tabBarBackground: TabBarBackground ? () => <TabBarBackground /> : undefined,
              tabBarStyle: [
                Platform.select({
                  ios: { position: 'absolute' },
                  default: {},
                }),
                {
                  backgroundColor: Colors[theme].background,
                  borderTopColor: Colors[theme].border,
                  borderTopWidth: 1,
                  elevation: 4,
                  shadowColor: '#000',
                  shadowOpacity: 0.1,
                  shadowOffset: { width: 0, height: -1 },
                  shadowRadius: 5,
                },
              ],
            };
          }}
        >
          <Tabs.Screen
            name="tasksScreen"
            options={{
              title: 'Tasks',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="checkmark.circle.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="addTaskScreen"
            options={{
              title: 'Add Task',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />, 
            }}
          />
          <Tabs.Screen
            name="settingsScreen"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
            }}
          />
        </Tabs>
      </TasksRefreshProvider>
    </View>
  );
}

