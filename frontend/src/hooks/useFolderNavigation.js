import { useCallback, useEffect, useRef, useState } from 'react';
import * as folderService from '../services/folderService';

export function useFolderNavigation(initialFolderId = null) {
  const [currentFolderId, setCurrentFolderId] = useState(initialFolderId);
  const [path, setPath] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const historyRef = useRef(initialFolderId ? [initialFolderId] : []);
  const [canGoBack, setCanGoBack] = useState(false);

  const loadFolder = useCallback(async (folderId) => {
    if (!folderId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await folderService.getFolderContents(folderId);
      setPath(data.path ?? []);
      setItems(data.items ?? []);
      setCurrentFolderId(folderId);
      return data;
    } catch (err) {
      setError(err.message ?? 'Failed to load folder');
    } finally {
      setLoading(false);
    }
  }, []);

  const navigateToFolder = useCallback(
    async (folderId) => {
      if (!folderId) return;
      const history = historyRef.current;
      if (history[history.length - 1] !== folderId) {
        history.push(folderId);
        setCanGoBack(history.length > 1);
      }
      return loadFolder(folderId);
    },
    [loadFolder],
  );

  const goBack = useCallback(async () => {
    if (historyRef.current.length <= 1) return;
    historyRef.current.pop();
    const previousFolderId = historyRef.current[historyRef.current.length - 1];
    setCanGoBack(historyRef.current.length > 1);
    return loadFolder(previousFolderId);
  }, [loadFolder]);

  const refresh = useCallback(() => {
    if (currentFolderId) {
      return loadFolder(currentFolderId);
    }
    return Promise.resolve();
  }, [currentFolderId, loadFolder]);

  useEffect(() => {
    if (initialFolderId && !currentFolderId) {
      Promise.resolve().then(() => loadFolder(initialFolderId));
    }
  }, [initialFolderId, currentFolderId, loadFolder]);

  return {
    currentFolderId,
    path,
    items,
    loading,
    error,
    navigateToFolder,
    goBack,
    canGoBack,
    loadFolder,
    refresh,
    setCurrentFolderId,
  };
}
