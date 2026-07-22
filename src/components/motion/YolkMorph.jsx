import { forwardRef, useId } from 'react';
import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';

import yolkImg from '../../assets/reference/eggyolk-topdown.png';

/** 살아있는 노른자 idle 미세 호흡 */
const wobbleKeyframe = keyframes`
  0%, 100% { transform: scale(1, 1); }
  50% { transform: scale(1.012, 0.99); }
`;

/** 용암 블리스터 기포 — 표면에서 부풀어 올랐다 꺼짐(pop) */
const blisterKeyframe = keyframes`
  0% { transform: scale(0.15); opacity: 0; }
  38% { transform: scale(1); opacity: 1; }
  68% { transform: scale(1.18); opacity: 0.8; }
  100% { transform: scale(0.35); opacity: 0; }
`;

/** 노른자 표면 위 기포 위치(노른자 중심 기준, rClip 단위) */
const BLISTERS = [
  { dx: -0.34, dy: -0.08, r: 0.2, dur: 1.7, delay: 0 },
  { dx: 0.28, dy: 0.22, r: 0.26, dur: 2.1, delay: 0.6 },
  { dx: 0.08, dy: -0.34, r: 0.16, dur: 1.5, delay: 1.1 },
  { dx: -0.12, dy: 0.34, r: 0.19, dur: 1.9, delay: 1.6 },
  { dx: 0.36, dy: -0.16, r: 0.14, dur: 1.4, delay: 0.9 },
];

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * YolkMorph 컴포넌트 (하이브리드 · 주입→꿀렁→분열 시퀀스)
 *
 * 실제 노른자 사진(top-down flat-lay)을 텍스처로 깔고, progress(0~1)를 3단계로 매핑해
 * "형광 그린 주입 → 노른자 꿀렁(활성화) → 둘로 분열"을 보여준다.
 * - 0.00~0.35 주입: 노른자에 그린이 차오르며(tint) 발광 bloom이 퍼짐(주사기 배출과 연동).
 * - 0.20~0.75 꿀렁: feTurbulence 변위가 강해지며 막이 젤리처럼 출렁(활성화).
 * - 0.55~1.00 분열: gooey 필터로 하나였던 노른자가 점성 목을 만들며 둘로 갈라짐.
 *
 * Props:
 * @param {number} size - 정사각 크기(px) [Optional, 기본값: 260]
 * @param {number} progress - 시퀀스 진행도 0~1 [Optional, 기본값: 0]
 * @param {number} maxSeparation - 분열 후 각 노른자가 중앙(100)에서 벌어지는 거리(좌우 대칭) [Optional, 기본값: 46]
 * @param {number} zoom - 사진 확대율(흰자 크롭 정도) [Optional, 기본값: 1.3]
 * @param {number} redMute - 중앙 붉은 점 뭉개기 0~1 [Optional, 기본값: 0.4]
 * @param {boolean} hasSurface - 표면(배경) 렌더 [Optional, 기본값: true]
 * @param {string} surfaceColor - 표면 배경색 — 영화 노른자 씬처럼 소프트 블루 [Optional, 기본값: '#87C1E0']
 * @param {boolean} hasAlbumen - 노른자 주변 반투명 흰자(계란 흰자) 웅덩이 [Optional, 기본값: true]
 * @param {boolean} hasShadow - 접촉 그림자/AO(바닥에 놓인 느낌) [Optional, 기본값: true]
 * @param {boolean} hasWobble - idle 호흡 애니메이션 [Optional, 기본값: true]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <YolkMorph size={ 300 } progress={ scrollProgress } />
 */
