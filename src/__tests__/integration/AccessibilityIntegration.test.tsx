import React, { useState } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import { ThemeProvider } from '../../context/ThemeContext';
import { AccessibleButton } from '../../components/common/AccessibleButton';
import { AccessibleTextInput } from '../../components/common/AccessibleTextInput';
import { AccessibleModal } from '../../components/common/AccessibleModal';
import { AccessibleForm } from '../../components/forms/AccessibleForm';
import { AccessibleField } from '../../components/forms/AccessibleField';
import { AccessibleTabBar } from '../../components/navigation/AccessibleTabBar';
import { AccessibleHeader } from '../../components/navigation/AccessibleHeader';

// Mock the theme context
const mockTheme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    surface: '#FFFFFF',
    background: '#F2F2F7',
    textPrimary: '#000000',
    textSecondary: '#8E8E93',
    border: '#C6C6C8',
    error: '#FF3B30',
  },
  typography: {
    headerFont: 'Inter-SemiBold',
    bodyFont: 'Inter-Regular',
    captionFont: 'Inter-Medium',
  },
};

// Mock AccessibilityInfo
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn().mockResolvedValue(true),
    announceForAccessibility: jest.fn(),
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  },
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

// Test component that demonstrates accessibility integration
const TestAccessibilityScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [activeTab, setActiveTab] = useState('home');

  const tabs = [
    {
      id: 'home',
      label: 'Home',
      icon: 'home',
      onPress: () => setActiveTab('home'),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'person',
      onPress: () => setActiveTab('profile'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'settings',
      onPress: () => setActiveTab('settings'),
    },
  ];

  return (
    <>
      <AccessibleHeader
        title="Accessibility Test"
        subtitle="Testing accessibility features"
        showBackButton
        showMenuButton
        showSearchButton
        onBackPress={() => console.log('Back pressed')}
        onMenuPress={() => console.log('Menu pressed')}
        onSearchPress={() => console.log('Search pressed')}
      />
      
      <AccessibleForm>
        <AccessibleField
          label="Name"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          placeholder="Enter your name"
          required
          validation={(value) => value.length < 2 ? 'Name must be at least 2 characters' : null}
        />
        
        <AccessibleField
          label="Email"
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          placeholder="Enter your email"
          keyboardType="email-address"
          required
          validation={(value) => !value.includes('@') ? 'Please enter a valid email' : null}
        />
        
        <AccessibleButton
          title="Open Modal"
          onPress={() => setModalVisible(true)}
          accessibilityHint="Opens a modal dialog"
        />
        
        <AccessibleButton
          title="Submit Form"
          onPress={() => console.log('Form submitted', formData)}
          variant="primary"
          accessibilityHint="Submits the form data"
        />
      </AccessibleForm>
      
      <AccessibleTabBar
        tabs={tabs}
        activeTabId={activeTab}
        accessibilityLabel="Main navigation"
        accessibilityHint="Use tabs to navigate between sections"
      />
      
      <AccessibleModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title="Test Modal"
        accessibilityLabel="Test modal dialog"
        accessibilityHint="This is a test modal for accessibility"
      >
        <AccessibleTextInput
          label="Modal Input"
          value=""
          onChangeText={() => {}}
          placeholder="Enter text in modal"
        />
        <AccessibleButton
          title="Close Modal"
          onPress={() => setModalVisible(false)}
          variant="outline"
        />
      </AccessibleModal>
    </>
  );
};

describe('Accessibility Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all accessibility components together', () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    // Check that all components are rendered
    expect(getByTestId('accessible-header')).toBeTruthy();
    expect(getByTestId('accessible-form')).toBeTruthy();
    expect(getByTestId('accessible-tab-bar')).toBeTruthy();
  });

  it('should handle form validation with accessibility announcements', async () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    const nameInput = getByTestId('accessible-field-input');
    
    // Enter invalid name
    fireEvent.changeText(nameInput, 'A');
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Error in Name: Name must be at least 2 characters'
      );
    });
  });

  it('should handle tab navigation with accessibility', async () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    const profileTab = getByTestId('accessible-tab-bar-tab-profile');
    
    fireEvent.press(profileTab);
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Selected Profile tab'
      );
    });
  });

  it('should handle modal opening with accessibility', async () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    const openModalButton = getByTestId('accessible-button');
    
    fireEvent.press(openModalButton);
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Modal opened: Test Modal'
      );
    });
  });

  it('should handle header button presses with accessibility', async () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    const backButton = getByTestId('accessible-header-back');
    const menuButton = getByTestId('accessible-header-menu');
    const searchButton = getByTestId('accessible-header-search');
    
    fireEvent.press(backButton);
    fireEvent.press(menuButton);
    fireEvent.press(searchButton);
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Navigating back'
      );
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Opening menu'
      );
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Opening search'
      );
    });
  });

  it('should handle form submission with accessibility', async () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    const nameInput = getByTestId('accessible-field-input');
    const emailInput = getByTestId('accessible-field-input');
    const submitButton = getByTestId('accessible-button');
    
    // Fill in valid form data
    fireEvent.changeText(nameInput, 'John Doe');
    fireEvent.changeText(emailInput, 'john@example.com');
    
    fireEvent.press(submitButton);
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Form is valid and ready to submit'
      );
    });
  });

  it('should handle modal closing with accessibility', async () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    // Open modal
    const openModalButton = getByTestId('accessible-button');
    fireEvent.press(openModalButton);
    
    await waitFor(() => {
      expect(getByTestId('accessible-modal')).toBeTruthy();
    });
    
    // Close modal
    const closeModalButton = getByTestId('accessible-modal-close');
    fireEvent.press(closeModalButton);
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Modal closed'
      );
    });
  });

  it('should maintain focus management across components', async () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    const nameInput = getByTestId('accessible-field-input');
    const emailInput = getByTestId('accessible-field-input');
    
    // Focus on name input
    fireEvent(nameInput, 'focus');
    
    // Focus on email input
    fireEvent(emailInput, 'focus');
    
    // Both inputs should be accessible
    expect(nameInput).toHaveProp('accessible', true);
    expect(emailInput).toHaveProp('accessible', true);
  });

  it('should provide proper accessibility labels and hints', () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    // Check header accessibility
    const header = getByTestId('accessible-header');
    expect(header).toHaveProp('accessibilityLabel', 'Accessibility Test');
    expect(header).toHaveProp('accessibilityHint', 'Header with navigation options');
    
    // Check tab bar accessibility
    const tabBar = getByTestId('accessible-tab-bar');
    expect(tabBar).toHaveProp('accessibilityLabel', 'Main navigation');
    expect(tabBar).toHaveProp('accessibilityHint', 'Use tabs to navigate between sections');
    
    // Check form accessibility
    const form = getByTestId('accessible-form');
    expect(form).toHaveProp('accessibilityLabel', 'Form');
    expect(form).toHaveProp('accessibilityHint', 'Fill out the form fields below');
  });

  it('should handle keyboard navigation', () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    const nameInput = getByTestId('accessible-field-input');
    const emailInput = getByTestId('accessible-field-input');
    
    // Both inputs should support keyboard navigation
    expect(nameInput).toHaveProp('returnKeyType', 'done');
    expect(emailInput).toHaveProp('returnKeyType', 'done');
  });

  it('should handle screen reader announcements for all interactions', async () => {
    const { getByTestId } = renderWithTheme(<TestAccessibilityScreen />);
    
    // Test button press announcement
    const button = getByTestId('accessible-button');
    fireEvent.press(button);
    
    await waitFor(() => {
      expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
        'Opens a modal dialog'
      );
    });
  });
});
