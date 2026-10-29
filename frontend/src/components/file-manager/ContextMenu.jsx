import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './ContextMenu.module.css';

export function ContextMenu({ open, x, y, items, onClose }) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: y, left: x });

  useLayoutEffect(() => {
    if (!open || !menuRef.current) return;
    const rect = menuRef.current.getBoundingClientRect();
    setPosition({
      top: Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)),
      left: Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)),
    });
  }, [open, x, y, items]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose();
    }
    function handleDismiss() {
      onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleDismiss);
    window.addEventListener('scroll', handleDismiss, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleDismiss);
      window.removeEventListener('scroll', handleDismiss, true);
    };
  }, [open, onClose]);

  if (!open || !items?.length) return null;

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ top: position.top, left: position.left }}
      onClick={(event) => event.stopPropagation()}
      role="menu"
    >
      {items.map((item) =>
        item.separator ? (
          <div key={item.id} className={styles.separator} />
        ) : (
          <button
            key={item.id}
            type="button"
            className={styles.item}
            disabled={item.disabled}
            onClick={(e) => {
              e.stopPropagation();
              item.onClick?.();
              onClose();
            }}
          >
            {item.label}
          </button>
        ),
      )}
    </div>
  );
}
