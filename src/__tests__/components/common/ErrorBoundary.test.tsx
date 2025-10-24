import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
import { ThemeProvider } from '../../../context/ThemeContext';

// Mock component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock component that doesn't throw
const NoError = () => <div>No error</div>;

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    renderWithTheme(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeTruthy();
  });

  it('should render fallback UI when there is an error', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
    expect(screen.getByText("We're sorry, but something unexpected happened. Please try again.")).toBeTruthy();
    expect(screen.getByTestId('error-boundary-fallback-retry-button')).toBeTruthy();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();
    
    renderWithTheme(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error UI</div>;
    
    renderWithTheme(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom error UI')).toBeTruthy();
  });

  it('should retry when retry button is pressed', () => {
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show error UI
    expect(screen.getByText('Oops! Something went wrong')).toBeTruthy();
    
    // Press retry button
    fireEvent.press(screen.getByTestId('error-boundary-fallback-retry-button'));
    
    // Should show children again (no error)
    expect(screen.getByText('No error')).toBeTruthy();
  });

  it('should show error details in development mode', () => {
    // Mock __DEV__ to be true
    const originalDev = global.__DEV__;
    global.__DEV__ = true;
    
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Error Details (Development):')).toBeTruthy();
    expect(screen.getByText('Test error')).toBeTruthy();
    
    // Restore original __DEV__
    global.__DEV__ = originalDev;
  });

  it('should not show error details in production mode', () => {
    // Mock __DEV__ to be false
    const originalDev = global.__DEV__;
    global.__DEV__ = false;
    
    renderWithTheme(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.queryByText('Error Details (Development):')).toBeNull();
    
    // Restore original __DEV__
    global.__DEV__ = originalDev;
  });

  it('should use custom testID', () => {
    const customTestID = 'custom-error-boundary';
    
    renderWithTheme(
      <ErrorBoundary testID={customTestID}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
  });
});
