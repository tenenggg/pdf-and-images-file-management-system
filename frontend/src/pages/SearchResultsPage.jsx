import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { AdvancedSearchPanel } from '../components/search/AdvancedSearchPanel';
import * as fileService from '../services/fileService';
import styles from './SearchResultsPage.module.css';

export function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [anchor, setAnchor] = useState(null);

  useEffect(() => {
    const nextQuery = searchParams.get('q') ?? '';
    let active = true;
    Promise.resolve().then(() => {
      setQuery(nextQuery);
      setLoading(true);
      setError('');
      return fileService.searchFiles(Object.fromEntries(searchParams.entries()));
    }).then((data) => {
      if (active) setResults(data.items ?? []);
    }).catch((err) => {
      if (active) setError(err.message ?? 'Search failed');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [searchParams]);

  function submitSearch(value) {
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set('q', value.trim());
    else next.delete('q');
    setSearchParams(next);
  }

  function submitFilters(filters) {
    const next = new URLSearchParams();
    Object.entries({
      q: filters.q,
      content: filters.contentSearch,
      mimeType: filters.mimeType,
      creator: filters.creator,
      createdFrom: filters.createdFrom ? `${filters.createdFrom}T00:00:00` : '',
      createdTo: filters.createdTo ? `${filters.createdTo}T23:59:59` : '',
      modifiedFrom: filters.modifiedFrom ? `${filters.modifiedFrom}T00:00:00` : '',
      modifiedTo: filters.modifiedTo ? `${filters.modifiedTo}T23:59:59` : '',
    }).forEach(([key, value]) => {
      if (value) next.set(key, value);
    });
    setSearchParams(next);
    setFiltersOpen(false);
  }

  function toggleFilters(event) {
    const rect = event.currentTarget.getBoundingClientRect();
    setAnchor({ top: rect.bottom + 8, right: rect.right });
    setFiltersOpen((open) => !open);
  }

  return (
    <AppLayout
      searchQuery={query}
      onSearchQueryChange={setQuery}
      onSearchSubmit={submitSearch}
      onSearchOptionsToggle={toggleFilters}
    >
      <section className={styles.page}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Search results</p>
            <h1>{query ? `Results for "${query}"` : 'All matching files'}</h1>
          </div>
          <button type="button" className={styles.back} onClick={() => navigate('/drive')}>
            Back to My Files
          </button>
        </header>

        {loading && <p className={styles.status}>Searching…</p>}
        {error && <p className={styles.error}>{error}</p>}
        {!loading && !error && results.length === 0 && (
          <p className={styles.status}>No files matched your search.</p>
        )}
        {!loading && !error && results.length > 0 && (
          <div className={styles.results}>
            {results.map((item) => (
              <button
                type="button"
                key={item.id}
                className={styles.result}
                onClick={() => navigate('/drive', { state: { searchResult: item } })}
              >
                <span className={styles.icon}>📄</span>
                <span className={styles.details}>
                  <strong>{item.name}</strong>
                  <span>{item.folderPath?.map((folder) => folder.name).join(' > ') ?? 'My Files'}</span>
                </span>
                <span className={styles.type}>{item.ext?.toUpperCase() ?? 'FILE'}</span>
              </button>
            ))}
          </div>
        )}
      </section>
      <AdvancedSearchPanel
        open={filtersOpen}
        anchor={anchor}
        onClose={() => setFiltersOpen(false)}
        onSearch={submitFilters}
        query={query}
        onQueryChange={setQuery}
      />
    </AppLayout>
  );
}
