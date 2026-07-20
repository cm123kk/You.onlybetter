import { forwardRef, useId } from 'react';
import Box from '@mui/material/Box';
import { useTheme, keyframes } from '@mui/material/styles';

/** viewBox 좌표(세로 바이알) */
const VB_W = 88;
const VB_H = 600;
const X0 = 18;
const X1 = 70;
const RX = 18;
const TOP_Y = 22;
const BOTTOM_Y = 578;
const INNER_H = BOTTOM_Y - TOP_Y;
const TICK_PAD = 34;

/** 기포 상승 */
const rise = keyframes`
  0% { transform: translateY(0); opacity: 0; }
  16% { opacity: 0.85; }
  84% { opacity: 0.7; }
  100% { transform: translateY(-${ INNER_H }px); opacity: 0; }
`;

/** 기포 세트(작고 드문드문, 불규칙) */
const BUBBLES = [
  { cx: 33, r: 3.4, dur: 8, delay: 0 },
  { cx: 55, r: 2.4, dur: 10, delay: 2.4 },
  { cx: 44, r: 4, dur: 7, delay: 4.6 },
  { cx: 38, r: 2, dur: 11, delay: 1.5 },
  { cx: 52, r: 3, dur: 9, delay: 6 },
];

/**
 * SubstanceSyringe 컴포넌트
 *
 * The Substance 좌측 형광물질 바이알(주입 게이지). 둥근 유리관에 형광 그린 액체가 가득 찼다가
 * fill(0~1)이 줄면 액면이 내려가며 "주입"된다. 눈금은 액체 부분에만 검정으로 표시되고,
 * 유리관은 원통 셰이딩(좌우 어둡고 하이라이트 밴드)으로 볼륨을, 액체는 세로 깊이 그라디언트와
 * 입체 기포로 사실감을 낸다.
 *
 * Props:
 * @param {number} fill - 액체 레벨 0(빔)~1(가득) [Optional, 기본값: 1]
 * @param {string} color - 액체 기준색 [Optional, 기본값: 'secondary.main']
 * @param {number} minorCount - 부 눈금 간격 수 [Optional, 기본값: 40]
 * @param {number} majorEvery - 몇 칸마다 주 눈금 [Optional, 기본값: 5]
 * @param {boolean} hasBubbles - 상승 기포 애니메이션 [Optional, 기본값: true]
 * @param {boolean} stretch - 종횡비 고정 해제(컨테이너 폭×높이로 늘림) — 두껍고 짧게 쓸 때 [Optional, 기본값: false]
 * @param {boolean} flipGradient - 액체 그라디언트 반전(어두운색을 표면=배출 끝으로) [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <SubstanceSyringe fill={ 1 - scrollProgress } />
 */
