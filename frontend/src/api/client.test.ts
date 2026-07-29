import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';
import {
  makeMemberMutation,
  makeProjectMutation,
  makeWorkItemMutation,
} from '../test/fixtures';

interface MockResponseOptions {
  ok?: boolean;
  status?: number;
  contentType?: string;
  body?: unknown;
}

function mockResponse({
  ok = true,
  status = 200,
  contentType = 'application/json',
  body = {},
}: MockResponseOptions = {}): Response {
  const response = new Response(status === 204 ? null : 'mock', {
    status,
    headers: { 'content-type': contentType },
  });
  Object.defineProperty(response, 'ok', { value: ok });
  vi.spyOn(response, 'json').mockResolvedValue(body);
  vi.spyOn(response, 'text').mockResolvedValue(
    typeof body === 'string' ? body : JSON.stringify(body),
  );
  return response;
}

function mockFetch(responseOptions: MockResponseOptions = {}) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(mockResponse(responseOptions));
}

function expectRequest(path: string, options: RequestInit = {}): void {
  expect(globalThis.fetch).toHaveBeenCalledWith(
    `http://localhost:5200${path}`,
    expect.objectContaining({
      ...options,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

describe('api client', () => {
  afterEach(() => vi.restoreAllMocks());

  it('parses JSON and preserves typed error details', async () => {
    const body = { id: 'project-1', name: 'Orbit Board' };
    mockFetch({ body });
    await expect(api.projects.get('project-1')).resolves.toEqual(body);

    vi.restoreAllMocks();
    mockFetch({ ok: false, status: 404, body: { detail: 'Project not found.' } });
    await expect(api.projects.get('missing')).rejects.toMatchObject({
      message: 'Project not found.',
      status: 404,
      payload: { detail: 'Project not found.' },
    });
  });

  it('uses title, text and fallback error messages', async () => {
    mockFetch({ ok: false, status: 409, body: { title: 'Conflict.' } });
    await expect(api.dashboard()).rejects.toThrow('Conflict.');
    vi.restoreAllMocks();
    mockFetch({ ok: false, status: 500, contentType: 'text/plain', body: 'Failure.' });
    await expect(api.dashboard()).rejects.toThrow('Failure.');
    vi.restoreAllMocks();
    mockFetch({ ok: false, status: 500, body: null });
    await expect(api.dashboard()).rejects.toThrow('Não foi possível concluir a operação.');
  });

  it('returns undefined without parsing a 204 response', async () => {
    const response = mockResponse({ status: 204 });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response);
    await expect(api.projects.remove('project-1')).resolves.toBeUndefined();
    expect(response.json).not.toHaveBeenCalled();
    expect(response.text).not.toHaveBeenCalled();
  });

  it('calls the dashboard and project endpoints with their contracts', async () => {
    mockFetch();
    await api.dashboard();
    expectRequest('/api/dashboard');

    const mutation = makeProjectMutation();
    await api.projects.create(mutation);
    expectRequest('/api/projects', { method: 'POST', body: JSON.stringify(mutation) });
    await api.projects.update('project-1', mutation);
    expectRequest('/api/projects/project-1', { method: 'PUT', body: JSON.stringify(mutation) });
    await api.projects.remove('project-1');
    expectRequest('/api/projects/project-1', { method: 'DELETE' });
  });

  it('serializes supported task filters and omits empty filters', async () => {
    mockFetch();
    await api.tasks.list({
      status: 'Backlog',
      projectId: 'project-1',
      assigneeId: '',
      search: 'login flow',
    });
    expectRequest('/api/tasks?status=Backlog&projectId=project-1&search=login+flow');
  });

  it('calls every task mutation endpoint with typed payloads', async () => {
    mockFetch();
    const mutation = makeWorkItemMutation();
    await api.tasks.create(mutation);
    expectRequest('/api/tasks', { method: 'POST', body: JSON.stringify(mutation) });
    await api.tasks.update('task-1', mutation);
    expectRequest('/api/tasks/task-1', { method: 'PUT', body: JSON.stringify(mutation) });
    await api.tasks.changeStatus('task-1', 'Done');
    expectRequest('/api/tasks/task-1/status', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Done' }),
    });
    await api.tasks.move('task-1', 'Review', 2);
    expectRequest('/api/tasks/task-1/position', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'Review', position: 2 }),
    });
    await api.tasks.history('task-1');
    expectRequest('/api/tasks/task-1/history');
    await api.tasks.remove('task-1');
    expectRequest('/api/tasks/task-1', { method: 'DELETE' });
  });

  it('calls every team endpoint with typed payloads', async () => {
    mockFetch();
    const mutation = makeMemberMutation();
    await api.team.list();
    expectRequest('/api/team-members');
    await api.team.create(mutation);
    expectRequest('/api/team-members', { method: 'POST', body: JSON.stringify(mutation) });
    await api.team.update('member-1', mutation);
    expectRequest('/api/team-members/member-1', { method: 'PUT', body: JSON.stringify(mutation) });
    await api.team.remove('member-1');
    expectRequest('/api/team-members/member-1', { method: 'DELETE' });
  });
});
