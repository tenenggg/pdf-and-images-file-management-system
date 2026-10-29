import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppHeader } from '../components/layout/AppHeader';
import { Sidebar } from '../components/layout/Sidebar';
import { MainContent } from '../components/layout/MainContent';
import { FileDetailsPanel } from '../components/file-manager/FileDetailsPanel';
import { FilePreviewModal } from '../components/file-manager/FilePreviewModal';
import { ContextMenu } from '../components/file-manager/ContextMenu';
import { CreateFolderDialog } from '../components/dialogs/CreateFolderDialog';
import { RenameDialog } from '../components/dialogs/RenameDialog';
import { DeleteDialog } from '../components/dialogs/DeleteDialog';
import { UploadDialog } from '../components/dialogs/UploadDialog';
import { AdvancedSearchPanel } from '../components/search/AdvancedSearchPanel';
import { useFolderNavigation } from '../hooks/useFolderNavigation';
import { useClipboard } from '../hooks/useClipboard';
import { usePermissions } from '../hooks/usePermissions';
import * as folderService from '../services/folderService';
import * as fileService from '../services/fileService';
import layoutStyles from '../components/layout/FileManagerLayout.module.css';

export function FileManagerPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState('icon');
  const [selectedItem, setSelectedItem] = useState(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [bootstrapError, setBootstrapError] = useState('');
  const [previewItem, setPreviewItem] = useState(null);
  const [actionFolderId, setActionFolderId] = useState(null);
  const [treeRefreshKey, setTreeRefreshKey] = useState(0);
  const {
    currentFolderId,
    path,
    items,
    loading,
    error,
    navigateToFolder,
    goBack,
    canGoBack,
    refresh,
  } = useFolderNavigation();
  const { clipboard, cut, copy, clear } = useClipboard();
  const permissions = usePermissions();

  const [menu, setMenu] = useState({ open: false, x: 0, y: 0, items: [] });
  const [createOpen, setCreateOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAnchor, setSearchAnchor] = useState(null);

  useEffect(() => {
    folderService
      .getFolderTree()
      .then((data) => {
        const myFiles = data.tree?.find((node) => node.navKey === 'my-files')
          ?? data.tree?.find((node) => node.name?.trim().toLowerCase() === 'my files')
          ?? data.tree?.[0];
        if (myFiles?.folderId) {
          navigateToFolder(myFiles.folderId);
        } else {
          setBootstrapError('Root folder not found. Run the database setup seed first.');
        }
      })
      .catch((err) => setBootstrapError(err.message ?? 'Failed to load folders'))
      .finally(() => setBootstrapped(true));
  }, [navigateToFolder]);

  useEffect(() => {
    const searchResult = location.state?.searchResult;
    if (!searchResult?.folderId) return;

    navigateToFolder(searchResult.folderId).then(() => {
      setSelectedItem(searchResult);
      setPreviewItem(searchResult);
      navigate(location.pathname, { replace: true, state: null });
    });
  }, [location.pathname, location.state, navigate, navigateToFolder]);

  useEffect(() => {
    queueMicrotask(() => setSelectedItem(null));
  }, [currentFolderId]);

  const closeMenu = useCallback(() => {
    setMenu((prev) => ({ ...prev, open: false }));
  }, []);

  const handleDownload = useCallback((item) => {
    if (item.type !== 'file') return;
    window.open(fileService.getDownloadUrl(item.id), '_blank', 'noopener,noreferrer');
  }, []);

  const handleOpenFile = useCallback((item) => {
    if (item.type === 'file' && permissions.canPreviewFiles) setPreviewItem(item);
  }, [permissions.canPreviewFiles]);

  const refreshAll = useCallback(async () => {
    await refresh();
    setTreeRefreshKey((value) => value + 1);
  }, [refresh]);

  const handlePaste = useCallback(async () => {
    if (!clipboard?.item || !currentFolderId) return;
    const { mode, item } = clipboard;
    if (mode === 'cut') {
      if (item.type === 'file') {
        await fileService.moveFile(item.id, currentFolderId);
      } else {
        await folderService.moveFolder(item.id, currentFolderId);
      }
      clear();
    } else if (item.type === 'file') {
      await fileService.moveFile(item.id, currentFolderId);
    } else {
      await folderService.moveFolder(item.id, currentFolderId);
    }
    await refreshAll();
  }, [clipboard, currentFolderId, clear, refreshAll]);

  const buildItemMenu = useCallback(
    (item, includeDestinationActions = false) => {
      const menuItems = [];
      if (item.type === 'folder') {
        menuItems.push({ id: 'open', label: 'Open', onClick: () => navigateToFolder(item.id) });
        if (includeDestinationActions && permissions.canCreateFolder) {
          menuItems.push({
            id: 'new-folder-in-target',
            label: 'New Folder Here',
            onClick: () => {
              setActionFolderId(item.id);
              setCreateOpen(true);
            },
          });
        }
        if (includeDestinationActions && permissions.canUpload) {
          menuItems.push({
            id: 'upload-in-target',
            label: 'Upload File Here',
            onClick: () => {
              setActionFolderId(item.id);
              setUploadOpen(true);
            },
          });
        }
      }
      if (item.type === 'file' && permissions.canPreviewFiles) {
        menuItems.push({ id: 'view', label: 'View', onClick: () => handleOpenFile(item) });
      }
      if (permissions.canDownload && item.type === 'file') {
        menuItems.push({
          id: 'download',
          label: 'Download',
          onClick: () => handleDownload(item),
        });
      }
      if (permissions.canCutCopyPaste) {
        menuItems.push(
          { id: 'cut', label: 'Cut', onClick: () => cut(item) },
          { id: 'copy', label: 'Copy', onClick: () => copy(item) },
          {
            id: 'paste',
            label: 'Paste',
            disabled: !clipboard,
            onClick: () => handlePaste(),
          },
        );
      }
      if (permissions.canRename) {
        menuItems.push({
          id: 'rename',
          label: 'Rename',
          onClick: () => {
            setSelectedItem(item);
            setRenameOpen(true);
          },
        });
      }
      if (permissions.canDelete) {
        menuItems.push({
          id: 'delete',
          label: 'Delete',
          onClick: () => {
            setSelectedItem(item);
            setDeleteOpen(true);
          },
        });
      }
      return menuItems;
    },
    [
      permissions,
      clipboard,
      cut,
      copy,
      handleDownload,
      handlePaste,
      handleOpenFile,
      navigateToFolder,
    ],
  );

  const openItemContextMenu = useCallback(
    (event, item, destinationFolderId = currentFolderId, includeDestinationActions = false) => {
      setSelectedItem(item);
      setActionFolderId(destinationFolderId);
      setMenu({
        open: true,
        x: event.clientX,
        y: event.clientY,
        items: buildItemMenu(item, includeDestinationActions),
      });
    },
    [buildItemMenu, currentFolderId],
  );

  const buildEmptyMenu = useCallback((destinationFolderId) => {
    const menuItems = [];
    if (permissions.canCreateFolder) {
      menuItems.push({
        id: 'new-folder',
        label: 'New Folder',
        onClick: () => {
          setActionFolderId(destinationFolderId);
          setCreateOpen(true);
        },
      });
    }
    if (permissions.canUpload) {
      menuItems.push({
        id: 'upload',
        label: 'Upload File',
        onClick: () => {
          setActionFolderId(destinationFolderId);
          setUploadOpen(true);
        },
      });
    }
    if (permissions.canCutCopyPaste) {
      menuItems.push({ id: 'paste', label: 'Paste', disabled: !clipboard, onClick: handlePaste });
    }
    menuItems.push({ id: 'refresh', label: 'Refresh', onClick: refreshAll });
    return menuItems;
  }, [permissions, clipboard, handlePaste, refreshAll]);

  const openBackgroundContextMenu = useCallback(
    (event, destinationFolderId = currentFolderId) => {
      event.preventDefault();
      event.stopPropagation();
      setActionFolderId(destinationFolderId);
      setMenu({
        open: true,
        x: event.clientX,
        y: event.clientY,
        items: buildEmptyMenu(destinationFolderId),
      });
    },
    [buildEmptyMenu, currentFolderId],
  );

  async function handleCreateFolder(name) {
    const destinationFolderId = actionFolderId || currentFolderId;
    if (!destinationFolderId) {
      throw new Error('Open a folder before creating a folder');
    }
    await folderService.createFolder({ name, parentId: destinationFolderId });
    await refreshAll();
  }

  function openCreateFolderDialog() {
    setActionFolderId(currentFolderId);
    setCreateOpen(true);
  }

  function openUploadDialog() {
    setActionFolderId(currentFolderId);
    setUploadOpen(true);
  }

  async function handleRename(name) {
    if (!selectedItem) return;
    if (selectedItem.type === 'folder') {
      await folderService.renameFolder(selectedItem.id, name);
    } else {
      await fileService.renameFile(selectedItem.id, name);
    }
    await refreshAll();
  }

  async function handleDelete() {
    if (!selectedItem) return;
    if (selectedItem.type === 'folder') {
      await folderService.deleteFolder(selectedItem.id);
    } else {
      await fileService.deleteFile(selectedItem.id);
    }
    setSelectedItem(null);
    await refreshAll();
  }

  async function handleUpload(fileList) {
    await fileService.uploadFiles(actionFolderId || currentFolderId, fileList);
    await refreshAll();
  }

  async function handleAdvancedSearch(filters) {
    const query = new URLSearchParams();
    Object.entries({
      q: filters.q,
      mimeType: filters.mimeType,
      creator: filters.creator,
      createdFrom: filters.createdFrom ? `${filters.createdFrom}T00:00:00` : '',
      createdTo: filters.createdTo ? `${filters.createdTo}T23:59:59` : '',
      modifiedFrom: filters.modifiedFrom ? `${filters.modifiedFrom}T00:00:00` : '',
      modifiedTo: filters.modifiedTo ? `${filters.modifiedTo}T23:59:59` : '',
    }).forEach(([key, value]) => {
      if (value) query.set(key, value);
    });
    navigate(`/search?${query.toString()}`);
    setSearchOpen(false);
  }

  function handleSearchSubmit(value) {
    const query = value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  }

  function toggleSearchOptions(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setSearchAnchor({ top: rect.bottom + 8, right: rect.right });
    setSearchOpen((open) => !open);
  }

  if (!bootstrapped && !currentFolderId) {
    return (
      <div className={layoutStyles.shell}>
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBack={goBack}
          canGoBack={canGoBack}
        />
        <p style={{ padding: '1rem' }}>Loading file manager…</p>
      </div>
    );
  }

  if (bootstrapError && !currentFolderId) {
    return (
      <div className={layoutStyles.shell}>
        <AppHeader
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBack={goBack}
          canGoBack={canGoBack}
        />
        <p style={{ padding: '1rem' }}>{bootstrapError}</p>
      </div>
    );
  }

  return (
    <div className={layoutStyles.shell}>
      <AppHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onSearchFocus={() => setSearchOpen(true)}
        onSearchOptionsToggle={toggleSearchOptions}
        onBack={goBack}
        canGoBack={canGoBack}
      />
      <div className={layoutStyles.body}>
        <Sidebar
          currentFolderId={currentFolderId}
          refreshKey={treeRefreshKey}
          onNavigate={navigateToFolder}
          onOpenFile={handleOpenFile}
          onContextMenu={(event, item) => {
            if (item) {
              openItemContextMenu(
                event,
                item,
                item.type === 'folder' ? item.id : item.folderId,
                item.type === 'folder',
              );
            } else {
              openBackgroundContextMenu(event, currentFolderId);
            }
          }}
        />
        <MainContent
          path={path}
          items={items}
          viewMode={viewMode}
          selectedItem={selectedItem}
          cutId={clipboard?.mode === 'cut' ? clipboard.item.id : null}
          loading={loading}
          error={error}
          onNavigateFolder={navigateToFolder}
          onSelectItem={setSelectedItem}
          onOpenFolder={navigateToFolder}
          onOpenFile={handleOpenFile}
          onNewFolder={openCreateFolderDialog}
          onUpload={openUploadDialog}
          onRename={() => setRenameOpen(true)}
          onDelete={() => setDeleteOpen(true)}
          onItemContextMenu={openItemContextMenu}
          onBackgroundContextMenu={openBackgroundContextMenu}
        />
        <FileDetailsPanel item={selectedItem} />
      </div>

      <ContextMenu {...menu} onClose={closeMenu} />
      <FilePreviewModal
        item={previewItem}
        canDownload={permissions.canDownload}
        onClose={() => setPreviewItem(null)}
      />
      <CreateFolderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateFolder}
      />
      <RenameDialog
        open={renameOpen}
        item={selectedItem}
        onClose={() => setRenameOpen(false)}
        onSubmit={handleRename}
      />
      <DeleteDialog
        open={deleteOpen}
        item={selectedItem}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
      />
      <UploadDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />
      <AdvancedSearchPanel
        open={searchOpen}
        anchor={searchAnchor}
        onClose={() => setSearchOpen(false)}
        onSearch={handleAdvancedSearch}
        query={searchQuery}
        onQueryChange={setSearchQuery}
      />
    </div>
  );
}
