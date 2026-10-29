/** Mock data for Phase 2–3 UI until the backend is connected. */

export const MOCK_USERS = {
  admin: {
    id: 1,
    username: 'admin',
    role: 'admin',
    displayName: 'Admin',
  },
  user: {
    id: 2,
    username: 'viewer',
    role: 'user',
    displayName: 'Viewer',
  },
};

/** Sidebar tree nodes (expandable). */
export const SIDEBAR_TREE = [
  {
    id: 'root-my-files',
    name: 'My Files',
    folderId: 'folder-my-files',
    children: [],
  },
  {
    id: 'root-videos',
    name: 'Videos',
    folderId: 'folder-videos',
    children: [
      { id: 'vid-1', name: 'video 1', folderId: 'folder-video-1' },
      { id: 'vid-2', name: 'video 2', folderId: 'folder-video-2' },
      { id: 'vid-work-1', name: 'work 1', folderId: 'folder-work-1' },
    ],
  },
  {
    id: 'root-music',
    name: 'Music',
    folderId: 'folder-music',
    children: [],
  },
  {
    id: 'root-images',
    name: 'Images',
    folderId: 'folder-images',
    children: [],
  },
  {
    id: 'root-scenario',
    name: 'Scenario',
    folderId: 'folder-scenario-inner',
    children: [],
  },
];

/** Folder metadata keyed by id. */
export const MOCK_FOLDERS = {
  'folder-my-files': { id: 'folder-my-files', name: 'My Files', parentId: null },
  'folder-videos': { id: 'folder-videos', name: 'Videos', parentId: 'folder-my-files' },
  'folder-video-1': { id: 'folder-video-1', name: 'video 1', parentId: 'folder-videos' },
  'folder-video-2': { id: 'folder-video-2', name: 'video 2', parentId: 'folder-videos' },
  'folder-work-1': { id: 'folder-work-1', name: 'work 1', parentId: 'folder-videos' },
  'folder-music': { id: 'folder-music', name: 'Music', parentId: 'folder-my-files' },
  'folder-images': { id: 'folder-images', name: 'Images', parentId: 'folder-my-files' },
  'folder-scenario': { id: 'folder-scenario', name: 'Scenario', parentId: 'folder-images' },
  'folder-scenario-inner': {
    id: 'folder-scenario-inner',
    name: 'Scenario',
    parentId: 'folder-images',
  },
};

/** Items per folder: mix of files and subfolders. */
export const MOCK_FOLDER_CONTENTS = {
  'folder-my-files': [
    { type: 'folder', id: 'folder-videos', name: 'Videos' },
    { type: 'folder', id: 'folder-music', name: 'Music' },
    { type: 'folder', id: 'folder-images', name: 'Images' },
  ],
  'folder-images': [
    { type: 'folder', id: 'folder-scenario-inner', name: 'Scenario' },
  ],
  'folder-scenario-inner': [
    {
      type: 'folder',
      id: 'folder-other-scenario',
      name: 'Other Scenario',
      dateModified: '2025-09-05T06:42:00',
      dateCreated: '2025-09-03T14:41:00',
    },
    {
      type: 'file',
      id: 'file-forest',
      name: 'Forest.jpg',
      ext: 'jpg',
      mimeType: 'image/jpeg',
      size: 19456,
      dateModified: '2025-09-12T16:45:00',
      dateCreated: '2025-09-10T11:21:00',
      creator: 'Budin',
    },
    {
      type: 'file',
      id: 'file-mountain',
      name: 'Mountain.png',
      ext: 'png',
      mimeType: 'image/png',
      size: 21504,
      dateModified: '2025-09-15T14:54:00',
      dateCreated: '2025-09-13T12:56:00',
      creator: 'Arif',
    },
    {
      type: 'file',
      id: 'file-paddy',
      name: 'Paddy Field.pdf',
      ext: 'pdf',
      mimeType: 'application/pdf',
      size: 20480,
      dateModified: '2025-09-09T08:15:00',
      dateCreated: '2025-09-06T13:11:00',
      creator: 'Admin',
    },
    {
      type: 'file',
      id: 'file-river',
      name: 'River.docx',
      ext: 'docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      size: 14336,
      dateModified: '2025-09-02T03:33:00',
      dateCreated: '2025-09-01T11:33:00',
      creator: 'Admin',
    },
  ],
  'folder-videos': [
    { type: 'folder', id: 'folder-video-1', name: 'video 1' },
    { type: 'folder', id: 'folder-video-2', name: 'video 2' },
    { type: 'folder', id: 'folder-work-1', name: 'work 1' },
  ],
  'folder-music': [],
  'folder-scenario': [],
};

export function getFolderPath(folderId) {
  const segments = [];
  let currentId = folderId;
  const visited = new Set();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const folder = MOCK_FOLDERS[currentId];
    if (!folder) break;
    segments.unshift(folder);
    currentId = folder.parentId;
  }

  return segments;
}

export function getFolderContents(folderId) {
  return MOCK_FOLDER_CONTENTS[folderId] ?? [];
}
