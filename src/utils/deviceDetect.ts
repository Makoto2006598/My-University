
export type DeviceType = 'pc' | 'pad' | 'phone';

function detectDevice(): DeviceType {
  if (typeof window === 'undefined') return 'pc';

  const ua = navigator.userAgent.toLowerCase();
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const minDim = Math.min(width, height);

  // Check for phone-specific UA strings
  const isPhoneUA = /iphone|android.*mobile|windows phone|blackberry/i.test(ua);
  // Check for tablet-specific UA strings
  const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(ua);

  if (isPhoneUA || (hasTouch && minDim < 600)) {
    return 'phone';
  }

  if (isTabletUA || (hasTouch && minDim >= 600 && minDim < 1200)) {
    return 'pad';
  }

  // Check CSS pointer media query (coarse = touch device)
  if (hasTouch && window.matchMedia('(pointer: coarse)').matches) {
    return minDim < 600 ? 'phone' : 'pad';
  }

  return 'pc';
}

let cachedDevice: DeviceType | null = null;

export function getDeviceType(): DeviceType {
  if (cachedDevice === null) {
    cachedDevice = detectDevice();
  }
  return cachedDevice;
}

// Re-detect on resize (e.g., desktop browser resizing to mobile width for testing)
if (typeof window !== 'undefined') {
  window.addEventListener('resize', () => { cachedDevice = null; });
}
