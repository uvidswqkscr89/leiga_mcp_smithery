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

### 7. list_issue_comments
**Purpose**: List comments for a specific issue with pagination support.

**When to use**:
- User wants to see discussion history on an issue
- Need to understand context from previous comments
- Following up on issue conversations

**Parameters**:
- `issueId`: Issue ID or issue number (e.g., "12345" or "PROJ-123")
- `pageNumber`: Page number (default: 1)
- `pageSize`: Number of comments per page (default: 10)

### 8. create_comment
**Purpose**: Create new comments or replies on issues.

**When to use**:
- User wants to add feedback or updates to an issue
- Need to reply to existing comments
- Documenting progress or decisions

**Parameters**:
- `issueId`: Issue ID or issue number
- `content`: Comment text content
- `commentId`: Optional - ID of comment to reply to (for threaded replies)

### 9. get_issue_options
**Purpose**: Get available field options for an issue (status, priority, assignee, etc.).

**When to use**:
- Before updating an issue to see valid field values
- Understanding what options are available for issue fields
- Validating field names before updates

**Parameters**:
- `issueId`: Issue ID or issue number

### 10. update_issue
**Purpose**: Update issue fields using human-readable field names.

**When to use**:
- User wants to change issue status, priority, assignee, etc.
- Updating issue details like summary or description
- Setting dates, labels, or other metadata

**Parameters**:
- `issueId`: Issue ID or issue number (required)
- `summary`: New issue title
- `description`: New issue description
- `statusName`: Status name (e.g., "In Progress", "Done")
- `priorityName`: Priority name (e.g., "High", "Medium")
- `assigneeName`: Assignee name
- `labels`: Array of label names
- `follows`: Array of follower names
- `releaseVersionName`: Release version name
- `dueDate`: Due date (YYYY-MM-DD format)
- `startDate`: Start date (YYYY-MM-DD format)

### 11. list_project_members
**Purpose**: List members of a specific project.

**When to use**:
- Finding team members for assignment or collaboration
- Understanding project team composition
- Looking up user names for assignments

**Parameters**:
- `projectId`: Project ID (required)
- `keyword`: Search keyword for member names
- `pageNumber`: Page number (default: 1)
- `pageSize`: Results per page (default: 20)

### 12. list_org_members
**Purpose**: List all organization members.

**When to use**:
- Finding users across the entire organization
- Looking up user information for assignments
- Understanding team structure

**Parameters**:
- `key`: Search keyword for member names
- `pageNumber`: Page number (default: 1)
- `pageSize`: Results per page (default: 20)

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
3. Update issue status: `update_issue` to change progress
4. Add progress comments: `create_comment` to document work
5. Create follow-up tasks: `create_issue` for new work

### Project Planning
1. List available projects: `list_project`
2. Search existing issues: `search_all_issues` with project filter
3. Review team members: `list_project_members` for assignments
4. Create new issues: `create_issue` for planned work
5. Set up issue fields: `get_issue_options` to see available values

### Status Updates and Communication
1. Search recent activity: `search_all_issues` with date filters
2. Check personal work: `my_assigned_issues` with status filters
3. Get detailed context: `get_issue_detail` for specific updates
4. Review discussions: `list_issue_comments` to see conversations
5. Add updates: `create_comment` to document progress
6. Update issue fields: `update_issue` to reflect current status

### Issue Investigation and Resolution
1. Get issue details: `get_issue_detail` for full context
2. Review comment history: `list_issue_comments` for background
3. Check available options: `get_issue_options` for field values
4. Update issue status: `update_issue` with resolution
5. Document resolution: `create_comment` with solution details

### Team Collaboration
1. Find team members: `list_project_members` or `list_org_members`
2. Assign issues: `update_issue` with assignee names
3. Add collaborators: `update_issue` with follower names
4. Communicate updates: `create_comment` for team visibility

## Integration Tips

- Always provide context about what the search or action accomplished
- Include direct links to issues when available
- Suggest follow-up actions when appropriate
- Handle edge cases gracefully (no results, errors, etc.)
