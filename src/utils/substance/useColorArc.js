import { useEffect, useRef, useState } from 'react';

import { lerpColor } from './lerpColor';

/**
 * useColorArc - 스크롤 진행도를 옐로→그린 컬러 아크로 변환 (히스테리시스)
 *
 * scrollProgress 파생 상태. 되돌림 저항(hysteresis)이 핵심이다:
 * 스크롤을 내릴 때(진행)는 빠르게 그린으로 물들지만, 위로 올릴 때(되돌림)는
 * 즉시 복귀하지 않고 천천히 옐로로 돌아간다 — "진행됐다"는 불가역 감각.
 *
 * rAF 루프에서 progressRef(최신값)를 읽어 arcValue를 비대칭 이징으로 추적한다.
 * (target > current → rise 속도, target < current → fall 속도, fall ≪ rise)
 *
 * Props:
 * @param {React.RefObject<number>} progressRef - useScrollProgress가 반환한 진행도 ref [Required]
 * @param {object} options - 설정 [Optional]
 * @param {string} options.yellow - 아크 시작 색 [Optional, 기본값: '#F5E642']
 * @param {string} options.green - 아크 종료 색 [Optional, 기본값: '#AAFF00']
 * @param {number} options.rise - 진행 시 추종 계수 (클수록 빠름) [Optional, 기본값: 0.14]
 * @param {number} options.fall - 되돌림 시 추종 계수 (작을수록 저항 강함) [Optional, 기본값: 0.02]
 * @returns {{ color: string, arcValue: number, arcRef: React.RefObject<number> }}
 *
 * Example usage:
 * const { color, arcValue, arcRef } = useColorArc(progressRef);
 * // <Box sx={{ backgroundColor: color }} />
 */
export function useColorArc(progressRef, {
  yellow = '#F5E642',
  green = '#AAFF00',
  rise = 0.14,
  fall = 0.02,
} = {}) {
  const [color, setColor] = useState(yellow);
  const [arcValue, setArcValue] = useState(0);
  const arcRef = useRef(0);

  useEffect(() => {
    let raf = null;
    let mounted = true;

    const loop = () => {
      if (!mounted) return;
      const target = (progressRef && progressRef.current) || 0;
      const cur = arcRef.current;
      const factor = target > cur ? rise : fall;
      const next = cur + (target - cur) * factor;
      arcRef.current = next;

      // 동일값 setState는 React가 bail-out → 안정 구간에선 리렌더 없음
      setArcValue((prev) => (Math.abs(prev - next) > 0.0005 ? next : prev));
      setColor(lerpColor(yellow, green, next));

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => {
      mounted = false;
      if (raf) cancelAnimationFrame(raf);
    };
  }, [progressRef, yellow, green, rise, fall]);

  return { color, arcValue, arcRef };
}
