import { describe, expect, it } from 'vitest';
import { dropIndexFor, landingFor, reorder } from './boardDrop';

const boxes = [
  { top: 0, height: 100 },
  { top: 100, height: 100 },
  { top: 200, height: 100 },
];

describe('dropIndexFor', () => {
  it('lands before the first card when the pointer is above its middle', () => {
    expect(dropIndexFor(boxes, 10)).toBe(0);
    expect(dropIndexFor(boxes, 49)).toBe(0);
  });

  it('lands after a card once the pointer passes its middle', () => {
    expect(dropIndexFor(boxes, 51)).toBe(1);
    expect(dropIndexFor(boxes, 149)).toBe(1);
    expect(dropIndexFor(boxes, 151)).toBe(2);
  });

  it('lands at the end when the pointer is below every card', () => {
    expect(dropIndexFor(boxes, 400)).toBe(3);
  });

  it('lands at the start of an empty column', () => {
    expect(dropIndexFor([], 400)).toBe(0);
  });
});

describe('landingFor', () => {
  const column = [
    { id: 'a', priority: 'Critical' },
    { id: 'b', priority: 'High' },
    { id: 'c', priority: 'High' },
    { id: 'd', priority: 'Low' },
  ];

  it('counts the position only among tasks of the same priority', () => {
    expect(landingFor(column, 2, 'High')).toEqual({ position: 1, index: 2 });
  });

  it('lands first in its group when dropped above everything', () => {
    expect(landingFor(column, 0, 'High')).toEqual({ position: 0, index: 1 });
  });

  it('lands last in its group when dropped below everything', () => {
    expect(landingFor(column, 4, 'High')).toEqual({ position: 2, index: 3 });
  });

  it('keeps a low priority task under the higher ones even when dropped on top', () => {
    expect(landingFor(column, 0, 'Low')).toEqual({ position: 0, index: 3 });
  });

  it('keeps a critical task above the others even when dropped at the bottom', () => {
    expect(landingFor(column, 4, 'Critical')).toEqual({ position: 1, index: 1 });
  });

  it('lands at the start of an empty column', () => {
    expect(landingFor([], 0, 'Medium')).toEqual({ position: 0, index: 0 });
  });
});

describe('reorder', () => {
  it('moves an item down keeping the remaining order', () => {
    expect(reorder(['a', 'b', 'c'], 0, 2)).toEqual(['b', 'a', 'c']);
  });

  it('moves an item up keeping the remaining order', () => {
    expect(reorder(['a', 'b', 'c'], 2, 0)).toEqual(['c', 'a', 'b']);
  });

  it('returns the same list when the position does not change', () => {
    const items = ['a', 'b', 'c'];
    expect(reorder(items, 1, 1)).toBe(items);
  });

  it('ignores an index outside the list', () => {
    const items = ['a', 'b'];
    expect(reorder(items, 5, 0)).toBe(items);
  });
});
