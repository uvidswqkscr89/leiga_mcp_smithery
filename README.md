# Leiga MCP Server for Smithery

A Model Context Protocol (MCP) server for the Leiga project management platform, deployed on Smithery.

## Overview

This server provides AI agents with the ability to interact with Leiga, a project management tool. It offers comprehensive functionality for searching, creating, and managing issues within Leiga projects.

## Features

### Tools Available

1. **search_all_issues** - Search for issues across all projects with flexible filtering
2. **get_issue_detail** - Get detailed information about a specific issue
3. **my_assigned_issues** - Get issues assigned to the authenticated user
4. **create_issue** - Create new issues in Leiga projects
5. **list_project** - List all available projects
6. **current_date** - Get the current date

### Configuration

The server requires Leiga API credentials to function:

- **clientId**: Your Leiga API client ID
- **secret**: Your Leiga API secret
- **debug**: Optional debug logging flag

## Usage

### Search Issues

Search for issues using various filters:
- Text search in titles
- Filter by project, status, assignee, priority, sprint, work type
- Date range filtering for start, due, and creation dates
- Configurable result limits

### Create Issues

Create new issues with:
- Required: summary and project name
- Optional: description, priority, status, sprint, work type

### Issue Management

- Get detailed issue information by ID or issue number
- List projects to find correct project names
- Filter issues assigned to the authenticated user

## Authentication

The server uses Leiga's API authentication system. Credentials are configured through Smithery's configuration interface and stored securely.

## Development

To run the server locally:

```bash
npm run dev
```

To build for deployment:

```bash
npm run build
```

## Deployment

This server is designed to be deployed on the Smithery platform, which handles:
- HTTP transport and routing
- Configuration management
- Authentication and security
- Scaling and availability

## API Integration

The server integrates with Leiga's OpenAPI endpoints:
- Issue search and retrieval
- Issue creation and management
- Project listing
- User authentication

## Error Handling

The server includes comprehensive error handling for:
- Authentication failures
- API rate limiting
- Invalid parameters
- Network connectivity issues

All errors are returned as user-friendly messages to the AI agent.
