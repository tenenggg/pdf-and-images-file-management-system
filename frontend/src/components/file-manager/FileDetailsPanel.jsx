import { formatDate } from '../../utils/formatDate';
import { formatFileSize } from '../../utils/formatFileSize';
import styles from './FileDetailsPanel.module.css';

export function FileDetailsPanel({ item }) {
  return (
    <aside className={styles.panel}>
      <h2 className={styles.title}>Information</h2>
      {!item ? (
        <p className={styles.placeholder}>Select a file or folder to see details.</p>
      ) : (
        <dl className={styles.list}>
          <div>
            <dt>Name</dt>
            <dd>{item.name}</dd>
          </div>
          <div>
            <dt>Size</dt>
            <dd>{item.type === 'folder' ? '—' : formatFileSize(item.size)}</dd>
          </div>
          <div>
            <dt>Type</dt>
            <dd>{item.type === 'folder' ? 'Folder' : (item.ext ?? '—').toUpperCase()}</dd>
          </div>
          <div>
            <dt>Date Modified</dt>
            <dd>{formatDate(item.dateModified)}</dd>
          </div>
          <div>
            <dt>Date Created</dt>
            <dd>{formatDate(item.dateCreated)}</dd>
          </div>
          <div>
            <dt>Creator</dt>
            <dd>{item.creator ?? '—'}</dd>
          </div>
        </dl>
      )}
    </aside>
  );
}
