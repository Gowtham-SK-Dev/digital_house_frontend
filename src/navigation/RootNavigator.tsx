/**
 * Navigation Structure
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens (to be created)
// import LoginScreen from '@screens/auth/LoginScreen';
// import OTPVerificationScreen from '@screens/auth/OTPVerificationScreen';
// import HomeScreen from '@screens/home/HomeScreen';
// import ProfileScreen from '@screens/profile/ProfileScreen';
// import ChatScreen from '@screens/chat/ChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Auth Stack - for unauthenticated users
 */
export function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      {/* <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="OTPVerification" component={OTPVerificationScreen} /> */}
    </Stack.Navigator>
  );
}

/**
 * Home Tab Stack
 */
function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {/* <Stack.Screen 
        name="HomeFeed" 
        component={HomeScreen}
        options={{ title: 'Digital House' }}
      /> */}
    </Stack.Navigator>
  );
}

/**
 * Chat Tab Stack
 */
function ChatStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {/* <Stack.Screen 
        name="ChatList" 
        component={ChatScreen}
        options={{ title: 'Messages' }}
      /> */}
    </Stack.Navigator>
  );
}

/**
 * Profile Tab Stack
 */
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      {/* <Stack.Screen 
        name="ProfileTab" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      /> */}
    </Stack.Navigator>
  );
}

/**
 * App Stack - for authenticated users
 */
export function AppStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = '';

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'ChatTab') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Home',
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatStack}
        options={{
          title: 'Messages',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator
 */
export function RootNavigator() {
  // TODO: Get isAuthenticated from auth store
  const isAuthenticated = false;

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
