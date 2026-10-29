import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import styles from './ProfilePage.module.css';

export function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState(user?.username ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSubmitting(true);
    try {
      await authService.updateProfile({
        username: username.trim(),
        password: newPassword || undefined,
        currentPassword: newPassword ? currentPassword : undefined,
      });
      await refreshUser();
      setCurrentPassword('');
      setNewPassword('');
      setMessage('Profile updated.');
    } catch (err) {
      setError(err.message ?? 'Update failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppLayout>
      <div className={styles.card}>
        <h1>My account</h1>
        <p className={styles.muted}>Role: {user?.role}</p>

        <form className={styles.form} onSubmit={handleSubmit}>
          {message && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}

          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </label>

          <label>
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </label>

          {newPassword && (
            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
          )}

          <Button type="submit" disabled={submitting}>
            Save changes
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
