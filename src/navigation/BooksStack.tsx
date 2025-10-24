import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../context/ThemeContext';
import { BooksStackParamList } from '../types/navigation';

// Import screens
import BooksListScreen from '../screens/books/BooksListScreen';
import BookDetailScreen from '../screens/books/BookDetailScreen';
import BookEditScreen from '../screens/books/BookEditScreen';
import CreateBookScreen from '../screens/books/CreateBookScreen';
import BookExportScreen from '../screens/books/BookExportScreen';

const Stack = createStackNavigator<BooksStackParamList>();

export default function BooksStack() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.textPrimary,
        headerTitleStyle: {
          fontFamily: theme.typography.headerFont,
        },
        cardStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="BooksList" 
        component={BooksListScreen}
        options={{
          title: 'Recipe Books',
        }}
      />
      <Stack.Screen 
        name="BookDetail" 
        component={BookDetailScreen}
        options={({ route }) => ({
          title: route.params?.book?.title || 'Recipe Book',
        })}
      />
      <Stack.Screen 
        name="BookEdit" 
        component={BookEditScreen}
        options={{
          title: 'Edit Book',
        }}
      />
      <Stack.Screen 
        name="CreateBook" 
        component={CreateBookScreen}
        options={{
          title: 'Create Recipe Book',
        }}
      />
      <Stack.Screen 
        name="BookExport" 
        component={BookExportScreen}
        options={{
          title: 'Export Book',
        }}
      />
    </Stack.Navigator>
  );
}
