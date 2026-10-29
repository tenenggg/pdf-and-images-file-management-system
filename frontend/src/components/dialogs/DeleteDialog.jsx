import { useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import dialogStyles from './DialogForms.module.css';

export function DeleteDialog({ open, item, onClose, onConfirm }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setError('');
    setSubmitting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message ?? 'Delete failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Delete"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleDelete} disabled={submitting}>
            Delete
          </Button>
        </>
      }
    >
      <div className={dialogStyles.form}>
        {error && <p className={dialogStyles.error}>{error}</p>}
        <p>
          Delete <strong>{item?.name}</strong>? This action cannot be undone.
        </p>
      </div>
    </Modal>
  );
}
