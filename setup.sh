#!/bin/bash

echo "🚀 GitLab MCP Server Setup"
echo "=========================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your GitLab token"
    echo ""
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build project"
    exit 1
fi

echo "✅ Project built successfully"
echo ""

# Get absolute path
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your GitLab URL and token"
echo "2. Add the following to your Cursor MCP config (~/.cursor/config/mcp.json):"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"gitlab\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"${SCRIPT_DIR}/dist/index.js\"],"
echo "      \"env\": {"
echo "        \"GITLAB_URL\": \"https://gitlab.com\","
echo "        \"GITLAB_TOKEN\": \"your_token_here\""
echo "      }"
echo "    }"
echo "  }"
echo "}"
echo ""
echo "3. Restart Cursor"
echo ""
echo "📖 For more information, see README.md"

