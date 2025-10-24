# Watchman Setup for Recipe OCR Frontend

This guide helps you set up Watchman to resolve the "EMFILE: too many open files" error when running the React Native development server.

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
yarn setup:watchman
```

### Option 2: Manual Setup

1. **Install Watchman:**
   ```bash
   brew install watchman
   ```

2. **Initialize Watchman in your project:**
   ```bash
   cd /Users/amolodyh/Freelancing/me/recipe-app/recipe-ocr-frontend
   watchman watch .
   ```

3. **Verify Watchman is working:**
   ```bash
   watchman watch-list
   ```

## 🔧 Configuration Files Created

### `.watchmanconfig`
- Tells Watchman which directories to ignore
- Reduces the number of files being watched
- Prevents EMFILE errors

### `metro.config.js` (Updated)
- Configured to use Watchman for file watching
- Added blacklist patterns to exclude unnecessary files
- Optimized for better performance

### `package.json` (Updated)
- Added `ulimit -n 65536` to all start scripts
- Added new scripts for different start modes
- Added `setup:watchman` script

## 🚀 Running the Project

### Standard Development
```bash
yarn start
yarn android
```

### If Still Getting EMFILE Errors
```bash
# Try tunnel mode (uses Expo's servers)
yarn start:tunnel

# Or clear cache and restart
yarn start:clear
```

### Alternative: Use Physical Device
1. Enable Developer Options on your Android phone
2. Enable USB Debugging
3. Connect via USB
4. Run `yarn android`

## 🔧 Troubleshooting

### Check File Limits
```bash
# Check current limits
ulimit -n
launchctl limit maxfiles
```

### Reset Watchman
```bash
# Stop Watchman
watchman shutdown-server

# Clear Watchman state
watchman watch-del-all

# Reinitialize
watchman watch .
```

### Clear All Caches
```bash
# Kill all processes
pkill -f node
pkill -f metro
pkill -f expo

# Clear caches
rm -rf node_modules/.cache
rm -rf .expo
rm -rf coverage

# Restart
yarn start
```

## 📱 Alternative: Use Physical Device

If you continue having issues with the emulator:

1. **Enable Developer Options:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect and Run:**
   ```bash
   yarn android
   ```

This bypasses the emulator entirely and often works better for development.

## ✅ Verification

After setup, you should be able to run:
```bash
yarn start
```

Without getting the "EMFILE: too many open files" error.

If you still encounter issues, try the tunnel mode or use a physical device as alternatives.
