import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../../services/api.service';

const REPORT_TYPES = [
  'abuse',
  'harassment',
  'scam',
  'hate_speech',
  'sexual_content',
  'spam',
  'fraud',
  'impersonation',
  'other',
];

const ReportChatScreen = ({ route, navigation }: any) => {
  const { chatId, messageId } = route.params;
  const [selectedType, setSelectedType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submitReport = async () => {
    if (!selectedType) {
      Alert.alert('Select a report type');
      return;
    }
    setSubmitting(true);
    try {
      const response = await api.post('/chat/report', {
        chatId,
        messageId,
        reportType: selectedType,
        description,
      });
      if (response.data.success) {
        Alert.alert('Report submitted', 'Thank you for helping keep the community safe.');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.error || 'Failed to submit report');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Report Chat or Message</Text>
      <Text style={styles.label}>Reason</Text>
      <View style={styles.typeList}>
        {REPORT_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeButton,
              selectedType === type && styles.typeButtonSelected,
            ]}
            onPress={() => setSelectedType(type)}
          >
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type && styles.typeButtonTextSelected,
              ]}
            >
              {type.replace('_', ' ').toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe the issue..."
        multiline
        numberOfLines={3}
      />
      <TouchableOpacity
        style={styles.submitButton}
        onPress={submitReport}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitButtonText}>Submit Report</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    color: '#333',
    marginTop: 12,
    marginBottom: 4,
  },
  typeList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  typeButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    margin: 4,
  },
  typeButtonSelected: {
    backgroundColor: '#d32f2f',
  },
  typeButtonText: {
    color: '#333',
    fontSize: 13,
  },
  typeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    minHeight: 60,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReportChatScreen;
