import React, { useEffect, useState } from 'react';
import {
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Button,
  TextInput,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useTasksRefresh } from '@/context/TasksRefreshContext';
import TasksPopup from '@/components/TasksEditPopup';

interface Task {
  _id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate?: string;
  notifications?: Array<{ time: string | Date }>;
}

// Helper to get task background color
function getTaskBgColor({ status, dueDate }: { status: string; dueDate?: string }, theme: string) {
  const isOverdue = dueDate && status !== 'completed' && (() => {
    const due = new Date(dueDate);
    return !isNaN(due.getTime()) && due.getTime() < Date.now();
  })();
  if (isOverdue && status !== 'completed') {
    return theme === 'dark' ? '#ff4d508c' : '#ffcccc'; 
  }
  if (status === 'completed') return theme === 'dark' ? '#2ecc40a5' : '#b6fcb6'; 
  if (status === 'in-progress') return theme === 'dark' ? '#ffd9009c' : '#fff7b2'; 
  if (status === 'pending') return theme === 'dark' ? '#888' : '#e0e0e0';
  return theme === 'dark' ? '#222' : '#fff';
}

export default function TasksScreen() {
  const { userToken } = useAuth();
  const { theme } = useTheme();
  const colors = Colors[theme];
  const { refreshKey, triggerRefresh } = useTasksRefresh();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!userToken) return;

    const fetchTasks = async () => {
      setLoading(true);
      setError(null);
      try {
  const res = await fetch('https://taskmanagermobile.onrender.com/api/tasks', {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch tasks');
        }
        const data = await res.json();
        // Parse notification times as Date objects
        setTasks(
          Array.isArray(data)
            ? data.map(task => ({
                ...task,
                notifications: task.notifications
                  ? (task.notifications as Array<{ time: string | Date }>).
                      map((n: { time: string | Date }) => ({
                        time: typeof n.time === 'string' ? new Date(n.time) : n.time,
                      }))
                  : [],
              }))
            : []
        );
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userToken, refreshKey]);

  const handleDelete = async (taskId: string) => {
    if (!userToken) return;
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await fetch(`https://taskmanagermobile.onrender.com/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${userToken}` },
              });
              triggerRefresh();
            } catch (e) {
              // Optionally handle error
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading)
    return <ActivityIndicator style={styles.center} size="large" color={colors.tint} />;

  if (error)
    return (
      <ThemedView style={styles.center}>
        <ThemedText
          style={styles.error}
          darkColor={Colors.dark.tint}
          lightColor={Colors.light.tint}
        >
          {error}
        </ThemedText>
      </ThemedView>
    );

  if (tasks.length === 0)
    return (
      <ThemedView style={styles.center}>
        <ThemedText>No tasks found.</ThemedText>
      </ThemedView>
    );

  return (
    <ThemedView style={{ flex: 1 }}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) =>
          userToken ? (
            <TouchableOpacity
              key={item._id}
              onPress={() => setEditingTask(item)}
              style={[styles.taskItem, { backgroundColor: getTaskBgColor(item, theme) }]}
            >
              <ThemedText style={[styles.title, { color: theme === 'dark' ? '#fff' : '#000' }]}>{item.title}</ThemedText>
              {item.description ? (
                <ThemedText style={[styles.description, { color: theme === 'dark' ? '#fff' : '#000' }]}>{item.description}</ThemedText>
              ) : null}
              <ThemedText>Status: {item.status}</ThemedText>
              {item.dueDate && (
                <ThemedText style={{ fontSize: 13, marginTop: 4 }}>
                  Complete By: {new Date(item.dueDate).toLocaleString()}
                </ThemedText>
              )}
              {item.notifications && item.notifications.length > 0 && (
                <View style={{ marginTop: 2 }}>
                  <ThemedText style={{ fontSize: 12, color: colors.text, fontWeight: 'bold' }}>
                    Notifications:
                  </ThemedText>
                  {item.notifications.map((n, i) => (
                    <ThemedText key={i} style={{ fontSize: 12, color: colors.text, marginLeft: 8 }}>
                      {n.time ? new Date(n.time).toLocaleString() : ''}
                    </ThemedText>
                  ))}
                </View>
              )}
              {item.dueDate && item.status !== 'completed' && (() => {
                const due = new Date(item.dueDate);
                return !isNaN(due.getTime()) && due.getTime() < Date.now();
              })() && (
                <ThemedText style={{ color: 'red', fontWeight: 'bold', marginTop: 4 }}>
                  OVERDUE
                </ThemedText>
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      <Modal visible={!!editingTask} animationType="slide" transparent={false}>
        {editingTask && (
          <TasksPopup
            task={editingTask}
            userToken={userToken!}
            onSave={() => {
              triggerRefresh();
              setEditingTask(null);
            }}
            onCancel={() => setEditingTask(null)}
            onDelete={() => {
              handleDelete(editingTask._id);
              setEditingTask(null);
            }}
          />
        )}
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  taskItem: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 6,
    backgroundColor: 'transparent',
    shadowColor: Colors.dark.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: Colors.dark.text },
  description: { fontStyle: 'italic', marginBottom: 6, color: Colors.dark.icon },
  error: { marginBottom: 12, color: Colors.dark.tint },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: 'transparent',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    marginTop: 12,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
});
