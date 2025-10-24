// Mock React Native modules for testing
const React = require('react');

const mockAccessibilityInfo = {
  isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
  announceForAccessibility: jest.fn(),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

const mockUIManager = {
  sendAccessibilityEvent: jest.fn(),
  AccessibilityEventTypes: {
    typeViewFocused: 8,
  },
};

const mockFindNodeHandle = jest.fn(() => 123);

// Create mock components that work with React Testing Library
const createMockComponent = (name) => {
  const MockComponent = (props) => {
    return React.createElement('div', { 
      ...props, 
      'data-testid': props.testID,
      'data-native-testid': props.testID 
    });
  };
  MockComponent.displayName = name;
  return MockComponent;
};

// Mock the entire react-native module
module.exports = {
  AccessibilityInfo: mockAccessibilityInfo,
  UIManager: mockUIManager,
  findNodeHandle: mockFindNodeHandle,
  
  // React Native components
  View: createMockComponent('View'),
  Text: createMockComponent('Text'),
  TouchableOpacity: createMockComponent('TouchableOpacity'),
  TextInput: createMockComponent('TextInput'),
  Modal: createMockComponent('Modal'),
  Image: createMockComponent('Image'),
  ScrollView: createMockComponent('ScrollView'),
  FlatList: createMockComponent('FlatList'),
  TouchableHighlight: createMockComponent('TouchableHighlight'),
  TouchableWithoutFeedback: createMockComponent('TouchableWithoutFeedback'),
  Pressable: createMockComponent('Pressable'),
  SafeAreaView: createMockComponent('SafeAreaView'),
  KeyboardAvoidingView: createMockComponent('KeyboardAvoidingView'),
  
  // StyleSheet
  StyleSheet: {
    create: (styles) => styles,
    flatten: (style) => style,
    absoluteFill: {},
    absoluteFillObject: {},
    hairlineWidth: 1,
  },
  
  // Dimensions
  Dimensions: {
    get: () => ({ width: 375, height: 667 }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  // Platform
  Platform: {
    OS: 'ios',
    select: (obj) => obj.ios || obj.default,
    isPad: false,
    isTVOS: false,
    isTesting: true,
  },
  
  // Alert
  Alert: {
    alert: jest.fn(),
    prompt: jest.fn(),
  },
  
  // Linking
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    getInitialURL: jest.fn(() => Promise.resolve(null)),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  // AppState
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  // Keyboard
  Keyboard: {
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dismiss: jest.fn(),
  },
  
  // LayoutAnimation
  LayoutAnimation: {
    configureNext: jest.fn(),
    create: jest.fn(),
    Types: {},
    Properties: {},
  },
  
  // Animated
  Animated: {
    View: createMockComponent('Animated.View'),
    Text: createMockComponent('Animated.Text'),
    Image: createMockComponent('Animated.Image'),
    ScrollView: createMockComponent('Animated.ScrollView'),
    FlatList: createMockComponent('Animated.FlatList'),
    Value: jest.fn(),
    ValueXY: jest.fn(),
    timing: jest.fn(),
    spring: jest.fn(),
    decay: jest.fn(),
    sequence: jest.fn(),
    parallel: jest.fn(),
    stagger: jest.fn(),
    loop: jest.fn(),
    event: jest.fn(),
    add: jest.fn(),
    subtract: jest.fn(),
    multiply: jest.fn(),
    divide: jest.fn(),
    modulo: jest.fn(),
    diffClamp: jest.fn(),
    interpolate: jest.fn(),
    createAnimatedComponent: jest.fn(),
  },
  
  // Easing
  Easing: {
    linear: jest.fn(),
    ease: jest.fn(),
    quad: jest.fn(),
    cubic: jest.fn(),
    poly: jest.fn(),
    sin: jest.fn(),
    circle: jest.fn(),
    exp: jest.fn(),
    elastic: jest.fn(),
    back: jest.fn(),
    bounce: jest.fn(),
    bezier: jest.fn(),
    in: jest.fn(),
    out: jest.fn(),
    inOut: jest.fn(),
  },
  
  // PanResponder
  PanResponder: {
    create: jest.fn(),
  },
  
  // PixelRatio
  PixelRatio: {
    get: jest.fn(() => 2),
    getFontScale: jest.fn(() => 1),
    getPixelSizeForLayoutSize: jest.fn((size) => size * 2),
    roundToNearestPixel: jest.fn((size) => Math.round(size)),
  },
  
  // StatusBar
  StatusBar: {
    setBarStyle: jest.fn(),
    setBackgroundColor: jest.fn(),
    setHidden: jest.fn(),
    setNetworkActivityIndicatorVisible: jest.fn(),
    setTranslucent: jest.fn(),
  },
  
  // NetInfo
  NetInfo: {
    fetch: jest.fn(() => Promise.resolve({ isConnected: true })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  // AsyncStorage
  AsyncStorage: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
  },
  
  // PermissionsAndroid
  PermissionsAndroid: {
    PERMISSIONS: {},
    RESULTS: {},
    request: jest.fn(() => Promise.resolve('granted')),
    requestMultiple: jest.fn(() => Promise.resolve({})),
    check: jest.fn(() => Promise.resolve(true)),
  },
  
  // Vibration
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },
  
  // Clipboard
  Clipboard: {
    getString: jest.fn(() => Promise.resolve('')),
    setString: jest.fn(() => Promise.resolve()),
  },
  
  // Share
  Share: {
    share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })),
  },
  
  // DeviceInfo
  DeviceInfo: {
    getModel: jest.fn(() => 'iPhone'),
    getSystemName: jest.fn(() => 'iOS'),
    getSystemVersion: jest.fn(() => '14.0'),
  },
};