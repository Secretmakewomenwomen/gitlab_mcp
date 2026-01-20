#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosInstance } from 'axios';

// GitLab API configuration
const GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;
const DEFAULT_PROJECT_ID = process.env.DEFAULT_PROJECT_ID;

if (!GITLAB_TOKEN) {
  console.error('Error: GITLAB_TOKEN environment variable is required');
  process.exit(1);
}

// Create GitLab API client
const gitlabClient: AxiosInstance = axios.create({
  baseURL: `${GITLAB_URL}/api/v4`,
  headers: {
    'PRIVATE-TOKEN': GITLAB_TOKEN,
  },
});

// 获取所有可访问的项目列表
async function getAllProjects(perPage: number = 300): Promise<string[]> {
  try {
    const response = await gitlabClient.get('/projects', {
      params: {
        per_page: perPage,
        order_by: 'updated_at',
        sort: 'desc',
      },
    });
    return response.data.map((project: any) => project.id.toString());
  } catch (error: any) {
    console.error('Error fetching projects:', error.message);
    return [];
  }
}

// Define available tools
const TOOLS: Tool[] = [
  {
    name: 'get_my_commits',
    description: 'Get recent commits by the authenticated user across projects or in a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'Optional: GitLab project ID. If not provided, searches across all accessible projects',
        },
        per_page: {
          type: 'number',
          description: 'Number of commits to return (default: 20, max: 300)',
          default: 20,
        },
        ref_name: {
          type: 'string',
          description: 'Optional: Branch name to filter commits',
        },
      },
    },
  },
  {
    name: 'get_projects',
    description: 'List GitLab projects accessible to the authenticated user',
    inputSchema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Optional: Search term to filter projects by name',
        },
        owned: {
          type: 'boolean',
          description: 'Optional: If true, only return projects owned by the authenticated user',
          default: false,
        },
        per_page: {
          type: 'number',
          description: 'Number of projects to return (default: 20, max: 100)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'get_project_details',
    description: 'Get detailed information about a specific GitLab project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'GitLab project ID or path (e.g., "username/projectname")',
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_project_commits',
    description: 'Get recent commits from a specific project',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'GitLab project ID or path',
        },
        ref_name: {
          type: 'string',
          description: 'Optional: Branch name (default: main/master)',
        },
        per_page: {
          type: 'number',
          description: 'Number of commits to return (default: 20, max: 100)',
          default: 20,
        },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'get_merge_requests',
    description: 'Get merge requests for a project or across all projects',
    inputSchema: {
      type: 'object',
      properties: {
        project_id: {
          type: 'string',
          description: 'Optional: GitLab project ID. If not provided, searches across all accessible projects',
        },
        state: {
          type: 'string',
          description: 'Filter by state: opened, closed, merged, all (default: opened)',
          enum: ['opened', 'closed', 'merged', 'all'],
          default: 'opened',
        },
        scope: {
          type: 'string',
          description: 'Scope: created_by_me, assigned_to_me, all (default: all)',
          enum: ['created_by_me', 'assigned_to_me', 'all'],
          default: 'all',
        },
        per_page: {
          type: 'number',
          description: 'Number of merge requests to return (default: 20, max: 100)',
          default: 20,
        },
      },
    },
  },
];

