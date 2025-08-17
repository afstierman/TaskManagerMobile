import React, { useState } from 'react';
import { StyleSheet, TextInput, Button, Alert, View, TouchableOpacity } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { useTasksRefresh } from '@/context/TasksRefreshContext';

export default function AddTaskScreen() {
  const { theme } = useTheme();
  const { userToken } = useAuth();
  const { triggerRefresh } = useTasksRefresh();
  const colorSet = Colors[theme];
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Array<{ time: Date }>>([]);
  const [showNotifPicker, setShowNotifPicker] = useState(false);
  const [notifPickerDate, setNotifPickerDate] = useState<Date | null>(null);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Title is required');
      return;
    }
    // Require dueDate if notifications are present
    if (notifications.length > 0 && !dueDate) {
      Alert.alert('A due date is required when notifications are present.');
      return;
    }
    setLoading(true);
    try {
  const res = await fetch('https://taskmanagermobile.onrender.com/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ title, description, dueDate, notifications }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to add task');
      }
      setTitle('');
      setDescription('');
      setNotifications([]);
      setDueDate(null);
      Alert.alert('Task added!');
      triggerRefresh();
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // Notification helpers
  const addNotificationTime = (date: Date) => {
    setNotifications((prev) => {
      if (prev.some((n) => n.time.getTime() === date.getTime())) return prev;
      return [...prev, { time: date }];
    });
  };
  const removeNotificationTime = (date: Date) => {
    setNotifications((prev) => prev.filter((n) => n.time.getTime() !== date.getTime()));
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Add a New Task</ThemedText>
      <TextInput
        style={[styles.input, { color: colorSet.text, borderColor: colorSet.border }]}
        placeholder="Title"
        placeholderTextColor={colorSet.icon}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, { color: colorSet.text, borderColor: colorSet.border, height: 80 }]}
        placeholder="Description (optional)"
        placeholderTextColor={colorSet.icon}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <ThemedText style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginTop: 12 }}>Due Date</ThemedText>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={{
          borderWidth: 1,
          borderRadius: 6,
          padding: 8,
          marginBottom: 8,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          borderColor: colorSet.border,
        }}
      >
        <ThemedText style={{ fontSize: 16 }}>
          {dueDate ? dueDate.toLocaleString() : 'Set date & time'}
        </ThemedText>
      </TouchableOpacity>
      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="datetime"
        date={dueDate || new Date()}
        onConfirm={(selectedDate) => {
          setShowDatePicker(false);
          setDueDate(selectedDate);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
      <ThemedText style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginTop: 12 }}>Notifications</ThemedText>
      <View style={{ marginBottom: 8 }}>
        {notifications.length === 0 && (
          <ThemedText style={{ fontSize: 13, color: colorSet.icon }}>No notifications set. Add one below!</ThemedText>
        )}
        {notifications.map((n, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <ThemedText style={{ fontSize: 13, marginRight: 8 }}>{
              n.time ? (typeof n.time === 'string' ? new Date(n.time).toLocaleString() : n.time.toLocaleString()) : ''
            }</ThemedText>
            <TouchableOpacity onPress={() => removeNotificationTime(typeof n.time === 'string' ? new Date(n.time) : n.time)}>
              <ThemedText style={{ color: theme === 'dark' ? '#ff4d4d' : '#d32f2f' }}>Remove</ThemedText>
            </TouchableOpacity>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          {['Due', '1hr', '1d', 'Custom'].map((label, idx) => {
            let onPress;
            if (label === 'Due') onPress = () => { if (dueDate) addNotificationTime(new Date(dueDate)); };
            if (label === '1hr') onPress = () => { if (dueDate) { const oneHourBefore = new Date(dueDate.getTime() - 60 * 60 * 1000); addNotificationTime(oneHourBefore); } };
            if (label === '1d') onPress = () => { if (dueDate) { const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000); addNotificationTime(oneDayBefore); } };
            if (label === 'Custom') onPress = () => setShowNotifPicker(true);
            const isDisabled = label !== 'Custom' && !dueDate;
            const bgColor = theme === 'dark' ? '#222' : colorSet.tint;
            return (
              <TouchableOpacity
                key={label}
                style={{ flex: 1, marginRight: idx < 3 ? 4 : 0, padding: 6, backgroundColor: bgColor, borderRadius: 6, alignItems: 'center' }}
                onPress={onPress}
                disabled={isDisabled}
              >
                <ThemedText style={{ color: '#fff', fontSize: 13 }}>{label}</ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <DateTimePickerModal
        isVisible={showNotifPicker}
        mode="datetime"
        date={notifPickerDate || new Date()}
        onConfirm={(selectedDate) => {
          setShowNotifPicker(false);
          setNotifPickerDate(null);
          addNotificationTime(selectedDate);
        }}
        onCancel={() => {
          setShowNotifPicker(false);
          setNotifPickerDate(null);
        }}
      />
      <TouchableOpacity
        style={{
          marginTop: 12,
          padding: 12,
          backgroundColor: theme === 'dark' ? '#222' : colorSet.tint,
          borderRadius: 6,
          alignItems: 'center',
          opacity: loading ? 0.7 : 1,
        }}
        onPress={handleAddTask}
        disabled={loading}
      >
        <ThemedText style={{ color: '#fff', fontSize: 16 }}>{loading ? 'Adding...' : 'Add Task'}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
});
