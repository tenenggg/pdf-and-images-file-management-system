import { useState } from 'react';
import { Button } from '../common/Button';
import dialogStyles from '../dialogs/DialogForms.module.css';
import styles from './AdvancedSearchPanel.module.css';

const emptyFilters = {
  q: '',
  mimeType: '',
  creator: '',
  createdFrom: '',
  createdTo: '',
  modifiedFrom: '',
  modifiedTo: '',
  contentSearch: '',
};

export function AdvancedSearchPanel({
  open,
  anchor,
  onClose,
  onSearch,
  onQueryChange,
  query,
  loading,
}) {
  const [filters, setFilters] = useState(emptyFilters);

  if (!open) return null;

  function updateField(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSearch(filters);
  }

  return (
    <aside
      className={styles.panel}
      style={anchor ? { top: anchor.top, right: Math.max(8, window.innerWidth - anchor.right) } : undefined}
    >
      <header className={styles.header}>
        <h2>Search</h2>
        <button type="button" onClick={onClose} aria-label="Close search">
          ×
        </button>
      </header>

      <form className={dialogStyles.form} onSubmit={handleSubmit}>
        <label>
          Search by file names
          <input
            value={query ?? filters.q}
            onChange={(e) => {
              updateField('q', e.target.value);
              onQueryChange?.(e.target.value);
            }}
          />
        </label>
        <label>
          Files type
          <input
            value={filters.mimeType}
            onChange={(e) => updateField('mimeType', e.target.value)}
            placeholder="e.g. pdf, image"
          />
        </label>
        <label>
          Date created (from)
          <input
            type="date"
            value={filters.createdFrom}
            onChange={(e) => updateField('createdFrom', e.target.value)}
          />
        </label>
        <label>
          Date created (to)
          <input
            type="date"
            value={filters.createdTo}
            onChange={(e) => updateField('createdTo', e.target.value)}
          />
        </label>
        <label>
          Date modified (from)
          <input
            type="date"
            value={filters.modifiedFrom}
            onChange={(e) => updateField('modifiedFrom', e.target.value)}
          />
        </label>
        <label>
          Date modified (to)
          <input
            type="date"
            value={filters.modifiedTo}
            onChange={(e) => updateField('modifiedTo', e.target.value)}
          />
        </label>
        <label>
          Creator
          <input value={filters.creator} onChange={(e) => updateField('creator', e.target.value)} />
        </label>
        <label>
          Search text in PDF or image
          <input
            value={filters.contentSearch}
            onChange={(e) => updateField('contentSearch', e.target.value)}
            placeholder="Search inside file contents..."
          />
        </label>
        <Button type="submit" disabled={loading}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </form>

    </aside>
  );
}
