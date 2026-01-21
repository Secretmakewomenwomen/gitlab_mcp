# GitLab MCP Server - 团队使用指南

本指南帮助团队成员快速安装和配置 GitLab MCP Server。

## 🚀 一键安装（推荐）

### 方法 1: 使用安装脚本（最简单）

```bash
curl -sSL https://raw.githubusercontent.com/Secretmakewomenwomen/gitlab_mcp/main/install.sh | bash
```

或者：

```bash
bash <(curl -sSL https://raw.githubusercontent.com/Secretmakewomenwomen/gitlab_mcp/main/install.sh)
```

### 方法 2: 手动安装

```bash
# 1. 克隆仓库
git clone https://github.com/Secretmakewomenwomen/gitlab_mcp.git
cd gitlab_mcp

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 全局安装
npm install -g .
```

---

## ⚙️ 配置步骤

### 第一步：获取 GitLab Token

1. 访问：http://gitlab.econage.com/-/user_settings/personal_access_tokens
2. 点击 "Add new token"
3. 勾选权限：
   - ✅ `read_api`
   - ✅ `read_repository`
   - ✅ `read_user`
4. 点击 "Create personal access token"
5. **复制并保存 token**（只显示一次）

### 第二步：配置你的 AI 工具

#### Claude Code CLI

```bash
claude mcp add-json gitlab '{
  "type": "stdio",
  "command": "@econage/gitlab-mcp-server",
  "env": {
    "GITLAB_TOKEN": "你的token",
    "GITLAB_HOST": "http://gitlab.econage.com/"
  }
}'
```

#### Cursor

编辑文件 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "@econage/gitlab-mcp-server",
      "env": {
        "GITLAB_TOKEN": "你的token",
        "GITLAB_HOST": "http://gitlab.econage.com/"
      }
    }
  }
}
```

保存后重启 Cursor。

#### Trae

编辑文件 `~/.trae/mcp.json`：

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "@econage/gitlab-mcp-server",
      "env": {
        "GITLAB_TOKEN": "你的token",
        "GITLAB_HOST": "http://gitlab.econage.com/"
      }
    }
  }
}
```

保存后重启 Trae。

---

## ✅ 验证安装

### 方法 1: 命令行验证

```bash
# 检查是否安装成功
@econage/gitlab-mcp-server --help

# 或
npm list -g @econage/gitlab-server
```

### 方法 2: 在 AI 工具中测试

在 AI Chat 窗口中输入：

```
列出我可以访问的 GitLab 项目
```

如果返回项目列表，说明配置成功！

---

## 🔧 可用功能

配置成功后，你可以：

1. **查看项目**
   ```
   列出所有我可以访问的 GitLab 项目
   ```

2. **获取提交记录**
   ```
   获取我最近的提交记录
   ```

3. **项目详情**
   ```
   获取项目 123 的详细信息
   ```

4. **合并请求**
   ```
   查看所有打开的合并请求
   ```

---

## 🔄 更新

当项目有更新时：

### 使用安装脚本的用户

重新运行安装脚本即可：

```bash
curl -sSL https://raw.githubusercontent.com/Secretmakewomenwomen/gitlab_mcp/main/install.sh | bash
```

### 手动安装的用户

```bash
cd gitlab_mcp
git pull origin main
npm install
npm run build
npm install -g .
```

---

## ❓ 常见问题

### Q1: 安装后找不到命令

**A**: 检查 npm 全局安装路径：

```bash
npm config get prefix
```

确保这个路径在系统的 `PATH` 环境变量中。

### Q2: 权限错误

**A**: 使用 sudo 安装（Linux/Mac）：

```bash
sudo npm install -g @econage/gitlab-mcp-server-*.tgz
```

### Q3: AI 工具无法连接 MCP

**A**:
1. 确认命令可用：`@econage/gitlab-mcp-server`
2. 检查环境变量是否正确设置
3. 重启 AI 工具
4. 查看错误日志

### Q4: GitLab Token 无效

**A**:
1. 确认 token 有正确的权限（read_api, read_repository, read_user）
2. 检查 token 是否过期
3. 确认 GITLAB_HOST 地址正确

---

## 📞 获取帮助

如果遇到问题：

1. 查看 [README.md](./README.md) - 完整文档
2. 查看 [QUICK_START.md](./QUICK_START.md) - 快速开始指南
3. 在 GitHub 提交 Issue: https://github.com/Secretmakewomenwomen/gitlab_mcp/issues

---

## 🎉 开始使用

安装配置完成后，就可以在 AI 工具中使用 GitLab MCP 功能了！

试试这些命令：

- "列出我可以访问的前 10 个项目"
- "获取我最近 5 条提交记录"
- "查看项目 123 的详细信息"

祝使用愉快！🚀
