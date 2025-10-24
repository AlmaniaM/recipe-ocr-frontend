import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorState } from '../../../components/common/ErrorState';
import { ThemeProvider } from '../../../context/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ErrorState', () => {
  it('should render with message', () => {
    const message = 'Something went wrong';
    renderWithTheme(<ErrorState message={message} />);
    
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.getByTestId('error-state-message')).toBeTruthy();
  });

  it('should render with retry button when onRetry is provided', () => {
    const message = 'Failed to load data';
    const onRetry = jest.fn();
    
    renderWithTheme(
      <ErrorState message={message} onRetry={onRetry} />
    );
    
    expect(screen.getByText('Try Again')).toBeTruthy();
    expect(screen.getByTestId('error-state-retry-button')).toBeTruthy();
  });

  it('should not render retry button when onRetry is not provided', () => {
    const message = 'Something went wrong';
    
    renderWithTheme(<ErrorState message={message} />);
    
    expect(screen.queryByText('Try Again')).toBeNull();
    expect(screen.queryByTestId('error-state-retry-button')).toBeNull();
  });

  it('should not render retry button when showRetry is false', () => {
    const message = 'Something went wrong';
    const onRetry = jest.fn();
    
    renderWithTheme(
      <ErrorState message={message} onRetry={onRetry} showRetry={false} />
    );
    
    expect(screen.queryByText('Try Again')).toBeNull();
    expect(screen.queryByTestId('error-state-retry-button')).toBeNull();
  });

  it('should call onRetry when retry button is pressed', () => {
    const message = 'Failed to load data';
    const onRetry = jest.fn();
    
    renderWithTheme(
      <ErrorState message={message} onRetry={onRetry} />
    );
    
    fireEvent.press(screen.getByTestId('error-state-retry-button'));
    
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should render with icon when provided', () => {
    const message = 'Something went wrong';
    const icon = '⚠️';
    
    renderWithTheme(<ErrorState message={message} icon={icon} />);
    
    expect(screen.getByText(icon)).toBeTruthy();
    expect(screen.getByTestId('error-state-icon')).toBeTruthy();
  });

  it('should not render icon when not provided', () => {
    const message = 'Something went wrong';
    
    renderWithTheme(<ErrorState message={message} />);
    
    expect(screen.queryByTestId('error-state-icon')).toBeNull();
  });

  it('should apply custom style', () => {
    const message = 'Something went wrong';
    const customStyle = { marginTop: 20 };
    
    renderWithTheme(<ErrorState message={message} style={customStyle} />);
    
    const container = screen.getByTestId('error-state');
    expect(container).toBeTruthy();
  });

  it('should use custom testID', () => {
    const message = 'Something went wrong';
    const customTestID = 'custom-error-state';
    
    renderWithTheme(<ErrorState message={message} testID={customTestID} />);
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-message`)).toBeTruthy();
  });

  it('should render with all props', () => {
    const message = 'Failed to load recipes';
    const icon = '❌';
    const onRetry = jest.fn();
    const customStyle = { padding: 10 };
    const customTestID = 'full-props-error-state';
    
    renderWithTheme(
      <ErrorState
        message={message}
        icon={icon}
        onRetry={onRetry}
        showRetry={true}
        style={customStyle}
        testID={customTestID}
      />
    );
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.getByText(icon)).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-retry-button`)).toBeTruthy();
  });
});
