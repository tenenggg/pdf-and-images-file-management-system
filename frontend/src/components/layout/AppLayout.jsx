import { AppHeader } from './AppHeader';
import styles from './AppLayout.module.css';

export function AppLayout({ children, ...headerProps }) {
  return (
    <div className={styles.shell}>
      <AppHeader {...headerProps} />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
