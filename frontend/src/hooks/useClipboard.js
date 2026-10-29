import { useCallback, useState } from 'react';

export function useClipboard() {
  const [clipboard, setClipboard] = useState(null);

  const cut = useCallback((item) => {
    setClipboard({ mode: 'cut', item });
  }, []);

  const copy = useCallback((item) => {
    setClipboard({ mode: 'copy', item });
  }, []);

  const clear = useCallback(() => {
    setClipboard(null);
  }, []);

  return { clipboard, cut, copy, clear };
}
