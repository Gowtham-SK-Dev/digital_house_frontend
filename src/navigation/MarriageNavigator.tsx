// Frontend/src/navigation/MarriageNavigator.tsx
// Navigation stack for marriage module

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { useAuth } from '../context/AuthContext';

// User Screens
import MarriageRegistrationScreen from '../screens/marriage/MarriageRegistrationScreen';
import CreateMarriageProfileScreen from '../screens/marriage/CreateMarriageProfileScreen';
import ProfileDetailScreen from '../screens/marriage/ProfileDetailScreen';
import MarriageSearchScreen from '../screens/marriage/MarriageSearchScreen';
import InterestsReceivedScreen from '../screens/marriage/InterestsReceivedScreen';
import HoroscopeMatchScreen from '../screens/marriage/HoroscopeMatchScreen';
import ReportProfileScreen from '../screens/marriage/ReportProfileScreen';

// Admin Screens
import AdminMarriageVerificationScreen from '../screens/marriage/admin/AdminMarriageVerificationScreen';
import AdminReportsScreen from '../screens/marriage/admin/AdminReportsScreen';

const Stack = createNativeStackNavigator();
const Tab = createMaterialBottomTabNavigator();

// User Marriage Stack
function UserMarriageStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="MarriageRegistration"
        component={MarriageRegistrationScreen}
        options={{ title: 'Marriage Profile' }}
      />
      <Stack.Screen
        name="CreateMarriageProfile"
        component={CreateMarriageProfileScreen}
        options={{ title: 'Create Profile' }}
      />
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="HoroscopeMatch"
        component={HoroscopeMatchScreen}
        options={{ title: 'Horoscope Compatibility' }}
      />
      <Stack.Screen
        name="ReportProfile"
        component={ReportProfileScreen}
        options={{ title: 'Report Profile' }}
      />
    </Stack.Navigator>
  );
}

// User Marriage Tab Navigator
function UserMarriageTabsStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="SearchTab"
        component={MarriageSearchStack}
        options={{
          title: 'Search',
          tabBarIcon: 'magnify',
        }}
      />
      <Tab.Screen
        name="InterestsTab"
        component={InterestsStack}
        options={{
          title: 'Interests',
          tabBarIcon: 'heart-multiple',
          tabBarBadge: true,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={UserMarriageStack}
        options={{
          title: 'My Profile',
          tabBarIcon: 'account',
        }}
      />
    </Tab.Navigator>
  );
}

function MarriageSearchStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Search"
        component={MarriageSearchScreen}
        options={{ title: 'Search Profiles' }}
      />
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="HoroscopeMatch"
        component={HoroscopeMatchScreen}
        options={{ title: 'Horoscope Compatibility' }}
      />
      <Stack.Screen
        name="ReportProfile"
        component={ReportProfileScreen}
        options={{ title: 'Report Profile' }}
      />
    </Stack.Navigator>
  );
}

function InterestsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="InterestsReceived"
        component={InterestsReceivedScreen}
        options={{ title: 'Interests Received' }}
      />
      <Stack.Screen
        name="ProfileDetail"
        component={ProfileDetailScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="HoroscopeMatch"
        component={HoroscopeMatchScreen}
        options={{ title: 'Horoscope Compatibility' }}
      />
    </Stack.Navigator>
  );
}

// Admin Marriage Stack
function AdminMarriageStack() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="VerificationTab"
        component={AdminVerificationStack}
        options={{
          title: 'Verification',
          tabBarIcon: 'check-circle',
        }}
      />
      <Tab.Screen
        name="ReportsTab"
        component={AdminReportsStack}
        options={{
          title: 'Reports',
          tabBarIcon: 'flag',
        }}
      />
    </Tab.Navigator>
  );
}

function AdminVerificationStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminMarriageVerification"
        component={AdminMarriageVerificationScreen}
        options={{ title: 'Verification Queue' }}
      />
      <Stack.Screen
        name="AdminProfileReview"
        component={ProfileDetailScreen}
        options={{ title: 'Review Profile' }}
      />
    </Stack.Navigator>
  );
}

function AdminReportsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{ title: 'User Reports' }}
      />
      <Stack.Screen
        name="AdminReportDetail"
        component={ProfileDetailScreen}
        options={{ title: 'Report Details' }}
      />
    </Stack.Navigator>
  );
}

// Main Marriage Navigator
export function MarriageNavigator() {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminMarriageStack />;
  }

  return <UserMarriageTabsStack />;
}

export default MarriageNavigator;
