#!/bin/bash

# GitLab MCP Server 一键安装脚本
# 适用于团队内部快速部署
#
# 使用方法:
# 1. 在线安装: curl -sSL https://raw.githubusercontent.com/Secretmakewomenwomen/gitlab_mcp/main/install.sh | bash
# 2. 本地安装: bash install.sh (在项目目录下执行)

set -e

echo "🚀 开始安装 GitLab MCP Server..."

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ 未安装 Node.js，请先安装 Node.js >= 18.0.0${NC}"
    exit 1
fi
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 版本需要 >= 18.0.0${NC}"
    echo "当前版本: $(node -v)"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 版本检查通过: $(node -v)${NC}"

# 检测是否在项目根目录（有 package.json 和 src 目录）
if [ -f "package.json" ] && [ -d "src" ]; then
    echo -e "${GREEN}✅ 检测到本地项目目录，直接使用${NC}"
    WORK_DIR="$(pwd)"
else
    echo "📥 正在下载项目文件..."
    TEMP_DIR=$(mktemp -d)
    WORK_DIR="$TEMP_DIR/gitlab-mcp"

    # 尝试多种下载方式
    if command -v git &> /dev/null; then
        echo "使用 git 下载..."
        # 配置 Git 使用 HTTP/1.1，解决连接问题
        export GIT_TERMINAL_PROMPT=0
        git -c http.version=HTTP/1.1 \
            -c https.version=HTTP/1.1 \
            -c http.postBuffer=524288000 \
            clone --depth=1 \
            https://github.com/Secretmakewomenwomen/gitlab_mcp.git "$WORK_DIR" 2>/dev/null || {
            echo -e "${YELLOW}⚠️  Git 克隆失败，尝试下载压缩包...${NC}"
            if command -v wget &> /dev/null; then
                wget -qO- https://github.com/Secretmakewomenwomen/gitlab_mcp/archive/refs/heads/main.tar.gz | tar -xz -C "$TEMP_DIR"
                mv "$TEMP_DIR/gitlab_mcp-main" "$WORK_DIR"
            elif command -v curl &> /dev/null; then
                curl -sL https://github.com/Secretmakewomenwomen/gitlab_mcp/archive/refs/heads/main.tar.gz | tar -xz -C "$TEMP_DIR"
                mv "$TEMP_DIR/gitlab_mcp-main" "$WORK_DIR"
            else
                echo -e "${RED}❌ 无法下载项目文件${NC}"
                echo -e "${YELLOW}💡 请手动下载: https://github.com/Secretmakewomenwomen/gitlab_mcp/archive/refs/heads/main.zip${NC}"
                exit 1
            fi
        }
    elif command -v wget &> /dev/null; then
        echo "使用 wget 下载..."
        wget -qO- https://github.com/Secretmakewomenwomen/gitlab_mcp/archive/refs/heads/main.tar.gz | tar -xz -C "$TEMP_DIR"
        mv "$TEMP_DIR/gitlab_mcp-main" "$WORK_DIR"
    elif command -v curl &> /dev/null; then
        echo "使用 curl 下载..."
        curl -sL https://github.com/Secretmakewomenwomen/gitlab_mcp/archive/refs/heads/main.tar.gz | tar -xz -C "$TEMP_DIR"
        mv "$TEMP_DIR/gitlab_mcp-main" "$WORK_DIR"
    else
        echo -e "${RED}❌ 未找到 git/wget/curl，无法下载项目${NC}"
        exit 1
    fi

    # 清理函数
    cleanup() {
        if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
            echo "🧹 清理临时文件..."
            rm -rf "$TEMP_DIR"
        fi
    }
    trap cleanup EXIT
fi

cd "$WORK_DIR"

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
