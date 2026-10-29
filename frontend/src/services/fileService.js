import { API_BASE_URL, apiRequest } from './apiClient';

export function searchFiles(params) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return apiRequest(`/files/search/query${qs ? `?${qs}` : ''}`);
}

export function renameFile(fileId, name) {
  return apiRequest(`/files/${fileId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

export function deleteFile(fileId) {
  return apiRequest(`/files/${fileId}`, { method: 'DELETE' });
}

export function moveFile(fileId, targetFolderId) {
  return apiRequest(`/files/${fileId}/move`, {
    method: 'POST',
    body: JSON.stringify({ targetFolderId }),
  });
}

export async function uploadFiles(folderId, fileList) {
  if (!Number.isInteger(Number(folderId)) || Number(folderId) <= 0) {
    throw new Error('Open a folder before uploading files');
  }

  const formData = new FormData();
  formData.append('folderId', String(folderId));
  Array.from(fileList).forEach((file) => formData.append('files', file));

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      message = body.message ?? message;
    } catch {
      /* ignore */
    }
    throw new Error(message || 'Upload failed');
  }

  return response.json();
}

export function getDownloadUrl(fileId) {
  return `${API_BASE_URL}/files/${fileId}/download`;
}

export function getPreviewUrl(fileId) {
  return `${API_BASE_URL}/files/${fileId}/preview`;
}
