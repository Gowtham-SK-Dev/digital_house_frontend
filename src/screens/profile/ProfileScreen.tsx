/**
 * Profile Screen
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '@services/api.service';
import { useAuthStore } from '@store/index';
import { storageService } from '@services/storage.service';

interface Props {
  navigation: any;
}

export default function ProfileScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => {},
      },
      {
        text: 'Logout',
        onPress: async () => {
          try {
            setIsLoading(true);
            await apiService.logout();
            await storageService.clearAll();
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          } catch (error) {
            Alert.alert('Error', 'Failed to logout');
          } finally {
            setIsLoading(false);
          }
        },
        style: 'destructive',
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user.firstName} {user.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditProfile}
          disabled={isLoading}
        >
          <Ionicons name="create-outline" size={16} color="#007AFF" />
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {/* Menu */}
      <View style={styles.menuSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="notifications-outline" size={20} color="#666" />
          <Text style={styles.menuItemText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" />
          <Text style={styles.menuItemText}>Privacy & Security</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={20} color="#666" />
          <Text style={styles.menuItemText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={20} color="#666" />
          <Text style={styles.menuItemText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ff3b30" />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color="#ff3b30" />
            <Text style={styles.logoutText}>Logout</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarTextLarge: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 28,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 6,
  },
  editButtonText: {
    marginLeft: 6,
    color: '#007AFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginTop: 8,
    marginBottom: 8,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#f0f0f0',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  menuSection: {
    backgroundColor: '#fff',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 8,
    marginVertical: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#ff3b30',
  },
});
