import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function requestNotificationPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleTaskNotifications(task: {
  _id: string;
  title: string;
  notifications?: Array<{ time: Date }>; // expects JS Date objects
}) {
  if (!task.notifications || !Array.isArray(task.notifications)) return [];
  const now = Date.now();
  const scheduledIds: string[] = [];
  for (const notif of task.notifications) {
    const notifTime = new Date(notif.time).getTime();
    if (notifTime > now) {
      const notifDate = notif.time instanceof Date ? notif.time : new Date(notif.time);
      const now = Date.now();
      const seconds = Math.floor((notifDate.getTime() - now) / 1000);
      let body = '';
      if (seconds > 0) {
        // Future notification
        const mins = Math.floor(seconds / 60);
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        let timeStr = '';
        if (days > 0) timeStr = `${days} day${days > 1 ? 's' : ''}`;
        else if (hours > 0) timeStr = `${hours} hour${hours > 1 ? 's' : ''}`;
        else if (mins > 0) timeStr = `${mins} minute${mins > 1 ? 's' : ''}`;
        else timeStr = `${seconds} second${seconds > 1 ? 's' : ''}`;
        body = `Task '${task.title}' is due in ${timeStr}`;
      } else if (seconds === 0) {
        body = `Task '${task.title}' is due now!`;
      } else {
        // Past due
        const overdueSec = Math.abs(seconds);
        const overdueMins = Math.floor(overdueSec / 60);
        const overdueHours = Math.floor(overdueMins / 60);
        const overdueDays = Math.floor(overdueHours / 24);
        let overdueStr = '';
        if (overdueDays > 0) overdueStr = `${overdueDays} day${overdueDays > 1 ? 's' : ''}`;
        else if (overdueHours > 0) overdueStr = `${overdueHours} hour${overdueHours > 1 ? 's' : ''}`;
        else if (overdueMins > 0) overdueStr = `${overdueMins} minute${overdueMins > 1 ? 's' : ''}`;
        else overdueStr = `${overdueSec} second${overdueSec > 1 ? 's' : ''}`;
        body = `Task '${task.title}' is overdue by ${overdueStr}`;
      }
      if (seconds > 0) {
        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Task Reminder',
            body,
            data: { taskId: task._id },
          },
          trigger: { seconds, repeats: false } as any,
        });
        scheduledIds.push(notificationId);
      }
    }
  }
  return scheduledIds;
}

export async function cancelAllScheduledNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}
