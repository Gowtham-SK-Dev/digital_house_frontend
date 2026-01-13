// Frontend/src/screens/marriage/MarriageRegistrationScreen.tsx
// Initial registration screen for marriage module

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Text, Button, Card, RadioButton } from 'react-native-paper';
import { apiService } from '../../services/api.service';

const MarriageRegistrationScreen = ({ navigation }: any) => {
  const [createdBy, setCreatedBy] = useState<'self' | 'parent' | 'guardian'>('self');
  const [loading, setLoading] = useState(false);

  const handleProceed = async () => {
    try {
      setLoading(true);
      // Store selection and navigate to profile creation
      navigation.navigate('CreateMarriageProfile', { createdBy });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Marriage Profile
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Who is creating this profile?
        </Text>
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.optionGroup}>
            <RadioButton.Group value={createdBy} onValueChange={setCreatedBy}>
              <View style={styles.option}>
                <RadioButton value="self" />
                <Text variant="bodyLarge" style={styles.optionText}>
                  Self (Bride/Groom)
                </Text>
              </View>

              <View style={styles.option}>
                <RadioButton value="parent" />
                <Text variant="bodyLarge" style={styles.optionText}>
                  Parent
                </Text>
              </View>

              <View style={styles.option}>
                <RadioButton value="guardian" />
                <Text variant="bodyLarge" style={styles.optionText}>
                  Guardian/Relative
                </Text>
              </View>
            </RadioButton.Group>
          </View>

          <Text variant="bodySmall" style={styles.description}>
            This helps us understand the context of your profile and provide relevant features.
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.infoSection}>
        <Text variant="titleMedium" style={styles.infoTitle}>
          What you'll need:
        </Text>
        <Text variant="bodySmall" style={styles.infoItem}>
          • Basic personal information
        </Text>
        <Text variant="bodySmall" style={styles.infoItem}>
          • Birth horoscope details (optional but recommended)
        </Text>
        <Text variant="bodySmall" style={styles.infoItem}>
          • Recent photos
        </Text>
        <Text variant="bodySmall" style={styles.infoItem}>
          • ID proof for verification
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={handleProceed}
        loading={loading}
        disabled={loading}
        style={styles.proceedButton}
      >
        Proceed to Profile Creation
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: 24,
    marginTop: 12,
  },
  title: {
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#666',
  },
  card: {
    marginBottom: 24,
  },
  optionGroup: {
    marginVertical: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionText: {
    marginLeft: 8,
  },
  description: {
    color: '#999',
    marginTop: 12,
    fontStyle: 'italic',
  },
  infoSection: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoTitle: {
    fontWeight: '600',
    marginBottom: 12,
  },
  infoItem: {
    marginBottom: 8,
    lineHeight: 20,
  },
  proceedButton: {
    marginBottom: 32,
  },
});

export default MarriageRegistrationScreen;
