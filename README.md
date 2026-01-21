# GitLab MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that enables AI assistants (Claude, Cursor, etc.) to interact with GitLab repositories, commits, projects, and merge requests.

## ✨ Features

- 🔍 **List Projects**: Browse all accessible GitLab projects
- 📝 **Get Commits**: Retrieve commit history from projects
- 👤 **Personal Commits**: Quickly fetch your own commits across projects
- 📋 **Project Details**: Get detailed information about specific projects
- 🔄 **Merge Requests**: View and manage merge requests (MRs)

## 🚀 Quick Start

### Installation

#### Using npx (Recommended - No installation needed!)

```bash
# MCP tools will be automatically downloaded on first use
# Just configure your AI tool to use: npx @econage/gitlab-mcp-server
```

See [Configuration Guide](#configuration) for details.

#### Using npm

```bash
npm install -g @econage/gitlab-mcp-server
```

#### Using yarn

```bash
yarn global add @econage/gitlab-mcp-server
```

### Prerequisites

- **Node.js** >= 18.0.0
- **GitLab Personal Access Token** with `read_api`, `read_repository`, and `read_user` scopes

### Configuration

Configure your AI tool to use the MCP server with the following command:

```bash
npx @econage/gitlab-mcp-server
```

With environment variables:

```json
{
  "GITLAB_TOKEN": "your-gitlab-token",
  "GITLAB_HOST": "https://your-gitlab-instance.com"
}
```

## 📖 Configuration

### For Claude Code CLI

```bash
claude mcp add-json gitlab '{
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "@econage/gitlab-mcp-server"],
  "env": {
    "GITLAB_TOKEN": "your-token-here",
    "GITLAB_HOST": "https://gitlab.example.com"
  }
}'
```

### For Cursor

Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "gitlab": {
      "command": "npx",
      "args": ["-y", "@econage/gitlab-mcp-server"],
      "env": {
        "GITLAB_TOKEN": "your-token-here",
        "GITLAB_HOST": "https://gitlab.example.com"
      }
    }
  }
}
```

### For Other MCP-compatible Tools

Use the same configuration pattern as above. The key points are:

- **Command**: `npx`
- **Args**: `["-y", "@econage/gitlab-mcp-server"]`
- **Environment variables**: `GITLAB_TOKEN` (required), `GITLAB_HOST` (optional)

## 🔧 Available Tools

### 1. `get_my_commits`

Get recent commits by the authenticated user.

**Parameters:**
- `project_id` (optional): Project ID to search in
- `per_page` (optional): Number of commits (default: 20, max: 300)
- `ref_name` (optional): Branch name

**Example:**
```
Get my recent commits from project 123
```

### 2. `get_projects`

List GitLab projects accessible to the authenticated user.

**Parameters:**
- `search` (optional): Search term to filter projects
- `owned` (optional): Only return owned projects
- `per_page` (optional): Number of projects (default: 20, max: 100)

**Example:**
```
List all projects I have access to
Search for projects containing "bpi"
```

### 3. `get_project_details`

Get detailed information about a specific GitLab project.

**Parameters:**
- `project_id` (required): Project ID or path

**Example:**
```
Get details for project 123
```

### 4. `get_project_commits`

Get recent commits from a specific project.

**Parameters:**
- `project_id` (required): Project ID or path
- `ref_name` (optional): Branch name
- `per_page` (optional): Number of commits (default: 20, max: 100)

**Example:**
```
Get the last 10 commits from project 123 on master branch
```

### 5. `get_merge_requests`

Get merge requests for a project or across all projects.

**Parameters:**
- `project_id` (optional): Project ID
- `state` (optional): Filter by state (opened/closed/merged/all)
- `scope` (optional): created_by_me/assigned_to_me/all
- `per_page` (optional): Number of MRs (default: 20, max: 100)

**Example:**
```
Show me all open merge requests
Get MRs assigned to me in project 123
```

## 🛠️ Development

### Setup

```bash
# Clone the repository
git clone https://github.com/your-username/@econage/gitlab-mcp-server.git
cd @econage/gitlab-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Testing

```bash
# Run directly with environment variables
GITLAB_TOKEN=your-token GITLAB_HOST=https://gitlab.example.com npm start
```

### Publishing to npm

```bash
# Build
npm run build

# Login to npm (first time only)
npm login

# Publish
npm publish
```

## 📝 Environment Variables

| Variable | Required | Description | Default |
|----------|----------|-------------|---------|
| `GITLAB_TOKEN` | ✅ | GitLab Personal Access Token | - |
| `GITLAB_HOST` | ❌ | GitLab instance URL | `https://gitlab.com` |
| `DEFAULT_PROJECT_ID` | ❌ | Default project ID | - |

## 🔐 Security

- Never commit your GitLab token to version control
- Use environment variables or secure configuration files
- Only grant necessary permissions to your access token
- Rotate tokens regularly

## 📄 License

MIT © [He Huan](https://github.com/your-username)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📚 Documentation

For detailed configuration instructions for various AI tools, see [MCP_CONFIG_GUIDE.md](./MCP_CONFIG_GUIDE.md).

## 🔗 Links

- [MCP Protocol Specification](https://modelcontextprotocol.io/)
- [GitLab API Documentation](https://docs.gitlab.com/ee/api/api_resources.html)
- [Claude Code CLI Documentation](https://docs.anthropic.com/claude-code)

## 📦 Package Information

- **Package Name**: `@econage/gitlab-mcp-server`
- **Version**: 1.0.0
- **Node Version Required**: >= 18.0.0
- **Type**: module

## 💡 Usage Tips

1. **First time setup**: The `npx` command will download the package on first use, so the first run might be slower
2. **Auto-update**: `npx` always uses the latest version unless you specify a version
3. **Offline usage**: For offline usage, consider installing globally with `npm install -g @econage/gitlab-mcp-server`
4. **Multiple GitLab instances**: Configure multiple MCP servers with different names for different GitLab instances

## 🐛 Troubleshooting

### Issue: "GITLAB_TOKEN environment variable is required"

**Solution**: Make sure you've set the `GITLAB_TOKEN` in your MCP server configuration's `env` section.

### Issue: "Cannot find module 'dist/index.js'"

**Solution**: Run `npm run build` to compile the TypeScript code.

### Issue: MCP server not connecting

**Solution**:
- Check Node.js version: `node --version` (must be >= 18)
- Verify your GitLab token has the required permissions
- Ensure the `GITLAB_HOST` is correct (include http:// or https://)

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/@econage/gitlab-mcp-server/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/@econage/gitlab-mcp-server/discussions)

---

Made with ❤️ by the GitLab MCP Team
