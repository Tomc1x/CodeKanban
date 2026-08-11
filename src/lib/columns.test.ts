import { describe, it, expect } from 'vitest';
import { COLUMNS, nextColumn, PRIORITY_CLASS } from './columns';

describe('nextColumn', () => {
  it('walks through the pipeline in order', () => {
    expect(nextColumn('backlog')).toBe('todo');
    expect(nextColumn('todo')).toBe('doing');
    expect(nextColumn('doing')).toBe('blocked');
    expect(nextColumn('blocked')).toBe('done');
    expect(nextColumn('done')).toBe('validated');
  });

  it('returns null after the last column', () => {
    expect(nextColumn('validated')).toBeNull();
  });

  it('covers every status defined in COLUMNS', () => {
    expect(COLUMNS.map((c) => c.id)).toEqual(['backlog', 'todo', 'doing', 'blocked', 'done', 'validated']);
  });
});

describe('PRIORITY_CLASS', () => {
  it('has a class for every priority level', () => {
    expect(PRIORITY_CLASS.haute).toBeTruthy();
    expect(PRIORITY_CLASS.moyenne).toBeTruthy();
    expect(PRIORITY_CLASS.basse).toBeTruthy();
  });
});
