// Frontend/src/screens/jobboard/JobDetailScreen.tsx
// Job details with apply button

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import apiService from '../../services/api.service';

interface Job {
  id: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  responsibilities: string;
  qualifications: string;
  jobLocation: string;
  jobType: string;
  workMode: string;
  experienceMin: number;
  experienceMax: number;
  salaryMin?: number;
  salaryMax?: number;
  skillsRequired: string[];
  lastDateToApply: string;
  status: string;
}

export const JobDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const jobId = (route.params as any)?.jobId;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      const response = await apiService.get(`/jobboard/jobs/${jobId}`);
      setJob(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await apiService.post(`/jobboard/jobs/${jobId}/apply`, {
        resumeUrl: 'https://example.com/resume.pdf', // Get from user's profile
        resumeFileName: 'my_resume.pdf',
        coverMessage: 'I am interested in this position',
      });
      Alert.alert('Success', 'Application submitted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleSaveJob = async () => {
    try {
      await apiService.post(`/jobboard/jobs/${jobId}/save`, {});
      setSaved(!saved);
      Alert.alert('Success', saved ? 'Job removed from saved' : 'Job saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save job');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const expiryDate = new Date(job.lastDateToApply);
  const daysLeft = Math.ceil(
    (expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleSection}>
            <Text style={styles.jobTitle}>{job.jobTitle}</Text>
            <Text style={styles.companyName}>{job.companyName}</Text>
          </View>
          <TouchableOpacity onPress={handleSaveJob}>
            <Icon
              name={saved ? 'heart' : 'heart-outline'}
              size={28}
              color={saved ? '#FF6B6B' : '#999'}
            />
          </TouchableOpacity>
        </View>

        {/* Job Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Icon name="map-marker" size={20} color="#007AFF" />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{job.jobLocation}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="briefcase" size={20} color="#007AFF" />
            <Text style={styles.infoLabel}>Type</Text>
            <Text style={styles.infoValue}>{job.jobType}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="home-city" size={20} color="#007AFF" />
            <Text style={styles.infoLabel}>Mode</Text>
            <Text style={styles.infoValue}>{job.workMode}</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="chart-line" size={20} color="#007AFF" />
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>
              {job.experienceMin}-{job.experienceMax} yrs
            </Text>
          </View>
        </View>

        {/* Salary */}
        {job.salaryMin && (
          <View style={styles.salarySection}>
            <Text style={styles.sectionLabel}>Salary</Text>
            <Text style={styles.salaryText}>
              ₹{(job.salaryMin / 100000).toFixed(1)}L - ₹{(job.salaryMax! / 100000).toFixed(1)}L per annum
            </Text>
          </View>
        )}

        {/* Expiry */}
        <View style={[styles.section, daysLeft < 3 && styles.urgentSection]}>
          <Text style={styles.sectionLabel}>Application Deadline</Text>
          <Text style={[styles.sectionText, daysLeft < 3 && styles.urgentText]}>
            {daysLeft > 0
              ? `${daysLeft} days left`
              : expiryDate.toLocaleDateString()}
          </Text>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>About This Job</Text>
          <Text style={styles.sectionText}>{job.jobDescription}</Text>
        </View>

        {/* Responsibilities */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Responsibilities</Text>
          <Text style={styles.sectionText}>{job.responsibilities}</Text>
        </View>

        {/* Qualifications */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Qualifications</Text>
          <Text style={styles.sectionText}>{job.qualifications}</Text>
        </View>

        {/* Skills Required */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Required Skills</Text>
          <View style={styles.skillsList}>
            {job.skillsRequired.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.applyButton, applying && styles.applyButtonDisabled]}
          onPress={handleApply}
          disabled={applying}
        >
          {applying ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="send" size={18} color="#FFF" />
              <Text style={styles.applyButtonText}>Apply Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    backgroundColor: '#FFF',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  titleSection: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 15,
    color: '#666',
  },
  infoGrid: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    flex: 0.45,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    marginTop: 2,
    textAlign: 'center',
  },
  salarySection: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  section: {
    backgroundColor: '#FFF',
    padding: 16,
    marginTop: 12,
    marginHorizontal: 12,
    borderRadius: 12,
  },
  urgentSection: {
    backgroundColor: '#FFF3E0',
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  salaryText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007AFF',
  },
  urgentText: {
    color: '#FF6F00',
    fontWeight: '600',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#E8F0FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  applyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  applyButtonDisabled: {
    opacity: 0.6,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
});
