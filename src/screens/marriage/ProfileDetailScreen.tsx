// Frontend/src/screens/marriage/ProfileDetailScreen.tsx
// Display detailed profile information

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ImageBackground,
  Share,
} from 'react-native';
import { Text, Button, Card, Chip, Icon, Divider } from 'react-native-paper';
import { apiService } from '../../services/api.service';

const ProfileDetailScreen = ({ navigation, route }: any) => {
  const { profileId } = route.params;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiService.get(`/api/marriage/profile/${profileId}`);
      setProfile(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async () => {
    try {
      await apiService.post('/api/marriage/interest', {
        receiverProfileId: profileId,
        message: 'Interested in knowing more about you.',
      });
      Alert.alert('Success', 'Interest sent! Waiting for response.');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleCheckHoroscope = () => {
    navigation.navigate('HoroscopeMatch', { profileId });
  };

  const handleReport = () => {
    navigation.navigate('ReportProfile', { profileId });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this profile on DigitalConnect Marriage Module!\nProfile: ${profile?.name}, ${profile?.age}`,
        title: `${profile?.name}'s Profile`,
      });
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.notFound}>
        <Text>Profile not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Photo Gallery */}
      {profile.photos && profile.photos.length > 0 && (
        <View style={styles.gallerySection}>
          <ImageBackground
            source={{ uri: profile.photos[activePhotoIndex]?.url }}
            style={styles.mainPhoto}
          >
            <View style={styles.photoOverlay}>
              <View style={styles.photoIndicator}>
                <Text style={styles.photoCountText}>
                  {activePhotoIndex + 1} / {profile.photos.length}
                </Text>
              </View>
            </View>
          </ImageBackground>

          {profile.photos.length > 1 && (
            <ScrollView
              horizontal
              style={styles.thumbnailRow}
              showsHorizontalScrollIndicator={false}
            >
              {profile.photos.map((photo: any, index: number) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setActivePhotoIndex(index)}
                  style={[
                    styles.thumbnail,
                    activePhotoIndex === index && styles.activeThumbnail,
                  ]}
                >
                  <ImageBackground
                    source={{ uri: photo.url }}
                    style={styles.thumbnailImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Basic Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.basicHeader}>
            <View>
              <Text variant="headlineSmall" style={styles.name}>
                {profile.name}
              </Text>
              <Text variant="bodyMedium" style={styles.age}>
                {profile.age} years old
              </Text>
            </View>
            {profile.verificationStatus === 'verified' && (
              <Chip icon="check-circle" label="Verified" />
            )}
          </View>

          <Divider style={styles.divider} />

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text variant="labelSmall" style={styles.infoLabel}>
                Gender
              </Text>
              <Text variant="bodyMedium">{profile.gender}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text variant="labelSmall" style={styles.infoLabel}>
                Height
              </Text>
              <Text variant="bodyMedium">{profile.height} cm</Text>
            </View>

            <View style={styles.infoItem}>
              <Text variant="labelSmall" style={styles.infoLabel}>
                Weight
              </Text>
              <Text variant="bodyMedium">{profile.weight} kg</Text>
            </View>

            <View style={styles.infoItem}>
              <Text variant="labelSmall" style={styles.infoLabel}>
                Marital Status
              </Text>
              <Text variant="bodyMedium">{profile.maritalStatus}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Career Details */}
      <Card style={styles.card}>
        <Card.Title title="Career & Education" />
        <Card.Content>
          <View style={styles.detailRow}>
            <Text variant="labelSmall" style={styles.label}>
              Education:
            </Text>
            <Text variant="bodyMedium">{profile.education}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="labelSmall" style={styles.label}>
              Profession:
            </Text>
            <Text variant="bodyMedium">{profile.profession}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="labelSmall" style={styles.label}>
              Income:
            </Text>
            <Text variant="bodyMedium">{profile.income}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Location */}
      <Card style={styles.card}>
        <Card.Title title="Location" />
        <Card.Content>
          <View style={styles.detailRow}>
            <Text variant="labelSmall" style={styles.label}>
              Native Place:
            </Text>
            <Text variant="bodyMedium">{profile.nativePlace}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text variant="labelSmall" style={styles.label}>
              Current Location:
            </Text>
            <Text variant="bodyMedium">{profile.currentLocation}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Astrological Details */}
      {(profile.caste || profile.raasi || profile.natchathiram) && (
        <Card style={styles.card}>
          <Card.Title title="Astrological Details" />
          <Card.Content>
            {profile.caste && (
              <View style={styles.detailRow}>
                <Text variant="labelSmall" style={styles.label}>
                  Caste:
                </Text>
                <Text variant="bodyMedium">{profile.caste}</Text>
              </View>
            )}
            {profile.subCaste && (
              <View style={styles.detailRow}>
                <Text variant="labelSmall" style={styles.label}>
                  Sub-Caste:
                </Text>
                <Text variant="bodyMedium">{profile.subCaste}</Text>
              </View>
            )}
            {profile.gothram && (
              <View style={styles.detailRow}>
                <Text variant="labelSmall" style={styles.label}>
                  Gothram:
                </Text>
                <Text variant="bodyMedium">{profile.gothram}</Text>
              </View>
            )}
            {profile.raasi && (
              <View style={styles.detailRow}>
                <Text variant="labelSmall" style={styles.label}>
                  Raasi:
                </Text>
                <Text variant="bodyMedium">{profile.raasi}</Text>
              </View>
            )}
            {profile.natchathiram && (
              <View style={styles.detailRow}>
                <Text variant="labelSmall" style={styles.label}>
                  Nakshatram:
                </Text>
                <Text variant="bodyMedium">{profile.natchathiram}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <Button
          mode="contained"
          onPress={handleSendInterest}
          style={styles.actionButton}
          icon="heart-outline"
        >
          Send Interest
        </Button>

        <Button
          mode="outlined"
          onPress={handleCheckHoroscope}
          style={styles.actionButton}
          icon="zodiac-cancer"
        >
          Check Horoscope Match
        </Button>

        <Button
          mode="text"
          onPress={handleShare}
          style={styles.actionButton}
          icon="share-variant"
        >
          Share Profile
        </Button>

        <Button
          mode="text"
          onPress={handleReport}
          style={[styles.actionButton, styles.reportButton]}
          icon="flag"
          textColor="red"
        >
          Report Profile
        </Button>
      </View>
    </ScrollView>
  );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gallerySection: {
    backgroundColor: '#000',
  },
  mainPhoto: {
    height: 350,
    backgroundColor: '#f0f0f0',
    justifyContent: 'flex-end',
  },
  photoOverlay: {
    paddingBottom: 12,
    paddingRight: 12,
    alignItems: 'flex-end',
  },
  photoIndicator: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  photoCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  thumbnailRow: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  thumbnail: {
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: '#fff',
  },
  thumbnailImage: {
    width: 80,
    height: 80,
  },
  card: {
    margin: 12,
  },
  basicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontWeight: '700',
    color: '#333',
  },
  age: {
    color: '#666',
    marginTop: 4,
  },
  divider: {
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginVertical: 8,
  },
  infoLabel: {
    color: '#999',
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    color: '#999',
    fontWeight: '600',
  },
  actionSection: {
    padding: 12,
    gap: 8,
  },
  actionButton: {
    marginVertical: 4,
  },
  reportButton: {
    marginTop: 8,
  },
});

export default ProfileDetailScreen;
