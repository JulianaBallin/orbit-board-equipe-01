import type { WorkItemPriority } from '../types/api';

const priorityRank: WorkItemPriority[] = ['Critical', 'High', 'Medium', 'Low'];

interface Prioritized {
  priority: WorkItemPriority;
}

export interface DropBox {
  top: number;
  height: number;
}

export function landingFor(columnTasks: Prioritized[], dropIndex: number, priority: WorkItemPriority) {
  const rank = priorityRank.indexOf(priority);
  const position = columnTasks
    .slice(0, dropIndex)
    .filter((task) => task.priority === priority)
    .length;
  const above = columnTasks
    .filter((task) => priorityRank.indexOf(task.priority) < rank)
    .length;

  return { position, index: above + position };
}

export function dropIndexFor(boxes: DropBox[], pointerY: number): number {
  for (let index = 0; index < boxes.length; index += 1) {
    const box = boxes[index];
    if (!box) continue;
    if (pointerY < box.top + box.height / 2) return index;
  }

  return boxes.length;
}

export function reorder<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= items.length) return items;

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  if (moved !== undefined) next.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved);
  return next;
}
