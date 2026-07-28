import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';

function mockJsonResponse({ ok = true, status = 200, body = {} } = {}) {
  return {
    ok,
    status,
    headers: { get: () => 'application/json' },
    json: () => Promise.resolve(body),
  };
}

describe('api.tasks.history', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests GET /api/tasks/{id}/history and returns the parsed body', async () => {
    const entries = [
      { id: '1', workItemId: 'task-1', fromStatus: null, toStatus: 'Backlog', changedAt: '2026-01-01T00:00:00Z' },
    ];
    vi.spyOn(global, 'fetch').mockResolvedValue(mockJsonResponse({ body: entries }));

    const result = await api.tasks.history('task-1');

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/tasks/task-1/history'),
      expect.objectContaining({ headers: expect.objectContaining({ 'Content-Type': 'application/json' }) }),
    );
    expect(result).toEqual(entries);
  });

  it('throws an Error with the API detail message when the response is not ok', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue(
      mockJsonResponse({ ok: false, status: 404, body: { detail: 'Tarefa não encontrada.' } }),
    );

    await expect(api.tasks.history('missing-id')).rejects.toThrow('Tarefa não encontrada.');
  });
});
