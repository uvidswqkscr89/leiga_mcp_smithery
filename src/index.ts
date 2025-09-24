/**
 * Leiga MCP Server for Smithery
 *
 * A Model Context Protocol server for the Leiga project management platform.
 * This server provides tools to search, create, and manage Leiga issues.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { z } from "zod"
import { LeigaMCPClient } from "./shared.js"

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
		version: "1.0.0",
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

Best practices:
- When searching:
  - Use specific, targeted queries for better results (e.g., "auth mobile app" rather than just "auth")
  - Apply relevant filters when asked or when you can infer the appropriate filters to narrow results

- When creating issues:
  - Write clear, actionable summary that describe the task well (e.g., "Implement user authentication for mobile app")
  - Include concise but appropriately detailed descriptions in markdown format with context and acceptance criteria
  - Always specify the correct project name

The server uses the authenticated user's permissions for all operations.`,
						},
					},
				],
			}
		},
	)

	return server.server
}
