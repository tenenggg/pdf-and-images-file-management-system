const ADMIN_CAPABILITIES = {
  canViewFiles: true,
  canBrowseFolders: true,
  canPreviewFiles: true,
  canUpload: true,
  canDownload: true,
  canCreateFolder: true,
  canRename: true,
  canDelete: true,
  canCutCopyPaste: true,
  canManageUsers: true,
  canEditOwnProfile: true,
};

const USER_CAPABILITIES = {
  canViewFiles: true,
  canBrowseFolders: true,
  canPreviewFiles: true,
  canUpload: false,
  canDownload: false,
  canCreateFolder: false,
  canRename: false,
  canDelete: false,
  canCutCopyPaste: false,
  canManageUsers: false,
  canEditOwnProfile: true,
};

export function getCapabilitiesForRole(role) {
  return role === 'admin' ? { ...ADMIN_CAPABILITIES } : { ...USER_CAPABILITIES };
}
