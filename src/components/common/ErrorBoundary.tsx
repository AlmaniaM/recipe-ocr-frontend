import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  testID?: string;
}

/**
 * React error boundary that catches JavaScript errors anywhere in the child component tree
 * Displays a user-friendly error message with retry functionality
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onRetry={this.handleRetry}
          testID={this.props.testID}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  onRetry: () => void;
  testID?: string;
}

/**
 * Default fallback UI for ErrorBoundary
 */
const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  onRetry,
  testID = 'error-boundary-fallback',
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]} testID={testID}>
      <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Oops! Something went wrong
        </Text>
        
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
          We're sorry, but something unexpected happened. Please try again.
        </Text>

        {__DEV__ && error && (
          <View style={styles.errorDetails}>
            <Text style={[styles.errorTitle, { color: theme.colors.error }]}>
              Error Details (Development):
            </Text>
            <Text style={[styles.errorText, { color: theme.colors.textSecondary }]}>
              {error.message}
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
          onPress={onRetry}
          testID={`${testID}-retry-button`}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.surface }]}>
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 12,
    maxWidth: 400,
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Inter-Bold',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
  errorDetails: {
    width: '100%',
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'Inter-Bold',
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Inter-SemiBold',
  },
});

export default ErrorBoundary;
