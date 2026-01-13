// Frontend/src/screens/marriage/ReportProfileScreen.tsx
// Screen to report inappropriate profiles

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Text, TextInput, Button, Card, RadioButton } from 'react-native-paper';
import { apiService } from '../../services/api.service';

const ReportProfileScreen = ({ navigation, route }: any) => {
  const { profileId } = route.params;
  const [reportType, setReportType] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { label: 'Fake Profile', value: 'fake_profile' },
    { label: 'Inappropriate Behavior', value: 'inappropriate_behavior' },
    { label: 'Spam/Multiple Profiles', value: 'spam' },
    { label: 'Fraud/Scam', value: 'fraud' },
    { label: 'Wrong Information', value: 'wrong_info' },
    { label: 'Offensive Content', value: 'scam' },
  ];

  const handleSubmitReport = async () => {
    try {
      if (!reportType || !details.trim()) {
        Alert.alert('Validation Error', 'Please select report type and provide details');
        return;
      }

      setLoading(true);

      await apiService.post('/api/marriage/report', {
        reportedProfileId: profileId,
        reportType,
        details,
      });

      Alert.alert('Success', 'Report submitted successfully. Our team will review it shortly.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.warningCard}>
        <Card.Content>
          <Text variant="bodySmall" style={styles.warningText}>
            Please report only profiles that violate our community guidelines. False reports may
            result in account suspension.
          </Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Reason for Report
          </Text>

          <RadioButton.Group value={reportType} onValueChange={setReportType}>
            {reportTypes.map((option) => (
              <View key={option.value} style={styles.radioOption}>
                <RadioButton value={option.value} />
                <Text variant="bodyMedium" style={styles.radioLabel}>
                  {option.label}
                </Text>
              </View>
            ))}
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Details
          </Text>

          <Text variant="bodySmall" style={styles.helpText}>
            Please provide as much detail as possible about why you're reporting this profile.
          </Text>

          <TextInput
            label="Detailed Description"
            value={details}
            onChangeText={setDetails}
            multiline={true}
            numberOfLines={6}
            style={styles.detailedInput}
            placeholder="Describe the issue in detail..."
          />
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            What Happens Next?
          </Text>

          <Text variant="bodySmall" style={styles.nextStepText}>
            • Our team will review your report within 24 hours
          </Text>
          <Text variant="bodySmall" style={styles.nextStepText}>
            • If the profile violates guidelines, we'll take action
          </Text>
          <Text variant="bodySmall" style={styles.nextStepText}>
            • You'll receive a notification about the outcome
          </Text>
          <Text variant="bodySmall" style={styles.nextStepText}>
            • Your identity remains confidential
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.actionSection}>
        <Button
          mode="contained"
          onPress={handleSubmitReport}
          loading={loading}
          disabled={loading || !reportType || !details.trim()}
          style={styles.submitButton}
        >
          Submit Report
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          Cancel
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
  },
  warningCard: {
    marginBottom: 16,
    backgroundColor: '#fff3cd',
  },
  warningText: {
    color: '#856404',
    lineHeight: 20,
  },
  card: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  radioLabel: {
    marginLeft: 12,
  },
  helpText: {
    color: '#999',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  detailedInput: {
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  nextStepText: {
    marginVertical: 6,
    lineHeight: 20,
  },
  actionSection: {
    padding: 12,
    gap: 8,
  },
  submitButton: {
    marginBottom: 8,
  },
});

export default ReportProfileScreen;
