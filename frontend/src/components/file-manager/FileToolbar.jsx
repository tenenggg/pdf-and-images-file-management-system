import { usePermissions } from '../../hooks/usePermissions';
import { Button } from '../common/Button';
import styles from './FileToolbar.module.css';

export function FileToolbar({
  selectedItem,
  onNewFolder,
  onUpload,
  onRename,
  onDelete,
}) {
  const permissions = usePermissions();
  const selectionLabel = selectedItem?.name ?? '';

  return (
    <div className={styles.toolbar}>
      <div className={styles.actions}>
        {permissions.canCreateFolder && (
          <Button variant="secondary" onClick={onNewFolder}>
            New Folder
          </Button>
        )}
        {permissions.canUpload && (
          <Button variant="secondary" onClick={onUpload}>
            Upload File
          </Button>
        )}
        {permissions.canRename && selectedItem && (
          <Button variant="secondary" onClick={onRename}>
            Rename
          </Button>
        )}
        {permissions.canDelete && selectedItem && (
          <Button variant="secondary" onClick={onDelete}>
            Delete
          </Button>
        )}
      </div>
      {selectionLabel && (
        <div className={styles.selection} title="Selected item">
          {selectionLabel}
        </div>
      )}
    </div>
  );
}
