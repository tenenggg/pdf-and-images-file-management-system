import styles from './FileGrid.module.css';

function typeLabel(item) {
  if (item.type === 'folder') return 'Folder';
  return item.ext?.toUpperCase() ?? 'File';
}

export function FileGrid({ items, selectedId, highlightedId, cutId, onSelect, onOpenFolder, onOpenFile, onItemContextMenu }) {
  if (items.length === 0) {
    return <div className={styles.empty}>This folder is empty.</div>;
  }

  return (
    <div className={styles.grid}>
      {items.map((item) => {
        const isFolder = item.type === 'folder';
        const isSelected = selectedId === item.id;
        return (
          <button
            type="button"
            key={item.id}
            data-item-id={item.id}
            className={`${styles.card} ${isSelected ? styles.selected : ''} ${highlightedId === item.id ? styles.highlighted : ''} ${cutId === item.id ? styles.cut : ''}`}
            onClick={() => onSelect(item)}
            onDoubleClick={() => (isFolder ? onOpenFolder(item.id) : onOpenFile?.(item))}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onItemContextMenu?.(e, item);
            }}
          >
            <span className={isFolder ? styles.iconFolder : styles.iconFile}>
              {isFolder ? '📁' : '📄'}
            </span>
            <span className={styles.name}>{item.name}</span>
            <span className={styles.meta}>{typeLabel(item)}</span>
          </button>
        );
      })}
    </div>
  );
}
