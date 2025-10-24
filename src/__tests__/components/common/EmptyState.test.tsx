import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../../../components/common/EmptyState';
import { ThemeProvider } from '../../../context/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('EmptyState', () => {
  it('should render with message', () => {
    const message = 'No recipes found';
    renderWithTheme(<EmptyState message={message} />);
    
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.getByTestId('empty-state-message')).toBeTruthy();
  });

  it('should render with action button when action is provided', () => {
    const message = 'No recipes found';
    const action = {
      title: 'Add Recipe',
      onPress: jest.fn(),
    };
    
    renderWithTheme(<EmptyState message={message} action={action} />);
    
    expect(screen.getByText('Add Recipe')).toBeTruthy();
    expect(screen.getByTestId('empty-state-action-button')).toBeTruthy();
  });

  it('should not render action button when action is not provided', () => {
    const message = 'No recipes found';
    
    renderWithTheme(<EmptyState message={message} />);
    
    expect(screen.queryByTestId('empty-state-action-button')).toBeNull();
  });

  it('should call action.onPress when action button is pressed', () => {
    const message = 'No recipes found';
    const action = {
      title: 'Add Recipe',
      onPress: jest.fn(),
    };
    
    renderWithTheme(<EmptyState message={message} action={action} />);
    
    fireEvent.press(screen.getByTestId('empty-state-action-button'));
    
    expect(action.onPress).toHaveBeenCalledTimes(1);
  });

  it('should render with icon when provided', () => {
    const message = 'No recipes found';
    const icon = '📝';
    
    renderWithTheme(<EmptyState message={message} icon={icon} />);
    
    expect(screen.getByText(icon)).toBeTruthy();
    expect(screen.getByTestId('empty-state-icon')).toBeTruthy();
  });

  it('should not render icon when not provided', () => {
    const message = 'No recipes found';
    
    renderWithTheme(<EmptyState message={message} />);
    
    expect(screen.queryByTestId('empty-state-icon')).toBeNull();
  });

  it('should apply custom style', () => {
    const message = 'No recipes found';
    const customStyle = { marginTop: 20 };
    
    renderWithTheme(<EmptyState message={message} style={customStyle} />);
    
    const container = screen.getByTestId('empty-state');
    expect(container).toBeTruthy();
  });

  it('should use custom testID', () => {
    const message = 'No recipes found';
    const customTestID = 'custom-empty-state';
    
    renderWithTheme(<EmptyState message={message} testID={customTestID} />);
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-message`)).toBeTruthy();
  });

  it('should render with all props', () => {
    const message = 'No recipes found';
    const icon = '📝';
    const action = {
      title: 'Add Recipe',
      onPress: jest.fn(),
    };
    const customStyle = { padding: 10 };
    const customTestID = 'full-props-empty-state';
    
    renderWithTheme(
      <EmptyState
        message={message}
        icon={icon}
        action={action}
        style={customStyle}
        testID={customTestID}
      />
    );
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.getByText(icon)).toBeTruthy();
    expect(screen.getByText('Add Recipe')).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-action-button`)).toBeTruthy();
  });
});
