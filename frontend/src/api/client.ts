import type {
  ApiProblem,
  Dashboard,
  Project,
  ProjectMutation,
  TaskHistoryEntry,
  TeamMember,
  TeamMemberMutation,
  WorkItem,
  WorkItemFilters,
  WorkItemMutation,
  WorkItemStatus,
} from '../types/api';

const configuredApiUrl = import.meta.env.VITE_API_URL;
const API_URL = configuredApiUrl && configuredApiUrl !== 'undefined'
  ? configuredApiUrl
  : 'http://localhost:5200';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function problemMessage(body: unknown): string | undefined {
  if (!isRecord(body)) return typeof body === 'string' ? body : undefined;
  const problem = body as ApiProblem;
  return typeof problem.detail === 'string'
    ? problem.detail
    : typeof problem.title === 'string'
      ? problem.title
      : undefined;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) return undefined as T;

  const contentType = response.headers.get('content-type') || '';
  const body: unknown = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(
      problemMessage(body) || 'Não foi possível concluir a operação.',
      response.status,
      body,
    );
  }

  return body as T;
}

function toQuery(params: WorkItemFilters): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const api = {
  dashboard: () => request<Dashboard>('/api/dashboard'),
  projects: {
    list: () => request<Project[]>('/api/projects'),
    get: (id: string) => request<Project>(`/api/projects/${id}`),
    create: (data: ProjectMutation) => request<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: ProjectMutation) => request<Project>(`/api/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    remove: (id: string) => request<void>(`/api/projects/${id}`, { method: 'DELETE' }),
  },
  tasks: {
    list: (filters: WorkItemFilters = {}) => request<WorkItem[]>(`/api/tasks${toQuery(filters)}`),
    get: (id: string) => request<WorkItem>(`/api/tasks/${id}`),
    create: (data: WorkItemMutation) => request<WorkItem>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: WorkItemMutation) => request<WorkItem>(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    changeStatus: (id: string, status: WorkItemStatus) => request<WorkItem>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
    move: (id: string, status: WorkItemStatus, position: number) => request<WorkItem>(`/api/tasks/${id}/position`, {
      method: 'PATCH',
      body: JSON.stringify({ status, position }),
    }),
    remove: (id: string) => request<void>(`/api/tasks/${id}`, { method: 'DELETE' }),
    history: (id: string) => request<TaskHistoryEntry[]>(`/api/tasks/${id}/history`),
  },
  team: {
    list: () => request<TeamMember[]>('/api/team-members'),
    create: (data: TeamMemberMutation) => request<TeamMember>('/api/team-members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: string, data: TeamMemberMutation) => request<TeamMember>(`/api/team-members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    remove: (id: string) => request<void>(`/api/team-members/${id}`, { method: 'DELETE' }),
  },
};

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
}
