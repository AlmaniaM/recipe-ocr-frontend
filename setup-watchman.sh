#!/bin/bash

# Setup Watchman for Recipe OCR Frontend
echo "🔧 Setting up Watchman for Recipe OCR Frontend..."

# Check if Homebrew is installed
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew is not installed. Please install Homebrew first:"
    echo "   /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
    exit 1
fi

# Install Watchman
echo "📦 Installing Watchman..."
brew install watchman

# Check if Watchman is installed
if ! command -v watchman &> /dev/null; then
    echo "❌ Failed to install Watchman"
    exit 1
fi

echo "✅ Watchman installed successfully"

# Navigate to project directory
cd "$(dirname "$0")"

# Initialize Watchman in the project
echo "🔍 Initializing Watchman in project directory..."
watchman watch .

# Verify Watchman is working
echo "🔍 Verifying Watchman setup..."
watchman watch-list

# Set up file limits
echo "⚙️ Setting up file limits..."
ulimit -n 65536

echo "✅ Watchman setup complete!"
echo ""
echo "🚀 You can now run:"
echo "   yarn start"
echo "   yarn android"
echo ""
echo "If you still get EMFILE errors, try:"
echo "   yarn start --tunnel"
