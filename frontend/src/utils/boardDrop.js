const priorityRank = ['Critical', 'High', 'Medium', 'Low'];

export function landingFor(columnTasks, dropIndex, priority) {
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

export function dropIndexFor(boxes, pointerY) {
  for (let index = 0; index < boxes.length; index += 1) {
    const box = boxes[index];
    if (pointerY < box.top + box.height / 2) return index;
  }

  return boxes.length;
}

export function reorder(items, fromIndex, toIndex) {
  if (fromIndex === toIndex || fromIndex < 0 || fromIndex >= items.length) return items;

  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex > fromIndex ? toIndex - 1 : toIndex, 0, moved);
  return next;
}
