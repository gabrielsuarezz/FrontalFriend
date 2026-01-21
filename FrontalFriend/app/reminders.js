import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  scheduleMedicationReminder,
  scheduleAppointmentReminder,
  scheduleCustomReminder,
  cancelNotification,
  getAllScheduledNotifications,
  requestNotificationPermissions,
} from '../services/notificationService';

export default function RemindersScreen() {
  const router = useRouter();
  const [reminders, setReminders] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [reminderType, setReminderType] = useState('medication'); // 'medication', 'appointment', 'custom'
  const [reminderTitle, setReminderTitle] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [repeatFrequency, setRepeatFrequency] = useState('daily'); // 'once', 'daily', 'weekly', 'monthly'

  useEffect(() => {
    requestNotificationPermissions();
    loadScheduledReminders();
  }, []);

  const loadScheduledReminders = async () => {
    const scheduled = await getAllScheduledNotifications();
    setReminders(scheduled);
  };

  const handleAddReminder = async () => {
    if (!reminderTitle.trim()) {
      Alert.alert('Error', 'Please enter a reminder title');
      return;
    }

    let notificationId;

    try {
      if (reminderType === 'medication') {
        notificationId = await scheduleMedicationReminder(
          reminderTitle,
          {
            hour: selectedTime.getHours(),
            minute: selectedTime.getMinutes(),
          },
          repeatFrequency
        );
      } else if (reminderType === 'appointment') {
        notificationId = await scheduleAppointmentReminder(
          reminderTitle,
          selectedTime,
          30
        );
      } else {
        notificationId = await scheduleCustomReminder(
          'Reminder',
          reminderTitle,
          selectedTime,
          repeatFrequency
        );
      }

      if (notificationId) {
        Alert.alert('Success', 'Reminder scheduled successfully!');
        setModalVisible(false);
        setReminderTitle('');
        loadScheduledReminders();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to schedule reminder');
      console.error(error);
    }
  };

  const handleDeleteReminder = async (notificationId) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelNotification(notificationId);
            loadScheduledReminders();
          },
        },
      ]
    );
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reminders</Text>
        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.headerAddButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Your Scheduled Reminders</Text>
        <Text style={styles.description}>
          Set up reminders for medications, appointments, and self-care activities.
        </Text>

        <View style={styles.remindersList}>
          {reminders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No reminders scheduled</Text>
              <Text style={styles.emptySubtext}>
                Tap the + button below to create your first reminder
              </Text>
            </View>
          ) : (
            reminders.map((reminder, index) => (
              <View key={reminder.identifier || index} style={styles.reminderCard}>
                <View style={styles.reminderContent}>
                  <Text style={styles.reminderTitle}>
                    {reminder.content?.title || 'Reminder'}
                  </Text>
                  <Text style={styles.reminderBody}>
                    {reminder.content?.body || 'No details'}
                  </Text>
                  {reminder.trigger?.date && (
                    <Text style={styles.reminderTime}>
                      {formatTime(reminder.trigger.date)}
                    </Text>
                  )}
                  {reminder.trigger?.hour !== undefined && (
                    <Text style={styles.reminderTime}>
                      Daily at {reminder.trigger.hour}:{String(reminder.trigger.minute).padStart(2, '0')}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReminder(reminder.identifier)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Reminder</Text>

            <Text style={styles.label}>Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reminderType === 'medication' && styles.typeButtonActive,
                ]}
                onPress={() => setReminderType('medication')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    reminderType === 'medication' && styles.typeButtonTextActive,
                  ]}
                >
                  💊 Medication
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reminderType === 'appointment' && styles.typeButtonActive,
                ]}
                onPress={() => setReminderType('appointment')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    reminderType === 'appointment' && styles.typeButtonTextActive,
                  ]}
                >
                  📅 Appointment
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  reminderType === 'custom' && styles.typeButtonActive,
                ]}
                onPress={() => setReminderType('custom')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    reminderType === 'custom' && styles.typeButtonTextActive,
                  ]}
                >
                  ⏰ Custom
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder={
                reminderType === 'medication'
                  ? 'e.g., Multivitamin'
                  : reminderType === 'appointment'
                  ? 'e.g., Therapy Session'
                  : 'e.g., Take a walk'
              }
              value={reminderTitle}
              onChangeText={setReminderTitle}
            />

            <Text style={styles.label}>Repeat Frequency</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  repeatFrequency === 'once' && styles.typeButtonActive,
                ]}
                onPress={() => setRepeatFrequency('once')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    repeatFrequency === 'once' && styles.typeButtonTextActive,
                  ]}
                >
                  Once
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  repeatFrequency === 'daily' && styles.typeButtonActive,
                ]}
                onPress={() => setRepeatFrequency('daily')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    repeatFrequency === 'daily' && styles.typeButtonTextActive,
                  ]}
                >
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  repeatFrequency === 'weekly' && styles.typeButtonActive,
                ]}
                onPress={() => setRepeatFrequency('weekly')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    repeatFrequency === 'weekly' && styles.typeButtonTextActive,
                  ]}
                >
                  Weekly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.frequencyButton,
                  repeatFrequency === 'monthly' && styles.typeButtonActive,
                ]}
                onPress={() => setRepeatFrequency('monthly')}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    repeatFrequency === 'monthly' && styles.typeButtonTextActive,
                  ]}
                >
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Time</Text>
            <TouchableOpacity
              style={styles.timeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timeButtonText}>
                {selectedTime.toLocaleString()}
              </Text>
            </TouchableOpacity>

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode={reminderType === 'medication' ? 'time' : 'datetime'}
                display="default"
                onChange={(event, date) => {
                  setShowTimePicker(Platform.OS === 'ios');
                  if (date) setSelectedTime(date);
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setReminderTitle('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleAddReminder}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 15,
  },
  backButtonText: {
    fontSize: 18,
    color: '#007AFF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  headerAddButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  remindersList: {
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    textAlign: 'center',
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  reminderBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 12,
    color: '#999',
  },
  deleteButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: '#007AFF',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  frequencyButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  timeButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#F9F9F9',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
});
