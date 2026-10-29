import { useRef, useState } from 'react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import dialogStyles from './DialogForms.module.css';

export function UploadDialog({ open, onClose, onUpload }) {
  const inputRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    const files = inputRef.current?.files;
    if (!files?.length) {
      setError('Choose at least one file');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      await onUpload(files);
      if (inputRef.current) inputRef.current.value = '';
      onClose();
    } catch (err) {
      setError(err.message ?? 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Upload files"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="upload-form" disabled={submitting}>
            Upload
          </Button>
        </>
      }
    >
      <form id="upload-form" className={dialogStyles.form} onSubmit={handleSubmit}>
        {error && <p className={dialogStyles.error}>{error}</p>}
        <label>
          Files
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf,image/*"
            multiple
            required
          />
        </label>
      </form>
    </Modal>
  );
}
