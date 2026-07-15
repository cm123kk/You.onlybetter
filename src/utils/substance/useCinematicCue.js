import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useCinematicCue - 영화 기법 큐 트리거(과잉 조명 플래시 중심)
 *
 * 매크로 풀아웃·대칭 붕괴·롱렌즈 고립 등은 스크롤 파생 트랜스폼이라 각 컴포넌트가
 * 직접 처리한다. 이 훅은 상태와 "예산 제한"이 필요한 큐 — 과잉 조명 플래시 —를 담당한다.
 *
 * 과잉 조명 플래시: 배경 #0A0A0A에서 텍스트 주변이 폭발하듯 밝아졌다 복귀(brightness filter).
 * "숨을 곳 없는 임상적 과잉 조명"의 번역 — 남발 금지, 페이지 전체 maxFlashes회로 제한한다.
 * (트리거: "This is the Substance." / "You. Are. One." / SUBMIT 직후)
 *
 * Props(옵션):
 * @param {object} options - 설정 [Optional]
 * @param {number} options.maxFlashes - 플래시 총 허용 횟수 [Optional, 기본값: 4]
 * @param {number} options.flashDuration - 플래시 지속(ms) [Optional, 기본값: 180]
 * @returns {{ isFlashing: boolean, flashCount: number, remainingFlashes: number, flash: function, cue: function }}
 *
 * Example usage:
 * const { isFlashing, flash } = useCinematicCue();
 * // onEnter "This is the Substance" → flash();
 * // <Box sx={{ filter: isFlashing ? 'brightness(2.2)' : 'none', transition: 'filter 120ms' }} />
 */
export function useCinematicCue({ maxFlashes = 4, flashDuration = 180 } = {}) {
  const [isFlashing, setIsFlashing] = useState(false);
  const [flashCount, setFlashCount] = useState(0);
  const countRef = useRef(0);
  const timerRef = useRef(null);

  /**
   * flash - 과잉 조명 플래시 1회. 예산 소진 시 무시(false 반환).
   * @returns {boolean} 실제 발동 여부
   */
  const flash = useCallback(() => {
    if (countRef.current >= maxFlashes) return false;
    countRef.current += 1;
    setFlashCount(countRef.current);
    setIsFlashing(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsFlashing(false), flashDuration);
    return true;
  }, [maxFlashes, flashDuration]);

  /**
   * cue - 큐 타입별 디스패치. 현재 'overbright-flash'만 상태를 가진다.
   * @param {string} type - 큐 타입 [Required]
   * @returns {boolean}
   */
  const cue = useCallback((type) => {
    if (type === 'overbright-flash') return flash();
    return false;
  }, [flash]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return {
    isFlashing,
    flashCount,
    remainingFlashes: Math.max(0, maxFlashes - flashCount),
    flash,
    cue,
  };
}
