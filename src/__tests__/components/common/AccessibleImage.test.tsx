import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { Image, Text, AccessibilityInfo } from 'react-native';
import { AccessibleImage } from '../../../components/common/AccessibleImage';
import { ThemeProvider } from '../../../context/ThemeContext';

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

// Mock the useTheme hook
jest.mock('../../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: mockTheme }),
}));

// Mock AccessibilityInfo
jest.mock('react-native', () => ({
  ...jest.requireActual('react-native'),
  AccessibilityInfo: {
    isScreenReaderEnabled: jest.fn().mockResolvedValue(true),
    announceForAccessibility: jest.fn(),
    addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  },
  Image: jest.fn((props) => {
    // Mock Image component to immediately call onLoad or onError
    React.useEffect(() => {
      if (props.source && props.source.uri === 'invalid-uri') {
        props.onError?.({ nativeEvent: { error: 'Failed to load' } });
      } else {
        props.onLoad?.();
      }
    }, [props.source]);
    return <Text testID="mock-image">{props.source?.uri || 'placeholder'}</Text>;
  }),
}));

// Mock the useAccessibility hook
const mockAnnounceForAccessibility = jest.fn();
jest.mock('../../../hooks/useAccessibility', () => ({
  useAccessibility: () => ({
    announceForAccessibility: mockAnnounceForAccessibility,
  }),
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('AccessibleImage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders image with alt text as accessibilityLabel', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" />
    );
    const image = getByTestId('recipe-image-image');
    expect(image).toHaveProp('accessibilityLabel', 'Recipe Photo');
    expect(image).toHaveProp('accessibilityRole', 'image');
  });

  it('shows loading state initially if not loaded', () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} />
    );
    expect(getByTestId('recipe-image-loading')).toBeTruthy();
    expect(getByText('Loading image...')).toBeTruthy();
    expect(getByTestId('recipe-image-loading')).toHaveProp('accessibilityLabel', 'Recipe Photo - Loading');
    expect(getByTestId('recipe-image-loading')).toHaveProp('accessibilityState', { busy: true });
  });

  it('hides loading state after image loads', async () => {
    const { queryByTestId, getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} />
    );

    await waitFor(() => {
      expect(queryByTestId('recipe-image-loading')).toBeNull();
      expect(getByTestId('recipe-image-image')).toBeTruthy();
    });
  });

  it('shows error state if image fails to load', async () => {
    const { getByTestId, getByText } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} />
    );

    await waitFor(() => {
      expect(getByTestId('recipe-image-error')).toBeTruthy();
      expect(getByText('Failed to load image')).toBeTruthy();
      expect(getByTestId('recipe-image-error')).toHaveProp('accessibilityLabel', 'Recipe Photo - Failed to load image');
      expect(getByTestId('recipe-image-error')).toHaveProp('accessibilityState', { disabled: true });
    });
  });

  it('announces image loading error for accessibility', async () => {
    renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} />
    );

    await waitFor(() => {
      expect(mockAnnounceForAccessibility).toHaveBeenCalledWith('Image failed to load: Recipe Photo');
    });
  });

  it('applies custom size and shape styles', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" size="large" shape="circle" />
    );
    const image = getByTestId('recipe-image-image');
    expect(image.props.style).toContainEqual(expect.objectContaining({ width: 200, height: 200 }));
    expect(image.props.style).toContainEqual(expect.objectContaining({ borderRadius: 9999 }));
  });

  it('uses custom accessibilityHint if provided', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" accessibilityHint="A beautiful dish" testID="recipe-image" />
    );
    const image = getByTestId('recipe-image-image');
    expect(image).toHaveProp('accessibilityHint', 'A beautiful dish');
  });

  it('handles custom testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="custom-image" />
    );
    expect(getByTestId('custom-image')).toBeTruthy();
  });

  it('handles custom image testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" imageTestID="custom-image-element" testID="recipe-image" />
    );
    expect(getByTestId('custom-image-element')).toBeTruthy();
  });

  it('handles custom loading testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingTestID="custom-loading" />
    );
    expect(getByTestId('custom-loading')).toBeTruthy();
  });

  it('handles custom error testID', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorTestID="custom-error" />
    );
    expect(getByTestId('custom-error')).toBeTruthy();
  });

  it('handles custom styles', () => {
    const customStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" style={customStyle} />
    );
    const image = getByTestId('recipe-image-image');
    expect(image).toHaveStyle(customStyle);
  });

  it('handles custom image styles', () => {
    const customImageStyle = { borderWidth: 2 };
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" imageStyle={customImageStyle} />
    );
    const image = getByTestId('recipe-image-image');
    expect(image).toHaveStyle(customImageStyle);
  });

  it('handles custom loading styles', () => {
    const customLoadingStyle = { backgroundColor: 'blue' };
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingStyle={customLoadingStyle} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveStyle(customLoadingStyle);
  });

  it('handles custom error styles', () => {
    const customErrorStyle = { backgroundColor: 'red' };
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorStyle={customErrorStyle} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveStyle(customErrorStyle);
  });

  it('handles custom loading text', () => {
    const { getByText } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingText="Custom loading text" />
    );
    expect(getByText('Custom loading text')).toBeTruthy();
  });

  it('handles custom error text', () => {
    const { getByText } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorText="Custom error text" />
    );
    expect(getByText('Custom error text')).toBeTruthy();
  });

  it('handles custom loading accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityLabel="Custom loading label" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityLabel', 'Custom loading label');
  });

  it('handles custom error accessibility label', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityLabel="Custom error label" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityLabel', 'Custom error label');
  });

  it('handles custom loading accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityHint="Custom loading hint" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityHint', 'Custom loading hint');
  });

  it('handles custom error accessibility hint', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityHint="Custom error hint" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityHint', 'Custom error hint');
  });

  it('handles custom loading accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityRole="progressbar" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityRole', 'progressbar');
  });

  it('handles custom error accessibility role', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityRole="alert" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityRole', 'alert');
  });

  it('handles custom loading accessibility state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityState={{ busy: false }} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityState', { busy: false });
  });

  it('handles custom error accessibility state', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityState={{ disabled: false }} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityState', { disabled: false });
  });

  it('handles custom loading accessibility traits', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityTraits={['progressbar', 'updatesFrequently']} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityTraits', ['progressbar', 'updatesFrequently']);
  });

  it('handles custom error accessibility traits', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityTraits={['alert', 'updatesFrequently']} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityTraits', ['alert', 'updatesFrequently']);
  });

  it('handles custom loading accessibility component type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityComponentType="progressbar" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityComponentType', 'progressbar');
  });

  it('handles custom error accessibility component type', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityComponentType="alert" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityComponentType', 'alert');
  });

  it('handles custom loading accessibility live region', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityLiveRegion="polite" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityLiveRegion', 'polite');
  });

  it('handles custom error accessibility live region', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityLiveRegion="assertive" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityLiveRegion', 'assertive');
  });

  it('handles custom loading accessibility view tag', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityViewIsModal={true} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityViewIsModal', true);
  });

  it('handles custom error accessibility view tag', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityViewIsModal={true} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityViewIsModal', true);
  });

  it('handles custom loading accessibility elements hidden', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityElementsHidden={true} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityElementsHidden', true);
  });

  it('handles custom error accessibility elements hidden', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityElementsHidden={true} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityElementsHidden', true);
  });

  it('handles custom loading accessibility important for accessibility', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingImportantForAccessibility="yes" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('importantForAccessibility', 'yes');
  });

  it('handles custom error accessibility important for accessibility', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorImportantForAccessibility="yes" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('importantForAccessibility', 'yes');
  });

  it('handles custom loading accessibility label for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityLabelForIOS="Custom iOS loading label" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityLabelForIOS', 'Custom iOS loading label');
  });

  it('handles custom error accessibility label for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityLabelForIOS="Custom iOS error label" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityLabelForIOS', 'Custom iOS error label');
  });

  it('handles custom loading accessibility hint for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityHintForIOS="Custom iOS loading hint" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityHintForIOS', 'Custom iOS loading hint');
  });

  it('handles custom error accessibility hint for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityHintForIOS="Custom iOS error hint" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityHintForIOS', 'Custom iOS error hint');
  });

  it('handles custom loading accessibility role for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityRoleForIOS="progressbar" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityRoleForIOS', 'progressbar');
  });

  it('handles custom error accessibility role for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityRoleForIOS="alert" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityRoleForIOS', 'alert');
  });

  it('handles custom loading accessibility traits for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityTraitsForIOS={['progressbar', 'updatesFrequently']} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityTraitsForIOS', ['progressbar', 'updatesFrequently']);
  });

  it('handles custom error accessibility traits for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityTraitsForIOS={['alert', 'updatesFrequently']} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityTraitsForIOS', ['alert', 'updatesFrequently']);
  });

  it('handles custom loading accessibility component type for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityComponentTypeForIOS="progressbar" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityComponentTypeForIOS', 'progressbar');
  });

  it('handles custom error accessibility component type for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityComponentTypeForIOS="alert" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityComponentTypeForIOS', 'alert');
  });

  it('handles custom loading accessibility live region for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityLiveRegionForIOS="polite" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityLiveRegionForIOS', 'polite');
  });

  it('handles custom error accessibility live region for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityLiveRegionForIOS="assertive" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityLiveRegionForIOS', 'assertive');
  });

  it('handles custom loading accessibility view tag for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityViewIsModalForIOS={true} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityViewIsModalForIOS', true);
  });

  it('handles custom error accessibility view tag for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityViewIsModalForIOS={true} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityViewIsModalForIOS', true);
  });

  it('handles custom loading accessibility elements hidden for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityElementsHiddenForIOS={true} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityElementsHiddenForIOS', true);
  });

  it('handles custom error accessibility elements hidden for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityElementsHiddenForIOS={true} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityElementsHiddenForIOS', true);
  });

  it('handles custom loading accessibility important for accessibility for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingImportantForAccessibilityForIOS="yes" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('importantForAccessibilityForIOS', 'yes');
  });

  it('handles custom error accessibility important for accessibility for iOS', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorImportantForAccessibilityForIOS="yes" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('importantForAccessibilityForIOS', 'yes');
  });

  it('handles custom loading accessibility label for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityLabelForAndroid="Custom Android loading label" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityLabelForAndroid', 'Custom Android loading label');
  });

  it('handles custom error accessibility label for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityLabelForAndroid="Custom Android error label" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityLabelForAndroid', 'Custom Android error label');
  });

  it('handles custom loading accessibility hint for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityHintForAndroid="Custom Android loading hint" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityHintForAndroid', 'Custom Android loading hint');
  });

  it('handles custom error accessibility hint for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityHintForAndroid="Custom Android error hint" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityHintForAndroid', 'Custom Android error hint');
  });

  it('handles custom loading accessibility role for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityRoleForAndroid="progressbar" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityRoleForAndroid', 'progressbar');
  });

  it('handles custom error accessibility role for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityRoleForAndroid="alert" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityRoleForAndroid', 'alert');
  });

  it('handles custom loading accessibility state for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityStateForAndroid={{ busy: false }} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityStateForAndroid', { busy: false });
  });

  it('handles custom error accessibility state for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityStateForAndroid={{ disabled: false }} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityStateForAndroid', { disabled: false });
  });

  it('handles custom loading accessibility actions for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityActionsForAndroid={[{ name: 'longpress', label: 'Long press' }]} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityActionsForAndroid', [{ name: 'longpress', label: 'Long press' }]);
  });

  it('handles custom error accessibility actions for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityActionsForAndroid={[{ name: 'longpress', label: 'Long press' }]} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityActionsForAndroid', [{ name: 'longpress', label: 'Long press' }]);
  });

  it('handles custom loading accessibility value for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityValueForAndroid={{ text: '50%' }} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityValueForAndroid', { text: '50%' });
  });

  it('handles custom error accessibility value for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityValueForAndroid={{ text: '50%' }} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityValueForAndroid', { text: '50%' });
  });

  it('handles custom loading accessibility live region for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityLiveRegionForAndroid="polite" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityLiveRegionForAndroid', 'polite');
  });

  it('handles custom error accessibility live region for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityLiveRegionForAndroid="assertive" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityLiveRegionForAndroid', 'assertive');
  });

  it('handles custom loading accessibility view tag for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityViewIsModalForAndroid={true} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityViewIsModalForAndroid', true);
  });

  it('handles custom error accessibility view tag for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityViewIsModalForAndroid={true} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityViewIsModalForAndroid', true);
  });

  it('handles custom loading accessibility elements hidden for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingAccessibilityElementsHiddenForAndroid={true} />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('accessibilityElementsHiddenForAndroid', true);
  });

  it('handles custom error accessibility elements hidden for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorAccessibilityElementsHiddenForAndroid={true} />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('accessibilityElementsHiddenForAndroid', true);
  });

  it('handles custom loading accessibility important for accessibility for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'https://example.com/image.jpg' }} alt="Recipe Photo" testID="recipe-image" showLoadingState={true} isLoaded={false} loadingImportantForAccessibilityForAndroid="yes" />
    );
    const loading = getByTestId('recipe-image-loading');
    expect(loading).toHaveProp('importantForAccessibilityForAndroid', 'yes');
  });

  it('handles custom error accessibility important for accessibility for Android', () => {
    const { getByTestId } = renderWithTheme(
      <AccessibleImage source={{ uri: 'invalid-uri' }} alt="Recipe Photo" testID="recipe-image" showErrorState={true} errorImportantForAccessibilityForAndroid="yes" />
    );
    const error = getByTestId('recipe-image-error');
    expect(error).toHaveProp('importantForAccessibilityForAndroid', 'yes');
  });
});