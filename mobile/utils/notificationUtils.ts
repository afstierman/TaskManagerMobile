// NotificationService.ts

import * as Notifications from 'expo-notifications'
import { Platform, Alert } from 'react-native'

// ----------------------
// Notification Handler
// ----------------------
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

// ----------------------
// Android channel setup
// ----------------------
export async function setupAndroidNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      sound: 'default',
    })
  }
}

// ----------------------
// Request permissions
// ----------------------
export async function requestNotificationPermissions(): Promise<boolean> {
  await setupAndroidNotificationChannel()
  const { status } = await Notifications.requestPermissionsAsync()
  console.log('Notification permission status:', status)
  return status === 'granted'
}

// ----------------------
// Schedule notifications for a task
// ----------------------
export async function scheduleTaskNotifications(task: {
  _id: string
  title: string
  notifications?: Array<{ time: Date }>
  dueDate?: string
}): Promise<string[]> {
  try {
    const permissionGranted = await requestNotificationPermissions()
    if (!permissionGranted) {
      Alert.alert('Notification permission not granted.')
      return []
    }

    if (!task.notifications || !Array.isArray(task.notifications)) {
      return []
    }

    const now = Date.now()
    const scheduledIds: string[] = []

    for (const notif of task.notifications) {
      const notifDate = notif.time instanceof Date ? notif.time : new Date(notif.time);
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      const seconds = Math.floor((notifDate.getTime() - now) / 1000);
      if (seconds <= 0) continue;

      // Calculate time until due date, round down to nearest minute, no seconds
      let body = '';
      if (dueDate) {
        const diffMs = dueDate.getTime() - notifDate.getTime();
        let dueMins = Math.floor(diffMs / 60000);
        let dueHours = Math.floor(dueMins / 60);
        let dueDays = Math.floor(dueHours / 24);
        dueMins = dueMins % 60;
        dueHours = dueHours % 24;
        if (dueDays === 0 && dueHours === 0 && dueMins === 0) {
          body = `Task '${task.title}' is due now`;
        } else {
          let timeStr = '';
          if (dueDays > 0) timeStr += `${dueDays} day${dueDays > 1 ? 's' : ''} `;
          if (dueHours > 0) timeStr += `${dueHours} hour${dueHours > 1 ? 's' : ''} `;
          if (dueMins > 0) timeStr += `${dueMins} minute${dueMins > 1 ? 's' : ''}`;
          body = `Task '${task.title}' is due in ${timeStr.trim()}`;
        }
      } else {
        body = `Task '${task.title}' is due at an unknown time`;
      }

      try {
        // Use Expo's enum constant for the trigger type
        const trigger: Notifications.TimeIntervalTriggerInput = {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          repeats: false,
        }

        const notificationId =
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Task Reminder',
              body,
              sound: 'default',
              data: { taskId: task._id },
            },
            trigger,
          })

        scheduledIds.push(notificationId)
      } catch (err) {
        Alert.alert('Failed to schedule notification', String(err))
      }
    }

    return scheduledIds
  } catch (err) {
    Alert.alert('Notification error', String(err))
    return []
  }
}

// ----------------------
// Cancel notifications
// ----------------------
export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync()
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id)
}
