import { forwardRef, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * KitSpecimen 컴포넌트
 *
 * The Substance PROTOCOL 키트 실사(영화 실물 "그대로"). 봉인된 진공 파우치가 스크롤에 따라
 * **윗 필름만 뜯겨** 내용물이 드러나는 과정을 **생성 실사 프레임 시퀀스**(봉인→개봉)로 스크럽한다.
 * 소진 시 '쭈글 빈 비닐' 실사로 crossfade. 넘버링 키트(STABILIZER/FOOD)는 **수직 넘버-라인
 * 프로그레스 게이지**를 오버레이한다. "이미 몸에 주입됐다"의 물성.
 *
 * 뜯김 구현(핵심): **이미지 시퀀스 스크럽**. `frames`(봉인→개봉 정합 프레임)를 `openProgress`로
 * 훑으며 인접 두 프레임을 opacity crossfade → 스크롤로 부드럽게 뜯긴다(비디오 아님, 가벼움).
 * 각 프레임은 같은 프레이밍이라 내용물이 흔들리지 않는다.
 *
 * 동작 방식:
 * 1. 애니메이션 값(프레임 opacity)은 openProgress에서 파생 — 별도 상태/타이머 없음.
 * 2. fpos = openProgress·(n-1). 각 프레임 opacity = 1 - |fpos - index| → 인접 프레임만 보임(crossfade).
 * 3. consumeProgress>0면 consumedSrc를 위에 alpha crossfade.
 * 4. openProgress가 1에 닿으면 onAdminister 1회(인젝션 사운드).
 *
 * Props:
 * @param {string[]} frames - 봉인→개봉 순 실사 프레임 URL 배열 [Required]
 * @param {number} openProgress - 뜯기 진행도 0~1 (frames 스크럽) [Optional, 기본값: 0]
 * @param {string} consumedSrc - 소진 실사(쭈글 빈 비닐) [Optional]
 * @param {number} consumeProgress - 소진 crossfade 0~1 [Optional, 기본값: 0]
 * @param {boolean} isConsumed - true면 consumeProgress를 1로 간주(편의) [Optional, 기본값: false]
 * @param {number} segments - 넘버링 게이지 칸 수(예: 7). 0이면 게이지 없음(ACTIVATOR 등 단일) [Optional, 기본값: 0]
 * @param {number} activeSegment - 현재 소진 위치(1~segments). 이하 칸은 dim [Optional, 기본값: 0]
 * @param {function} onAdminister - openProgress가 1에 도달할 때 1회 호출(인젝션 사운드) [Optional]
 * @param {string} label - 접근성 라벨(예: 'ACTIVATOR') [Optional, 기본값: 'Kit specimen']
 * @param {object} sx - 루트 컨테이너 MUI sx [Optional]
 *
 * Example usage:
 * <KitSpecimen
 *   frames={ ['/kit/activator-01-sealed.png', '/kit/activator-05-fully-torn.png'] }
 *   openProgress={ phaseProgress } onAdminister={ () => audio.inject() } label="ACTIVATOR" />
 */
const KitSpecimen = forwardRef(function KitSpecimen({
  frames = [],
  openProgress = 0,
  consumedSrc,
  consumeProgress = 0,
  isConsumed = false,
  segments = 0,
  activeSegment = 0,
  onAdminister,
  label = 'Kit specimen',
  objectFit = 'contain',
  objectPosition = 'center',
  frameSnap = false,
  sx,
  ...props
}, ref) {
  const openP = clamp01(openProgress);
  const consumeP = isConsumed ? 1 : clamp01(consumeProgress);

  /** openProgress가 1에 닿으면 인젝션 콜백 1회(내려갔다 오면 재무장) */
  const administeredRef = useRef(false);
  useEffect(() => {
    if (openP >= 0.999 && !administeredRef.current) {
      administeredRef.current = true;
      if (typeof onAdminister === 'function') onAdminister();
    } else if (openP < 0.9) {
      administeredRef.current = false;
    }
  }, [openP, onAdminister]);

  /** 프레임 스크럽 위치 — 인접 프레임만 crossfade */
  const n = Math.max(1, frames.length);
  const fpos = openP * (n - 1);

  return (
    <Box
      ref={ ref }
      role="img"
      aria-label={ `${ label } — ${ openP >= 0.999 ? 'opened' : 'sealed' }` }
      sx={ {
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 240,
        overflow: 'hidden',
        backgroundColor: 'background.default',
        ...sx,
      } }
      { ...props }
    >
      {/* 뜯기 프레임 스택 — openProgress로 스크럽(인접 프레임 opacity crossfade) */}
      { frames.map((src, i) => (
        <Box
          key={ src }
          component="img"
          src={ src }
          alt=""
          aria-hidden="true"
          draggable={ false }
          sx={ {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            objectPosition,
            // frameSnap: 가장 가까운 프레임만 표시(하드 컷) → 프레임 간 위치가 달라도 겹침(고스팅) 없이
            //   "파우치는 고정, 내용물만 단계적으로" 보임. 0.18s 트랜지션으로 짧게만 페이드.
            opacity: frameSnap ? (Math.round(fpos) === i ? 1 : 0) : clamp01(1 - Math.abs(fpos - i)),
            transition: frameSnap ? 'opacity 0.18s linear' : 'opacity 0.12s linear',
            userSelect: 'none',
            pointerEvents: 'none',
          } }
        />
      )) }

      {/* 소진(쭈글 빈 비닐) crossfade */}
      { consumedSrc && consumeP > 0 && (
        <Box
          component="img"
          src={ consumedSrc }
          alt=""
          aria-hidden="true"
          draggable={ false }
          sx={ {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit,
            objectPosition,
            opacity: consumeP,
            pointerEvents: 'none',
          } }
        />
      ) }

      {/* 수직 넘버-라인 프로그레스 게이지 — 넘버링 키트(STABILIZER/FOOD)만 */}
      { segments > 0 && (
        <Box
          aria-hidden="true"
          sx={ {
            position: 'absolute',
            top: '12%',
            bottom: '12%',
            right: '6%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '30%',
            pointerEvents: 'none',
          } }
        >
          { Array.from({ length: segments }, (_, i) => {
            const num = i + 1;
            const spent = activeSegment > 0 && num < activeSegment;
            const active = num === activeSegment;
            return (
              <Box key={ num } sx={ { display: 'flex', alignItems: 'center', gap: 1, opacity: spent ? 0.28 : 1 } }>
                <Box
                  sx={ {
                    flex: 1,
                    height: active ? 2 : 1,
                    backgroundColor: active ? 'secondary.main' : '#F5F5F0',
                    boxShadow: active ? '0 0 8px rgba(170,255,0,0.7)' : 'none',
                    transition: 'all 0.3s ease',
                  } }
                />
                <Box
                  component="span"
                  sx={ {
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: 'clamp(0.7rem, 1.4vw, 1rem)',
                    color: active ? 'secondary.main' : '#F5F5F0',
                    minWidth: '1.2em',
                    textAlign: 'right',
                  } }
                >
                  { num }
                </Box>
              </Box>
            );
          }) }
        </Box>
      ) }
    </Box>
  );
});

export { KitSpecimen };
