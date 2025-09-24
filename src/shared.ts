import { LeigaOpenAPIClient } from "./LeigaOpenAPIClient.js";
import { CreateIssueDTO, SearchIssueDTO } from "./types.js";

export class LeigaMCPClient {
  private client: LeigaOpenAPIClient;

  constructor(clientId: string, secret: string) {
    if (!clientId || !secret) throw new Error("LEIGA_CLIENT_ID and LEIGA_SECRET environment variable is required");
    this.client = new LeigaOpenAPIClient({ clientId, secret });
  }

  async getIssue(issueId: string) {
    const result = await this.client.getIssueDeail(issueId);
    if (!result) throw new Error(`Issue ${issueId} not found`);
    const data = result.data;
    return {
      id: data.id,
      issueNumber: data.data.issueNumber,
      summary: data.data.summary,
      description: data.data.description,
      priority: data.data?.priorityVO?.name,
      status: data.data.statusVO.name,
      assignee: data.data?.assigneeVO?.name,
      projectId: data.data?.projectId,
      url: this.client.getIssueUrl(data.id, data.data?.projectId),
    };
  }

  async searchIssues(args: SearchIssueDTO) {
    const result = await this.client.searchIssueList(args);
    return result.data;
  }

  async myIssues(args: SearchIssueDTO) {
    args.assignee = "currentAuthedUser";
    const result = await this.client.searchIssueList(args);
    return result.data;
  }

  async createIssue(args: CreateIssueDTO) {
    const result = await this.client.createIssue(args);
    return result.data;
  }

  async listProjects(){
    return (await this.client.getProjects()).data;
  }

  async getIssueDetail(issueId: string) {
    const result = await this.client.getIssueDeail(issueId);
    if (!result) throw new Error(`Issue ${issueId} not found`);
    return result.data.data;
  }
}
