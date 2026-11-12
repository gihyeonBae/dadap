// pjt/src/components/Content/FrostedCard/useCardCarousel.ts
import { useState, useRef, useEffect, useCallback } from 'react';
import { CAROUSEL_LAYOUT } from './FrostedCard.constants';

interface UseCardCarouselProps {
  itemCount: number;
}

/**
 * 드래그 및 관성 효과가 적용된 무한 캐러셀 인터랙션 훅.
 * @param itemCount - 캐러셀에 표시될 전체 아이템의 수
 */
export const useCardCarousel = ({ itemCount }: UseCardCarouselProps) => {
  const [position, setPosition] = useState(0);
  const [velocity, setVelocity] = useState(0); // 관성 효과
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // 드래그 또는 호버 시 자동 스크롤 일시정지

  const startX = useRef(0);
  const startPos = useRef(0);
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  
  // 캐러셀의 총 너비 계산
  const TOTAL_WIDTH = itemCount * CAROUSEL_LAYOUT.EFFECTIVE_WIDTH;

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== null) {
      let currentVelocity = velocity;

      // 자동 스크롤 (일시정지 또는 드래그 중이 아닐 때)
      if (!isPaused && !isDragging) {
        // 목표 속도(-0.4)에 서서히 수렴
        currentVelocity = velocity * 0.95 + (-0.4) * 0.05;
      } else {
        // 드래그 중이 아니거나 일시정지 상태일 때 속도 감속
        currentVelocity *= 0.95;
      }

      setPosition(prev => {
        let next = prev + currentVelocity;
        // 무한 루프를 위한 위치 보정
        const loopBoundary = -TOTAL_WIDTH / 2;
        if (next <= loopBoundary) return next + Math.abs(loopBoundary);
        if (next >= 0) return next - Math.abs(loopBoundary);
        return next;
      });
      
      setVelocity(currentVelocity);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [isPaused, isDragging, velocity, TOTAL_WIDTH]);

  useEffect(() => {
    if (itemCount > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [animate, itemCount]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setIsPaused(true);
    startX.current = e.pageX;
    startPos.current = position;
    setVelocity(0); // 드래그 시작 시 관성 초기화
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.pageX;
    const diff = currentX - startX.current;
    
    setPosition(prev => {
        const next = startPos.current + diff;
        // 드래그 중 위치 보정
        const loopBoundary = -TOTAL_WIDTH / 2;
        if (next <= loopBoundary) return next + Math.abs(loopBoundary);
        if (next >= 0) return next - Math.abs(loopBoundary);
        return next;
    });

    // 마지막 움직임을 기반으로 속도 업데이트
    setVelocity(diff * 0.1); 
  }, [isDragging, TOTAL_WIDTH]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsPaused(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setIsPaused(false);
    }
  }, [isDragging]);

  const getVelocity = () => Math.abs(velocity);

  return {
    position,
    isDragging,
    getVelocity,
    carouselProps: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseLeave,
    },
  };
};