const SubstanceSyringe = forwardRef(function SubstanceSyringe({
  fill = 1,
  color = 'secondary.main',
  minorCount = 40,
  majorEvery = 5,
  hasBubbles = true,
  stretch = false,
  flipGradient = false,
  sx,
  ...props
}, ref) {
  const theme = useTheme();
  const uid = useId().replace(/:/g, '');
  const glowId = `syr-glow-${ uid }`;
  const gradId = `syr-grad-${ uid }`;
  const cylId = `syr-cyl-${ uid }`;
  const tickId = `syr-tick-${ uid }`;
  const bubbleId = `syr-bubble-${ uid }`;
  const vialClip = `syr-vial-${ uid }`;
  const fluidClip = `syr-fluid-${ uid }`;

  const f = Math.min(1, Math.max(0, fill));
  const headTop = TOP_Y; // 공기층 없이 꽉 채움(fill=1 → 100%)
  const fluidTop = headTop + (1 - f) * (BOTTOM_Y - headTop);

  const resolve = (token) => {
    if (typeof token !== 'string' || !token.includes('.')) return token;
    const [group, shade] = token.split('.');
    return theme.palette[group]?.[shade] || token;
  };
  const liquidMid = resolve(color);
  const liquidLight = '#E6FFB4';
  const liquidDark = '#5F8F00';
  const glassInk = theme.palette.divider;

  const rightWall = X1 - 4;
  const tChamberTop = TOP_Y + TICK_PAD;
  const tChamberH = INNER_H - TICK_PAD * 2;
  const ticks = Array.from({ length: minorCount + 1 }, (_, i) => {
    const y = tChamberTop + (i / minorCount) * tChamberH;
    const isMajor = i % majorEvery === 0;
    return {
      key: i,
      y,
      x1: isMajor ? rightWall - 15 : rightWall - 8,
      width: isMajor ? 1.8 : 0.9,
      opacity: isMajor ? 0.85 : 0.5,
    };
  });

  return (
    <Box
      ref={ ref }
      component="span"
      aria-hidden="true"
      sx={ { display: 'inline-flex', height: '100%', lineHeight: 0, ...(stretch && { width: '100%' }), ...sx } }
      { ...props }
    >
      <Box
        component="svg"
        viewBox={ `0 0 ${ VB_W } ${ VB_H }` }
        preserveAspectRatio={ stretch ? 'none' : 'xMidYMid meet' }
        sx={ { display: 'block', height: '100%', width: stretch ? '100%' : 'auto' } }
      >
        <defs>
          <filter id={ glowId } x="-60%" y="-10%" width="220%" height="120%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          {/* 액체 세로 깊이 — 기본: 표면 밝고 바닥 어둡게 / flipGradient: 표면(배출 끝)을 어둡게 */}
          <linearGradient id={ gradId } gradientUnits="userSpaceOnUse" x1="0" y1={ fluidTop } x2="0" y2={ BOTTOM_Y }>
            { flipGradient ? (
              <>
                <stop offset="0%" stopColor={ liquidDark } />
                <stop offset="45%" stopColor={ liquidMid } />
                <stop offset="100%" stopColor={ liquidMid } />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor={ liquidMid } />
                <stop offset="55%" stopColor={ liquidMid } />
                <stop offset="100%" stopColor={ liquidDark } />
              </>
            ) }
          </linearGradient>
          {/* 원통(실린더) 셰이딩: 좌우 어둡고 왼쪽 치우친 하이라이트 밴드 → 볼륨 */}
          <linearGradient id={ cylId } x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.4" />
            <stop offset="16%" stopColor="#000000" stopOpacity="0.04" />
            <stop offset="32%" stopColor="#FFFFFF" stopOpacity="0.26" />
            <stop offset="47%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="72%" stopColor="#000000" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.44" />
          </linearGradient>
          {/* 눈금 라이팅: 빛 가까운 왼쪽 밝고 어두운 오른쪽 가장자리로 어둡게 */}
          <linearGradient id={ tickId } gradientUnits="userSpaceOnUse" x1={ X1 - 4 - 15 } y1="0" x2={ X1 - 4 - 2 } y2="0">
            <stop offset="0%" stopColor="#5A7222" />
            <stop offset="55%" stopColor="#1E2C08" />
            <stop offset="100%" stopColor="#080F00" />
          </linearGradient>
          {/* 입체 기포 */}
          <radialGradient id={ bubbleId } cx="36%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="26%" stopColor="#FFFFFF" stopOpacity="0.08" />
            <stop offset="72%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="89%" stopColor="#FFFFFF" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <clipPath id={ vialClip }>
            <rect x={ X0 } y={ TOP_Y } width={ X1 - X0 } height={ INNER_H } rx={ RX } ry={ RX } />
          </clipPath>
          <clipPath id={ fluidClip }>
            <rect x={ X0 } y={ fluidTop } width={ X1 - X0 } height={ Math.max(0, BOTTOM_Y - fluidTop) } />
          </clipPath>
        </defs>

        {/* 외곽 형광 발광 */}
        { f > 0 && (
          <rect x={ X0 } y={ fluidTop } width={ X1 - X0 } height={ BOTTOM_Y - fluidTop } rx={ RX } fill={ liquidMid } opacity="0.35" filter={ `url(#${ glowId })` } />
        ) }

        <g clipPath={ `url(#${ vialClip })` }>
          {/* 액체 본체(세로 깊이) */}
          <rect x={ X0 } y={ fluidTop } width={ X1 - X0 } height={ BOTTOM_Y - fluidTop } fill={ `url(#${ gradId })` } />
          {/* 빈 윗부분(옅은 유리) */}
          { fluidTop > TOP_Y && (
            <rect x={ X0 } y={ TOP_Y } width={ X1 - X0 } height={ fluidTop - TOP_Y } fill="rgba(255,255,255,0.015)" />
          ) }
          {/* 원통 셰이딩(유리관 전체) → 볼륨 */}
          <rect x={ X0 } y={ TOP_Y } width={ X1 - X0 } height={ INNER_H } fill={ `url(#${ cylId })` } />
          {/* 유리 엣지 하이라이트(양쪽 얇은 밝은 선) */}
          <rect x={ X0 + 1.5 } y={ TOP_Y + 4 } width="1.6" height={ INNER_H - 8 } rx="0.8" fill="#FFFFFF" opacity="0.35" />
          <rect x={ X1 - 3 } y={ TOP_Y + 4 } width="1.2" height={ INNER_H - 8 } rx="0.6" fill="#FFFFFF" opacity="0.14" />

          {/* 액면(meniscus) — 공기층 아래 곡면 표면(항상 노출) */}
          { f > 0 && (
            <>
              <ellipse cx={ (X0 + X1) / 2 } cy={ fluidTop + 1.5 } rx={ (X1 - X0) / 2 - 2 } ry="4.5" fill={ liquidDark } opacity="0.3" />
              <ellipse cx={ (X0 + X1) / 2 } cy={ fluidTop } rx={ (X1 - X0) / 2 - 2 } ry="4" fill={ liquidLight } opacity="0.4" />
            </>
          ) }

          {/* 주/부 눈금 — 원통 곡률 따라 휘고, 라이팅 그라디언트(왼쪽 밝음→오른쪽 어두움) */}
          { ticks.map((t) => {
            const xE = rightWall - 2;
            const midX = (t.x1 + xE) / 2;
            const bow = (xE - t.x1) * 0.16;
            return (
              <path
                key={ t.key }
                d={ `M ${ t.x1 } ${ t.y } Q ${ midX } ${ t.y + bow } ${ xE } ${ t.y }` }
                fill="none"
                stroke={ `url(#${ tickId })` }
                strokeWidth={ t.width }
                strokeOpacity={ t.opacity }
              />
            );
          }) }

          {/* 입체 상승 기포 (액체 영역, 최상단) */}
          { hasBubbles && (
            <g clipPath={ `url(#${ fluidClip })` }>
              { BUBBLES.map((b) => {
                const cy = BOTTOM_Y - b.r - 4;
                return (
                  <Box
                    key={ b.cx }
                    component="g"
                    sx={ {
                      opacity: 0,
                      animation: `${ rise } ${ b.dur }s linear infinite`,
                      animationDelay: `${ b.delay }s`,
                      '@media (prefers-reduced-motion: reduce)': { animation: 'none', opacity: 0.5 },
                    } }
                  >
                    <circle cx={ b.cx } cy={ cy } r={ b.r } fill={ `url(#${ bubbleId })` } />
                    <circle cx={ b.cx } cy={ cy } r={ b.r } fill="none" stroke="#FFFFFF" strokeWidth="0.5" strokeOpacity="0.4" />
                    <circle cx={ b.cx - b.r * 0.36 } cy={ cy - b.r * 0.4 } r={ Math.max(0.7, b.r * 0.3) } fill="#FFFFFF" opacity="0.95" />
                  </Box>
                );
              }) }
            </g>
          ) }
        </g>

        {/* 유리관 테두리(선명) */}
        <rect x={ X0 } y={ TOP_Y } width={ X1 - X0 } height={ INNER_H } rx={ RX } ry={ RX } fill="none" stroke={ glassInk } strokeWidth="1.4" />
      </Box>
    </Box>
  );
});

export { SubstanceSyringe };
