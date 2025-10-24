import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';

// No need to mock react-native here, it's handled in setup.ts

describe('Simple Test', () => {
  it('should render a simple component', () => {
    const { getByText } = render(
      <View>
        <Text>Hello World</Text>
      </View>
    );
    
    expect(getByText('Hello World')).toBeTruthy();
  });
});
