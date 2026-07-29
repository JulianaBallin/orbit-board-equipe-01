import type {
  Dashboard,
  Project,
  ProjectMutation,
  TeamMember,
  TeamMemberMutation,
  WorkItem,
  WorkItemMutation,
} from '../types/api';

export function makeMember(overrides: Partial<TeamMember> = {}): TeamMember {
  return {
    id: 'member-1',
    name: 'Renata Vasconcelos',
    role: 'Backend Developer',
    email: 'renata@example.com',
    initials: 'RV',
    ...overrides,
  };
}

export function makeMemberMutation(overrides: Partial<TeamMemberMutation> = {}): TeamMemberMutation {
  return {
    name: 'Renata Vasconcelos',
    role: 'Backend Developer',
    email: 'renata@example.com',
    ...overrides,
  };
}

export function makeProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 'project-1',
    name: 'OrbitBoard',
    description: 'Projeto usado para validar a integração.',
    status: 'Active',
    startDate: '2026-07-20',
    dueDate: null,
    ownerId: 'member-1',
    ownerName: 'Renata Vasconcelos',
    totalTasks: 1,
    completedTasks: 0,
    createdAt: '2026-07-20T12:00:00Z',
    ...overrides,
  };
}

export function makeProjectMutation(overrides: Partial<ProjectMutation> = {}): ProjectMutation {
  return {
    name: 'OrbitBoard',
    description: 'Projeto usado para validar a integração.',
    status: 'Active',
    startDate: '2026-07-20',
    dueDate: null,
    ownerId: 'member-1',
    ...overrides,
  };
}

export function makeWorkItem(overrides: Partial<WorkItem> = {}): WorkItem {
  return {
    id: 'task-1',
    projectId: 'project-1',
    projectName: 'OrbitBoard',
    title: 'Validar fluxo de inscrição',
    description: 'Executar a validação completa do fluxo.',
    status: 'Backlog',
    priority: 'High',
    assigneeId: 'member-1',
    assigneeName: 'Renata Vasconcelos',
    dueDate: null,
    estimatedHours: 4,
    position: 0,
    createdAt: '2026-07-20T12:00:00Z',
    updatedAt: '2026-07-20T12:00:00Z',
    ...overrides,
  };
}

export function makeWorkItemMutation(overrides: Partial<WorkItemMutation> = {}): WorkItemMutation {
  return {
    projectId: 'project-1',
    title: 'Validar fluxo de inscrição',
    description: 'Executar a validação completa do fluxo.',
    status: 'Backlog',
    priority: 'High',
    assigneeId: 'member-1',
    dueDate: null,
    estimatedHours: 4,
    ...overrides,
  };
}

export function makeDashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  return {
    totalProjects: 1,
    activeProjects: 1,
    totalTasks: 1,
    completedTasks: 0,
    overdueTasks: 0,
    recentTasks: [makeWorkItem()],
    tasksByStatus: { Backlog: 1, InProgress: 0, Review: 0, Done: 0 },
    ...overrides,
  };
}
