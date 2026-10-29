import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import * as fileService from '../../services/fileService';
import styles from './FilePreviewModal.module.css';

function previewKind(item) {
  if (item.mimeType === 'application/pdf') return 'pdf';
  if (item.mimeType?.startsWith('image/')) return 'image';
  if (item.mimeType?.startsWith('video/')) return 'video';
  if (item.mimeType?.startsWith('audio/')) return 'audio';
  return 'unsupported';
}

export function FilePreviewModal({ item, onClose, canDownload }) {
  if (!item) return null;

  const kind = previewKind(item);
  const previewUrl = fileService.getPreviewUrl(item.id);
  const downloadUrl = fileService.getDownloadUrl(item.id);

  return (
    <Modal
      open
      wide
      title={item.name}
      onClose={onClose}
      footer={canDownload ? (
        <Button variant="secondary" onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}>
          Download
        </Button>
      ) : null}
    >
      <div className={styles.viewer}>
        {kind === 'pdf' && <iframe title={item.name} src={previewUrl} className={styles.frame} />}
        {kind === 'image' && <img src={previewUrl} alt={item.name} className={styles.image} />}
        {kind === 'video' && <video src={previewUrl} className={styles.media} controls />}
        {kind === 'audio' && <audio src={previewUrl} className={styles.audio} controls />}
        {kind === 'unsupported' && (
          <p className={styles.unsupported}>Preview is not available for this file type.</p>
        )}
      </div>
    </Modal>
  );
}
