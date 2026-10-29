import { formatDate } from '../../utils/formatDate';
import { formatFileSize } from '../../utils/formatFileSize';
import styles from './FileList.module.css';

export function FileList({ items, selectedId, highlightedId, cutId, onSelect, onOpenFolder, onOpenFile, onItemContextMenu }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Size</th>
            <th>Date Modified</th>
            <th>Date Created</th>
            <th>Type</th>
            <th>Creator</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className={styles.empty}>
                This folder is empty.
              </td>
            </tr>
          )}
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            const isFolder = item.type === 'folder';
            return (
              <tr
                key={item.id}
                data-item-id={item.id}
                className={`${isSelected ? styles.selected : ''} ${highlightedId === item.id ? styles.highlighted : ''} ${cutId === item.id ? styles.cut : ''}`}
                onClick={() => onSelect(item)}
                onDoubleClick={() => (isFolder ? onOpenFolder(item.id) : onOpenFile?.(item))}
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onItemContextMenu?.(e, item);
                }}
              >
                <td>{item.name}</td>
                <td>{isFolder ? '—' : formatFileSize(item.size)}</td>
                <td>{formatDate(item.dateModified)}</td>
                <td>{formatDate(item.dateCreated)}</td>
                <td>{isFolder ? 'Folder' : item.ext ?? '—'}</td>
                <td>{item.creator ?? '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
