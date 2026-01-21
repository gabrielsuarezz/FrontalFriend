import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Request notification permissions
export async function requestNotificationPermissions() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    alert('Failed to get push notification permissions!');
    return false;
  }

  return true;
}

// Schedule a medication reminder
export async function scheduleMedicationReminder(medicationName, time, repeatFrequency = 'daily') {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  // Create a date object for the next occurrence of this time
  const now = new Date();
  const scheduledDate = new Date();
  scheduledDate.setHours(time.hour);
  scheduledDate.setMinutes(time.minute);
  scheduledDate.setSeconds(0);
  scheduledDate.setMilliseconds(0);

  // If the time has already passed today, schedule for tomorrow
  if (scheduledDate <= now) {
    scheduledDate.setDate(scheduledDate.getDate() + 1);
  }

  let trigger;

  if (repeatFrequency === 'once') {
    trigger = {
      date: scheduledDate,
    };
  } else if (repeatFrequency === 'daily') {
    // For daily repeats, use CalendarTrigger with date set to first occurrence
    trigger = {
      date: scheduledDate,
      repeats: true,
    };
  } else if (repeatFrequency === 'weekly') {
    // Schedule for next occurrence of this weekday
    const daysUntilTarget = (scheduledDate.getDay() - now.getDay() + 7) % 7;
    if (daysUntilTarget === 0 && scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 7);
    } else if (daysUntilTarget > 0) {
      scheduledDate.setDate(now.getDate() + daysUntilTarget);
    }

    trigger = {
      weekday: scheduledDate.getDay() + 1, // 1 = Sunday, 7 = Saturday
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };
  } else if (repeatFrequency === 'monthly') {
    // Schedule for next occurrence of this day of month
    if (scheduledDate <= now) {
      scheduledDate.setMonth(scheduledDate.getMonth() + 1);
    }

    trigger = {
      day: scheduledDate.getDate(),
      hour: time.hour,
      minute: time.minute,
      repeats: true,
    };
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '💊 Medication Reminder',
      body: `Time to take your ${medicationName}`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });

  console.log('Medication notification scheduled:', {
    id: notificationId,
    trigger,
    scheduledDate: scheduledDate.toLocaleString(),
    frequency: repeatFrequency
  });

  return notificationId;
}

// Schedule an appointment reminder
export async function scheduleAppointmentReminder(appointmentTitle, date, reminderMinutesBefore = 30) {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const reminderTime = new Date(date.getTime() - reminderMinutesBefore * 60 * 1000);
  const now = new Date();

  // Check if reminder time is in the future
  if (reminderTime <= now) {
    alert('Please select a future date and time for your appointment');
    return null;
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: '📅 Appointment Reminder',
      body: `${appointmentTitle} in ${reminderMinutesBefore} minutes`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      date: reminderTime,
    },
  });

  return notificationId;
}

// Schedule a custom reminder
export async function scheduleCustomReminder(title, body, date, repeatFrequency = 'once') {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const now = new Date();

  // Check if reminder time is in the future
  if (date <= now) {
    alert('Please select a future date and time for your reminder');
    return null;
  }

  let trigger;

  if (repeatFrequency === 'once') {
    trigger = {
      date: date,
    };
  } else if (repeatFrequency === 'daily') {
    // For daily repeats, use date trigger with repeats
    trigger = {
      date: date,
      repeats: true,
    };
  } else if (repeatFrequency === 'weekly') {
    // Ensure the date is in the future for weekly repeats
    const scheduledDate = new Date(date);
    if (scheduledDate <= now) {
      scheduledDate.setDate(scheduledDate.getDate() + 7);
    }

    trigger = {
      weekday: scheduledDate.getDay() + 1, // 1 = Sunday, 7 = Saturday
      hour: scheduledDate.getHours(),
      minute: scheduledDate.getMinutes(),
      repeats: true,
    };
  } else if (repeatFrequency === 'monthly') {
    // Ensure the date is in the future for monthly repeats
    const scheduledDate = new Date(date);
    if (scheduledDate <= now) {
      scheduledDate.setMonth(scheduledDate.getMonth() + 1);
    }

    trigger = {
      day: scheduledDate.getDate(),
      hour: scheduledDate.getHours(),
      minute: scheduledDate.getMinutes(),
      repeats: true,
    };
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });

  console.log('Custom notification scheduled:', {
    id: notificationId,
    trigger,
    scheduledDate: date.toLocaleString(),
    frequency: repeatFrequency
  });

  return notificationId;
}

// Cancel a specific notification
export async function cancelNotification(notificationId) {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

// Cancel all notifications
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

// Get all scheduled notifications
export async function getAllScheduledNotifications() {
  return await Notifications.getAllScheduledNotificationsAsync();
}
