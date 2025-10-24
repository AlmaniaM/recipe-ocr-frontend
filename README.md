# Recipe OCR Frontend

A React Native Expo application for digitizing and managing recipes through OCR (Optical Character Recognition) technology.

## Features

- **Recipe Management**: Create, edit, view, and organize recipes
- **OCR Integration**: Capture and process recipe images using OCR
- **Recipe Books**: Organize recipes into collections
- **Theme System**: Multiple UI themes with persistence
- **Local Storage**: SQLite database for offline functionality
- **Camera Integration**: Capture recipe photos
- **Image Processing**: Crop and manipulate images

## Technology Stack

- **React Native** (0.81.4) with **Expo** (~54.0.13)
- **TypeScript** for type safety
- **React Navigation** for navigation (v7)
- **AsyncStorage** for local data persistence
- **Expo SQLite** for database operations
- **Jest** and **React Native Testing Library** for testing

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components
│   ├── forms/          # Form components
│   └── recipe/         # Recipe-specific components
├── constants/          # App constants and themes
├── context/           # React Context providers
├── hooks/             # Custom React hooks
├── navigation/        # Navigation configuration
├── screens/           # Screen components
│   ├── books/         # Recipe book management
│   ├── recipes/       # Recipe management
│   └── settings/      # App settings
├── services/          # Business logic and external services
│   ├── api/           # API communication
│   ├── ocr/           # OCR processing
│   └── storage/       # Data persistence
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recipe-ocr-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on specific platforms:
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Testing

This project includes comprehensive testing setup with Jest and React Native Testing Library.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests for CI
npm run test:ci
```

### Test Structure

```
src/__tests__/
├── context/           # Context provider tests
├── constants/         # Constants and theme tests
├── types/            # Type definition tests
├── screens/          # Screen component tests
├── navigation/       # Navigation tests
├── integration/      # Integration tests
├── e2e/             # End-to-end tests
├── utils/           # Test utilities
└── __mocks__/       # Mock implementations
```

### Test Coverage

The project maintains a minimum test coverage threshold of 95% for:
- Branches
- Functions
- Lines
- Statements

## Available Scripts

- `npm start` - Start the Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run on web browser
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:ci` - Run tests for CI environment

## Themes

The app includes three built-in themes:

1. **Warm & Inviting** (Default) - Orange and golden tones
2. **Clean & Modern** - Blue and emerald accents
3. **Earthy & Natural** - Green and amber tones

Themes are persisted using AsyncStorage and can be changed in the Settings screen.

## Development

### Code Style

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- React Native Testing Library for testing

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the repository.
