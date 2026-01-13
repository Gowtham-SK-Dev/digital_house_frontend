/**
 * Enhanced Profile Screen - View and Edit User Profiles
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
  Switch,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@services/api.service';
import { useAuthStore } from '@store/index';

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  email: string;
  phone?: string;
  location?: string;
  work?: string;
  bio?: string;
  maritalStatus?: string;
  interests?: string[];
  skills?: string[];
  businessInfo?: {
    businessName?: string;
    businessType?: string;
    businessDescription?: string;
    websiteUrl?: string;
    contactPhone?: string;
  };
  verified: boolean;
  privacy?: {
    photo: 'public' | 'friends' | 'private';
    work: 'public' | 'friends' | 'private';
    maritalStatus: 'public' | 'friends' | 'private';
    interests: 'public' | 'friends' | 'private';
    businessInfo: 'public' | 'friends' | 'private';
    skills: 'public' | 'friends' | 'private';
    bio: 'public' | 'friends' | 'private';
    location: 'public' | 'friends' | 'private';
  };
}

interface Props {
  navigation: any;
  route?: any;
}

export default function ViewProfileScreen({ navigation, route }: Props) {
  const user = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  const userId = route?.params?.userId || user?.id;
  const isOwnProfile = userId === user?.id;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get(`/profiles/${userId}`);
      setProfile(response.data);
      setEditedProfile(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await apiService.patch('/profiles/me', editedProfile);
      setProfile(response.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditedProfile({
      ...editedProfile,
      [field]: value,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        {isOwnProfile && (
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Ionicons name={isEditing ? 'close' : 'pencil'} size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Photo */}
      <View style={styles.photoSection}>
        {editedProfile.photo ? (
          <Image
            source={{ uri: editedProfile.photo }}
            style={styles.profilePhoto}
          />
        ) : (
          <View style={[styles.profilePhoto, styles.photoPlaceholder]}>
            <Ionicons name="person-circle" size={100} color="#ccc" />
          </View>
        )}

        {profile.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        )}

        {isEditing && isOwnProfile && (
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Ionicons name="camera" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>First Name</Text>
          {isEditing && isOwnProfile ? (
            <TextInput
              style={styles.input}
              value={editedProfile.firstName}
              onChangeText={(text) => updateField('firstName', text)}
              placeholder="First Name"
            />
          ) : (
            <Text style={styles.value}>{profile.firstName}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Last Name</Text>
          {isEditing && isOwnProfile ? (
            <TextInput
              style={styles.input}
              value={editedProfile.lastName}
              onChangeText={(text) => updateField('lastName', text)}
              placeholder="Last Name"
            />
          ) : (
            <Text style={styles.value}>{profile.lastName}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{profile.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Phone</Text>
          {isEditing && isOwnProfile ? (
            <TextInput
              style={styles.input}
              value={editedProfile.phone}
              onChangeText={(text) => updateField('phone', text)}
              placeholder="Phone Number"
            />
          ) : (
            <Text style={styles.value}>{profile.phone || 'Not provided'}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Bio</Text>
          {isEditing && isOwnProfile ? (
            <TextInput
              style={[styles.input, styles.bioInput]}
              value={editedProfile.bio}
              onChangeText={(text) => updateField('bio', text)}
              placeholder="Tell us about yourself"
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.value}>{profile.bio || 'No bio provided'}</Text>
          )}
        </View>
      </View>

      {/* Location & Work */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & Work</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Location</Text>
          {isEditing && isOwnProfile ? (
            <TextInput
              style={styles.input}
              value={editedProfile.location}
              onChangeText={(text) => updateField('location', text)}
              placeholder="City/Location"
            />
          ) : (
            <Text style={styles.value}>{profile.location || 'Not specified'}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Work</Text>
          {isEditing && isOwnProfile ? (
            <TextInput
              style={styles.input}
              value={editedProfile.work}
              onChangeText={(text) => updateField('work', text)}
              placeholder="Job Title/Profession"
            />
          ) : (
            <Text style={styles.value}>{profile.work || 'Not specified'}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Marital Status</Text>
          {isEditing && isOwnProfile ? (
            <View style={styles.pickerContainer}>
              <Text style={styles.value}>{editedProfile.maritalStatus || 'Select...'}</Text>
            </View>
          ) : (
            <Text style={styles.value}>{profile.maritalStatus || 'Not specified'}</Text>
          )}
        </View>
      </View>

      {/* Skills & Interests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills & Interests</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Skills</Text>
        </View>
        {(editedProfile.skills || []).length > 0 ? (
          <View style={styles.tagsContainer}>
            {(editedProfile.skills || []).map((skill, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{skill}</Text>
                {isEditing && isOwnProfile && (
                  <TouchableOpacity
                    onPress={() => {
                      const newSkills = editedProfile.skills?.filter((_, i) => i !== index);
                      updateField('skills', newSkills);
                    }}
                  >
                    <Text style={styles.removeTag}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.placeholder}>No skills added</Text>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.label}>Interests</Text>
        </View>
        {(editedProfile.interests || []).length > 0 ? (
          <View style={styles.tagsContainer}>
            {(editedProfile.interests || []).map((interest, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{interest}</Text>
                {isEditing && isOwnProfile && (
                  <TouchableOpacity
                    onPress={() => {
                      const newInterests = editedProfile.interests?.filter((_, i) => i !== index);
                      updateField('interests', newInterests);
                    }}
                  >
                    <Text style={styles.removeTag}>×</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.placeholder}>No interests added</Text>
        )}
      </View>

      {/* Business Info */}
      {profile.businessInfo && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          <View style={styles.businessCard}>
            <Text style={styles.businessName}>
              {profile.businessInfo.businessName || 'Business'}
            </Text>
            <Text style={styles.businessType}>
              {profile.businessInfo.businessType}
            </Text>
            <Text style={styles.businessDesc}>
              {profile.businessInfo.businessDescription}
            </Text>
            {profile.businessInfo.websiteUrl && (
              <TouchableOpacity>
                <Text style={styles.businessLink}>{profile.businessInfo.websiteUrl}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Privacy Settings */}
      {isOwnProfile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy Settings</Text>
          <Text style={styles.privacyInfo}>
            Control who can see your information
          </Text>

          <PrivacySetting
            field="photo"
            label="Photo"
            value={editedProfile.privacy?.photo || 'public'}
            onChange={(value) => {
              setEditedProfile({
                ...editedProfile,
                privacy: {
                  ...editedProfile.privacy,
                  photo: value,
                },
              });
            }}
            isEditing={isEditing}
          />
          <PrivacySetting
            field="bio"
            label="Bio"
            value={editedProfile.privacy?.bio || 'public'}
            onChange={(value) => {
              setEditedProfile({
                ...editedProfile,
                privacy: {
                  ...editedProfile.privacy,
                  bio: value,
                },
              });
            }}
            isEditing={isEditing}
          />
          <PrivacySetting
            field="location"
            label="Location"
            value={editedProfile.privacy?.location || 'public'}
            onChange={(value) => {
              setEditedProfile({
                ...editedProfile,
                privacy: {
                  ...editedProfile.privacy,
                  location: value,
                },
              });
            }}
            isEditing={isEditing}
          />
          <PrivacySetting
            field="work"
            label="Work & Skills"
            value={editedProfile.privacy?.work || 'public'}
            onChange={(value) => {
              setEditedProfile({
                ...editedProfile,
                privacy: {
                  ...editedProfile.privacy,
                  work: value,
                },
              });
            }}
            isEditing={isEditing}
          />
        </View>
      )}

      {/* Action Buttons */}
      {isEditing && isOwnProfile && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setIsEditing(false);
              setEditedProfile(profile);
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.spacing} />
    </ScrollView>
  );
}

// Privacy Setting Component
function PrivacySetting({
  field,
  label,
  value,
  onChange,
  isEditing,
}: {
  field: string;
  label: string;
  value: string;
  onChange: (value: 'public' | 'friends' | 'private') => void;
  isEditing: boolean;
}) {
  return (
    <View style={styles.privacyRow}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <View style={styles.privacyOptions}>
          {['public', 'friends', 'private'].map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.privacyOption,
                value === option && styles.privacyOptionActive,
              ]}
              onPress={() => onChange(option as 'public' | 'friends' | 'private')}
            >
              <Text
                style={[
                  styles.privacyOptionText,
                  value === option && styles.privacyOptionTextActive,
                ]}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <Text style={styles.value}>{value.charAt(0).toUpperCase() + value.slice(1)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: 'white',
    marginBottom: 10,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  photoPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 10,
    right: '35%',
  },
  changePhotoBtn: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    color: '#007AFF',
    fontSize: 12,
  },
  removeTag: {
    color: '#007AFF',
    marginLeft: 6,
    fontSize: 16,
  },
  placeholder: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  businessCard: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  businessName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  businessType: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  businessDesc: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  businessLink: {
    color: '#007AFF',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  privacyInfo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  privacyRow: {
    marginBottom: 12,
  },
  privacyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  privacyOption: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  privacyOptionActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  privacyOptionText: {
    fontSize: 11,
    color: '#333',
  },
  privacyOptionTextActive: {
    color: 'white',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  spacing: {
    height: 20,
  },
});
