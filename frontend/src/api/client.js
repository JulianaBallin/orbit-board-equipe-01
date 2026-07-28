const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5200';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = body?.detail || body?.title || body || 'Não foi possível concluir a operação.';
    const error = new Error(message);
    error.status = response.status;
    error.payload = body;
    throw error;
  }

  return body;
}

function toQuery(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export const api = {
  dashboard: () => request('/api/dashboard'),
  projects: {
    list: () => request('/api/projects'),
    get: (id) => request(`/api/projects/${id}`),
    create: (data) => request('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/api/projects/${id}`, { method: 'DELETE' })
  },
  tasks: {
    list: (filters = {}) => request(`/api/tasks${toQuery(filters)}`),
    get: (id) => request(`/api/tasks/${id}`),
    create: (data) => request('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    changeStatus: (id, status) => request(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),
    move: (id, status, position) => request(`/api/tasks/${id}/position`, {
      method: 'PATCH',
      body: JSON.stringify({ status, position })
    }),
    remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
    history: (id) => request(`/api/tasks/${id}/history`)
  },
  team: {
    list: () => request('/api/team-members'),
    create: (data) => request('/api/team-members', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/api/team-members/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    remove: (id) => request(`/api/team-members/${id}`, { method: 'DELETE' })
  }
};
