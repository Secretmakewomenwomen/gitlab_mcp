#!/usr/bin/env node

import axios from 'axios';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually
try {
  const envContent = readFileSync(join(__dirname, '.env'), 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim();
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value;
      }
    }
  });
} catch (e) {
  console.error('⚠️  无法读取 .env 文件，使用环境变量');
}

const GITLAB_URL = process.env.GITLAB_URL || 'https://gitlab.com';
console.log(GITLAB_URL)
const GITLAB_TOKEN = process.env.GITLAB_TOKEN;

if (!GITLAB_TOKEN) {
  console.error('❌ 错误: 需要设置 GITLAB_TOKEN 环境变量');
  console.error('请在 .env 文件中设置 GITLAB_TOKEN=your_token');
  process.exit(1);
}

const gitlabClient = axios.create({
  baseURL: `${GITLAB_URL}/api/v4`,
  headers: {
    'PRIVATE-TOKEN': GITLAB_TOKEN,
  },
});

async function testGitLab() {
  try {
    console.log('🔍 测试 GitLab 连接...\n');
    
    // 1. 测试用户信息
    console.log('1️⃣ 获取用户信息...');
    const userResponse = await gitlabClient.get('/user');
    console.log(`✅ 用户: ${userResponse.data.name} (${userResponse.data.username})`);
    console.log(`   邮箱: ${userResponse.data.email}\n`);
    
    // 2. 获取最近的提交
    console.log('2️⃣ 查询最近的提交...');
    const eventsResponse = await gitlabClient.get('/events', {
      params: {
        action: 'pushed',
        per_page: 10,
      },
    });
    
    if (eventsResponse.data.length === 0) {
      console.log('   📝 没有找到最近的提交\n');
    } else {
      console.log(`   📝 找到 ${eventsResponse.data.length} 个最近的推送事件:\n`);
      eventsResponse.data.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.push_data?.commit_title || 'Push event'}`);
        console.log(`      项目: ${event.project?.name || event.project_id}`);
        console.log(`      分支: ${event.push_data?.ref || 'N/A'}`);
        console.log(`      时间: ${new Date(event.created_at).toLocaleString('zh-CN')}`);
        console.log('');
      });
    }
    
    // 3. 获取项目列表
    console.log('3️⃣ 获取项目列表...');
    const projectsResponse = await gitlabClient.get('/projects', {
      params: {
        per_page: 5,
        order_by: 'updated_at',
        sort: 'desc',
      },
    });
    
    console.log(`   📁 最近更新的 ${projectsResponse.data.length} 个项目:\n`);
    projectsResponse.data.forEach((project, index) => {
      console.log(`   ${index + 1}. ${project.name}`);
      console.log(`      路径: ${project.path_with_namespace}`);
      console.log(`      URL: ${project.web_url}`);
      console.log(`      最后活动: ${new Date(project.last_activity_at).toLocaleString('zh-CN')}`);
      console.log('');
    });
    
    console.log('✅ GitLab 连接测试成功！');
    console.log('\n💡 提示: 现在你可以在 Cursor 中配置 MCP 服务器了');
    console.log('   配置文件位置: ~/.cursor/config/mcp.json');
    
  } catch (error) {
    if (error.response) {
      console.error(`❌ GitLab API 错误: ${error.response.status}`);
      console.error(`   消息: ${error.response.data?.message || error.message}`);
      if (error.response.status === 401) {
        console.error('\n💡 提示: Token 可能无效或已过期，请检查 GITLAB_TOKEN');
      }
    } else {
      console.error(`❌ 错误: ${error.message}`);
    }
    process.exit(1);
  }
}

testGitLab();

