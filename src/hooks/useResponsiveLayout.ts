import { useState, useEffect, useCallback } from 'react';

export type DeviceType = 
  | 'wearable_micro'     // < 360px
  | 'mobile_compact'     // 360px - 390px (iPhone SE, Small Androids)
  | 'mobile_standard'    // 391px - 440px (iPhone 15/16, Galaxy S24, Pixel 9)
  | 'phablet_foldable'   // 441px - 640px (Foldables outer/inner, Phablets)
  | 'tablet_compact'     // 641px - 840px (iPad Mini, Foldables Open)
  | 'tablet_expanded'    // 841px - 1024px (iPad Air/Pro, Surface)
  | 'laptop_standard'    // 1025px - 1366px (MacBook Air, 13" Laptops)
  | 'desktop_fhd'        // 1367px - 1920px (1080p Standard Desktop)
  | 'ultrawide_4k';      // > 1920px (2K, 4K, 34" Ultrawide)

export type Orientation = 'portrait' | 'landscape';
export type PointerType = 'coarse' | 'fine' | 'none';

export interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ResponsiveLayoutState {
  // Dimension measurements
  width: number;
  height: number;
  screenWidth: number;
  screenHeight: number;
  dpr: number;
  aspectRatio: number;
  
  // Categorization
  deviceType: DeviceType;
  orientation: Orientation;
  pointerType: PointerType;

  // Booleans
  isMobile: boolean;       // < 640px
  isTablet: boolean;       // 640px - 1024px
  isLaptop: boolean;       // 1025px - 1366px
  isDesktop: boolean;      // 1367px - 1920px
  isUltraWide: boolean;    // > 1920px
  isTouch: boolean;        // Has touch screen
  isTouchOnly: boolean;    // Touch only, no mouse
  hasHover: boolean;       // Cursor hover support
  isCompact: boolean;      // < 768px
  isLandscape: boolean;
  isPortrait: boolean;
  hasNotch: boolean;       // Has safe-area insets (iOS/Android notch)

  // Intelligent dynamic calculation outputs
  columnCount: number;         // Suggested grid column count (1-6)
  fluidScale: number;          // Proportional fluid scale factor (0.85 - 1.2)
  contentPaddingClass: string; // Tailwind padding tailored to device
  contentPaddingPx: number;
  modalSizeClass: string;
  gridGapPx: number;
  cardImageHeightPx: number;
  safeArea: SafeAreaInsets;

  // Helper formatting for diagnostics HUD
  deviceLabel: string;
}

export function useResponsiveLayout(): ResponsiveLayoutState {
  const [layout, setLayout] = useState<ResponsiveLayoutState>(() => {
    return calculateIntelligentLayout();
  });

  const updateLayout = useCallback(() => {
    const newLayout = calculateIntelligentLayout();
    setLayout(newLayout);

    // Synchronize CSS custom properties on :root for fluid calculations
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--app-vw', `${newLayout.width}px`);
      root.style.setProperty('--app-vh', `${newLayout.height}px`);
      root.style.setProperty('--app-fluid-scale', `${newLayout.fluidScale}`);
      root.style.setProperty('--app-grid-cols', `${newLayout.columnCount}`);
      root.style.setProperty('--app-grid-gap', `${newLayout.gridGapPx}px`);
      root.style.setProperty('--safe-area-top', `${newLayout.safeArea.top}px`);
      root.style.setProperty('--safe-area-bottom', `${newLayout.safeArea.bottom}px`);
    }
  }, []);

  useEffect(() => {
    updateLayout();

    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
      resizeTimer = requestAnimationFrame(() => {
        updateLayout();
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });
    
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize, { passive: true });
    }

    if (window.screen?.orientation) {
      window.screen.orientation.addEventListener('change', handleResize, { passive: true });
    }

    // Match media listeners for dark mode & pointer changes
    const pointerMedia = window.matchMedia?.('(pointer: coarse)');
    const handlePointerChange = () => updateLayout();
    if (pointerMedia?.addEventListener) {
      pointerMedia.addEventListener('change', handlePointerChange);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      }
      if (window.screen?.orientation) {
        window.screen.orientation.removeEventListener('change', handleResize);
      }
      if (pointerMedia?.removeEventListener) {
        pointerMedia.removeEventListener('change', handlePointerChange);
      }
      if (resizeTimer) cancelAnimationFrame(resizeTimer);
    };
  }, [updateLayout]);

  return layout;
}

