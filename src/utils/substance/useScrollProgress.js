import { useEffect, useRef, useState } from 'react';

/**
 * useScrollProgress - 페이지의 유일한 입력이자 타임라인 소스
 *
 * The Substance 페이지의 "단일 소스" 원칙을 구현하는 훅이다.
 * 하나의 scrollProgress(0~1)가 배경 레이어·텍스트 리빌·컬러 아크·사운드를
 * 동시에 구동한다. rAF로 스크롤 이벤트를 스로틀해 프레임당 1회만 계산한다.
 *
 * 동작:
 * - targetRef 지정 시: 해당 엘리먼트를 스크롤로 통과하는 진행도(0~1).
 *   (인트로처럼 뷰포트보다 긴 섹션의 sticky 타임라인에 적합)
 * - targetRef 미지정 시: 문서 전체 스크롤 진행도(0~1).
 * - steps 지정 시: activeStep = floor(progress * steps) (활성화 스크립트 라인 인덱스).
 *
 * 리렌더 없이 값을 읽어야 하는 소비자(오디오·Canvas)를 위해 progressRef(최신값)를 함께 반환한다.
 *
 * Props(옵션):
 * @param {React.RefObject} targetRef - 진행도를 측정할 엘리먼트 ref [Optional, 기본값: 문서 전체]
 * @param {object} options - 설정 [Optional]
 * @param {number} options.steps - 활성 스텝 분할 수 (0이면 미사용) [Optional, 기본값: 0]
 * @returns {{ progress: number, activeStep: number, progressRef: React.RefObject<number> }}
 *
 * Example usage:
 * const introRef = useRef(null);
 * const { progress, activeStep, progressRef } = useScrollProgress(introRef, { steps: 11 });
 */
export function useScrollProgress(targetRef, { steps = 0 } = {}) {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const progressRef = useRef(0);
  const rafRef = useRef(null);
  const tickingRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const compute = () => {
      tickingRef.current = false;
      const vh = window.innerHeight;
      let p = 0;
      const el = targetRef && targetRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const total = rect.height - vh;
        p = total > 0 ? -rect.top / total : (rect.top <= 0 ? 1 : 0);
      } else {
        const total = document.documentElement.scrollHeight - vh;
        p = total > 0 ? window.scrollY / total : 0;
      }
      p = Math.min(1, Math.max(0, p));
      progressRef.current = p;
      setProgress(p);
      if (steps > 0) {
        setActiveStep(Math.min(steps - 1, Math.floor(p * steps)));
      }
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      rafRef.current = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [targetRef, steps]);

  return { progress, activeStep, progressRef };
}
