import { useEffect, useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import dialogStyles from './DialogForms.module.css';

export function RenameDialog({ open, item, onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset the form when a different file is selected or the dialog opens.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName(item?.name ?? '');
    setError('');
  }, [item, open]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onSubmit(name.trim());
      onClose();
    } catch (err) {
      setError(err.message ?? 'Rename failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Rename"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="rename-form" disabled={submitting}>
            Save
          </Button>
        </>
      }
    >
      <form id="rename-form" className={dialogStyles.form} onSubmit={handleSubmit}>
        {error && <p className={dialogStyles.error}>{error}</p>}
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
      </form>
    </Modal>
  );
}