function calculateIntelligentLayout(): ResponsiveLayoutState {
  const isClient = typeof window !== 'undefined';
  
  const w = isClient ? (window.visualViewport?.width || window.innerWidth || 1280) : 1280;
  const h = isClient ? (window.visualViewport?.height || window.innerHeight || 800) : 800;
  const screenW = isClient && window.screen ? window.screen.width : w;
  const screenH = isClient && window.screen ? window.screen.height : h;
  const dpr = isClient ? (window.devicePixelRatio || 1) : 1;
  const aspectRatio = Number((w / Math.max(1, h)).toFixed(2));

  // Pointer & Touch detection
  const isTouch = isClient ? ('ontouchstart' in window || navigator.maxTouchPoints > 0) : false;
  const hasHover = isClient ? window.matchMedia('(hover: hover)').matches : true;
  const pointerType: PointerType = isClient 
    ? (window.matchMedia('(pointer: coarse)').matches ? 'coarse' : window.matchMedia('(pointer: fine)').matches ? 'fine' : 'none')
    : 'fine';
  const isTouchOnly = isTouch && !hasHover;

  // Safe area insets reading
  let safeTop = 0;
  let safeBottom = 0;
  let safeLeft = 0;
  let safeRight = 0;

  if (isClient && typeof getComputedStyle !== 'undefined') {
    const computed = getComputedStyle(document.documentElement);
    safeTop = parseFloat(computed.getPropertyValue('--safe-area-inset-top') || '0') || (isTouch && h > 800 ? 24 : 0);
    safeBottom = parseFloat(computed.getPropertyValue('--safe-area-inset-bottom') || '0') || (isTouch ? 16 : 0);
  }

  // Device Classification Matrix
  let deviceType: DeviceType = 'desktop_fhd';
  let columnCount = 4;
  let contentPaddingClass = 'px-6 py-5';
  let contentPaddingPx = 20;
  let modalSizeClass = 'max-w-4xl max-h-[88vh]';
  let gridGapPx = 16;
  let cardImageHeightPx = 160;
  let fluidScale = 1.0;
  let deviceLabel = 'Desktop Full HD';

  if (w < 360) {
    deviceType = 'wearable_micro';
    columnCount = 1;
    contentPaddingClass = 'px-2 py-2';
    contentPaddingPx = 8;
    modalSizeClass = 'w-[98vw] max-h-[96dvh]';
    gridGapPx = 8;
    cardImageHeightPx = 100;
    fluidScale = 0.82;
    deviceLabel = 'Dispositivo Ultra Compacto (<360px)';
  } else if (w <= 390) {
    deviceType = 'mobile_compact';
    columnCount = 1;
    contentPaddingClass = 'px-3 py-3';
    contentPaddingPx = 12;
    modalSizeClass = 'w-[96vw] max-h-[94dvh]';
    gridGapPx = 10;
    cardImageHeightPx = 120;
    fluidScale = 0.88;
    deviceLabel = 'Móvil Compacto (iPhone SE / Galaxy S)';
  } else if (w <= 440) {
    deviceType = 'mobile_standard';
    columnCount = 1;
    contentPaddingClass = 'px-3.5 py-3.5';
    contentPaddingPx = 14;
    modalSizeClass = 'w-[95vw] max-h-[92dvh]';
    gridGapPx = 12;
    cardImageHeightPx = 135;
    fluidScale = 0.94;
    deviceLabel = 'Móvil Estándar (iPhone 15/16, S24)';
  } else if (w <= 640) {
    deviceType = 'phablet_foldable';
    columnCount = w > 520 ? 2 : 1;
    contentPaddingClass = 'px-4 py-4';
    contentPaddingPx = 16;
    modalSizeClass = 'w-[94vw] max-h-[90dvh]';
    gridGapPx = 12;
    cardImageHeightPx = 145;
    fluidScale = 0.96;
    deviceLabel = 'Phablet / Plegable Cerrado';
  } else if (w <= 840) {
    deviceType = 'tablet_compact';
    columnCount = 2;
    contentPaddingClass = 'px-4.5 py-4';
    contentPaddingPx = 18;
    modalSizeClass = 'w-[92vw] max-w-2xl max-h-[88dvh]';
    gridGapPx = 14;
    cardImageHeightPx = 155;
    fluidScale = 0.98;
    deviceLabel = 'Tablet Compacta / iPad Mini / Fold Abierto';
  } else if (w <= 1024) {
    deviceType = 'tablet_expanded';
    columnCount = 2;
    contentPaddingClass = 'px-5 py-5';
    contentPaddingPx = 20;
    modalSizeClass = 'w-[90vw] max-w-3xl max-h-[86vh]';
    gridGapPx = 16;
    cardImageHeightPx = 160;
    fluidScale = 1.0;
    deviceLabel = 'Tablet Amplia / iPad Air / Surface';
  } else if (w <= 1366) {
    deviceType = 'laptop_standard';
    columnCount = 3;
    contentPaddingClass = 'px-6 py-5';
    contentPaddingPx = 24;
    modalSizeClass = 'max-w-4xl max-h-[85vh]';
    gridGapPx = 18;
    cardImageHeightPx = 170;
    fluidScale = 1.0;
    deviceLabel = 'Laptop Estándar (13"-14" MacBook / PC)';
  } else if (w <= 1920) {
    deviceType = 'desktop_fhd';
    columnCount = 4;
    contentPaddingClass = 'px-8 py-6';
    contentPaddingPx = 28;
    modalSizeClass = 'max-w-5xl max-h-[85vh]';
    gridGapPx = 20;
    cardImageHeightPx = 180;
    fluidScale = 1.05;
    deviceLabel = 'Escritorio Full HD (1080p)';
  } else {
    deviceType = 'ultrawide_4k';
    columnCount = 5;
    contentPaddingClass = 'px-10 py-8';
    contentPaddingPx = 36;
    modalSizeClass = 'max-w-6xl max-h-[85vh]';
    gridGapPx = 24;
    cardImageHeightPx = 200;
    fluidScale = 1.15;
    deviceLabel = 'Monitor Ultra-Wide 4K / 34"+';
  }

  const orientation: Orientation = h > w ? 'portrait' : 'landscape';
  const isMobile = w < 640;
  const isTablet = w >= 640 && w <= 1024;
  const isLaptop = w > 1024 && w <= 1366;
  const isDesktop = w > 1366 && w <= 1920;
  const isUltraWide = w > 1920;
  const isCompact = w < 768;
  const hasNotch = safeTop > 0 || safeBottom > 0;

  return {
    width: Math.round(w),
    height: Math.round(h),
    screenWidth: Math.round(screenW),
    screenHeight: Math.round(screenH),
    dpr: Number(dpr.toFixed(2)),
    aspectRatio,
    deviceType,
    orientation,
    pointerType,
    isMobile,
    isTablet,
    isLaptop,
    isDesktop,
    isUltraWide,
    isTouch,
    isTouchOnly,
    hasHover,
    isCompact,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    hasNotch,
    columnCount,
    fluidScale,
    contentPaddingClass,
    contentPaddingPx,
    modalSizeClass,
    gridGapPx,
    cardImageHeightPx,
    safeArea: {
      top: Math.round(safeTop),
      right: Math.round(safeRight),
      bottom: Math.round(safeBottom),
      left: Math.round(safeLeft)
    },
    deviceLabel
  };
}
