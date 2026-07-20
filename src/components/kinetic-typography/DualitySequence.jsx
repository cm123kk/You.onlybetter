import { forwardRef, useId, useLayoutEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';

/** stage 프리셋을 progress(0~1) 값으로 매핑 */
const STAGE_PROGRESS = {
  A: 0,
  B: 0.5,
  C: 1,
};

/** progress 값을 0~1 범위로 clamp */
const clamp = (value) => Math.min(Math.max(value, 0), 1);

/** 옐로(#F5E642) → 그린(#AAFF00) 보간 */
const YELLOW = [0xf5, 0xe6, 0x42];
const GREEN = [0xaa, 0xff, 0x00];
const mixColor = (t) => {
  const c = YELLOW.map((v, i) => Math.round(v + (GREEN[i] - v) * t));
  return `rgb(${ c[0] }, ${ c[1] }, ${ c[2] })`;
};

const BIG_FONT = 'clamp(4rem, 18vw, 14rem)';
const BUD_FULL = 0.55; // 두 번째가 full 크기가 되는 지점(1단계 종료)
const FIRST_DRIFT = 0.2; // 2단계에서 첫 번째가 왼쪽으로 밀리는 정도(em)

/**
 * DualitySequence 컴포넌트
 *
 * The Substance "THE DUALITY" 시퀀스. 노른자 분열처럼 두 번째 자아가 **첫 번째의 오른쪽
 * 부분에서 겹쳐 싹터(budding)** 나와 둘로 갈라진다. 원본(옐로)에서 활성 자아(옐로→그린).
 *
 * 2단계 구조(핵심):
 * - 1단계 싹틈(0~BUD_FULL): 두 번째 왼쪽 끝을 **첫 번째 중앙에 고정** → 첫 번째의 오른쪽
 *   절반과 **겹친 채** scale 0→1 로 자라난다(간격 없음, 겹침 있음).
 * - 2단계 분리(BUD_FULL~1): 그제서야 좌우로 벌어져 간격이 열리고, 겹친 이음새의 gooey
 *   목이 얇아지다 끊긴다. 분리되면 각각 선명.
 * 끈적함: 겹친 구간에만 gooey blur를 동적으로(rest=0 선명). 글자엔 필터 안 씌움(분리 후 선명).
 *
 * Props:
 * @param {string} text - 분화시킬 대형 텍스트 [Optional, 기본값: 'YOU']
 * @param {string} stage - 진행 단계 프리셋 'A' | 'B' | 'C' [Optional, 기본값: 'A']
 * @param {number} progress - 분화 진행도 0~1 (지정 시 stage보다 우선) [Optional]
 * @param {number} budStart - 두 번째가 싹트는 시작점 오프셋(첫 번째 중앙 기준 오른쪽 em) [Optional, 기본값: 0.22]
 * @param {number} spread - 분리 후 두 자아 사이 간격(em) [Optional, 기본값: 0.6]
 * @param {number} stickiness - 이어짐 점성(gooey blur 최대치 px) [Optional, 기본값: 12]
 * @param {object} sx - 루트 컨테이너 MUI sx 스타일 [Optional]
 *
 * Example usage:
 * <DualitySequence text="YOU" stage="C" />
 * <DualitySequence text="SELF" progress={ 0.7 } />
 */
const DualitySequence = forwardRef(function DualitySequence(
  { text = 'YOU', stage = 'A', progress, budStart = 0.22, spread = 0.6, stickiness = 12, sx = {} },
  ref
) {
  const uid = useId().replace(/:/g, '');
  const gooId = `duality-goo-${ uid }`;

  /** 글자 반폭(em) 측정 — 분리 거리·겹침 계산에 사용 */
  const measureRef = useRef(null);
  const [halfWordEm, setHalfWordEm] = useState(0.85);
  useLayoutEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    const fs = parseFloat(window.getComputedStyle(el).fontSize) || 1;
    const wEm = el.getBoundingClientRect().width / fs;
    if (wEm > 0) setHalfWordEm(wEm / 2);
  }, [text]);

  /** progress가 명시되면 우선, 아니면 stage 프리셋을 progress로 변환 */
  const value = clamp(
    typeof progress === 'number' ? progress : STAGE_PROGRESS[stage] ?? 0
  );
  const rightColor = mixColor(value);

  /** 1단계: 크기 성장 / 2단계: 분리 진행 */
  const budScale = clamp(value / BUD_FULL, 0, 1);
  const sep = clamp((value - BUD_FULL) / (1 - BUD_FULL), 0, 1);

  /** 첫 번째: 2단계에만 왼쪽으로 드리프트 */
  const firstX = -sep * FIRST_DRIFT;
  /** 두 번째 왼쪽 끝: 1단계엔 첫 번째 중앙+budStart(획 두께 안, 겹침), 2단계에 오른쪽으로 분리 */
  const budLeftEm = firstX + budStart + sep * (halfWordEm + spread - budStart);

  /** 끈적함: 겹친 구간(성장~초기분리, 0~0.82)에만 blur, 분리되면 0 → 선명 */
  const blur = value < 0.82 ? stickiness * Math.sin((value / 0.82) * Math.PI) : 0;
  const useGoo = blur > 0.5;

  /** 콘텐츠 크기 스팬 공통 (중앙 기준 배치) */
  const glyphSx = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    whiteSpace: 'nowrap',
    typography: 'h1',
    lineHeight: 0.9,
    fontSize: BIG_FONT,
    userSelect: 'none',
    willChange: 'transform, color',
  };

  return (
    <Box
      ref={ ref }
      role="img"
      aria-label={ text }
      sx={ {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: 'clamp(8rem, 32vw, 24rem)',
        overflow: 'hidden',
        backgroundColor: 'background.default',
        ...sx,
      } }
    >
      {/* 폭 측정용 히든 스팬 */}
      <Box
        ref={ measureRef }
        component="span"
        aria-hidden="true"
        sx={ { position: 'absolute', visibility: 'hidden', whiteSpace: 'nowrap', typography: 'h1', lineHeight: 0.9, fontSize: BIG_FONT } }
      >
        { text }
      </Box>

      {/* gooey 필터(숨김) — 겹친 구간의 이어짐을 끈적하게 병합 */}
      <Box component="svg" aria-hidden="true" sx={ { position: 'absolute', width: 0, height: 0 } }>
        <defs>
          <filter id={ gooId }>
            <feGaussianBlur in="SourceGraphic" stdDeviation={ Math.max(blur, 0.01) } result="blur" />
            <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" />
          </filter>
        </defs>
      </Box>

      {/* 두 자아 — rest에선 filter none(선명), 겹친 구간에만 gooey */}
      <Box sx={ { position: 'absolute', inset: 0, filter: useGoo ? `url(#${ gooId })` : 'none' } }>
        {/* 첫 번째(원본, 옐로) — 중앙 기준, 항상 full·선명 */}
        <Box
          aria-hidden="true"
          component="span"
          sx={ {
            ...glyphSx,
            color: 'primary.main',
            transformOrigin: 'center',
            transform: `translate(-50%, -50%) translateX(${ firstX }em)`,
          } }
        >
          { text }
        </Box>

        {/* 두 번째(활성, 옐로→그린) — 첫 번째 우측 부분에서 겹쳐 자라남(좌측 원점 scale) */}
        <Box
          aria-hidden="true"
          component="span"
          sx={ {
            ...glyphSx,
            color: rightColor,
            transformOrigin: 'left center',
            transform: `translateY(-50%) translateX(${ budLeftEm }em) scale(${ budScale })`,
          } }
        >
          { text }
        </Box>
      </Box>
    </Box>
  );
});

export default DualitySequence;