const YolkMorph = forwardRef(function YolkMorph({
  size = 260,
  progress = 0,
  maxSeparation = 46,
  zoom = 1.15,
  redMute = 0.1,
  hasSurface = true,
  surfaceColor = '#87C1E0',
  hasAlbumen = true,
  hasShadow = true,
  hasWobble = true,
  sx,
  ...props
}, ref) {
  const uid = useId().replace(/:/g, '');
  const clipL = `y-clipL-${ uid }`;
  const clipR = `y-clipR-${ uid }`;
  const fx = `y-fx-${ uid }`;
  const muteId = `y-mute-${ uid }`;
  const bloomId = `y-bloom-${ uid }`;
  const glossId = `y-gloss-${ uid }`;
  const blisterId = `y-blister-${ uid }`;
  const plumeFx = `y-plumefx-${ uid }`;
  const shadowId = `y-shadow-${ uid }`;
  const shadowFx = `y-shfx-${ uid }`;

  const p = clamp01(progress);
  /** 단계 매핑 */
  const inject = clamp01(p / 0.35);
  const splitP = clamp01((p - 0.55) / 0.45);
  // 주입 그린 플룸: 주입 때 나타났다 흡수되며 사라짐(노른자는 노란색 유지)
  const plumeAmt = inject * (1 - clamp01((p - 0.4) / 0.3));
  // 꿀렁: 주입 후에만, 분열 후 정지(0.33~0.9 창)
  const wobbleWindow = clamp01((p - 0.33) / 0.15) * (1 - clamp01((p - 0.8) / 0.15));

  const cy = 100;
  const rClip = 34;
  const imgHalf = 65 * zoom;
  // 분열: 원본(왼쪽)은 온전한 채 살짝 왼쪽으로, 두 번째(오른쪽)는 원본 오른쪽 끝에서
  // 작게 싹터(budding) 자라며 떨어져 나온다(텍스트 DualitySequence와 동일 방향성).
  const budScale = clamp01(splitP / 0.7); // 오른쪽 노른자 크기 0→풀사이즈(70%에 완성)
  const budR = rClip * budScale;
  const leftCx = 100 - maxSeparation * splitP; // 원본도 대칭으로 이동(최종 100 ± maxSeparation)
  const attachedCx = leftCx + rClip - budR * 0.5; // 싹틀 땐 원본 오른쪽 끝에 접함
  const separatedCx = 100 + maxSeparation; // 최종: 100 기준 좌우 대칭(양옆 스페이스 동일)
  const rightCx = attachedCx + (separatedCx - attachedCx) * splitP;
  const dispScale = 3 + wobbleWindow * 13; // 정적 미세 유기 엣지 + 주입 후 꿀렁
  const blurAmt = 1 + 3.5 * Math.sin(Math.PI * splitP); // pinch(목 잇는 순간)만 gooey, 온전/완전분열 시 선명(광택)
  // 비싼 turbulence+displacement 필터는 꿀렁/분열이 실제로 일어나는 구간에만 적용(그 외엔 clip 원형 그대로) → 프레임당 재래스터화 제거
  const useFx = wobbleWindow > 0.02 || splitP > 0.02;

  /** 노른자 하나 렌더(사진 + 붉은점 뭉갬 + 그린 주입) — r: 이 노른자 반경(bud는 자람) */
  const yolk = (cx, clipId, r) => {
    if (r < 0.5) return null;
    const ih = imgHalf * (r / rClip); // bud는 사진도 함께 축소
    return (
    <g clipPath={ `url(#${ clipId })` } key={ clipId }>
      <image
        href={ yolkImg }
        x={ cx - ih }
        y={ cy - ih }
        width={ ih * 2 }
        height={ ih * 2 }
        preserveAspectRatio="xMidYMid slice"
      />
      <ellipse cx={ cx } cy={ cy } rx={ r * 0.62 } ry={ r * 0.62 } fill={ `url(#${ muteId })` } opacity={ redMute } />
      {/* 주입 그린 플룸(주입점에서 잉크처럼 번짐/텐드릴) — multiply로 노란 노른자가 네온그린으로 shift(흰색 X) */}
      { plumeAmt > 0.01 && (
        <Box
          component="ellipse"
          cx={ cx }
          cy={ cy - r * 0.28 }
          rx={ r * (0.24 + plumeAmt * 0.5) }
          ry={ r * (0.24 + plumeAmt * 0.5) }
          fill={ `url(#${ bloomId })` }
          filter={ `url(#${ plumeFx })` }
          sx={ { mixBlendMode: 'multiply', opacity: 0.35 + plumeAmt * 0.6 } }
        />
      ) }
      {/* 용암 블리스터 기포 — 주입 후 꿀렁(활성화) 창에서만 부풀었다 pop */}
      { wobbleWindow > 0.02 && (
        <g opacity={ wobbleWindow }>
          { BLISTERS.map((b) => {
            const bx = cx + b.dx * r;
            const by = cy + b.dy * r;
            return (
              <Box
                key={ `${ clipId }-${ b.dx }-${ b.dy }` }
                component="circle"
                cx={ bx }
                cy={ by }
                r={ b.r * r }
                fill={ `url(#${ blisterId })` }
                sx={ {
                  transformOrigin: `${ bx }px ${ by }px`,
                  transformBox: 'view-box',
                  animation: `${ blisterKeyframe } ${ b.dur }s ease-in-out infinite`,
                  animationDelay: `${ b.delay }s`,
                  '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0 },
                } }
              />
            );
          }) }
        </g>
      ) }
    </g>
    );
  };

  /** 젖은 광택 sheen(글로시) — 이전 버전 그대로(단일 소프트 sheen), 단 블러 밖에서 렌더해 분열 중/후에도 crisp */
  const glossLayer = (cx, clipId, r) => {
    if (r < 0.5) return null;
    return (
      <g clipPath={ `url(#${ clipId })` } key={ `gloss-${ clipId }` }>
        <Box component="ellipse" cx={ cx - r * 0.1 } cy={ cy - r * 0.34 } rx={ r * 0.6 } ry={ r * 0.42 } fill={ `url(#${ glossId })` } sx={ { mixBlendMode: 'screen' } } />
      </g>
    );
  };

  return (
    <Box
      ref={ ref }
      component="span"
      aria-hidden="true"
      sx={ { display: 'inline-flex', width: size, height: size, lineHeight: 0, ...sx } }
      { ...props }
    >
      <Box
        component="svg"
        viewBox="0 0 200 200"
        width={ size }
        height={ size }
        sx={ {
          display: 'block',
          transformOrigin: 'center',
          willChange: 'transform',
          animation: hasWobble ? `${ wobbleKeyframe } 6s ease-in-out infinite` : 'none',
          '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
        } }
      >
        <defs>
          <clipPath id={ clipL }><circle cx={ leftCx } cy={ cy } r={ rClip } /></clipPath>
          <clipPath id={ clipR }><circle cx={ rightCx } cy={ cy } r={ budR } /></clipPath>
          {/* 변위(꿀렁) + gooey 병합(점성 pinch) — 변위 강도는 progress로, 흐름은 시간으로 */}
          <filter id={ fx } x="-40%" y="-40%" width="180%" height="180%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="1" seed="4" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={ dispScale } xChannelSelector="R" yChannelSelector="G" result="d" />
            <feGaussianBlur in="d" stdDeviation={ blurAmt } result="b" />
            <feColorMatrix in="b" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" />
          </filter>
          {/* 그린 플룸 잉크 텐드릴(주입 번짐) — 물 속 잉크처럼 가장자리가 갈라짐 */}
          <filter id={ plumeFx } x="-70%" y="-70%" width="240%" height="240%">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="7" result="pn" />
            <feDisplacementMap in="SourceGraphic" in2="pn" scale="16" />
          </filter>
          {/* 그림자 불규칙화(동그라미 X) */}
          <filter id={ shadowFx } x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="11" result="sn" />
            <feDisplacementMap in="SourceGraphic" in2="sn" scale="8" result="sd" />
            <feGaussianBlur in="sd" stdDeviation="3.5" />
          </filter>
          <radialGradient id={ muteId } cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EEBE1E" stopOpacity="0.92" />
            <stop offset="42%" stopColor="#EFC223" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#EFC223" stopOpacity="0" />
          </radialGradient>
          {/* 젖은 광택 sheen(글로시) — 위쪽 광원 */}
          <radialGradient id={ glossId } cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
            <stop offset="55%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          {/* 용암 블리스터 기포 — 위쪽 하이라이트 + 노른자 노란색 돔 */}
          <radialGradient id={ blisterId } cx="38%" cy="30%" r="66%">
            <stop offset="0%" stopColor="#FFF6C0" stopOpacity="0.92" />
            <stop offset="42%" stopColor="#F2C531" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#C99A1A" stopOpacity="0" />
          </radialGradient>
          {/* 그린 주입 잉크 — 순수 네온그린(흰색 없음). multiply로 노른자에 초록이 비침 */}
          <radialGradient id={ bloomId } cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#9CE800" stopOpacity="1" />
            <stop offset="50%" stopColor="#AAFF00" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#AAFF00" stopOpacity="0" />
          </radialGradient>
          {/* 접촉 그림자/AO — 바닥에 놓인 느낌(대칭 소프트, 미세 하향 오프셋) */}
          <radialGradient id={ shadowId } cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#4A3B12" stopOpacity="0.32" />
            <stop offset="62%" stopColor="#4A3B12" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#4A3B12" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 소프트 블루 표면(영화 노른자 씬) */}
        { hasSurface && <rect x="0" y="0" width="200" height="200" fill={ surfaceColor } /> }

        {/* 반투명 계란 흰자(albumen) 웅덩이 — 노른자 감싸는 글로시 퍼짐(불규칙 엣지) */}
        { hasSurface && hasAlbumen && (
          <g filter={ `url(#${ shadowFx })` }>
            <ellipse cx={ (leftCx + rightCx) / 2 } cy={ cy } rx={ (rightCx - leftCx) / 2 + rClip * 1.55 } ry={ rClip * 1.5 } fill="#DCF1FB" opacity="0.5" />
            <ellipse cx={ (leftCx + rightCx) / 2 } cy={ cy } rx={ (rightCx - leftCx) / 2 + rClip * 1.55 } ry={ rClip * 1.5 } fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeOpacity="0.3" />
            <ellipse cx={ (leftCx + rightCx) / 2 - rClip * 0.5 } cy={ cy - rClip * 0.7 } rx={ rClip * 0.9 } ry={ rClip * 0.32 } fill="#FFFFFF" opacity="0.22" />
          </g>
        ) }

        {/* 접촉 그림자(노른자 밑, 표면 위) — 살짝 아래로만 오프셋 */}
        { hasShadow && (
          <g filter={ `url(#${ shadowFx })` }>
            <ellipse cx={ leftCx } cy={ cy + rClip * 0.14 } rx={ rClip * 1.16 } ry={ rClip * 1.02 } fill={ `url(#${ shadowId })` } />
            { budR > 1 && (
              <ellipse cx={ rightCx } cy={ cy + budR * 0.14 } rx={ budR * 1.16 } ry={ budR * 1.02 } fill={ `url(#${ shadowId })` } />
            ) }
          </g>
        ) }

        {/* 노른자: 원본(왼쪽, 온전) + 싹터 자라는 두 번째(오른쪽, budR) → 꿀렁 변위 + gooey 점성 분열.
            변위 필터는 활성 구간(useFx)에만 — 나머지 스크롤 구간은 필터 없이 저비용 렌더 */}
        <g filter={ useFx ? `url(#${ fx })` : undefined }>
          { yolk(leftCx, clipL, rClip) }
          { yolk(rightCx, clipR, budR) }
        </g>

        {/* 젖은 광택 — 블러 밖(분열 중/후에도 선명한 글로시 유지) */}
        { glossLayer(leftCx, clipL, rClip) }
        { glossLayer(rightCx, clipR, budR) }
      </Box>
    </Box>
  );
});

export { YolkMorph };
