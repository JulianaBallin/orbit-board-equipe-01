import type { ChangeEvent } from 'react';
import type {
  Project,
  WorkItemFilters,
  WorkItemPriority,
  WorkItemStatus,
} from '../types/api';
import { priorityLabel, statusLabel } from '../utils/labels';
import { Panel } from './TaskFilters.styles';

interface TaskFiltersProps {
  filters: WorkItemFilters;
  projects: Project[];
  statuses: WorkItemStatus[];
  priorities: WorkItemPriority[];
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onClear: () => void;
}

export default function TaskFilters({
  filters,
  projects,
  statuses,
  priorities,
  onChange,
  onClear,
}: TaskFiltersProps) {
  return (
    <Panel>
      <input
        name="search"
        value={filters.search ?? ''}
        onChange={onChange}
        placeholder="Buscar por título ou descrição"
      />
      <select name="projectId" value={filters.projectId ?? ''} onChange={onChange}>
        <option value="">Todos os projetos</option>
        {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
      </select>
      <select name="status" value={filters.status ?? ''} onChange={onChange}>
        <option value="">Todos os status</option>
        {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
      </select>
      <select name="priority" value={filters.priority ?? ''} onChange={onChange}>
        <option value="">Todas as prioridades</option>
        {priorities.map((priority) => (
          <option key={priority} value={priority}>{priorityLabel(priority)}</option>
        ))}
      </select>
      <button type="button" className="button secondary" onClick={onClear}>Limpar filtros</button>
    </Panel>
  );
}
