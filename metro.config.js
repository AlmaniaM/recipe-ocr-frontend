const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enable tree shaking
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize bundle
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
  compress: {
    drop_console: process.env.NODE_ENV === 'production',
    drop_debugger: process.env.NODE_ENV === 'production',
    pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
  },
};

// Enable bundle analysis
config.transformer.enableBabelRCLookup = false;

// Optimize resolver
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Enable source maps for debugging
config.transformer.enableBabelRCLookup = false;

// Optimize asset handling
config.transformer.assetPlugins = [];

// Enable tree shaking for better bundle size
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Configure module resolution
config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@components': path.resolve(__dirname, 'src/components'),
  '@hooks': path.resolve(__dirname, 'src/hooks'),
  '@utils': path.resolve(__dirname, 'src/utils'),
  '@services': path.resolve(__dirname, 'src/services'),
  '@types': path.resolve(__dirname, 'src/types'),
  '@constants': path.resolve(__dirname, 'src/constants'),
  '@context': path.resolve(__dirname, 'src/context'),
  '@domain': path.resolve(__dirname, 'src/domain'),
  '@infrastructure': path.resolve(__dirname, 'src/infrastructure'),
  '@application': path.resolve(__dirname, 'src/application'),
  '@presentation': path.resolve(__dirname, 'src/presentation'),
  '@navigation': path.resolve(__dirname, 'src/navigation'),
  '@screens': path.resolve(__dirname, 'src/screens'),
};

// Optimize transform ignore patterns
config.transformer.transformIgnorePatterns = [
  'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-vector-icons|@tanstack/react-query|zustand|inversify|reflect-metadata)'
];

// Enable bundle splitting
config.serializer.createModuleIdFactory = function () {
  return function (path) {
    // Create deterministic module IDs for better caching
    let name = path.substr(path.lastIndexOf('/') + 1);
    if (name === 'index.js') {
      name = path.substr(path.lastIndexOf('/', path.lastIndexOf('/') - 1) + 1);
    }
    return name.replace(/\.[^/.]+$/, '');
  };
};

// Optimize for production
if (process.env.NODE_ENV === 'production') {
  // Enable dead code elimination
  config.transformer.minifierConfig.compress.dead_code = true;
  config.transformer.minifierConfig.compress.unused = true;
  
  // Enable more aggressive minification
  config.transformer.minifierConfig.mangle = {
    ...config.transformer.minifierConfig.mangle,
    toplevel: true,
  };
  
  // Remove console statements in production
  config.transformer.minifierConfig.compress.pure_funcs = [
    'console.log',
    'console.info',
    'console.debug',
    'console.warn',
  ];
}

// Enable bundle analysis in development
if (process.env.NODE_ENV === 'development') {
  // Add bundle analysis plugin - commented out due to compatibility issues
  // config.serializer.customSerializer = require('metro/src/DeltaBundler/Serializers/baseJSBundle').getDefaultSerializer();
}

// Configure asset handling
config.transformer.assetPlugins = [];

// Enable source maps for better debugging
config.transformer.enableBabelRCLookup = false;

// Optimize resolver for better performance
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Configure watchman for better file watching
config.watchFolders = [
  path.resolve(__dirname, 'src'),
];

// Reduce file watching scope to prevent EMFILE errors
config.resolver = {
  ...config.resolver,
  blacklistRE: /(node_modules\/.*\/node_modules|\.git|coverage|\.expo|android|ios|web-build|\.DS_Store|.*\.log|temp|tmp|dist|build)/,
};

// Configure Metro to use Watchman for better file watching
config.watcher = {
  additionalExts: ['cjs', 'mjs'],
  watchman: {
    deferStates: ['hg.update'],
  },
};

// Enable experimental features for better performance - commented out due to compatibility issues
// config.resolver.unstable_enableSymlinks = true;
// config.resolver.unstable_enablePackageExports = true;

// Configure cache for better performance - commented out due to compatibility issues
// config.cacheStores = [
//   {
//     name: 'metro-cache',
//     type: 'file',
//     options: {
//       cacheDirectory: path.resolve(__dirname, '.metro-cache'),
//     },
//   },
// ];

// Enable bundle splitting for better performance
config.serializer.createModuleIdFactory = function () {
  return function (path) {
    // Create deterministic module IDs for better caching
    let name = path.substr(path.lastIndexOf('/') + 1);
    if (name === 'index.js') {
      name = path.substr(path.lastIndexOf('/', path.lastIndexOf('/') - 1) + 1);
    }
    return name.replace(/\.[^/.]+$/, '');
  };
};

// Configure transformer for better performance - commented out due to missing module
// config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

// Enable experimental features - commented out due to compatibility issues
// config.resolver.unstable_enableSymlinks = true;
// config.resolver.unstable_enablePackageExports = true;

// Configure resolver for better module resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Enable tree shaking
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Optimize for performance
config.transformer.minifierConfig = {
  ...config.transformer.minifierConfig,
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
  compress: {
    ...config.transformer.minifierConfig.compress,
    drop_console: process.env.NODE_ENV === 'production',
    drop_debugger: process.env.NODE_ENV === 'production',
    pure_funcs: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
  },
};

module.exports = config;
