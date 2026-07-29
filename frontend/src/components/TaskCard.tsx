import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import type { WorkItem, WorkItemStatus } from '../types/api';
import { priorityLabel, priorityTone, statusLabel } from '../utils/labels';
import { Badge } from './Common';
import { Card, Details, InlineControl, Topline } from './TaskCard.styles';

interface TaskCardProps {
  task: WorkItem;
  statuses?: WorkItemStatus[];
  dragLayer?: boolean;
  style?: CSSProperties;
  onPointerDown?: (event: ReactPointerEvent<HTMLElement>, task: WorkItem) => void;
  onStatusChange?: (id: string, status: WorkItemStatus) => void;
  onEdit?: (task: WorkItem) => void;
  onViewHistory?: (task: WorkItem) => void;
  onDelete?: (task: WorkItem) => void;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}

export default function TaskCard({
  task,
  statuses = [],
  dragLayer = false,
  style,
  onPointerDown,
  onStatusChange,
  onEdit,
  onViewHistory,
  onDelete,
}: TaskCardProps) {
  return (
    <Card
      className={`task-card${dragLayer ? ' drag-layer' : ''}`}
      $dragLayer={dragLayer}
      data-task-id={task.id}
      onPointerDown={onPointerDown ? (event) => onPointerDown(event, task) : undefined}
      title={dragLayer ? undefined : 'Arraste para mover a tarefa de estágio'}
      style={style}
    >
      <Topline>
        <Badge tone={priorityTone(task.priority)}>{priorityLabel(task.priority)}</Badge>
        <span>{task.dueDate ? formatDate(task.dueDate) : 'Sem prazo'}</span>
      </Topline>
      <h4>{task.title}</h4>
      <p>{task.description}</p>
      <Details>
        <span>{task.projectName}</span>
        <span>{task.assigneeName || 'Sem responsável'}</span>
        <span>{task.estimatedHours}h estimadas</span>
      </Details>
      {!dragLayer && onStatusChange && (
        <InlineControl>
          Mover para
          <select
            value={task.status}
            onChange={(event) => onStatusChange(task.id, event.target.value as WorkItemStatus)}
          >
            {statuses.map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}
          </select>
        </InlineControl>
      )}
      {!dragLayer && (
        <div className="card-actions">
          <button className="button secondary small" onClick={() => onEdit?.(task)}>Editar</button>
          <button className="button secondary small" onClick={() => onViewHistory?.(task)}>Histórico</button>
          <button className="button danger small" onClick={() => onDelete?.(task)}>Excluir</button>
        </div>
      )}
    </Card>
  );
}
