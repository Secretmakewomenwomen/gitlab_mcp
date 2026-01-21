# GitLab MCP 快速配置指南

> 💡 **推荐方式**: 使用 `npx` 一键安装，无需手动下载代码！

## 🚀 方法一：使用 npx（推荐 - 最简单）

### 优点
- ✅ 无需克隆代码或手动安装
- ✅ 自动使用最新版本
- ✅ 配置简单，只需一行命令

### 配置示例

#### Claude Code CLI
```bash
claude mcp add-json gitlab '{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@econage/gitlab-mcp-server"],
  "env": {
    "GITLAB_TOKEN": "your-token-here",
    "GITLAB_HOST": "https://your-gitlab-instance.com"
  }
}'
```

#### Cursor (~/.cursor/mcp.json)
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["-y", "@econage/gitlab-mcp-server"],
      "env": {
        "GITLAB_TOKEN": "your-token-here",
        "GITLAB_HOST": "https://your-gitlab-instance.com"
      }
    }
  }
}
```

#### Trae (~/.trae/mcp.json)
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["-y", "@econage/gitlab-mcp-server"],
      "env": {
        "GITLAB_TOKEN": "your-token-here",
        "GITLAB_HOST": "https://your-gitlab-instance.com"
      }
    }
  }
}
```

---

## 📦 方法二：本地安装

如果你已经下载了代码：

### 1. 构建项目
```bash
cd @econage/gitlab-mcp-server
npm install
npm run build
```

### 2. 配置（使用本地路径）

#### Claude Code CLI
```bash
claude mcp add-json gitlab '{
  "type": "stdio",
  "command": "node",
  "args": ["/absolute/path/to/@econage/gitlab-mcp-server/dist/index.js"],
  "env": {
    "GITLAB_TOKEN": "your-token-here",
    "GITLAB_HOST": "https://your-gitlab-instance.com"
  }
}'
```

#### Cursor (~/.cursor/mcp.json)
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "node",
      "args": ["/absolute/path/to/@econage/gitlab-mcp-server/dist/index.js"],
      "env": {
        "GITLAB_TOKEN": "your-token-here",
        "GITLAB_HOST": "https://your-gitlab-instance.com"
      }
    }
  }
}
```

---

## 🌐 方法三：全局安装（适合离线使用）

### 1. 全局安装
```bash
npm install -g @econage/gitlab-mcp-server
```

### 2. 配置（使用全局命令）

#### Claude Code CLI
```bash
claude mcp add-json gitlab '{
  "type": "stdio",
  "command": "@econage/gitlab-mcp-server",
  "args": [],
  "env": {
    "GITLAB_TOKEN": "your-token-here",
    "GITLAB_HOST": "https://your-gitlab-instance.com"
  }
}'
```

#### Cursor/Trae
```json
{
  "mcpServers": {
    "gitlab": {
      "command": "@econage/gitlab-mcp-server",
      "args": [],
      "env": {
        "GITLAB_TOKEN": "your-token-here",
        "GITLAB_HOST": "https://your-gitlab-instance.com"
      }
    }
  }
}
```

---

## ⚙️ 环境变量说明

| 变量 | 必填 | 说明 | 示例 |
|------|------|------|------|
| `GITLAB_TOKEN` | ✅ | GitLab 个人访问令牌 | `glpat-xxxxxxxxxxxx` |
| `GITLAB_HOST` | ❌ | GitLab 实例地址 | `https://gitlab.com` 或 `http://gitlab.example.com` |

### 获取 GitLab Token
1. 登录 GitLab
2. Settings → Access Tokens
3. 创建新 Token，需要权限：`read_api`, `read_repository`, `read_user`

---

## ✅ 验证配置

### Claude Code CLI
```bash
claude mcp list
# 应显示: gitlab: ✓ Connected
```

### Cursor/Trae
重启编辑器，在 AI Chat 中测试：
```
列出我可以访问的 GitLab 项目
```

---

## 🔧 可用工具

配置成功后，你可以使用以下功能：

1. **get_projects** - 列出项目
   ```
   列出所有我可以访问的 GitLab 项目
   ```

2. **get_my_commits** - 获取你的提交
   ```
   获取我最近的提交记录
   ```

3. **get_project_details** - 项目详情
   ```
   获取项目 123 的详细信息
   ```

4. **get_project_commits** - 项目提交记录
   ```
   获取项目 123 的最近提交
   ```

5. **get_merge_requests** - 合并请求
   ```
   查看所有打开的合并请求
   ```

---

## 🎯 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **npx** | 无需安装、自动更新 | 首次运行较慢 | **团队推荐**、大多数情况 |
| **本地路径** | 无需网络、完全控制 | 需要手动构建更新 | 开发和调试 |
| **全局安装** | 启动快、可离线使用 | 需要手动更新 | 离线环境、频繁使用 |

---

## 📚 完整文档

- [README.md](./README.md) - 项目说明和完整文档
- [PUBLISHING_GUIDE.md](./PUBLISHING_GUIDE.md) - 发布到 npm 和 GitHub 的指南
- [EXAMPLES.md](./EXAMPLES.md) - 使用示例

---

## ❓ 常见问题

### Q: npx 第一次运行很慢？
**A**: 第一次需要下载包，后续运行会使用缓存。或使用全局安装方式。

### Q: 如何更新到最新版本？
**A**:
- npx: 自动使用最新版本
- 全局安装: `npm update -g @econage/gitlab-mcp-server`

### Q: 找不到命令？
**A**:
- 确保 Node.js >= 18.0.0
- 检查环境变量是否正确设置
- 查看错误日志

---

**提示**: 推荐使用 `npx` 方式，配置最简单，且始终保持最新版本！
