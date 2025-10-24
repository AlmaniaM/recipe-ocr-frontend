import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeProvider } from '../../context/ThemeContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: string;
}

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: CustomRenderOptions
) => {
  return render(ui, { wrapper: AllTheProviders, ...options });
};

// Re-export everything
export * from '@testing-library/react-native';

// Override render method
export { customRender as render };
