import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import api from '../../services/api.service';

const BlockUserScreen = ({ route, navigation }: any) => {
  const { userId, userName } = route.params;
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const blockUser = async () => {
    setSubmitting(true);
    try {
      const response = await api.post(`/chat/block/${userId}`, { reason });
      if (response.data.success) {
        Alert.alert('User Blocked', `${userName} has been blocked.`);
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.error || 'Failed to block user');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to block user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Block {userName}?</Text>
      <Text style={styles.label}>Reason (optional)</Text>
      <TextInput
        style={styles.input}
        value={reason}
        onChangeText={setReason}
        placeholder="Enter reason for blocking..."
        multiline
        numberOfLines={2}
      />
      <TouchableOpacity
        style={styles.blockButton}
        onPress={blockUser}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.blockButtonText}>Block User</Text>
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
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    minHeight: 40,
    marginBottom: 16,
  },
  blockButton: {
    backgroundColor: '#d32f2f',
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  blockButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BlockUserScreen;
