import { Breadcrumb } from '../file-manager/Breadcrumb';
import { FileToolbar } from '../file-manager/FileToolbar';
import { FileGrid } from '../file-manager/FileGrid';
import { FileList } from '../file-manager/FileList';
import styles from './MainContent.module.css';

export function MainContent({
  path,
  items,
  viewMode,
  selectedItem,
  highlightedId,
  cutId,
  loading,
  error,
  onNavigateFolder,
  onSelectItem,
  onOpenFolder,
  onOpenFile,
  onNewFolder,
  onUpload,
  onRename,
  onDelete,
  onItemContextMenu,
  onBackgroundContextMenu,
}) {
  return (
    <section className={styles.main} onContextMenu={onBackgroundContextMenu}>
      <Breadcrumb segments={path} onNavigate={onNavigateFolder} />
      <FileToolbar
        selectedItem={selectedItem}
        onNewFolder={onNewFolder}
        onUpload={onUpload}
        onRename={onRename}
        onDelete={onDelete}
      />
      <div className={styles.contentArea}>
        {loading && <p className={styles.status}>Loading…</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && viewMode === 'list' && (
          <FileList
            items={items}
            selectedId={selectedItem?.id}
            highlightedId={highlightedId}
            cutId={cutId}
            onSelect={onSelectItem}
            onOpenFolder={onOpenFolder}
            onOpenFile={onOpenFile}
            onItemContextMenu={onItemContextMenu}
          />
        )}
        {!loading && !error && viewMode === 'icon' && (
          <FileGrid
            items={items}
            selectedId={selectedItem?.id}
            highlightedId={highlightedId}
            cutId={cutId}
            onSelect={onSelectItem}
            onOpenFolder={onOpenFolder}
            onOpenFile={onOpenFile}
            onItemContextMenu={onItemContextMenu}
          />
        )}
      </div>
    </section>
  );
}
