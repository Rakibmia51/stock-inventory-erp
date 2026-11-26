import { useEffect, useRef } from 'react';

export function useBarcodeScanner(onScan, { enabled = true, maxKeyGapMs = 60, minLength = 3 } = {}) {
  const bufferRef = useRef('');
  const lastKeyTimeRef = useRef(0);
  const callbackRef = useRef(onScan);

  callbackRef.current = onScan;

  useEffect(() => {
    if (!enabled) return undefined;

    const handleKeyDown = (event) => {
      const target = event.target;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (isInput && target.tagName === 'TEXTAREA') return;

      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      // মানুষ ধীরে টাইপ করলে বাফার রিসেট হবে (শুধু স্ক্যানারের দ্রুত ইনপুট ধরবে)
      if (gap > maxKeyGapMs) {
        bufferRef.current = '';
      }

      if (event.key === 'Enter') {
        const scanned = bufferRef.current.trim();
        bufferRef.current = '';

        if (scanned.length >= minLength && typeof callbackRef.current === 'function') {
          if (!isInput) {
            event.preventDefault();
          }
          callbackRef.current(scanned);
        }
        return;
      }

      if (event.key.length === 1) {
        bufferRef.current += event.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, maxKeyGapMs, minLength]);
}