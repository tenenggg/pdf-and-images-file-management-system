import { apiRequest } from './apiClient';

export function register(credentials) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function login(credentials) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function logout() {
  return apiRequest('/auth/logout', { method: 'POST' });
}

export function getMe() {
  return apiRequest('/auth/me');
}

export function updateProfile(payload) {
  return apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
