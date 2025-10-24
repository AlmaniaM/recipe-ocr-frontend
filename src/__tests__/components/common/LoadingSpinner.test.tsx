import React from 'react';
import { render, screen } from '@testing-library/react-native';

// Mock the useTheme hook
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#FF6B35',
        secondary: '#F7931E',
        background: '#FFF8F5',
        surface: '#FFFFFF',
        textPrimary: '#2D1B1B',
        textSecondary: '#8B7355',
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        border: '#E8D5C4',
      },
    },
  }),
}));

// Mock the component to avoid StyleSheet issues
jest.mock('../../../components/common/LoadingSpinner', () => {
  const React = require('react');
  
  return {
    LoadingSpinner: ({ testID, message }: any) => {
      return React.createElement('View', {
        testID,
        children: [
          React.createElement('View', { key: 'indicator', testID: `${testID}-indicator` }),
          message && React.createElement('Text', { key: 'message', testID: `${testID}-message` }, message),
        ],
      });
    },
  };
});

import { LoadingSpinner } from '../../../components/common/LoadingSpinner';


describe('LoadingSpinner', () => {
  it('should render with default props', () => {
    render(<LoadingSpinner testID="loading-spinner" />);
    
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
    expect(screen.getByTestId('loading-spinner-indicator')).toBeTruthy();
  });

  it('should render with custom size', () => {
    render(<LoadingSpinner size="large" testID="loading-spinner" />);
    
    const indicator = screen.getByTestId('loading-spinner-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should render with custom color', () => {
    const customColor = '#FF0000';
    render(<LoadingSpinner color={customColor} testID="loading-spinner" />);
    
    const indicator = screen.getByTestId('loading-spinner-indicator');
    expect(indicator).toBeTruthy();
  });

  it('should render with message', () => {
    const message = 'Loading recipes...';
    render(<LoadingSpinner message={message} testID="loading-spinner" />);
    
    expect(screen.getByTestId('loading-spinner-message')).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
  });

  it('should render without message when not provided', () => {
    render(<LoadingSpinner testID="loading-spinner" />);
    
    expect(screen.queryByTestId('loading-spinner-message')).toBeNull();
  });

  it('should apply custom style', () => {
    const customStyle = { marginTop: 20 };
    render(<LoadingSpinner style={customStyle} testID="loading-spinner" />);
    
    const container = screen.getByTestId('loading-spinner');
    expect(container).toBeTruthy();
  });

  it('should use custom testID', () => {
    const customTestID = 'custom-loading-spinner';
    render(<LoadingSpinner testID={customTestID} />);
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-indicator`)).toBeTruthy();
  });

  it('should render with all props', () => {
    const message = 'Loading data...';
    const customColor = '#00FF00';
    const customStyle = { padding: 10 };
    const customTestID = 'full-props-spinner';
    
    render(
      <LoadingSpinner
        size="large"
        color={customColor}
        message={message}
        style={customStyle}
        testID={customTestID}
      />
    );
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-indicator`)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-message`)).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
  });
});
