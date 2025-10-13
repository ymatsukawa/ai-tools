import { useEffect, useRef, useCallback } from 'react';
import { BACKGROUND_CHANGE_INTERVAL } from '../../shared/config/constants';

export function useBackgroundRotation(
  backgroundImages: string[],
  onIndexChange: (callback: (prev: number) => number) => void
) {
  useEffect(() => {
    if (backgroundImages.length > 1) {
      const interval = setInterval(() => {
        onIndexChange((prev: number) => (prev + 1) % backgroundImages.length);
      }, BACKGROUND_CHANGE_INTERVAL);
      
      return () => clearInterval(interval);
    }
  }, [backgroundImages, onIndexChange]);
}

export function useImagePreloader(
  backgroundImages: string[],
  currentBackgroundIndex: number
) {
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const preloadedImages = useRef<Set<string>>(new Set());
  
  const preloadImage = useCallback((url: string) => {
    if (preloadedImages.current.has(url)) return;
    
    const img = new Image();
    img.onload = () => {
      imageCache.current.set(url, img);
      preloadedImages.current.add(url);
    };
    img.onerror = () => {
      console.warn(`Failed to preload image: ${url}`);
    };
    img.src = url;
  }, []);
  
  useEffect(() => {
    if (backgroundImages.length > 1) {
      // Preload next 2 images
      const nextIndex = (currentBackgroundIndex + 1) % backgroundImages.length;
      const afterNextIndex = (currentBackgroundIndex + 2) % backgroundImages.length;
      
      preloadImage(backgroundImages[nextIndex]);
      if (backgroundImages.length > 2) {
        preloadImage(backgroundImages[afterNextIndex]);
      }
    }
  }, [currentBackgroundIndex, backgroundImages, preloadImage]);
  
  // Cleanup old images from cache when backgroundImages change
  useEffect(() => {
    const currentUrls = new Set(backgroundImages);
    
    // Remove cached images that are no longer in the current set
    Array.from(imageCache.current.keys()).forEach(url => {
      if (!currentUrls.has(url)) {
        imageCache.current.delete(url);
        preloadedImages.current.delete(url);
      }
    });
  }, [backgroundImages]);
}

export function useImageCleanup(backgroundImages: string[]) {
  const previousImages = useRef<string[]>([]);
  
  useEffect(() => {
    // Cleanup URLs that are no longer in the current array
    const currentUrls = new Set(backgroundImages);
    
    previousImages.current.forEach(url => {
      if (url.startsWith('blob:') && !currentUrls.has(url)) {
        URL.revokeObjectURL(url);
      }
    });
    
    previousImages.current = [...backgroundImages];
  }, [backgroundImages]);
  
  // Cleanup all on unmount
  useEffect(() => {
    return () => {
      previousImages.current.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, []);
}