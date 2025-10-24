import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { LoadingScreen } from '../../../components/common/LoadingScreen';
import { ThemeProvider } from '../../../context/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('LoadingScreen', () => {
  it('should render with default message', () => {
    renderWithTheme(<LoadingScreen />);
    
    expect(screen.getByText('Loading...')).toBeTruthy();
    expect(screen.getByTestId('loading-screen-spinner')).toBeTruthy();
  });

  it('should render with custom message', () => {
    const message = 'Loading recipes...';
    renderWithTheme(<LoadingScreen message={message} />);
    
    expect(screen.getByText(message)).toBeTruthy();
  });

  it('should apply custom style', () => {
    const customStyle = { backgroundColor: '#f0f0f0' };
    renderWithTheme(<LoadingScreen style={customStyle} />);
    
    const container = screen.getByTestId('loading-screen');
    expect(container).toBeTruthy();
  });

  it('should use custom testID', () => {
    const customTestID = 'custom-loading-screen';
    renderWithTheme(<LoadingScreen testID={customTestID} />);
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-spinner`)).toBeTruthy();
  });

  it('should render with all props', () => {
    const message = 'Loading data...';
    const customStyle = { padding: 20 };
    const customTestID = 'full-props-loading-screen';
    
    renderWithTheme(
      <LoadingScreen
        message={message}
        style={customStyle}
        testID={customTestID}
      />
    );
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-spinner`)).toBeTruthy();
  });
});