// Initialize MCP server
const server = new Server(
  {
    name: 'gitlab-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const safeArgs = args || {};

  try {
    switch (name) {
      case 'get_my_commits': {
        const perPage = Math.min((safeArgs.per_page as number | undefined) || 20, 300);
        const projectId = safeArgs.project_id as string | undefined;
        const refName = safeArgs.ref_name as string | undefined;

        // 如果指定了项目 ID，直接获取该项目的 commits
        if (projectId) {
          const commitsResponse = await gitlabClient.get(
            `/projects/${encodeURIComponent(projectId)}/repository/commits`,
            {
              params: {
                per_page: perPage,
                ref_name: refName,
              },
            }
          );

          // 获取用户信息以过滤出当前用户的 commits
          const userResponse = await gitlabClient.get('/user');
          const currentUserId = userResponse.data.id;
          const currentUserEmail = userResponse.data.email;

          const myCommits = commitsResponse.data.filter((commit: any) => {
            return (
              commit.author_email === currentUserEmail ||
              commit.author_name === userResponse.data.name
            );
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(myCommits.slice(0, perPage), null, 2),
              },
            ],
          };
        }

        // 如果没有指定项目，使用 events API 获取最近的推送事件
        const eventsResponse = await gitlabClient.get('/events', {
          params: {
            action: 'pushed',
            per_page: perPage,
          },
        });

        // 获取用户信息
        const userResponse = await gitlabClient.get('/user');
        const currentUserId = userResponse.data.id;

        // 过滤出当前用户的事件，并获取详细的 commit 信息
        const myEvents = eventsResponse.data.filter(
          (event: any) => event.author_id === currentUserId
        );

        // 收集所有相关的 commits
        const allCommits: any[] = [];
        for (const event of myEvents.slice(0, Math.min(perPage, 10))) {
          try {
            if (event.push_data?.commit_to) {
              const commitsResponse = await gitlabClient.get(
                `/projects/${event.project_id}/repository/commits`,
                {
                  params: {
                    ref_name: event.push_data.ref,
                    per_page: 5,
                  },
                }
              );
              allCommits.push(...commitsResponse.data);
            }
          } catch (err) {
            // 忽略单个项目的错误，继续处理其他项目
            continue;
          }
        }

        // 去重并按时间排序
        const uniqueCommits = Array.from(
          new Map(allCommits.map((commit) => [commit.id, commit])).values()
        )
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
          .slice(0, perPage);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(uniqueCommits, null, 2),
            },
          ],
        };
      }

      case 'get_projects': {
        const perPage = Math.min((safeArgs.per_page as number | undefined) || 20, 100);
        const search = safeArgs.search as string | undefined;
        const owned = safeArgs.owned as boolean | undefined;

        const params: any = {
          per_page: perPage,
          order_by: 'updated_at',
          sort: 'desc',
        };

        if (search) {
          params.search = search;
        }
        if (owned) {
          params.owned = owned;
        }

        const response = await gitlabClient.get('/projects', { params });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_project_details': {
        const projectId = safeArgs.project_id as string;
        if (!projectId) {
          throw new Error('project_id is required');
        }

        const response = await gitlabClient.get(`/projects/${encodeURIComponent(projectId)}`);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_project_commits': {
        const projectId = safeArgs.project_id as string;
        if (!projectId) {
          throw new Error('project_id is required');
        }

        const perPage = Math.min((safeArgs.per_page as number | undefined) || 20, 100);
        const refName = safeArgs.ref_name as string | undefined;

        const params: any = {
          per_page: perPage,
        };
        if (refName) {
          params.ref_name = refName;
        }

        const response = await gitlabClient.get(
          `/projects/${encodeURIComponent(projectId)}/repository/commits`,
          { params }
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      case 'get_merge_requests': {
        const perPage = Math.min((safeArgs.per_page as number | undefined) || 20, 100);
        const projectId = safeArgs.project_id as string | undefined;
        const state = (safeArgs.state as string | undefined) || 'opened';
        const scope = (safeArgs.scope as string | undefined) || 'all';

        let url = '/merge_requests';
        if (projectId) {
          url = `/projects/${encodeURIComponent(projectId)}/merge_requests`;
        }

        const params: any = {
          per_page: perPage,
          state: state,
        };

        if (scope === 'created_by_me') {
          params.scope = 'created_by_me';
        } else if (scope === 'assigned_to_me') {
          params.scope = 'assigned_to_me';
        }

        const response = await gitlabClient.get(url, { params });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(response.data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message;
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GitLab MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

