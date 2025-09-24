/**
 * Leiga MCP Server for Smithery
 *
 * A Model Context Protocol server for the Leiga project management platform.
 * This server provides tools to search, create, and manage Leiga issues.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { LeigaMCPClient } from "./shared.js"
import { CommentListItem, CreateCommentDTO } from "./types.js"

// Configuration schema that matches smithery.yaml
export const configSchema = z.object({
	clientId: z.string().describe("Your Leiga API client ID for authentication"),
	secret: z.string().describe("Your Leiga API secret for authentication"),
	debug: z.boolean().default(false).describe("Enable debug logging"),
})

export default function createServer({
	config,
}: {
	config: z.infer<typeof configSchema>
}) {
	// Initialize Leiga client with provided credentials
	const leigaClient = new LeigaMCPClient(config.clientId, config.secret)

	const server = new McpServer({
		name: "Leiga MCP Server",
		version: "1.0.6",
	})

	// Helper function to get current date
	function getTodayLocal() {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	const today = getTodayLocal()

	// Search all issues tool
	server.registerTool(
		"search_all_issues",
		{
			title: "Search All Issues",
			description: "Searches Leiga issues using flexible criteria. Supports filtering by any combination of: title text, project name, status(2=ToDo, 3=In Progress, 4=Done), assignee, label, priority name, work type, start date range, due date range, and create date range. Returns up to 10 issues by default (configurable via pageSize).",
			inputSchema: {
				query: z.string().optional().describe("Optional text to search in title"),
				projectName: z.string().optional().describe("Filter by project name"),
				status: z.string().optional().describe("Filter by status (2=ToDo, 3=In Progress, 4=Done)"),
				assignee: z.string().optional().describe("Filter by assignee's user name"),
				label: z.string().optional().describe("Filter by label name"),
				priority: z.string().optional().describe("Filter by priority name (e.g., 'Lowest', 'Low', 'Medium', 'High', 'Highest')"),
				sprint: z.string().optional().describe("Filter by sprint name"),
				workType: z.string().optional().describe("Filter by issue work type name"),
				startAfterDate: z.string().optional().describe("Filter issues that start AFTER or ON this date (YYYY-MM-DD format)"),
				startBeforeDate: z.string().optional().describe("Filter issues that start BEFORE or ON this date (YYYY-MM-DD format)"),
				dueAfterDate: z.string().optional().describe("Filter issues that are due AFTER or ON this date (YYYY-MM-DD format)"),
				dueBeforeDate: z.string().optional().describe("Filter issues that are due BEFORE or ON this date (YYYY-MM-DD format)"),
				createdAfterDate: z.string().optional().describe("Filter issues that were created AFTER or ON this date (YYYY-MM-DD format)"),
				createdBeforeDate: z.string().optional().describe("Filter issues that were created BEFORE or ON this date (YYYY-MM-DD format)"),
				pageSize: z.number().optional().describe("Max results to return (default: 10)")
			},
		},
		async (args) => {
			try {
				const issues = await leigaClient.searchIssues(args)
				return {
					content: [{
						type: "text",
						text: `Found ${issues.length} issues:\n${
							issues.map((issue) =>
								`- ${issue.issueNumber}: [${issue.title}](${issue.url})\n
								Project: ${issue.projectName}\n
								Priority: ${issue.priority || 'None'}\n
								Status: ${issue.status || 'None'}\n
								Assignee: ${issue.assignee || 'None'}\n
								Sprint: ${issue.sprintName || 'None'}
								`
							).join('\n')
						}`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error),
					}]
				}
			}
		},
	)

	// Get issue detail tool
	server.registerTool(
		"get_issue_detail",
		{
			title: "Get Issue Detail",
			description: "Get issue detail by using issue ID or issue number.",
			inputSchema: {
				issueId: z.string().describe("Issue ID or issue number")
			},
		},
		async ({ issueId }) => {
			try {
				const issue = await leigaClient.getIssue(issueId)
				return {
					content: [{
						type: "text",
						text: `Issue Detail:\n${issue.issueNumber}: [${issue.summary}](${issue.url})\n
						Project ID: ${issue.projectId}\n
						Priority: ${issue.priority || 'None'}\n
						Status: ${issue.status || 'None'}\n
						Assignee: ${issue.assignee || 'None'}\n
						Description: ${issue.description || 'None'}`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error),
					}]
				}
			}
		},
	)

	// My assigned issues tool
	server.registerTool(
		"my_assigned_issues",
		{
			title: "My Assigned Issues",
			description: "Retrieves my issues, specifically those assigned to the authenticated user. This tool is activated only when first-person singular pronouns (e.g., me, my, mine, or myself) are explicitly used in the query.",
			inputSchema: {
				query: z.string().optional().describe("Optional text to search in title"),
				projectName: z.string().optional().describe("Filter by project name"),
				status: z.string().optional().describe("Filter by status (2=ToDo, 3=In Progress, 4=Done)"),
				label: z.string().optional().describe("Filter by label name"),
				priority: z.string().optional().describe("Filter by priority name (e.g., 'Lowest', 'Low', 'Medium', 'High', 'Highest')"),
				sprint: z.string().optional().describe("Filter by sprint name"),
				workType: z.string().optional().describe("Filter by issue work type name"),
				startAfterDate: z.string().optional().describe("Filter issues that start AFTER or ON this date (YYYY-MM-DD format)"),
				startBeforeDate: z.string().optional().describe("Filter issues that start BEFORE or ON this date (YYYY-MM-DD format)"),
				dueAfterDate: z.string().optional().describe("Filter issues that are due AFTER or ON this date (YYYY-MM-DD format)"),
				dueBeforeDate: z.string().optional().describe("Filter issues that are due BEFORE or ON this date (YYYY-MM-DD format)"),
				createdAfterDate: z.string().optional().describe("Filter issues that were created AFTER or ON this date (YYYY-MM-DD format)"),
				createdBeforeDate: z.string().optional().describe("Filter issues that were created BEFORE or ON this date (YYYY-MM-DD format)"),
				pageSize: z.number().optional().describe("Maximum number of issues to return (default: 10)")
			},
		},
		async (args) => {
			try {
				const issues = await leigaClient.myIssues(args)
				return {
					content: [{
						type: "text",
						text: `Found ${issues.length} issues:\n${
							issues.map((issue: any) =>
								`- ${issue.issueNumber}: [${issue.title}](${issue.url})\n
								Project: ${issue.projectName}\n
								Priority: ${issue.priority || 'None'}\n
								Status: ${issue.status || 'None'}\n
								Sprint: ${issue.sprintName || 'None'}
								`
							).join('\n')
						}`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error),
					}]
				}
			}
		},
	)

	// Create issue tool
	server.registerTool(
		"create_issue",
		{
			title: "Create Issue",
			description: "Creates a new Leiga issue. Required fields: summary (issue title) and projectName. Optional fields: description (issue details), priority (0-4, where 0 is no priority and 1 is urgent), statusName (issue status, e.g., 'Not Started', 'In Progress', 'Done'), sprint (sprint name), and workType (e.g., 'Story', 'Chore', 'Bug'). Returns the created issue's identifier and URL.",
			inputSchema: {
				summary: z.string().describe("Issue summary"),
				projectName: z.string().describe("Project name"),
				description: z.string().optional().describe("Issue description"),
				priority: z.string().optional().describe("priority name (e.g., 'Lowest', 'Low', 'Medium', 'High', 'Highest')"),
				statusName: z.string().optional().describe("Issue status (e.g., 'Not Started', 'In Progress', 'Done' )"),
				sprint: z.string().optional().describe("Sprint name"),
				workType: z.string().optional().describe("Work type name (e.g., 'Story', 'Chore', 'Bug')"),
			},
		},
		async (args) => {
			try {
				const issue = await leigaClient.createIssue(args)
				return {
					content: [{
						type: "text",
						text: `Create issue success: ${issue.issueNumber}: [${issue.title}](${issue.url})\n`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error),
					}]
				}
			}
		},
	)

	// List projects tool
	server.registerTool(
		"list_project",
		{
			title: "List Projects",
			description: "Show project list",
			inputSchema: {},
		},
		async () => {
			try {
				const projects = await leigaClient.listProjects()
				return {
					content: [{
						type: "text",
						text: `Found ${projects.length} Projects:\n${
							projects.filter((project: any) => project.archived != 1).map((project: any) =>
								`ID: ${project.id}\n
								Name: ${project.pname}\n
								PKey: ${project.pkey}\n`
							).join('\n')
						}`
					}]
				}
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error),
					}]
				}
			}
		},
	)

	// Current date tool
	server.registerTool(
		"current_date",
		{
			title: "Current Date",
			description: "Get current date (local timezone)",
			inputSchema: {},
		},
		async () => {
			return {
				content: [{
					type: "text",
					text: `Current Date is: ${today}`
				}]
			}
		},
	)

	// List issue comments tool
	server.registerTool(
		"list_issue_comments",
		{
			title: "List Issue Comments",
			description: "List comments of an issue by ID or issue number with pagination.",
			inputSchema: {
				issueId: z.string().describe("Issue ID or issue number (e.g., 12345 or ABC-678)"),
				pageNumber: z.number().optional().describe("Page number (default 1)"),
				pageSize: z.number().optional().describe("Page size (default 10)")
			},
		},
		async (args) => {
			try {
				const data = await leigaClient.listIssueComments(args.issueId, args.pageNumber, args.pageSize);
				const total = data.total;
				const list = data.list || [];
				const formatTime = (ts?: number) => ts ? new Date(ts).toISOString() : '';
				const formatComment = (comment: CommentListItem, indent: string = ''): string => {
					const baseComment = `${indent}- [ID:${comment.commentId}] ${comment.commentUser?.userName || 'Unknown'} @ ${formatTime(comment.createTime)}\n${indent}  ${comment.content || ''}`;

					if (!comment.subReplies || comment.subReplies.length === 0) {
						return baseComment;
					}

					const replies = comment.subReplies.map((reply) =>
						`${indent}  └─ [ID:${reply.replyId}] ${reply.commentUser?.userName || 'Unknown'} @ ${formatTime(reply.createTime)}\n${indent}     ${reply.content || ''}`
					).join('\n');

					return `${baseComment}\n${replies}`;
				};

				const text = `Total Comments: ${total}\n${list.map((c) => formatComment(c)).join('\n\n')}`;
				return {
					content: [{ type: "text", text }]
				};
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error)
					}]
				}
			}
		},
	)

	// Create comment tool
	server.registerTool(
		"create_comment",
		{
			title: "Create Comment",
			description: "Create a comment for an issue. Can be a new comment or a reply to an existing comment.",
			inputSchema: {
				issueId: z.string().describe("Issue ID or issue number (e.g., 12345 or ABC-678)"),
				content: z.string().describe("Comment content"),
				commentId: z.number().optional().describe("Optional: Comment ID to reply to (for replies)")
			},
		},
		async (args) => {
			try {
				// Get issue's linkId
				const linkId = await leigaClient.resolveIssueId(args.issueId);

				const commentData: CreateCommentDTO = {
					commentModule: "issue",
					linkId,
					plainContent: args.content,
					content: args.content,
					...(args.commentId && { commentId: args.commentId })
				};

				const result = await leigaClient.createComment(commentData);
				return {
					content: [{
						type: "text",
						text: `Comment created successfully with ID: ${result.id}`
					}]
				};
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error)
					}]
				}
			}
		},
	)

	// List project members tool
	server.registerTool(
		"list_project_members",
		{
			title: "List Project Members",
			description: "List members of a specific project with optional search and pagination.",
			inputSchema: {
				projectId: z.number().describe("Project ID"),
				keyword: z.string().optional().describe("Optional keyword to search for members"),
				pageNumber: z.number().optional().describe("Page number (default: 1)"),
				pageSize: z.number().optional().describe("Page size (default: 20)")
			},
		},
		async (args) => {
			try {
				const data = await leigaClient.listProjectMembers(args);
				const total = data.total;
				const list = data.list || [];
				return {
					content: [{
						type: "text",
						text: `Found ${total} project members:\n${
							list.map((member: any) =>
								`- User ID: ${member.userId || 'N/A'}\n  User Name: ${member.userName || 'N/A'}\n  Email: ${member.orgEmail || 'N/A'}`
							).join('\n\n')
						}`
					}]
				};
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error)
					}]
				}
			}
		},
	)

	// List org members tool
	server.registerTool(
		"list_org_members",
		{
			title: "List Organization Members",
			description: "List all organization members with optional search and pagination.",
			inputSchema: {
				key: z.string().optional().describe("Optional keyword to search for members"),
				pageNumber: z.number().optional().describe("Page number (default: 1)"),
				pageSize: z.number().optional().describe("Page size (default: 20)")
			},
		},
		async (args) => {
			try {
				const data = await leigaClient.listOrgMembers(args);
				const total = data.total;
				const list = data.list || [];
				return {
					content: [{
						type: "text",
						text: `Found ${total} organization members:\n${
							list.map((member: any) =>
								`- User ID: ${member.userId || 'N/A'}\n  User Name: ${member.userName || 'N/A'}\n  Email: ${member.orgEmail || 'N/A'}`
							).join('\n\n')
						}`
					}]
				};
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error)
					}]
				}
			}
		},
	)

	// Get issue options tool
	server.registerTool(
		"get_issue_options",
		{
			title: "Get Issue Options",
			description: "Get selectable option fields for an issue by ID or issue number.",
			inputSchema: {
				issueId: z.string().describe("Issue ID or issue number (e.g., 12345 or ABC-678)")
			},
		},
		async (args) => {
			try {
				const fields = await leigaClient.getIssueOptions(args.issueId);
				const text = `Found ${fields.length} option fields:\n${
					fields.map((f: any) => {
						const header = `- ${f.customFieldName || 'Unnamed'} (${f.fieldCode || 'unknown_code'})${f.requiredFlag ? ' (required)' : ''}`;
						if (!Array.isArray(f.options) || f.options.length === 0) {
							return `${header}\n  - options: None`;
						}
						const optionsText = f.options.map((o: any) => `  - name: ${o?.name ?? 'None'}, value: ${o?.value ?? ''}`).join('\n');
						return `${header}\n${optionsText}`;
					}).join('\n\n')
				}`;
				return {
					content: [{ type: "text", text }]
				};
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error)
					}]
				}
			}
		},
	)

	// Update issue tool
	server.registerTool(
		"update_issue",
		{
			title: "Update Issue",
			description: "Update an issue by ID or issue number. If names are provided for fields (e.g., statusName, priorityName, assigneeName, labels), they will be resolved to IDs via get_issue_options before updating.",
			inputSchema: {
				issueId: z.string().describe("Issue ID or issue number (e.g., 12345 or ABC-678)"),
				summary: z.string().optional().describe("New summary (optional)"),
				description: z.string().optional().describe("New description (optional)"),
				statusName: z.string().optional().describe("Workflow status name to set (optional)"),
				priorityName: z.string().optional().describe("Priority name to set (optional)"),
				assigneeName: z.string().optional().describe("Assignee name to set (optional)"),
				labels: z.array(z.string()).optional().describe("Label names to set (optional)"),
				follows: z.array(z.string()).optional().describe("Follower names to set (optional)"),
				releaseVersionName: z.string().optional().describe("Release version name to set (optional)"),
				dueDate: z.string().optional().describe("Due date (YYYY-MM-DD) or timestamp in ms (optional)"),
				startDate: z.string().optional().describe("Start date (YYYY-MM-DD) or timestamp in ms (optional)")
			},
		},
		async (args) => {
			try {
				const result = await leigaClient.updateIssue(args);
				return { content: [{ type: "text", text: `Update issue success: ${result}` }] };
			} catch (error) {
				return {
					content: [{
						type: "text",
						text: error instanceof Error ? error.message : String(error)
					}]
				}
			}
		},
	)

	// Add a prompt for Leiga usage instructions
	server.registerPrompt(
		"leiga-server-prompt",
		{
			title: "Leiga Server Instructions",
			description: "Instructions for using the Leiga MCP server effectively",
			argsSchema: {},
		},
		async () => {
			return {
				messages: [
					{
						role: "user",
						content: {
							type: "text",
							text: `This server provides access to Leiga, a project management tool. Use it to manage issues.

Key capabilities:
- Create issues: Create new issues with titles, descriptions, priorities, and project assignments.
- Search functionality: Find issues across the organization using flexible search queries with user filters.
- Comment management: View comments on issues with author information and timestamps.
- Issue updates: Update issue fields like status, priority, assignee, and more.
- Team management: List project and organization members.

Tool Usage:
- search_all_issues:
  - combine multiple filters for precise results
  - query searches title
  - returns max 10 results by default

- my_assigned_issues:
  - combine multiple filters for precise results
  - get authenticated user's issues
  - use this tool when first-person singular pronouns (e.g., me, my, mine, or myself) appear
  - returns max 10 results by default

- get_issue_detail:
  - using issue ID (e.g., 12345) or the issue number (e.g., ABC-678) get issue detail

- create_issue:
  - statusName must match exact Leiga workflow state names (e.g., 'Not Started', 'In Progress', 'Done')

- list_issue_comments:
  - get comments for an issue using ID or issue number
  - supports pagination with pageNumber and pageSize
  - returns author, timestamp, content, and reply count for each comment

- create_comment:
  - create a new comment for an issue using ID or issue number
  - can reply to existing comments by providing commentId
  - returns the created comment ID

- get_issue_options:
  - get available field options for an issue (status, priority, assignee, etc.)
  - useful before updating issues to see valid values

- update_issue:
  - update issue fields using field names (automatically resolved to IDs)
  - supports summary, description, status, priority, assignee, labels, dates, etc.

- list_project_members / list_org_members:
  - list team members with search and pagination
  - useful for finding assignees or collaborators

Best practices:
- When searching:
  - Use specific, targeted queries for better results (e.g., "auth mobile app" rather than just "auth")
  - Apply relevant filters when asked or when you can infer the appropriate filters to narrow results

- When creating issues:
  - Write clear, actionable summary that describe the task well (e.g., "Implement user authentication for mobile app")
  - Include concise but appropriately detailed descriptions in markdown format with context and acceptance criteria
  - Always specify the correct project name

- When viewing comments:
  - Use issue ID or issue number format (e.g., 12345 or ABC-678)
  - Comments are paginated with 20 items per page by default

- When updating issues:
  - Use get_issue_options first to see available field values
  - Provide field names (e.g., "High" for priority) rather than IDs

The server uses the authenticated user's permissions for all operations.`,
						},
					},
				],
			}
		},
	)

	return server.server
}
