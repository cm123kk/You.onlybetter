import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { SubstanceLogo } from '../../common/ui/SubstanceLogo.jsx';
import { LipsVideoWall } from './LipsVideoWall.jsx';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 터치/모바일(coarse pointer) — iOS는 paused video seek 프레임 미렌더(스크럽 깨짐) + 무거운 SVG melt 필터에 GPU 질식.
 *  이 경우 인젝션 영상은 루프 재생, melt 필터는 경량 blur로 대체. */
const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

/** 영화 노른자 씬 소프트 블루 — 전환(handoff)에서 배경이 이 색으로 안→밖 확산 */
const BLUE = '#87C1E0';

/** 인트로 활성화 스크립트 기본값 (욕망 3연은 LipsVideoWall 비트가 담당하므로 제외).
 *  `at` = 그 라인이 stamp되는 진행도(안무 표 기준). 립스 비트(0.20~0.34) 전후로 배치.
 *  한 비트가 여러 줄이어도 됨 — text에 \n 사용 시 줄바꿈으로 렌더 */
const DEFAULT_LINES = [
  { text: 'HAVE YOU EVER DREAMT…', at: 0.10 },
  { text: '…OF A BETTER VERSION\nOF YOURSELF?', at: 0.22 },
  // ── 립스 → TV 월 욕망 비트 (0.33~0.49) : LipsVideoWall 가 "Younger./More beautiful./More perfect." 담당 ──
  //    (립스 구간 동안 스크립트는 자동 숨김 → "better version"은 립스 전에만 보이고 이후엔 안 나옴)
  { text: 'ONE SINGLE INJECTION\nUNLOCKS YOUR DNA.', at: 0.63 },
  { text: 'THIS IS THE SUBSTANCE.', at: 0.82, isDing: true },
  // ※ 이후 라인(YOU ARE THE MATRIX / YOU JUST HAVE TO SHARE / YOU. ARE. ONE.)은 인트로에서 제거 —
  //   HOW IT WORKS 페이즈 설명 카피로 이전 예정.
];

/**
 * IntroLogoBleed 컴포넌트
 *
 * The Substance 인트로 오프닝. 흰 배경 + 검은 ◗◗ 로고로 시작해, 부모가 주는 progress(0~1)로
 * 로고 중심에서 검정이 원형으로 배경 전체에 번져(로고 블리드) #0A0A0A로 전환된다. 배경이
 * 검어진 뒤 활성화 스크립트가 형광 그린(secondary.main)으로 한 줄씩 빠르게 순차 stamp된다
 * (누적, 비삭제). 블리드 완료 시 흰색 소형 로고가 좌상단(GNB 자리)에 등장한다.
 *
 * 동작 방식:
 * 1. 애니메이션 값은 progress에서 파생(useState 미사용), 전환은 CSS transition으로 처리.
 * 2. 블리드는 radial-gradient 하드스톱 원판(반경 = bleed·100%)으로 종횡비 무관하게 전체를 덮는다.
 * 3. 각 라인은 진행도 임계값을 넘으면 blur→선명·아래→위로 stamp(reduced-motion에선 opacity만).
 * 4. 라인 리빌·블리드 완료는 side effect로 콜백(onLineReveal/onBleedComplete) — 사운드/GNB 연동용.
 *
 * Props:
 * @param {number} progress - 인트로 진행도 0~1 (부모 scrollProgress 파생) [Optional, 기본값: 0]
 * @param {number} meltProgress - 마지막 라인 녹아내림 진행도 0~1 (외부 handoff 구동). null이면 progress tail(0.86~1.0)로 자체 산출 [Optional, 기본값: null]
 * @param {Array} lines - 활성화 스크립트 라인 목록 { text, at, isDing } (at=stamp 진행도, 없으면 균등분포) [Optional, 기본값: 내장 4줄(THIS IS THE SUBSTANCE.로 종료)]
 * @param {number} bleedEnd - 블리드가 완료되는 진행도 지점 [Optional, 기본값: 0.18]
 * @param {number} logoSize - 시작 중앙 로고 크기(px) [Optional, 기본값: 96]
 * @param {boolean} hasGnbLogo - 블리드 완료 시 좌상단 흰 로고 노출 [Optional, 기본값: true]
 * @param {boolean} hasLipsBeat - 립스→TV월 욕망 비트 삽입 여부 [Optional, 기본값: true]
 * @param {number} lipsStart - 립스 비트 시작 진행도 [Optional, 기본값: 0.20]
 * @param {number} lipsMultiplyEnd - 멀티플라이(풀 TV월) 완료 진행도 [Optional, 기본값: 0.28]
 * @param {number} lipsEnd - 립스 비트 페이드아웃 완료 진행도 [Optional, 기본값: 0.34]
 * @param {function} onLineReveal - 라인 stamp 시 호출 (index, line) [Optional]
 * @param {function} onLipsStep - 립스 욕망 3연 단계 진입 시 호출 (index, 사운드 stinger) [Optional]
 * @param {function} onBleedComplete - 블리드 완료 시 1회 호출 [Optional]
 * @param {object} sx - 루트 컨테이너 추가 스타일 [Optional]
 *
 * Example usage:
 * <IntroLogoBleed progress={ scrollProgress } onLineReveal={ (i) => audio.stinger() } onLipsStep={ (i) => audio.stinger(i) } />
 */
