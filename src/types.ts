/**
 * Leiga API Types
 */

// Token 数据
export interface TokenData {
  accessToken: string;
  expireIn: number;
  createdAt: number;
}

export interface SearchIssueDTO {
  query?: string;
  projectName?: string;
  status?: string;
  assignee?: string;
  label?: string;
  priority?: string;
  sprint?: string;
  workType?: string;
  startAfterDate?: string;
  startBeforeDate?: string;
  dueAfterDate?: string;
  dueBeforeDate?: string;
  createdAfterDate?: string;
  createdBeforeDate?: string;
  pageSize?: number;
}

export interface CreateIssueDTO {
  projectName: string;
  summary: string;
  description?: string;
  statusName?: string;
  priority?: string;
  sprint?: string;
  workType?: string;
}

export interface IssueListResponse {
  id: string;
  projectName: string;
  issueNumber: string;
  url: string;
  status: string;
  priority?: string;
  assignee?: string;
  title: string;
  description?: string;
  sprintName?: string;
}
