#!/bin/bash

# GitLab MCP Server 一键安装脚本
# 适用于团队内部快速部署

set -e

echo "🚀 开始安装 GitLab MCP Server..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 版本需要 >= 18.0.0"
    echo "当前版本: $(node -v)"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本检查通过: $(node -v)${NC}"

# 临时目录
TEMP_DIR=$(mktemp -d)
echo "📦 使用临时目录: $TEMP_DIR"

# 克隆仓库
echo "📥 克隆仓库..."
git clone https://github.com/Secretmakewomenwomen/gitlab_mcp.git "$TEMP_DIR/gitlab-mcp"
cd "$TEMP_DIR/gitlab-mcp"

# 安装依赖
echo "📥 安装依赖..."
npm install --silent

# 构建
echo "🔨 构建项目..."
npm run build

# 全局安装
echo "🌍 全局安装..."
npm pack
npm install -g @econage/gitlab-mcp-server-*.tgz

# 清理
echo "🧹 清理临时文件..."
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}✨ 安装完成！${NC}"
echo ""
echo "📝 接下来的步骤："
echo "1. 获取 GitLab Token: https://gitlab.econage.com/-/user_settings/personal_access_tokens"
echo "2. 配置你的 AI 工具（Cursor/Claude Code/Trae）使用以下命令："
echo ""
echo "   命令: @econage/gitlab-mcp-server"
echo ""
echo "   环境变量:"
echo "   - GITLAB_TOKEN: 你的 GitLab Token"
echo "   - GITLAB_HOST: http://gitlab.econage.com/"
echo ""
echo "💡 示例配置："
echo '{"command": "@econage/gitlab-mcp-server", "env": {"GITLAB_TOKEN": "your-token", "GITLAB_HOST": "http://gitlab.econage.com/"}}'
echo ""
echo -e "${YELLOW}⚠️  请将配置中的 your-token 替换为你的实际 GitLab Token${NC}"