const IntroLogoBleed = forwardRef(function IntroLogoBleed({
  progress = 0,
  meltProgress = null,
  bluePhase = 0,
  bleedColor = BLUE, // 전환 수렴 색(기본 블루). App에서 '#0A0A0A' 주면 검정으로 마감
  lines = DEFAULT_LINES,
  bleedEnd = 0.18,
  logoSize = 96,
  hasGnbLogo = true,
  hasLipsBeat = true,
  lipsStart = 0.33,
  lipsMultiplyEnd = 0.55,
  lipsEnd = 0.58,
  hasInjectionBeat = true,
  injectionVideoSrc = '/video/ink-diffusion.mp4',
  injectionStart = 0.60,
  injectionEnd = 0.80,
  onLineReveal,
  onLipsStep,
  onBleedComplete,
  sx,
  ...props
}, ref) {
  const p = clamp01(progress);
  const bleed = clamp01(p / bleedEnd);

  /** 라인별 리빌 임계값 — line.at 있으면 그 값, 없으면 블리드 이후 균등 분포 */
  const thresholds = useMemo(() => {
    const start = bleedEnd * 0.7;
    const end = 0.97;
    const n = Math.max(1, lines.length);
    return lines.map((line, i) => (
      typeof line.at === 'number' ? line.at : start + ((i + 0.5) / n) * (end - start)
    ));
  }, [lines, bleedEnd]);

  /** 립스 비트 직후 첫 라인 진행도 — 그 전까지 스크립트를 숨겨 립스 월과 겹치지 않게 */
  const postLipsAt = useMemo(() => {
    const after = thresholds.filter((t) => t > lipsStart);
    return after.length ? Math.min(...after) : lipsEnd;
  }, [thresholds, lipsStart, lipsEnd]);

  const activeCount = thresholds.reduce((acc, t) => (p >= t ? acc + 1 : acc), 0);
  const bleedDone = bleed >= 1;

  /** 립스 비트: 로컬 progress(0.20→0.28), 페이드(0.20 in / 0.28→0.34 out), 창 밖이면 언마운트 */
  const lipsActive = hasLipsBeat && p >= lipsStart - 0.05 && p <= lipsEnd + 0.02;
  const lipsLocal = clamp01((p - lipsStart) / Math.max(1e-4, lipsMultiplyEnd - lipsStart));
  const lipsFadeIn = clamp01((p - lipsStart) / 0.015);
  const lipsFadeOut = 1 - clamp01((p - lipsMultiplyEnd) / Math.max(1e-4, lipsEnd - lipsMultiplyEnd));
  const lipsOpacity = lipsFadeIn * lipsFadeOut;
  /** 립스 비트 노출 구간엔 그린 스크립트 숨김(겹침 방지) */
  const scriptsHidden = hasLipsBeat && p >= lipsStart && p < postLipsAt;

  /** 인젝션 비트: 잉크 확산 영상 풀블리드 배경 (ONE SINGLE INJECTION 구간). 페이드 인/아웃 + 스크럽 */
  const injectionActive = hasInjectionBeat && p >= injectionStart - 0.03 && p <= injectionEnd + 0.03;
  const injIn = clamp01((p - injectionStart) / 0.05);
  const injOut = 1 - clamp01((p - (injectionEnd - 0.08)) / 0.08);
  const injectionOpacity = injIn * injOut;
  /** 스크롤로 영상 재생 위치 스크럽 — 텍스트 등장과 확산이 동기 */
  const injLocal = clamp01((p - injectionStart) / Math.max(1e-4, injectionEnd - injectionStart));
  const injVideoRef = useRef(null);
  const [coarse] = useState(isCoarsePointer);
  useEffect(() => {
    const v = injVideoRef.current;
    if (!v || !injectionActive) return;
    // 모바일: 스크럽(seek) 대신 재생 — iOS는 paused seek 프레임을 안 그려 배경영상이 검게 멈춤
    if (coarse) { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); return; }
    const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 5;
    try { v.currentTime = injLocal * dur * 0.985; } catch { /* not seekable yet */ }
  }, [injLocal, injectionActive, coarse]);

  /** 리빌·블리드 완료 트리거(중복 방지) — side effect */
  const firedRef = useRef({ lines: 0, bleed: false });
  useEffect(() => {
    const st = firedRef.current;
    if (activeCount > st.lines) {
      for (let i = st.lines; i < activeCount; i += 1) {
        if (typeof onLineReveal === 'function') onLineReveal(i, lines[i]);
      }
    }
    st.lines = activeCount;
    if (bleedDone && !st.bleed && typeof onBleedComplete === 'function') onBleedComplete();
    st.bleed = bleedDone;
  }, [activeCount, bleedDone, lines, onLineReveal, onBleedComplete]);

  // 블리드: 검은 ◗◗ 로고 자체가 화면 가득 커져 배경이 됨(별도 원 아님, ease-out으로 빠르게).
  // 로고 틈(네거티브 스페이스)까지 확실히 메우도록 배경색을 흰→#0A0A0A로 함께 보간.
  const bleedEased = 1 - (1 - bleed) ** 2;
  const logoScale = 1 + bleedEased * 60;
  const bgT = clamp01((bleedEased - 0.35) / 0.55);
  const bgV = Math.round(255 + (10 - 255) * bgT);
  const gnbOpacity = clamp01((bleedEased - 0.7) / 0.3);
  // GNB 로고 색: 검은 배경에선 흰색, 배경이 블루로 물들면 검정으로 보간(파란 배경 위 고대비)
  const gnbT = clamp01((bluePhase - 0.5) / 0.3);
  const gnbLogoColor = `rgb(${ Math.round(245 - 235 * gnbT) }, ${ Math.round(245 - 235 * gnbT) }, ${ Math.round(240 - 230 * gnbT) })`;
  // 립스 숨김 구간엔 현재 라인을 없앰(-1) → "better version"이 미리 페이드아웃되어,
  // 립스 종료 후 컨테이너가 다시 보일 때 잔상으로 깜빡이지 않음.
  const currentIndex = scriptsHidden ? -1 : activeCount - 1;

  // 마지막 라인 녹아내림(melt) — 외부 meltProgress(handoff)가 있으면 그걸로, 없으면 progress tail로.
  // 앞 6%는 pause(정지) 후 50% 구간에 걸쳐 gooey 세로 드립으로 처지고 흘러내림.
  const meltId = useId().replace(/:/g, '');
  const meltStart = 0.86;
  const meltP = meltProgress != null
    ? clamp01((meltProgress - 0.06) / 0.5)
    : clamp01((p - meltStart) / (1 - meltStart));
  const lastIndex = lines.length - 1;

  // 녹는 텍스트 색 전이(형광초록→블루) — 파랑 경계선이 아래→위로 차오름. meltP↑ → blueLine이 위로(음수까지)
  // 가 되어 글자 전체가 파랑. (blueLine 위쪽=초록, 아래쪽=파랑)
  const blueLine = 130 - meltP * 160;
  // 배경 전환 — "파랗게 물든 글자 자체"가 팽창(dilate)해 잉크처럼 번져 배경이 된다(원 아님, 글자에서 확산).
  const floodP = clamp01((bluePhase - 0.3) / 0.6); // 씬 끝(≈0.9)에 완료 → 완료 직후 곧바로 노른자로(빈 블루 최소)
  const flood = floodP * floodP; // ease-in
  // 배경색을 검정→bleedColor로 수렴 — 팽창이 못 덮은 모서리까지 같은 색으로 채워 경계 없이 마감
  const bgBlueT = clamp01((bluePhase - 0.4) / 0.5);
  const bcHex = bleedColor.replace('#', '');
  const bcR = parseInt(bcHex.slice(0, 2), 16);
  const bcG = parseInt(bcHex.slice(2, 4), 16);
  const bcB = parseInt(bcHex.slice(4, 6), 16);
  const bgR = Math.round(bgV + (bcR - bgV) * bgBlueT);
  const bgG = Math.round(bgV + (bcG - bgV) * bgBlueT);
  const bgB = Math.round(bgV + (bcB - bgV) * bgBlueT);
  const bgColor = `rgb(${ bgR }, ${ bgG }, ${ bgB })`;

  return (
    <Box
      ref={ ref }
      sx={ {
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        backgroundColor: bgColor,
        ...sx,
      } }
      { ...props }
    >
      {/* 녹아내림+번짐 필터 — HTML 텍스트에 filter: url(#meltId)로 적용.
          초반(meltP): gooey 세로 드립으로 제자리에서 녹음. 후반(flood): blur를 크게 키우고 alpha를 강하게
          dilate → 파랗게 물든 글자가 잉크처럼 크게 번져 배경을 뒤덮는다(글자가 배경을 전환). */}
      { meltP > 0.001 && !coarse && (
        <Box
          component="svg"
          aria-hidden="true"
          width="0"
          height="0"
          sx={ { position: 'absolute', width: 0, height: 0 } }
        >
          <defs>
            <filter id={ meltId } x="-90%" y="-90%" width="280%" height="280%" colorInterpolationFilters="sRGB">
              <feTurbulence type="fractalNoise" baseFrequency={ `0.011 ${ 0.006 + meltP * 0.004 }` } numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale={ meltP * 80 + flood * 55 } xChannelSelector="R" yChannelSelector="G" result="disp" />
              <feMorphology in="disp" operator="dilate" radius={ flood * flood * 130 } result="grown" />
              <feGaussianBlur in="grown" stdDeviation={ `${ 0.4 + meltP * 1.4 + flood * 12 } ${ 0.4 + meltP * 7 + flood * 14 }` } result="soft" />
              <feColorMatrix in="soft" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 13 -4" />
            </filter>
          </defs>
        </Box>
      ) }

      {/* 로고 블리드 — 검은 ◗◗ 로고 자체가 중앙에서 화면 가득 커져 배경이 됨(배경색도 함께 검어짐).
          CSS scale(비트맵 확대→픽셀 깨짐) 대신 size를 키워 인라인 SVG를 벡터로 재렌더 → 항상 크리스프.
          전환(bluePhase)에서 배경이 블루로 수렴하면 검은 로고가 드러나므로 미리 페이드아웃(블리드 후엔 불필요). */}
      <Box
        aria-hidden="true"
        sx={ {
          position: 'absolute',
          top: '50%',
          left: '50%',
          zIndex: 1,
          // 모바일: 로고를 900px로 '한 번만' 렌더하고 CSS transform scale(GPU)로 확대 — 매 프레임 거대 SVG
          //   재래스터화(멈춤/끊김) 제거. scale 상한 2.4배(=2160px)로 iOS 텍스처 한계(4096px) 이내 유지.
          //   (bg도 검정으로 수렴하므로 로고가 전 픽셀을 덮지 않아도 전환이 깨끗)
          transform: coarse
            ? `translate(-50%, -50%) scale(${ Math.min(2.4, (logoSize * logoScale) / 900) })`
            : 'translate(-50%, -50%)',
          willChange: coarse ? 'transform' : undefined,
          lineHeight: 0,
          opacity: 1 - clamp01((bluePhase - 0.1) / 0.3),
        } }
      >
        <SubstanceLogo size={ coarse ? 900 : Math.round(logoSize * logoScale) } color="#0A0A0A" hasSplitOnHover={ false } />
      </Box>

      {/* 립스 → TV 월 욕망 비트 — 풀블리드, 로컬 progress로 단일→멀티플라이, 3연 stamp(내장) */}
      { lipsActive && (
        <Box
          aria-hidden={ lipsOpacity <= 0 }
          sx={ {
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            opacity: lipsOpacity,
            pointerEvents: 'none',
            transition: 'opacity 0.2s linear',
          } }
        >
          <LipsVideoWall progress={ lipsLocal } onStep={ onLipsStep } />
        </Box>
      ) }

      {/* 인젝션 비트 — 형광 그린 잉크가 검은 물에 확산하는 영상 풀블리드 배경(ONE SINGLE INJECTION 구간) */}
      { injectionActive && injectionVideoSrc && (
        <Box
          component="video"
          ref={ injVideoRef }
          aria-hidden="true"
          src={ injectionVideoSrc }
          muted
          playsInline
          preload="auto"
          { ...(coarse ? { autoPlay: true, loop: true } : {}) }
          onLoadedMetadata={ (e) => {
            const v = e.currentTarget;
            const dur = Number.isFinite(v.duration) && v.duration > 0 ? v.duration : 5;
            try { v.currentTime = injLocal * dur * 0.985; } catch { /* noop */ }
          } }
          sx={ {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
            opacity: injectionOpacity,
            pointerEvents: 'none',
            transition: 'opacity 0.2s linear',
          } }
        />
      ) }

      {/* 활성화 스크립트 — 형광 그린, 한 번에 한 줄만(교체). 아래에서 올라와 선명 → 위로 빠져나감 */}
      <Box
        sx={ {
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          opacity: scriptsHidden ? 0 : 1,
          transition: 'opacity 0.3s ease',
        } }
      >
        { lines.map((line, i) => {
          const isCurrent = i === currentIndex;
          const isPassed = i < currentIndex;
          const isMelting = isCurrent && i === lastIndex && meltP > 0.001;
          return (
            <Box
              key={ line.text }
              sx={ {
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 3,
                transformOrigin: 'center top',
                ...(isMelting ? {
                  // 제자리에서 gooey로 녹으며 초록→파랑으로 물들고, 후반엔 팽창해 배경이 됨(배경색이 블루로 수렴해 이음새 없음).
                  // flood 완료(배경=블루 수렴)에 맞춰 텍스트 요소를 완전히 페이드아웃 → 반투명 블루가 배경 위에 겹쳐
                  // 남는 "진한 블루 블롭/사각형" 잔상 제거.
                  opacity: 1 - clamp01((floodP - 0.55) / 0.45),
                  // 모바일은 무거운 turbulence/displacement/morphology 필터 대신 경량 blur(GPU 질식 방지)
                  filter: coarse ? `blur(${ 1 + floodP * 6 }px)` : `url(#${ meltId })`,
                  transform: 'none',
                  transition: 'none',
                } : {
                  opacity: isCurrent ? 1 : 0,
                  filter: isCurrent ? 'blur(0px)' : 'blur(9px)',
                  transform: isCurrent ? 'translateY(0)' : `translateY(${ isPassed ? -18 : 18 }px)`,
                  transition: 'opacity 0.4s ease, filter 0.4s ease, transform 0.4s ease',
                }),
                willChange: 'opacity, filter, transform',
                '@media (prefers-reduced-motion: reduce)': {
                  filter: 'none',
                  transform: 'none',
                  transition: 'opacity 0.25s ease',
                },
              } }
            >
              <Typography
                variant="h2"
                sx={ {
                  textAlign: 'center',
                  color: 'secondary.main',
                  lineHeight: 1.0,
                  whiteSpace: 'pre-line',
                  fontSize: 'clamp(2.75rem, 9vw, 8rem)',
                  ...(line.isDing && { textShadow: '0 0 30px rgba(170,255,0,0.6)' }),
                  // 녹는 동안 형광초록→bleedColor 세로 그라데이션. 경계선이 아래→위로 차오름
                  ...(isMelting && {
                    color: 'transparent',
                    background: `linear-gradient(180deg, #AAFF00 ${ blueLine - 35 }%, ${ bleedColor } ${ blueLine }%)`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: 'none',
                  }),
                } }
              >
                { line.text }
              </Typography>
            </Box>
          );
        }) }
      </Box>

      {/* GNB 흰 로고 — 배경이 검어지며 좌상단 등장(이후 상시) */}
      { hasGnbLogo && (
        <Box
          sx={ {
            position: 'absolute',
            top: 24,
            left: 24,
            zIndex: 3,
            opacity: gnbOpacity,
            transition: 'opacity 0.4s ease',
          } }
        >
          <SubstanceLogo size={ 44 } color={ gnbLogoColor } hasSplitOnHover={ false } />
        </Box>
      ) }
    </Box>
  );
});

export { IntroLogoBleed };
