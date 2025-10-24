import 'react-native-gesture-handler/jestSetup';
import 'reflect-metadata';

// Define __DEV__ for React Native
global.__DEV__ = true;

// Performance testing setup
global.performance = {
  now: jest.fn(() => Date.now()),
  memory: {
    usedJSHeapSize: 0,
    totalJSHeapSize: 0,
    jsHeapSizeLimit: 0
  },
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(() => []),
  getEntriesByName: jest.fn(() => []),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
};

// Mock requestAnimationFrame for performance testing
global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn(id => clearTimeout(id));

// Mock IntersectionObserver for performance testing
global.IntersectionObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock ResizeObserver for performance testing
global.ResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn()
}));

// Mock Platform early to prevent React Native Testing Library issues
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((config) => config.ios || config.default),
  isPad: false,
  isTVOS: false,
  isTesting: true,
}));

// Mock React Native core components
jest.mock('react-native', () => {
  const mockRN = {
    Platform: {
      OS: 'ios',
      select: jest.fn((config) => config.ios || config.default),
      isPad: false,
      isTVOS: false,
      isTesting: true,
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    PixelRatio: {
      get: jest.fn(() => 2),
      getFontScale: jest.fn(() => 1),
      getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
      roundToNearestPixel: jest.fn((size) => Math.round(size)),
    },
    StyleSheet: {
      create: jest.fn((styles) => styles),
      flatten: jest.fn((style) => style),
      absoluteFill: {},
      absoluteFillObject: {},
      hairlineWidth: 1,
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    TextInput: 'TextInput',
    ScrollView: 'ScrollView',
    FlatList: 'FlatList',
    ActivityIndicator: 'ActivityIndicator',
    Image: 'Image',
    Modal: 'Modal',
    Alert: {
      alert: jest.fn(),
    },
  };
  
  return mockRN;
});


// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
    getCameraPermissionsAsync: jest.fn(),
  },
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  getMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    readTransaction: jest.fn(),
    close: jest.fn(),
  })),
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/documents/',
  writeAsStringAsync: jest.fn(),
  readAsStringAsync: jest.fn(),
  deleteAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    reset: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));




// Mock the DI container
jest.mock('../infrastructure/di/container', () => ({
  container: {
    get: jest.fn(),
    bind: jest.fn(),
    unbind: jest.fn(),
    isBound: jest.fn(),
  },
  configureContainer: jest.fn(),
  getService: jest.fn((serviceIdentifier) => {
    // Return mock use cases based on the service identifier
    const mockUseCase = {
      execute: jest.fn().mockResolvedValue({
        isSuccess: true,
        value: [],
        error: null
      })
    };
    return mockUseCase;
  }),
  isServiceBound: jest.fn(),
  replaceService: jest.fn(),
}));

// Mock console methods to reduce noise in tests
// Console error suppression for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};

console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('componentWillReceiveProps')
  ) {
    return;
  }
  originalConsoleWarn.call(console, ...args);
};
