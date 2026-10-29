import styles from './Breadcrumb.module.css';

export function Breadcrumb({ segments, onNavigate }) {
  if (!segments?.length) return null;

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        return (
          <span key={segment.id} className={styles.segment}>
            {index > 0 && <span className={styles.sep}>&gt;</span>}
            {isLast ? (
              <span className={styles.current}>{segment.name}</span>
            ) : (
              <button type="button" onClick={() => onNavigate(segment.id)}>
                {segment.name}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
