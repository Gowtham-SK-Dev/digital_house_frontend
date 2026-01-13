// Frontend/src/screens/marriage/CreateMarriageProfileScreen.tsx
// Screen for creating/filling marriage profile details

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiService } from '../../services/api.service';

const CreateMarriageProfileScreen = ({ navigation, route }: any) => {
  const { createdBy } = route.params;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    dateOfBirth: new Date(),
    age: '',
    height: '',
    weight: '',
    education: '',
    profession: '',
    income: '',
    nativePlace: '',
    currentLocation: '',
    caste: '',
    subCaste: '',
    gothram: '',
    raasi: '',
    natchathiram: '',
    maritalStatus: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      const age = new Date().getFullYear() - selectedDate.getFullYear();
      setFormData({
        ...formData,
        dateOfBirth: selectedDate,
        age: age.toString(),
      });
    }
    setShowDatePicker(false);
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name || !formData.gender || !formData.age) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        return;
      }

      setLoading(true);

      const response = await apiService.post('/api/marriage/profile', {
        ...formData,
        createdBy,
        dateOfBirth: formData.dateOfBirth.toISOString().split('T')[0],
      });

      Alert.alert('Success', 'Profile created successfully!');
      navigation.navigate('ProfilePreview');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Basic Information
          </Text>

          <TextInput
            label="Full Name"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            style={styles.input}
            placeholder="Your full name"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text variant="labelMedium" style={styles.label}>
                Gender
              </Text>
              <View style={styles.chipGroup}>
                {['Male', 'Female'].map((option) => (
                  <Chip
                    key={option}
                    selected={formData.gender === option}
                    onPress={() => setFormData({ ...formData, gender: option })}
                    style={styles.chip}
                  >
                    {option}
                  </Chip>
                ))}
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text variant="labelMedium" style={styles.label}>
                Age
              </Text>
              <TextInput
                value={formData.age}
                editable={false}
                style={styles.input}
              />
            </View>
          </View>

          <TouchableOpacity onPress={() => setShowDatePicker(true)}>
            <TextInput
              label="Date of Birth"
              value={formData.dateOfBirth.toDateString()}
              editable={false}
              style={styles.input}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={formData.dateOfBirth}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Physical Details
          </Text>

          <View style={styles.row}>
            <TextInput
              label="Height (cm)"
              value={formData.height}
              onChangeText={(text) => setFormData({ ...formData, height: text })}
              style={[styles.input, styles.halfWidth]}
              keyboardType="numeric"
            />
            <TextInput
              label="Weight (kg)"
              value={formData.weight}
              onChangeText={(text) => setFormData({ ...formData, weight: text })}
              style={[styles.input, styles.halfWidth]}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Career & Income
          </Text>

          <TextInput
            label="Education"
            value={formData.education}
            onChangeText={(text) => setFormData({ ...formData, education: text })}
            style={styles.input}
            placeholder="e.g., Bachelor of Science"
          />

          <TextInput
            label="Profession"
            value={formData.profession}
            onChangeText={(text) => setFormData({ ...formData, profession: text })}
            style={styles.input}
            placeholder="e.g., Software Engineer"
          />

          <TextInput
            label="Annual Income"
            value={formData.income}
            onChangeText={(text) => setFormData({ ...formData, income: text })}
            style={styles.input}
            placeholder="e.g., 5-10 LPA"
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Location
          </Text>

          <TextInput
            label="Native Place"
            value={formData.nativePlace}
            onChangeText={(text) => setFormData({ ...formData, nativePlace: text })}
            style={styles.input}
            placeholder="Your hometown"
          />

          <TextInput
            label="Current Location"
            value={formData.currentLocation}
            onChangeText={(text) => setFormData({ ...formData, currentLocation: text })}
            style={styles.input}
            placeholder="Where you currently live"
          />
        </View>

        <View style={styles.section}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Astrological Details
          </Text>

          <TextInput
            label="Caste"
            value={formData.caste}
            onChangeText={(text) => setFormData({ ...formData, caste: text })}
            style={styles.input}
          />

          <TextInput
            label="Sub-Caste"
            value={formData.subCaste}
            onChangeText={(text) => setFormData({ ...formData, subCaste: text })}
            style={styles.input}
          />

          <TextInput
            label="Gothram"
            value={formData.gothram}
            onChangeText={(text) => setFormData({ ...formData, gothram: text })}
            style={styles.input}
          />

          <TextInput
            label="Raasi (Zodiac Sign)"
            value={formData.raasi}
            onChangeText={(text) => setFormData({ ...formData, raasi: text })}
            style={styles.input}
          />

          <TextInput
            label="Nakshatram (Star)"
            value={formData.natchathiram}
            onChangeText={(text) => setFormData({ ...formData, natchathiram: text })}
            style={styles.input}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Create Profile
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  label: {
    marginBottom: 8,
    color: '#333',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  chipGroup: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flex: 1,
  },
  submitButton: {
    marginBottom: 32,
    marginTop: 24,
  },
});

export default CreateMarriageProfileScreen;
