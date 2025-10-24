import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screen stacks
import RecipesStack from './RecipesStack';
import BooksStack from './BooksStack';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: theme.typography.captionFont,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontFamily: theme.typography.headerFont,
        },
      })}
      screenListeners={{
        tabPress: (e) => {
          // Tab press handled by individual screen listeners
        },
      }}
    >
      <Tab.Screen 
        name="Recipes" 
        component={RecipesStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="book" size={size} color={color} />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: () => {
            // This will be handled by the screenListeners above
          },
        }}
      />
      <Tab.Screen 
        name="Books" 
        component={BooksStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="folder" size={size} color={color} />
          ),
          headerShown: false,
        }}
        listeners={{
          tabPress: () => {
            // This will be handled by the screenListeners above
          },
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="settings" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            // This will be handled by the screenListeners above
          },
        }}
      />
    </Tab.Navigator>
  );
}
