import styles from './ViewModeToggle.module.css';

export function ViewModeToggle({ viewMode, onChange }) {
  return (
    <div className={styles.group} role="group" aria-label="View mode">
      <button
        type="button"
        className={viewMode === 'list' ? styles.active : ''}
        onClick={() => onChange('list')}
      >
        List
      </button>
      <button
        type="button"
        className={viewMode === 'icon' ? styles.active : ''}
        onClick={() => onChange('icon')}
      >
        Icon
      </button>
    </div>
  );
}
