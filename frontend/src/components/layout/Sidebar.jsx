import { useEffect, useState } from 'react';
import * as folderService from '../../services/folderService';
import styles from './Sidebar.module.css';

function SidebarNode({ node, currentFolderId, revealFolderIds, onNavigate, onOpenFile, onContextMenu, depth = 0 }) {
  const [expanded, setExpanded] = useState(node.name === 'Videos' || node.navKey === 'my-files');
  const hasChildren = node.children?.length > 0;
  const isFile = node.type === 'file';
  const isActive = node.type !== 'file' && String(currentFolderId) === String(node.folderId);

  useEffect(() => {
    if (revealFolderIds?.includes(node.folderId)) queueMicrotask(() => setExpanded(true));
  }, [node.folderId, revealFolderIds]);
  const target = isFile
    ? { ...node, id: node.fileId, type: 'file' }
    : { ...node, id: node.folderId, type: 'folder' };

  return (
    <li>
      <div className={styles.row} style={{ paddingLeft: `${0.5 + depth * 0.75}rem` }}>
        {!isFile && hasChildren ? (
          <button
            type="button"
            className={styles.expandBtn}
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? '▾' : '▸'}
          </button>
        ) : (
          <span className={styles.expandSpacer} />
        )}
        <button
          type="button"
          className={`${styles.itemBtn} ${isActive ? styles.active : ''} ${revealFolderIds?.includes(node.folderId) ? styles.revealed : ''}`}
          onClick={() => (isFile ? onOpenFile?.(target) : onNavigate(node.folderId))}
          onContextMenu={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onContextMenu?.(event, target);
          }}
        >
          <span className={isFile ? styles.fileIcon : styles.folderIcon} aria-hidden="true">
            {isFile ? '📄' : '📁'}
          </span>
          <span>{node.name}</span>
        </button>
      </div>
      {hasChildren && expanded && (
        <ul className={styles.nested}>
          {node.children.map((child) => (
            <SidebarNode
              key={child.id}
              node={child}
              currentFolderId={currentFolderId}
              onNavigate={onNavigate}
              revealFolderIds={revealFolderIds}
              onOpenFile={onOpenFile}
              onContextMenu={onContextMenu}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({
  currentFolderId,
  revealFolderIds,
  refreshKey,
  onNavigate,
  onOpenFile,
  onContextMenu,
  canCreateFolder,
  onCreateFolder,
}) {
  const [tree, setTree] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    folderService
      .getFolderTree()
      .then((data) => setTree(data.tree ?? []))
      .catch((err) => setError(err.message));
  }, [refreshKey]);

  return (
    <aside
      className={styles.sidebar}
      onContextMenu={(event) => {
        event.preventDefault();
        onContextMenu?.(event, null);
      }}
    >
      {error && <p className={styles.error}>{error}</p>}
      <ul className={styles.tree}>
        {tree.map((node) => (
          <SidebarNode
            key={node.id}
            node={node}
            currentFolderId={currentFolderId}
            onNavigate={onNavigate}
            revealFolderIds={revealFolderIds}
            onOpenFile={onOpenFile}
            onContextMenu={onContextMenu}
          />
        ))}
      </ul>
      {canCreateFolder && (
        <div style={{ padding: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--color-border, #eee)' }}>
          <button
            type="button"
            onClick={onCreateFolder}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.6rem',
              fontSize: '0.85rem',
              fontWeight: 500,
              color: 'var(--color-primary, #e53e3e)',
              background: 'transparent',
              border: '1px dashed var(--color-border, #ccc)',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <span>+</span>
            <span>New Folder</span>
          </button>
        </div>
      )}
    </aside>
  );
}
