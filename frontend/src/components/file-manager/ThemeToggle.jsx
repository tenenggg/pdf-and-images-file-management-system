import { useThemeContext } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';

export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();

  return (
    <div className={styles.group} role="group" aria-label="Theme">
      <button
        type="button"
        className={theme === 'dark' ? styles.active : ''}
        onClick={() => setTheme('dark')}
      >
        Dark
      </button>
      <button
        type="button"
        className={theme === 'light' ? styles.active : ''}
        onClick={() => setTheme('light')}
      >
        Light
      </button>
    </div>
  );
}
