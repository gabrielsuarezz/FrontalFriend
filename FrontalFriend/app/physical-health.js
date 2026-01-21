import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { supabase } from "../SupabaseClient";

export default function PhysicalHealthScreen() {
  const [steps, setSteps] = useState('');
  const [hours, setHours] = useState('');
  const [quality, setQuality] = useState('');

  const [tab, setTab] = useState("daily");

  // Example history (replace with Supabase later)
  const history = [
    { date: "Feb 10, 2025", steps: 8500, sleep: 7.5, quality: "Good" },
    { date: "Feb 09, 2025", steps: 6900, sleep: 6, quality: "Fair" },
    { date: "Feb 08, 2025", steps: 10200, sleep: 8, quality: "Excellent" },
    { date: "Feb 07, 2025", steps: 200, sleep: 4.4, quality: "Poor" },
  ];

  const router = useRouter();
  const isDisabled = !steps || !hours || !quality;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Physical Health</Text>
      </View>

      {/* Intro Section */}
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Your Physical Wellness</Text>
        <Text style={styles.description}>
          Physical and mental health are deeply connected. Track your activities to build healthy habits or view data.
        </Text>
      </View>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, tab === "daily" && styles.activeTab]}
          onPress={() => setTab("daily")}
        >
          <Text style={[styles.tabText, tab === "daily" && styles.activeTabText]}>
            Daily
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === "history" && styles.activeTab]}
          onPress={() => setTab("history")}
        >
          <Text style={[styles.tabText, tab === "history" && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* DAILY CHECK-IN */}
      {tab === "daily" && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Daily Check-in</Text>
          <Text style={styles.subtitle}>
            Track your progress to stay on top of your health goals.
          </Text>

          <Text style={styles.label}>Steps Walked</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 8500"
            keyboardType="numeric"
            value={steps}
            onChangeText={setSteps}
          />

          <Text style={styles.label}>Hours Slept</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 7.5"
            keyboardType="numeric"
            value={hours}
            onChangeText={setHours}
          />

          <Text style={styles.label}>Sleep Quality</Text>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={quality} onValueChange={setQuality} style={styles.picker}>
              <Picker.Item label="Select quality" value="" />
              <Picker.Item label="Excellent" value="Excellent" />
              <Picker.Item label="Good" value="Good" />
              <Picker.Item label="Fair" value="Fair" />
              <Picker.Item label="Poor" value="Poor" />
            </Picker>
          </View>

          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            disabled={isDisabled}
          >
            <Text style={styles.buttonText}>Save Entry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* HISTORY SECTION */}
      {tab === "history" && (
        <ScrollView style={styles.historyWrapper}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <Text style={styles.historyDate}>{item.date}</Text>
              <Text style={styles.historyText}>Steps: {item.steps}</Text>
              <Text style={styles.historyText}>Sleep: {item.sleep} hrs</Text>
              <Text style={styles.historyText}>Sleep Quality: {item.quality}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  /* Your existing styles stay the same */
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: { marginRight: 15 },
  backButtonText: { fontSize: 18, color: '#007AFF' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },

  content: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 10 },
  description: { fontSize: 16, color: '#666', lineHeight: 21 },

  /* Tabs */
  tabContainer: { flexDirection: "row", marginBottom: 20 },
  tab: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#d9d9d9",
    alignItems: "center",
    marginHorizontal: 5,
  },
  activeTab: { backgroundColor: "#007AFF" },
  tabText: { fontWeight: "600", color: "#444" },
  activeTabText: { color: "white" },

  /* Card */
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  subtitle: { fontSize: 15, color: '#555', marginBottom: 2 },

  label: { fontSize: 15, fontWeight: '600', marginTop: 10, color: '#333' },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    fontSize: 16,
  },

  pickerWrapper: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginTop: 6,
  },
  picker: { height: 55 },

  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 25,
  },
  buttonDisabled: { backgroundColor: '#aacbff' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  /* History */
  historyWrapper: { marginTop: 10 },
  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
  },
  historyDate: { fontSize: 18, fontWeight: "700", marginBottom: 5 },
  historyText: { color: "#555", fontSize: 15 },
});
