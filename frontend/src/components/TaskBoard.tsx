import type { PointerEvent as ReactPointerEvent } from 'react';
import type { WorkItem, WorkItemStatus } from '../types/api';
import { statusLabel } from '../utils/labels';
import { EmptyState } from './Common';
import TaskCard from './TaskCard';
import { Board, Column, ColumnHeader, Placeholder } from './TaskBoard.styles';

interface TaskBoardProps {
  tasks: WorkItem[];
  statuses: WorkItemStatus[];
  dragTaskId?: string;
  dragStatus?: WorkItemStatus | null;
  dragIndex?: number | null;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>, task: WorkItem) => void;
  onStatusChange: (id: string, status: WorkItemStatus) => void;
  onEdit: (task: WorkItem) => void;
  onViewHistory: (task: WorkItem) => void;
  onDelete: (task: WorkItem) => void;
}

export default function TaskBoard({
  tasks,
  statuses,
  dragTaskId,
  dragStatus,
  dragIndex,
  onPointerDown,
  onStatusChange,
  onEdit,
  onViewHistory,
  onDelete,
}: TaskBoardProps) {
  return (
    <Board>
      {statuses.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        const visibleTasks = columnTasks.filter((task) => task.id !== dragTaskId);
        const active = dragStatus === status;

        return (
          <Column
            className={`task-column${active ? ' drop-target' : ''}`}
            $active={active}
            key={status}
            data-status={status}
            aria-label={`Coluna ${statusLabel(status)}`}
          >
            <ColumnHeader>
              <h3>{statusLabel(status)}</h3>
              <span>{columnTasks.length}</span>
            </ColumnHeader>
            {columnTasks.length === 0 && (
              <EmptyState title="Sem tarefas" description="Nenhuma demanda neste estágio." />
            )}
            {visibleTasks.flatMap((task, position) => [
              active && dragIndex === position
                ? <Placeholder className="drop-placeholder" key={`slot-${position}`} />
                : null,
              <TaskCard
                key={task.id}
                task={task}
                statuses={statuses}
                onPointerDown={onPointerDown}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onViewHistory={onViewHistory}
                onDelete={onDelete}
              />,
            ])}
            {active && dragIndex !== null && dragIndex !== undefined && dragIndex >= visibleTasks.length && (
              <Placeholder className="drop-placeholder" />
            )}
          </Column>
        );
      })}
    </Board>
  );
}
