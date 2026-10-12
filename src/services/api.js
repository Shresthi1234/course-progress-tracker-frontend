const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getCourses: () => request('/courses'),
  createCourse: (course) => request('/courses', {
    method: 'POST',
    body: JSON.stringify(course)
  }),
  addTask: (courseId, title) => request(`/courses/${courseId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ title })
  }),
  updateTask: (courseId, taskId, task) => request(`/courses/${courseId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(task)
  }),
  deleteTask: (courseId, taskId) => request(`/courses/${courseId}/tasks/${taskId}`, {
    method: 'DELETE'
  })
};
