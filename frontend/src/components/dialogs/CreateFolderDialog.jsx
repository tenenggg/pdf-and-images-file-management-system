import { useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import dialogStyles from './DialogForms.module.css';

export function CreateFolderDialog({ open, onClose, onSubmit, title = 'New folder' }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(name.trim());
      setName('');
      onClose();
    } catch (err) {
      setError(err.message ?? 'Failed to create folder');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="create-folder-form" disabled={submitting}>
            Create
          </Button>
        </>
      }
    >
      <form id="create-folder-form" className={dialogStyles.form} onSubmit={handleSubmit}>
        {error && <p className={dialogStyles.error}>{error}</p>}
        <label>
          Folder name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={title.toLowerCase().includes('root') ? 'e.g. My Files, Documents' : 'e.g. Project A'}
            required
            autoFocus
          />
        </label>
      </form>
    </Modal>
  );
}
