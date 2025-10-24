import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LoadingButton } from '../../../components/common/LoadingButton';
import { ThemeProvider } from '../../../context/ThemeContext';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('LoadingButton', () => {
  it('should render with title', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    
    renderWithTheme(<LoadingButton title={title} onPress={onPress} />);
    
    expect(screen.getByText(title)).toBeTruthy();
    expect(screen.getByTestId('loading-button-text')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    
    renderWithTheme(<LoadingButton title={title} onPress={onPress} />);
    
    fireEvent.press(screen.getByTestId('loading-button'));
    
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('should show loading state when isLoading is true', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    
    renderWithTheme(
      <LoadingButton title={title} onPress={onPress} isLoading={true} />
    );
    
    expect(screen.getByTestId('loading-button-spinner')).toBeTruthy();
    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should show custom loading text when provided', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    const loadingText = 'Saving...';
    
    renderWithTheme(
      <LoadingButton
        title={title}
        onPress={onPress}
        isLoading={true}
        loadingText={loadingText}
      />
    );
    
    expect(screen.getByText(loadingText)).toBeTruthy();
  });

  it('should be disabled when isLoading is true', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    
    renderWithTheme(
      <LoadingButton title={title} onPress={onPress} isLoading={true} />
    );
    
    const button = screen.getByTestId('loading-button');
    expect(button.props.disabled).toBe(true);
  });

  it('should be disabled when disabled prop is true', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    
    renderWithTheme(
      <LoadingButton title={title} onPress={onPress} disabled={true} />
    );
    
    const button = screen.getByTestId('loading-button');
    expect(button.props.disabled).toBe(true);
  });

  it('should not call onPress when disabled', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    
    renderWithTheme(
      <LoadingButton title={title} onPress={onPress} disabled={true} />
    );
    
    fireEvent.press(screen.getByTestId('loading-button'));
    
    expect(onPress).not.toHaveBeenCalled();
  });

  it('should apply custom style', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    const customStyle = { marginTop: 20 };
    
    renderWithTheme(
      <LoadingButton title={title} onPress={onPress} style={customStyle} />
    );
    
    const button = screen.getByTestId('loading-button');
    expect(button).toBeTruthy();
  });

  it('should apply custom text style', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    const customTextStyle = { fontSize: 18 };
    
    renderWithTheme(
      <LoadingButton
        title={title}
        onPress={onPress}
        textStyle={customTextStyle}
      />
    );
    
    const text = screen.getByTestId('loading-button-text');
    expect(text).toBeTruthy();
  });

  it('should use custom testID', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    const customTestID = 'custom-loading-button';
    
    renderWithTheme(
      <LoadingButton
        title={title}
        onPress={onPress}
        testID={customTestID}
      />
    );
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-text`)).toBeTruthy();
  });

  it('should render with all props', () => {
    const title = 'Save Recipe';
    const onPress = jest.fn();
    const loadingText = 'Saving...';
    const customStyle = { padding: 10 };
    const customTextStyle = { fontSize: 18 };
    const customTestID = 'full-props-loading-button';
    
    renderWithTheme(
      <LoadingButton
        title={title}
        onPress={onPress}
        isLoading={true}
        loadingText={loadingText}
        style={customStyle}
        textStyle={customTextStyle}
        testID={customTestID}
      />
    );
    
    expect(screen.getByTestId(customTestID)).toBeTruthy();
    expect(screen.getByText(loadingText)).toBeTruthy();
    expect(screen.getByTestId(`${customTestID}-spinner`)).toBeTruthy();
  });
});
