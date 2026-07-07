import { useEffect, useState } from 'react';

function isPortraitMobile() {
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  const isPortrait = window.matchMedia('(orientation: portrait)').matches;
  return isMobile && isPortrait;
}

export default function LandscapeOverlay() {
  const [showOverlay, setShowOverlay] = useState(isPortraitMobile());
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handleResize() {
      const shouldShow = isPortraitMobile();
      setShowOverlay(shouldShow);
      if (!shouldShow) setDismissed(false);
    }
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  if (!showOverlay || dismissed) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-950/95 flex flex-col items-center justify-center gap-6 px-8 text-center">
      <div className="animate-spinSlow text-6xl">📱</div>
      <p className="text-white text-lg font-semibold max-w-xs">
        Mohon putar perangkat Anda ke mode Landscape untuk bermain.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="px-6 py-2 rounded-full bg-store text-amber-950 font-bold hover:brightness-110 transition"
      >
        OK
      </button>
    </div>
  );
}
