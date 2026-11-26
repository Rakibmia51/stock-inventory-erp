import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, SwitchCamera, AlertCircle } from 'lucide-react';

export default function CameraScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Scan Barcode with Camera'
}) {
  const scannerRef = useRef(null);
  const hasScannedRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = Back Camera

  useEffect(() => {
    if (!isOpen) return undefined;

    hasScannedRef.current = false;
    setErrorMsg('');

    const elementId = 'nexus-mobile-barcode-reader';
    let isMounted = true;

    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode(elementId);
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode },
          {
            fps: 12,
            qrbox: { width: 250, height: 140 },
            aspectRatio: 1.5
          },
          (decodedText) => {
            if (hasScannedRef.current || !isMounted) return;
            const cleanCode = String(decodedText || '').trim();
            if (!cleanCode) return;

            hasScannedRef.current = true;
            if (navigator.vibrate) {
              navigator.vibrate(100);
            }

            html5QrCode
              .stop()
              .catch(() => {})
              .finally(() => {
                if (isMounted) {
                  onScanSuccess?.(cleanCode);
                  onClose?.();
                }
              });
          },
          () => {
            // প্রতি ফ্রেমে স্ক্যান না মিললে ইগনোর করবে
          }
        );
      } catch (err) {
        if (!isMounted) return;
        const msg = String(err?.message || err || '');
        if (msg.toLowerCase().includes('https') || window.location.protocol !== 'https:') {
          setErrorMsg(
            'মোবাইল ক্যামেরা চালু করার জন্য সাইটটি অবশ্যই HTTPS (SSL) বা localhost-এ চলতে হবে।'
          );
        } else {
          setErrorMsg('ক্যামেরা চালু করা যায়নি। ব্রাউজারে Camera Permission Allow দিন।');
        }
      }
    };

    const timer = setTimeout(startScanner, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current?.clear())
          .catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [isOpen, facingMode, onScanSuccess, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-4 sm:p-5 shadow-2xl space-y-4 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-800">{title}</h3>
              <p className="text-[11px] text-slate-500">
                বারকোডটি ক্যামেরার বক্সের ভেতরে ধরুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'))
              }
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Switch Camera"
            >
              <SwitchCamera className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Camera Viewport */}
        {errorMsg ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <div>
              <p className="font-semibold">Camera Error</p>
              <p className="mt-1">{errorMsg}</p>
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl bg-black border border-slate-300">
            <div id="nexus-mobile-barcode-reader" className="w-full min-h-[240px]" />
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}