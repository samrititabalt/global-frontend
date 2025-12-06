import { useState, useRef, useEffect } from 'react';

/**
 * Hook for detecting swipe gestures
 * @param {Function} onSwipeLeft - Callback for left swipe
 * @param {Function} onSwipeRight - Callback for right swipe
 * @param {Number} threshold - Minimum distance for swipe (default: 50)
 */
export const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 50) => {
  const [swipeStart, setSwipeStart] = useState(null);
  const [swipeEnd, setSwipeEnd] = useState(null);
  const elementRef = useRef(null);

  const minSwipeDistance = threshold;

  const onTouchStart = (e) => {
    setSwipeEnd(null);
    setSwipeStart(e.touches[0].clientX);
  };

  const onTouchMove = (e) => {
    setSwipeEnd(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!swipeStart || !swipeEnd) return;
    
    const distance = swipeStart - swipeEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', onTouchStart);
    element.addEventListener('touchmove', onTouchMove);
    element.addEventListener('touchend', onTouchEnd);

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
    };
  }, [swipeStart, swipeEnd]);

  return elementRef;
};
