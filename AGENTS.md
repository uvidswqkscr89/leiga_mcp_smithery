# Leiga MCP Server - Agent Usage Guide

This MCP server provides AI agents with comprehensive access to Leiga project management functionality.

## Authentication Setup

Before using any tools, ensure you have:
- Leiga API Client ID
- Leiga API Secret

These credentials are configured through Smithery's interface and authenticate all API calls.

## Available Tools

### 1. search_all_issues
**Purpose**: Search for issues across all projects with flexible filtering options.

**When to use**:
- User asks to find issues by title, project, or other criteria
- Need to get an overview of issues matching specific conditions
- Looking for issues within date ranges

**Parameters**:
- `query`: Text to search in issue titles
- `projectName`: Filter by specific project
- `status`: Filter by status (2=ToDo, 3=In Progress, 4=Done)
- `assignee`: Filter by assignee name
- `priority`: Filter by priority level
- `sprint`: Filter by sprint name
- `workType`: Filter by work type (Story, Bug, etc.)
- Date filters: `startAfterDate`, `startBeforeDate`, `dueAfterDate`, `dueBeforeDate`, `createdAfterDate`, `createdBeforeDate`
- `pageSize`: Limit results (default: 10)

**Example usage**:
```
Find all high priority bugs in the "Mobile App" project created this week
```

### 2. my_assigned_issues
**Purpose**: Get issues specifically assigned to the authenticated user.

**When to use**:
- User uses first-person pronouns: "my issues", "assigned to me", "what should I work on"
- Personal task management queries
- Status updates on personal work

**Parameters**: Same as search_all_issues (automatically filters by current user)

### 3. get_issue_detail
**Purpose**: Get comprehensive details about a specific issue.

**When to use**:
- User references a specific issue ID or number
- Need full context about an issue for updates or discussion
- Following up on search results

**Parameters**:
- `issueId`: Issue ID (numeric) or issue number (e.g., "PROJ-123")

### 4. create_issue
**Purpose**: Create new issues in Leiga projects.

**When to use**:
- User wants to create tasks, bugs, or stories
- Converting discussion points into actionable items
- Project planning and task breakdown

**Required Parameters**:
- `summary`: Clear, actionable issue title
- `projectName`: Target project name

**Optional Parameters**:
- `description`: Detailed description with context and acceptance criteria
- `priority`: Priority level (Lowest, Low, Medium, High, Highest)
- `statusName`: Initial status (Not Started, In Progress, Done)
- `sprint`: Target sprint name
- `workType`: Type of work (Story, Bug, Chore, etc.)

### 5. list_project
**Purpose**: Get list of available projects.

**When to use**:
- User needs to know available projects for issue creation
- Project discovery and navigation
- Validating project names before creating issues

### 6. current_date
**Purpose**: Get current date for date-based filtering and context.

**When to use**:
- Date calculations for filtering
- Providing temporal context in responses

## Best Practices

### Search Strategy
1. **Start broad, then narrow**: Begin with general searches, then apply specific filters
2. **Use relevant filters**: Apply project, status, or assignee filters when context suggests them
3. **Limit results appropriately**: Use pageSize to manage response length

### Issue Creation
1. **Clear summaries**: Write actionable, specific issue titles
2. **Rich descriptions**: Include context, requirements, and acceptance criteria in markdown
3. **Proper categorization**: Use appropriate priority, status, and work type values
4. **Project validation**: Use list_project to verify project names before creating issues

### Error Handling
- Authentication errors: Guide user to check credentials
- Project not found: Suggest using list_project to find correct names
- Invalid parameters: Provide specific guidance on expected values

### Response Formatting
- Present search results in organized, scannable format
- Include relevant links to issues in Leiga
- Highlight important status information (priority, assignee, due dates)
- Use markdown formatting for better readability

## Common Workflows

### Task Management
1. Check personal assignments: `my_assigned_issues`
2. Get issue details: `get_issue_detail` for specific items
3. Create follow-up tasks: `create_issue` for new work

### Project Planning
1. List available projects: `list_project`
2. Search existing issues: `search_all_issues` with project filter
3. Create new issues: `create_issue` for planned work

### Status Updates
1. Search recent activity: `search_all_issues` with date filters
2. Check personal work: `my_assigned_issues` with status filters
3. Get detailed context: `get_issue_detail` for specific updates

## Integration Tips

- Always provide context about what the search or action accomplished
- Include direct links to issues when available
- Suggest follow-up actions when appropriate
- Handle edge cases gracefully (no results, errors, etc.)
