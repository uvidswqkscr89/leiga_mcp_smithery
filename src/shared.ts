import { LeigaOpenAPIClient } from "./LeigaOpenAPIClient.js";
import { CreateIssueDTO, SearchIssueDTO, CreateCommentDTO, ProjectMemberListDTO, OrgMemberListDTO } from "./types.js";

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

  async listIssueComments(issueId: string, pageNumber?: number, pageSize?: number){
    const result = await this.client.getIssueComments(issueId, pageNumber ?? 1, pageSize ?? 20);
    return result.data;
  }

  async createComment(args: CreateCommentDTO) {
    const result = await this.client.createComment(args);
    return result.data;
  }

  async resolveIssueId(issueIdOrNumber: string): Promise<number> {
    return await this.client.resolveIssueId(issueIdOrNumber);
  }

  async listProjectMembers(args: ProjectMemberListDTO) {
    const result = await this.client.listProjectMembers(args);
    return result.data;
  }

  async listOrgMembers(args: OrgMemberListDTO) {
    const result = await this.client.listOrgMembers(args);
    return result.data;
  }

  async getIssueOptions(issueIdOrNumber: string) {
    const result = await this.client.getIssueOptions(issueIdOrNumber);
    return result.data;
  }

  async updateIssue(args: {
    issueId: string,
    summary?: string,
    description?: string,
    statusName?: string,
    priorityName?: string,
    assigneeName?: string,
    labels?: string[],
    follows?: string[],
    releaseVersionName?: string,
    dueDate?: string | number,
    startDate?: string | number,
  }) {
    const numericId = await this.resolveIssueId(args.issueId);
    const fields = await this.getIssueOptions(args.issueId);

    const findFieldByCode = (code: string) => fields.find((f: any) => (f.fieldCode || '').toLowerCase() === code.toLowerCase());
    const findOptionValueByName = (code: string, name?: string) => {
      if (!name) return undefined;
      const field = findFieldByCode(code);
      const opts = field?.options || [];
      const match = opts.find((o: any) => (o?.name || '').toLowerCase() === name.toLowerCase());
      return match?.value;
    };
    const findManyOptionValuesByNames = (code: string, names?: string[]) => {
      if (!names || names.length === 0) return undefined;
      const field = findFieldByCode(code);
      const opts = field?.options || [];
      const map = new Map<string, any>();
      for (const o of opts) {
        const n = (o?.name || '').toLowerCase();
        map.set(n, o?.value);
      }
      const vals: any[] = [];
      for (const n of names) {
        const v = map.get((n || '').toLowerCase());
        if (v !== undefined) vals.push(v);
      }
      return vals.length ? vals : undefined;
    };

    const toMillis = (d?: string | number) => {
      if (d === undefined) return undefined;
      if (typeof d === 'number') return d;
      const parsed = Date.parse(d);
      return isNaN(parsed) ? undefined : parsed;
    };

    const data: any = {};
    if (args.summary !== undefined) data.summary = args.summary;
    if (args.description !== undefined) data.description = args.description;
    const statusId = findOptionValueByName('status', args.statusName);
    if (statusId !== undefined) data.status = statusId;
    const priorityId = findOptionValueByName('priority', args.priorityName);
    if (priorityId !== undefined) data.priority = priorityId;
    const assigneeId = findOptionValueByName('assignee', args.assigneeName);
    if (assigneeId !== undefined) data.assignee = assigneeId;
    const labelIds = findManyOptionValuesByNames('label', args.labels);
    if (labelIds !== undefined) data.label = labelIds;
    const followIds = findManyOptionValuesByNames('follows', args.follows);
    if (followIds !== undefined) data.follows = followIds;
    const releaseVersionId = findOptionValueByName('releaseVersion', args.releaseVersionName);
    if (releaseVersionId !== undefined) data.releaseVersion = releaseVersionId;
    const due = toMillis(args.dueDate);
    if (due !== undefined) data.dueDate = due;
    const start = toMillis(args.startDate);
    if (start !== undefined) data.startDate = start;

    const result = await this.client.updateIssue({ id: numericId, data } as any);
    return result.data;
  }
}
