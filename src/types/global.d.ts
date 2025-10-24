declare module 'react-native-vector-icons/MaterialIcons' {
  import { Component } from 'react';
  import { TextProps } from 'react-native';

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export default class Icon extends Component<IconProps> {}
}

declare module '@testing-library/react-native' {
  export * from '@testing-library/react-native';
}

declare module 'jest' {
  const jest: any;
  export default jest;
}

declare global {
  const describe: any;
  const it: any;
  const expect: any;
  const beforeEach: any;
  const afterEach: any;
  const beforeAll: any;
  const afterAll: any;
  const jest: any;
}
