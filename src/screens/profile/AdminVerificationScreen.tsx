/**
 * Admin Profile Verification Dashboard
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
  FlatList,
  RefreshControl,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@services/api.service';
import { useAuthStore } from '@store/index';

interface ProfileToVerify {
  id: string;
  firstName: string;
  lastName: string;
  photo?: string;
  email: string;
  location?: string;
  work?: string;
  bio?: string;
  verified: boolean;
  createdAt: string;
}

interface Props {
  navigation: any;
}

export default function AdminVerificationScreen({ navigation }: Props) {
  const [profiles, setProfiles] = useState<ProfileToVerify[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<ProfileToVerify | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    fetchPendingProfiles();
  }, []);

  const fetchPendingProfiles = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.get('/profiles/admin/pending-verifications', {
        params: { limit: 50, offset },
      });
      setProfiles(response.data.profiles);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pending profiles');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPendingProfiles();
    setRefreshing(false);
  };

  const handleVerifyProfile = async (userId: string, verified: boolean) => {
    try {
      setIsVerifying(true);
      await apiService.post('/profiles/admin/verify', {
        userId,
        verified,
        verificationNotes: verificationNotes.trim(),
      });

      Alert.alert(
        'Success',
        `Profile ${verified ? 'verified' : 'rejected'} successfully`
      );

      setProfiles(profiles.filter((p) => p.id !== userId));
      setShowModal(false);
      setVerificationNotes('');
      setSelectedProfile(null);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to process verification'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const openVerificationModal = (profile: ProfileToVerify) => {
    setSelectedProfile(profile);
    setVerificationNotes('');
    setShowModal(true);
  };

  const renderProfileCard = ({ item }: { item: ProfileToVerify }) => (
    <View style={styles.profileCard}>
      <View style={styles.cardContent}>
        <View style={styles.photoContainer}>
          {item.photo ? (
            <Image source={{ uri: item.photo }} style={styles.thumbnail} />
          ) : (
            <View style={[styles.thumbnail, styles.photoPlaceholder]}>
              <Ionicons name="person-circle" size={50} color="#ccc" />
            </View>
          )}
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.name}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.email}>{item.email}</Text>
          {item.location && (
            <View style={styles.infoChip}>
              <Ionicons name="location" size={14} color="#666" />
              <Text style={styles.chipText}>{item.location}</Text>
            </View>
          )}
          {item.work && (
            <View style={styles.infoChip}>
              <Ionicons name="briefcase" size={14} color="#666" />
              <Text style={styles.chipText}>{item.work}</Text>
            </View>
          )}
          {item.bio && (
            <Text style={styles.bio} numberOfLines={2}>
              {item.bio}
            </Text>
          )}
          <Text style={styles.joinDate}>
            Joined: {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.rejectBtn]}
          onPress={() => {
            openVerificationModal(item);
          }}
        >
          <Ionicons name="close-circle" size={20} color="#f44336" />
          <Text style={styles.actionBtnText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, styles.approveBtn]}
          onPress={() => {
            openVerificationModal(item);
          }}
        >
          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          <Text style={styles.actionBtnText}>Verify</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile Verification</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{profiles.length}</Text>
          </View>
        </View>

        {/* Content */}
        {profiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done-circle" size={64} color="#4CAF50" />
            <Text style={styles.emptyText}>All profiles verified!</Text>
            <Text style={styles.emptySubtext}>No pending verifications</Text>
          </View>
        ) : (
          <FlatList
            data={profiles}
            renderItem={renderProfileCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onEndReached={() => {
              setOffset(offset + 50);
            }}
            onEndReachedThreshold={0.5}
          />
        )}
      </View>

      {/* Verification Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedProfile && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Verify Profile</Text>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons name="close" size={24} color="#333" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  {/* Profile Summary */}
                  <View style={styles.profileSummary}>
                    {selectedProfile.photo ? (
                      <Image
                        source={{ uri: selectedProfile.photo }}
                        style={styles.summaryPhoto}
                      />
                    ) : (
                      <View
                        style={[styles.summaryPhoto, styles.photoPlaceholder]}
                      >
                        <Ionicons name="person-circle" size={60} color="#ccc" />
                      </View>
                    )}
                    <Text style={styles.summaryName}>
                      {selectedProfile.firstName} {selectedProfile.lastName}
                    </Text>
                    <Text style={styles.summaryEmail}>
                      {selectedProfile.email}
                    </Text>
                  </View>

                  {/* Profile Details */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.detailsTitle}>Profile Details</Text>

                    {selectedProfile.location && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Location:</Text>
                        <Text style={styles.detailValue}>
                          {selectedProfile.location}
                        </Text>
                      </View>
                    )}

                    {selectedProfile.work && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Work:</Text>
                        <Text style={styles.detailValue}>
                          {selectedProfile.work}
                        </Text>
                      </View>
                    )}

                    {selectedProfile.bio && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Bio:</Text>
                        <Text style={styles.detailValue}>
                          {selectedProfile.bio}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Verification Notes */}
                  <View style={styles.notesSection}>
                    <Text style={styles.notesLabel}>
                      Verification Notes (Optional)
                    </Text>
                    <View
                      style={[
                        styles.notesInput,
                        {
                          borderColor: '#ddd',
                          borderWidth: 1,
                          borderRadius: 8,
                          marginBottom: 16,
                        },
                      ]}
                    >
                      {/* Add a TextInput component here if needed */}
                    </View>
                  </View>

                  {/* Decision Buttons */}
                  <View style={styles.decisionButtons}>
                    <TouchableOpacity
                      style={[styles.decisionBtn, styles.rejectDecisionBtn]}
                      onPress={() =>
                        handleVerifyProfile(selectedProfile.id, false)
                      }
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Ionicons
                            name="close-circle"
                            size={20}
                            color="white"
                          />
                          <Text style={styles.decisionBtnText}>Reject</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.decisionBtn, styles.approveDecisionBtn]}
                      onPress={() =>
                        handleVerifyProfile(selectedProfile.id, true)
                      }
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <>
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="white"
                          />
                          <Text style={styles.decisionBtnText}>Verify</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  badge: {
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  photoContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  photoPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  email: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chipText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
  bio: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  joinDate: {
    fontSize: 10,
    color: '#999',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  rejectBtn: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
  },
  approveBtn: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  modalBody: {
    padding: 16,
  },
  profileSummary: {
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  summaryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  summaryEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  detailsSection: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  notesInput: {
    minHeight: 60,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  decisionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  decisionBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  rejectDecisionBtn: {
    backgroundColor: '#f44336',
  },
  approveDecisionBtn: {
    backgroundColor: '#4CAF50',
  },
  decisionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});
