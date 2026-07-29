import type { ProjectStatus, WorkItemPriority, WorkItemStatus } from '../types/api';

export type Tone = 'neutral' | 'info' | 'warning' | 'success' | 'danger';

export const statusLabel = (value: WorkItemStatus): string => ({
  Backlog: 'Backlog',
  InProgress: 'Em andamento',
  Review: 'Em revisão',
  Done: 'Concluída'
}[value]);

const statusTones: Record<WorkItemStatus, Tone> = {
  Backlog: 'neutral',
  InProgress: 'info',
  Review: 'warning',
  Done: 'success'
};
export const statusTone = (value: WorkItemStatus): Tone => statusTones[value];

export const priorityLabel = (value: WorkItemPriority): string => ({
  Low: 'Baixa',
  Medium: 'Média',
  High: 'Alta',
  Critical: 'Crítica'
}[value]);

const priorityTones: Record<WorkItemPriority, Tone> = {
  Low: 'neutral',
  Medium: 'info',
  High: 'warning',
  Critical: 'danger'
};
export const priorityTone = (value: WorkItemPriority): Tone => priorityTones[value];

export const projectStatusLabel = (value: ProjectStatus): string => ({
  Planning: 'Planejamento',
  Active: 'Ativo',
  OnHold: 'Em espera',
  Completed: 'Concluído'
}[value]);

const projectStatusTones: Record<ProjectStatus, Tone> = {
  Planning: 'neutral',
  Active: 'info',
  OnHold: 'warning',
  Completed: 'success'
};
export const projectStatusTone = (value: ProjectStatus): Tone => projectStatusTones[value];
