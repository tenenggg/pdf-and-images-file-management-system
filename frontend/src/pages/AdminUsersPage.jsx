import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { useAuth } from '../hooks/useAuth';
import dialogStyles from '../components/dialogs/DialogForms.module.css';
import * as userService from '../services/userService';
import styles from './AdminUsersPage.module.css';

const emptyForm = {
  username: '',
  password: '',
  role: 'user',
  displayName: '',
};

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const visibleUsers = users.filter((user) => String(user.id) !== String(currentUser?.id));

  async function loadUsers() {
    setLoading(true);
    setError('');
    try {
      const data = await userService.listUsers();
      setUsers(data.users ?? []);
    } catch (err) {
      setError(err.message ?? 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(() => loadUsers());
  }, []);

  function openCreate() {
    setEditingUser(null);
    setForm(emptyForm);
    setDialogOpen(true);
  }

  function openEdit(user) {
    setEditingUser(user);
    setForm({
      username: user.username,
      password: '',
      role: user.role,
      displayName: user.displayName ?? user.username,
    });
    setDialogOpen(true);
  }

  async function handleSave(event) {
    event.preventDefault();
    if (editingUser) {
      await userService.updateUser(editingUser.id, {
        username: form.username,
        role: form.role,
        displayName: form.displayName,
        password: form.password || undefined,
      });
    } else {
      await userService.createUser(form);
    }
    setDialogOpen(false);
    loadUsers();
  }

  async function handleDelete(user) {
    if (!window.confirm(`Delete user ${user.username}?`)) return;
    await userService.deleteUser(user.id);
    loadUsers();
  }

  return (
    <AppLayout>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <h1>User management</h1>
          <Button onClick={openCreate}>Create user</Button>
        </div>

        {loading && <p>Loading…</p>}
        {error && <p className={styles.error}>{error}</p>}

        {!loading && !error && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Display name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.displayName}</td>
                  <td>{user.role}</td>
                  <td className={styles.actions}>
                    <Button variant="secondary" onClick={() => openEdit(user)}>
                      Edit
                    </Button>
                    <Button variant="secondary" onClick={() => handleDelete(user)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={dialogOpen}
        title={editingUser ? 'Edit user' : 'Create user'}
        onClose={() => setDialogOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="user-form">
              Save
            </Button>
          </>
        }
      >
        <form id="user-form" className={dialogStyles.form} onSubmit={handleSave}>
          <label>
            Username
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
            />
          </label>
          <label>
            Display name
            <input
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <label>
            Password {editingUser ? '(leave blank to keep)' : ''}
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required={!editingUser}
            />
          </label>
        </form>
      </Modal>
    </AppLayout>
  );
}
