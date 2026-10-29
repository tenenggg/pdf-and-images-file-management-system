import { apiRequest } from './apiClient';

export function getFolderTree() {
  return apiRequest('/folders/tree');
}

export function getFolderContents(folderId) {
  return apiRequest(`/folders/${folderId}/contents`);
}

export function createFolder({ name, parentId }) {
  return apiRequest('/folders', {
    method: 'POST',
    body: JSON.stringify({ name, parentId }),
  });
}

export function renameFolder(folderId, name) {
  return apiRequest(`/folders/${folderId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export function deleteFolder(folderId) {
  return apiRequest(`/folders/${folderId}`, { method: 'DELETE' });
}

export function moveFolder(folderId, targetFolderId) {
  return apiRequest(`/folders/${folderId}/move`, {
    method: 'POST',
    body: JSON.stringify({ targetFolderId }),
  });
}
