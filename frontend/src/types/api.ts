export const projectStatuses = ['Planning', 'Active', 'OnHold', 'Completed'] as const;
export type ProjectStatus = (typeof projectStatuses)[number];

export const workItemStatuses = ['Backlog', 'InProgress', 'Review', 'Done'] as const;
export type WorkItemStatus = (typeof workItemStatuses)[number];

export const workItemPriorities = ['Low', 'Medium', 'High', 'Critical'] as const;
export type WorkItemPriority = (typeof workItemPriorities)[number];

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  initials: string;
}

export interface TeamMemberMutation {
  name: string;
  role: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string | null;
  ownerId: string;
  ownerName: string;
  totalTasks: number;
  completedTasks: number;
  createdAt: string;
}

export interface ProjectMutation {
  name: string;
  description: string;
  status: ProjectStatus;
  startDate: string;
  dueDate: string | null;
  ownerId: string;
}

export interface WorkItem {
  id: string;
  projectId: string;
  projectName: string;
  title: string;
  description: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  estimatedHours: number;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkItemMutation {
  projectId: string;
  title: string;
  description: string;
  status: WorkItemStatus;
  priority: WorkItemPriority;
  assigneeId: string | null;
  dueDate: string | null;
  estimatedHours: number;
}

export interface WorkItemFilters {
  projectId?: string;
  status?: WorkItemStatus | '';
  priority?: WorkItemPriority | '';
  assigneeId?: string;
  search?: string;
}

export interface TaskHistoryEntry {
  id: string;
  workItemId: string;
  fromStatus: WorkItemStatus | null;
  toStatus: WorkItemStatus;
  changedAt: string;
}

export interface Dashboard {
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  recentTasks: WorkItem[];
  tasksByStatus: Record<WorkItemStatus, number>;
}

export interface ApiProblem {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  traceId?: string;
}
