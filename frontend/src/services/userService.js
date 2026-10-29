import { apiRequest } from './apiClient';

export function listUsers() {
  return apiRequest('/users');
}

export function createUser(payload) {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateUser(userId, payload) {
  return apiRequest(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteUser(userId) {
  return apiRequest(`/users/${userId}`, { method: 'DELETE' });
}
