import { router } from 'expo-router';
import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const consent = ({ onAgree }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Disclaimer</Text>
      </View>


        <View style={styles.content}>
          <Text style={styles.description}> This application uses Generative Artificial Intelligence (AI) to provide general information and support for educational and informational purposes only. It does not offer medical, diagnostic, or treatment advice, and should not be relied upon as a substitute for professional judgment.
Always consult a qualified healthcare provider or licensed medical professional regarding any questions you may have about a medical condition, diagnosis, or treatment. Never disregard or delay seeking professional medical advice because of information provided by this app.
Use of this application signifies your understanding that the information generated may not be accurate, complete, or up to date, and that you are responsible for how you choose to use it.
        </Text>
        </View>


        <View style={{padding: 10, gap: 30, borderRadius: 8, marginBottom: 20}}>
            <Button title="I Agree" onPress={() => router.push('/chat')} style={styles.consentButtons} />
            <Button title="I do NOT consent" onPress={() => router.back()} style={styles.consentButtons} />
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
    consentButtons: {
      marginVertical: 10,
      padding: 10,
    },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
  content: {
    flex: 1,
    padding: 20,
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
  },
});

export default consent;