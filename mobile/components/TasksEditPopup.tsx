import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, View, Button, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  notifications?: Array<{ time: string | Date }>;
}

interface TasksPopupProps {
  task: Task;
  userToken: string;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
}

export default function TasksPopup({ task, userToken, onSave, onCancel, onDelete }: TasksPopupProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [status, setStatus] = useState(task.status);
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Array<{ time: Date }>>(
    task.notifications
      ? task.notifications.map(n => ({
          time: typeof n.time === 'string' ? new Date(n.time) : n.time,
        }))
      : []
  );
  const [showNotifPicker, setShowNotifPicker] = useState(false);
  const [notifPickerDate, setNotifPickerDate] = useState<Date | null>(null);

  // Sync notifications with task.notifications when task changes
  useEffect(() => {
    setNotifications(
      task.notifications
        ? task.notifications.map(n => ({
            time: typeof n.time === 'string' ? new Date(n.time) : n.time,
          }))
        : []
    );
  }, [task.notifications]);

  const addNotificationTime = (date: Date) => {
    setNotifications((prev) => {
      if (prev.some((n) => new Date(n.time).getTime() === date.getTime())) return prev;
      return [...prev, { time: date }];
    });
  };
  const removeNotificationTime = (date: Date) => {
    setNotifications((prev) => prev.filter((n) => new Date(n.time).getTime() !== date.getTime()));
  };

  const handleSave = async () => {
    setError(null);
    try {
      if (notifications.length > 0 && !dueDate) {
        setError('A due date is required when notifications are present.');
        return;
      }
      // Send updated task to backend
  const res = await fetch(`https://taskmanagermobile.onrender.com/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          title,
          description,
          status,
          dueDate,
          notifications: notifications.map(n => ({ time: n.time })),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to update task');
      }
      onSave(); // Parent should re-fetch task and close popup
    } catch (e: any) {
      setError(e.message || 'Failed to save');
    }
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
      {/* Title */}
      <TextInput
        style={{
          borderWidth: 1,
          borderRadius: 6,
          padding: 8,
          marginBottom: 8,
          fontSize: 16,
          backgroundColor: 'transparent',
          color: colors.text,
          borderColor: colors.border,
        }}
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        placeholderTextColor={colors.icon}
      />

      {/* Description */}
      <ThemedText style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginTop: 12 }}>
        Description
      </ThemedText>
      <TextInput
        style={{
          borderWidth: 1,
          borderRadius: 6,
          padding: 8,
          marginBottom: 8,
          fontSize: 16,
          backgroundColor: 'transparent',
          color: colors.text,
          borderColor: colors.border,
          height: 60,
        }}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        placeholderTextColor={colors.icon}
        multiline
      />

      {/* Status */}
      <ThemedText style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginTop: 12 }}>
        Status
      </ThemedText>
      <Picker
        selectedValue={status}
        onValueChange={setStatus}
        dropdownIconColor={theme === 'dark' ? 'white' : 'black'}
        style={{ color: colors.text, backgroundColor: 'transparent', marginBottom: 8 }}
      >
        <Picker.Item label="Pending" value="pending" />
        <Picker.Item label="In Progress" value="in-progress" />
        <Picker.Item label="Completed" value="completed" />
      </Picker>

      {/* Due Date */}
      <ThemedText style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 4, marginTop: 12 }}>
        Complete By
      </ThemedText>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={{
          borderWidth: 1,
          borderRadius: 6,
          padding: 8,
          marginBottom: 8,
          backgroundColor: 'transparent',
          justifyContent: 'center',
          borderColor: colors.border,
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

      {/* Notifications Section */}
      <View style={{ marginTop: 16, marginBottom: 16, padding: 12, backgroundColor: colors.background, borderRadius: 8 }}>
        <ThemedText style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8, color: colors.text }}>
          Notifications
        </ThemedText>
        {notifications.length === 0 && (
          <ThemedText style={{ fontSize: 13, color: colors.icon, marginBottom: 8 }}>
            No notifications set. Add one below!
          </ThemedText>
        )}
        {notifications.map((n, idx) => (
          <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <ThemedText style={{ fontSize: 14, marginRight: 12, color: colors.text }}>{n.time ? new Date(n.time).toLocaleString() : ''}</ThemedText>
            <TouchableOpacity onPress={() => removeNotificationTime(new Date(n.time))} style={{ paddingHorizontal: 8, paddingVertical: 2 }}>
              <ThemedText style={{ color: theme === 'dark' ? '#ff4d4d' : '#d32f2f', fontSize: 14 }}>Remove</ThemedText>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ flexDirection: 'column', gap: 8, marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            {['Due', '1hr', '1d', 'Custom'].map((label, idx) => {
              let onPress;
              if (label === 'Due') onPress = () => { if (dueDate) addNotificationTime(new Date(dueDate)); };
              if (label === '1hr') onPress = () => { if (dueDate) { const oneHourBefore = new Date(dueDate.getTime() - 60 * 60 * 1000); addNotificationTime(oneHourBefore); } };
              if (label === '1d') onPress = () => { if (dueDate) { const oneDayBefore = new Date(dueDate.getTime() - 24 * 60 * 60 * 1000); addNotificationTime(oneDayBefore); } };
              if (label === 'Custom') onPress = () => setShowNotifPicker(true);
              const isDisabled = label !== 'Custom' && !dueDate;
              const bgColor = theme === 'dark' ? '#222' : colors.tint;
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
      </View>

      {error && <ThemedText style={{ color: 'red', marginBottom: 8 }}>{error}</ThemedText>}

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
        <Button title="Save" onPress={handleSave} />
        <Button title="Cancel" color={colors.icon} onPress={onCancel} />
        <Button title="Delete" color="#d9534f" onPress={onDelete} />
      </View>
      </ScrollView>
    </ThemedView>
  );
}
