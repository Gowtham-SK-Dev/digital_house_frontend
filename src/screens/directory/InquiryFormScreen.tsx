// Inquiry Form Screen
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const InquiryFormScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { businessId, contactType, businessName } = route.params as any;

  const [message, setMessage] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmitInquiry = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/directory/business/${businessId}/inquire`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getToken()}`,
        },
        body: JSON.stringify({
          inquiryType: contactType,
          message,
          serviceId: selectedService || null,
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigation.goBack();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send inquiry');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setError('Failed to send inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    // Get token from secure storage
    return 'token';
  };

  const getContactIcon = () => {
    switch (contactType) {
      case 'call':
        return 'phone';
      case 'whatsapp':
        return 'whatsapp';
      case 'email':
        return 'email';
      default:
        return 'message';
    }
  };

  const getContactTitle = () => {
    switch (contactType) {
      case 'call':
        return 'Call Inquiry';
      case 'whatsapp':
        return 'WhatsApp Message';
      case 'email':
        return 'Email Inquiry';
      default:
        return 'Send Message';
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Icon name="check-circle" size={64} color="#4CAF50" />
        <Text style={styles.successTitle}>Inquiry Sent!</Text>
        <Text style={styles.successMessage}>
          {businessName} will get back to you soon
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Icon name={getContactIcon()} size={48} color="#007AFF" />
          <Text style={styles.title}>{getContactTitle()}</Text>
          <Text style={styles.subtitle}>{businessName}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Service Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Which service are you interested in?"
              value={selectedService}
              onChangeText={setSelectedService}
              placeholderTextColor="#999"
            />
          </View>

          {/* Message */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Your Message *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Tell us about your inquiry..."
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              placeholderTextColor="#999"
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>
              {message.length}/500 characters
            </Text>
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Icon name="information" size={20} color="#2196F3" />
            <Text style={styles.infoText}>
              Your contact information will only be shared after the business owner responds
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorBox}>
              <Icon name="alert-circle" size={20} color="#F44336" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmitInquiry}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="send" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Send Inquiry</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Contact Methods Info */}
          <View style={styles.methodsInfo}>
            <Text style={styles.methodsTitle}>Communication Method</Text>
            <View style={styles.methodCard}>
              <Icon name={getContactIcon()} size={24} color="#007AFF" />
              <View style={styles.methodContent}>
                <Text style={styles.methodName}>{getContactTitle()}</Text>
                <Text style={styles.methodDesc}>
                  {contactType === 'call' && 'Business will call you'}
                  {contactType === 'whatsapp' && 'Business will message you on WhatsApp'}
                  {contactType === 'email' && 'Business will reply to your email'}
                  {contactType === 'chat' && 'Business will message you here'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  form: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000',
  },
  messageInput: {
    paddingVertical: 12,
    minHeight: 120,
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    textAlign: 'right',
  },
  infoBox: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 12,
    color: '#1976D2',
    flex: 1,
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  errorText: {
    fontSize: 12,
    color: '#C62828',
    flex: 1,
    marginTop: 2,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  methodsInfo: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  methodsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 12,
  },
  methodContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  methodDesc: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginTop: 16,
  },
  successMessage: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default InquiryFormScreen;
