import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../file-manager/ThemeToggle';
import { ViewModeToggle } from '../file-manager/ViewModeToggle';
import { useAuth } from '../../hooks/useAuth';
import { useState } from 'react';
import { Button } from '../common/Button';
import styles from './AppHeader.module.css';
import logoIcon from '../../assets/open-book-red-icon.png';

export function AppHeader({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchQueryChange,
  onSearchSubmit,
  onSearchOptionsToggle,
  onBack,
  canGoBack,
}) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const linkClass = ({ isActive }) => `${styles.navLink} ${isActive ? styles.navActive : ''}`;
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('searchHistory')) || [];
    } catch {
      return [];
    }
  });

  const saveToHistory = (query) => {
    if (!query) return;
    const newHistory = [query, ...history.filter(h => h !== query)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => (onBack ? onBack() : navigate(-1))}
            disabled={canGoBack === false || (!onBack && location.pathname === '/drive')}
            aria-label="Go back"
            title="Go back"
          >
            &lt;
          </button>
          <nav className={styles.nav}>
            <NavLink to="/drive" className={linkClass}>
              My Files
            </NavLink>
            {role === 'admin' && (
              <NavLink to="/admin/users" className={linkClass}>
                Users
              </NavLink>
            )}
            <NavLink to="/profile" className={linkClass}>
              Account
            </NavLink>
          </nav>
          <span className={styles.userBadge}>{user?.displayName ?? user?.username}</span>
        </div>

        <div className={styles.searchBox}>
          <input
            type="search"
            className={styles.search}
            placeholder="Search by files names"
            aria-label="Search by files names"
            value={searchQuery ?? ''}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setTimeout(() => setShowHistory(false), 150)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                saveToHistory(searchQuery ?? '');
                onSearchSubmit?.(searchQuery ?? '');
                setShowHistory(false);
              }
            }}
            onChange={(event) => onSearchQueryChange?.(event.target.value)}
          />
          {showHistory && history.length > 0 && (
            <div className={styles.historyDropdown}>
              {history.map((item, index) => (
                <button
                  key={index}
                  type="button"
                  className={styles.historyItem}
                  onClick={() => {
                    onSearchQueryChange?.(item);
                    onSearchSubmit?.(item);
                    saveToHistory(item);
                    setShowHistory(false);
                  }}
                >
                  <span className={styles.historyIcon}>🕒</span>
                  {item}
                </button>
              ))}
            </div>
          )}
          <button
            type="button"
            className={styles.searchOptions}
            onClick={onSearchOptionsToggle}
            aria-label="Search filters"
            title="Search filters"
          >
            ⋮
          </button>
        </div>
        <div className={styles.right}>
          <ThemeToggle />
          {onViewModeChange && (
            <ViewModeToggle viewMode={viewMode} onChange={onViewModeChange} />
          )}
          {/* Group icon and text together */}
          <div className={styles.brand}>
            <img 
              src={logoIcon} 
              alt="File Management System Logo" 
              className={styles.brandIcon} 
            />
            <span className={styles.brandText}>File Management System</span>
          </div>
          <Button variant="ghost" className={styles.logoutButton} onClick={() => logout()}>
            Log out
          </Button>
        </div>
      </div>
    </header>
  );
}
