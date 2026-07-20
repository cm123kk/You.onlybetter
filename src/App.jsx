import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { defaultTheme as theme } from './styles/themes';
import { IntroLogoBleed } from './components/scroll';
import { SubstanceHowItWorks } from './components/templates/SubstanceHowItWorks.jsx';
import { useScrollProgress } from './utils/substance/useScrollProgress';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 배경 사운드 소스 — WAV(인코더 패딩 없음)로 루프 이음새 매끈하게. 후보 교체: youth-magic ↔ youth-retro ↔ youth-cm7-arp */
const PULSE_SRC = '/audio/substance/bass-pulse-loop.wav';
const YOUTH_SRC = '/audio/substance/youth-magic-loop.wav';
const INJECTION_SRC = '/audio/substance/injection-river.wav'; // 인젝션 비트 수중 dispersion 베드
const DING_SRC = '/audio/substance/ding-long.wav'; // THIS IS THE SUBSTANCE 계시의 종 — 단일 긴 딩~~(반복 아님)
const LIPS_START = 0.33; // 이 진행도(립스월)부터 youth 레이어 인 (IntroLogoBleed lipsStart와 동일)
const INJECTION_START = 0.48; // 인젝션 비트(ONE SINGLE INJECTION) 사운드 인 (IntroLogoBleed injectionStart와 동일)

/**
 * 인트로 랜딩 — 긴 스크롤 섹션(750vh)을 sticky 풀뷰포트 IntroLogoBleed가 통과 진행도로 구동.
 *
 * 사운드(스크롤 위치 구동):
 * - 로고 정지(progress≈0): 무음
 * - 스크롤 시작(로고 커짐·텍스트): **펄스만** 페이드인
 * - 립스월(progress≥LIPS_START): **youth arp** 추가
 * 오디오는 브라우저 정책상 첫 유효 제스처(클릭/키/터치)에서 unlock되며, 이후 볼륨은 progress로 게이팅.
 */
/** 통합 씬(인트로 750vh + 전환 150vh = 900vh) 중 전환(handoff)이 시작되는 지점.
 *  전환은 컴팩트하게 — 텍스트 녹아 파랑으로 번져 배경 전환까지 짧게 이어 노른자로 빠르게 넘어감 */
const HANDOFF_START = 750 / 900;

function IntroLanding() {
  const sceneRef = useRef(null);
  const worksRef = useRef(null);
  const { progress: sceneProgress } = useScrollProgress(sceneRef);
  const { progress: worksProgress } = useScrollProgress(worksRef);
  // 인트로 라인/블리드 구동(0~1) — 씬 앞 79%에 압축 / 전환(melt·블루·바·헤더) 구동(0~1) — 뒤 21%
  const introPhase = clamp01(sceneProgress / HANDOFF_START);
  const handoffPhase = clamp01((sceneProgress - HANDOFF_START) / (1 - HANDOFF_START));
  // 사운드 게이팅은 인트로 진행도 기준(립스월 타이밍 유지)
  const progress = introPhase;
  const pulseRef = useRef(null);
  const youthRef = useRef(null);
  const injectionRef = useRef(null);
  const dingRef = useRef(null);
  const dingFiredRef = useRef(false);
  const interactedRef = useRef(false);
  const soundOnRef = useRef(true);
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);

  // 무음(muted)으로 미리 autoplay(정책 허용) → 첫 제스처(스크롤 포함)에 언뮤트.
  // 브라우저는 "재생 시작"엔 클릭/키가 필요하지만, 이미 재생 중인 요소의 언뮤트는 휠/스크롤에도 허용 →
  // 토글 안 건드려도 스크롤에 소리가 살아난다.
  useEffect(() => {
    const pulse = new Audio(PULSE_SRC);
    pulse.loop = true;
    pulse.muted = true;
    pulse.volume = 0;
    const youth = new Audio(YOUTH_SRC);
    youth.loop = true;
    youth.muted = true;
    youth.volume = 0;
    const injection = new Audio(INJECTION_SRC);
    injection.loop = true;
    injection.muted = true;
    injection.volume = 0;
    const ding = new Audio(DING_SRC);
    ding.loop = false; // 단일 딩 — 반복 없이 1회 재생
    ding.muted = true;
    ding.volume = 0;
    pulseRef.current = pulse;
    youthRef.current = youth;
    injectionRef.current = injection;
    dingRef.current = ding;
    const layers = [pulse, youth, injection, ding];

    const kick = () => {
      layers.forEach((a) => { const p = a.play(); if (p && p.catch) p.catch(() => {}); });
    };
    kick(); // muted autoplay

    const evs = ['wheel', 'scroll', 'pointerdown', 'click', 'keydown', 'touchstart'];
    const onGesture = () => {
      interactedRef.current = true;
      kick(); // 혹시 정지됐으면 재생 보장
      if (soundOnRef.current) layers.forEach((a) => { a.muted = false; });
      evs.forEach((ev) => window.removeEventListener(ev, onGesture));
    };
    evs.forEach((ev) => window.addEventListener(ev, onGesture, { passive: true }));

    return () => {
      evs.forEach((ev) => window.removeEventListener(ev, onGesture));
      layers.forEach((a) => a.pause());
      pulseRef.current = null;
      youthRef.current = null;
      injectionRef.current = null;
      dingRef.current = null;
    };
  }, []);

  // 스크롤 진행도 → 레이어 볼륨 게이팅. 가청 여부는 muted가 담당.
  //  - 펄스: 스크롤 시작~ 상시
  //  - youth arp: 립스 비트에만 (립스월 인 → 립스 종료 후 아웃)
  //  - injection(river): 인젝션 비트에만 (ONE SINGLE INJECTION 인 → THIS IS THE SUBSTANCE 전 아웃)
  //  - 딩: THIS IS THE SUBSTANCE 등장(0.80~)부터 → 텍스트 녹아 사라짐(handoff melt)과 함께 아웃
  //  - 펄스: 인트로 섹션 끝(handoff)에서 페이드아웃 → HOW IT WORKS로 넘어가면 사라짐
  useEffect(() => {
    const pulse = pulseRef.current;
    const youth = youthRef.current;
    const injection = injectionRef.current;
    const ding = dingRef.current;
    if (!pulse || !youth || !injection || !ding) return;
    const introEndOut = 1 - clamp01((handoffPhase - 0.1) / 0.5); // 전환 진행 → 인트로 사운드 아웃
    pulse.volume = clamp01((progress - 0.02) / 0.05) * introEndOut * 0.3;
    youth.volume = clamp01((progress - LIPS_START) / 0.04) * (1 - clamp01((progress - 0.49) / 0.05)) * 0.25;
    injection.volume = clamp01((progress - INJECTION_START) / 0.05) * (1 - clamp01((progress - 0.72) / 0.08)) * 0.4;
    // 딩: 0.80에서 1회만 트리거(반복 아님, 하나의 긴 딩~~). 볼륨은 melt와 함께 아웃.
    ding.volume = (1 - clamp01((handoffPhase - 0.10) / 0.55)) * 0.5;
    if (progress >= 0.80 && !dingFiredRef.current) {
      dingFiredRef.current = true;
      ding.currentTime = 0;
      const dp = ding.play(); if (dp && dp.catch) dp.catch(() => {});
    } else if (progress < 0.78) {
      dingFiredRef.current = false; // 위로 스크롤 시 재트리거 허용
    }
  }, [progress, handoffPhase]);

  const toggleSound = useCallback(() => {
    setSoundOn((v) => {
      const next = !v;
      const layers = [pulseRef.current, youthRef.current, injectionRef.current, dingRef.current].filter(Boolean);
      if (layers.length) {
        const muted = !(next && interactedRef.current);
        layers.forEach((a) => { a.muted = muted; });
        if (next) layers.forEach((a) => { const p = a.play(); if (p && p.catch) p.catch(() => {}); });
      }
      return next;
    });
  }, []);

  return (
    <>
      {/* 통합 씬 — 인트로 + 전환을 하나의 sticky 뷰포트에서 진행(스크롤 위치가 갈라지지 않게).
          인트로 마지막 "THIS IS THE SUBSTANCE"가 그 자리에서 녹아내리고(meltProgress), 그 위에
          블루 확산 + 바 응결 + HOW IT WORKS 헤더가 겹쳐 등장 → 끝 상태가 HOW IT WORKS 시작과 일치 */}
      <Box ref={sceneRef} sx={{ position: 'relative', height: '900vh', backgroundColor: '#0A0A0A' }}>
        <Box sx={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
          <IntroLogoBleed progress={introPhase} meltProgress={handoffPhase} bluePhase={handoffPhase} />
        </Box>
      </Box>

      {/* HOW IT WORKS — 주사기 배출 + 노른자 주입→분열 */}
      <Box ref={worksRef} sx={{ position: 'relative', height: '400vh' }}>
        <Box sx={{ position: 'sticky', top: 0, height: '100vh', width: '100%', overflow: 'hidden' }}>
          <SubstanceHowItWorks progress={worksProgress} />
        </Box>
      </Box>

      {/* 음소거 토글 — 우측 하단 고정, 기본 ON. 옆에 작은 SOUND ON/OFF 라벨.
          인트로 초반 흰 배경(로고)에선 진회색, 배경이 검어지면 형광 그린으로 적응 */}
      {(() => {
        const onLight = progress < 0.08; // 아직 흰 배경(로고 블리드 전)
        const onBlue = handoffPhase > 0.8; // 블루가 코너(토글 위치)까지 덮은 후 ~ HOW IT WORKS 내내
        const ink = '#08161E'; // 블루 위 고대비 다크 잉크(헤더 텍스트와 동일)
        const labelColor = onLight ? 'grey.800' : onBlue ? ink : (soundOn ? 'secondary.main' : 'grey.500');
        const accent = onLight ? '#555555' : onBlue ? ink : '#AAFF00';
        return (
          <Box
            sx={{
              position: 'fixed',
              right: 20,
              bottom: 20,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: '0.7rem',
                letterSpacing: '0.15em',
                color: labelColor,
                userSelect: 'none',
                transition: 'color 0.4s ease',
              }}
            >
              {soundOn ? 'SOUND ON' : 'SOUND OFF'}
            </Typography>
            {(() => {
              const trackColor = onLight
                ? 'rgba(0,0,0,0.14)'
                : onBlue ? 'rgba(8,22,30,0.20)' : 'rgba(255,255,255,0.16)';
              const offThumb = onLight ? '#9A9A9A' : onBlue ? 'rgba(8,22,30,0.55)' : '#7A7A7A';
              const thumbColor = soundOn ? accent : offThumb;
              return (
                <Box
                  role="switch"
                  aria-checked={soundOn}
                  aria-label="sound toggle"
                  tabIndex={0}
                  onClick={toggleSound}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleSound(); }
                  }}
                  sx={{
                    position: 'relative',
                    width: 28,
                    height: 48,
                    // 동심 라운드: 트랙 반경 = 노브 반경(7) + 여백(4) = 11 → 안팎 코너가 일치
                    borderRadius: '11px',
                    backgroundColor: trackColor,
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background-color 0.4s ease',
                    outline: 'none',
                    '&:focus-visible': { boxShadow: `0 0 0 2px ${accent}` },
                  }}
                >
                  {/* 라운드 사각 노브 — ON: 상단 / OFF: 하단 */}
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 4,
                      width: 20,
                      height: 20,
                      borderRadius: '7px',
                      backgroundColor: thumbColor,
                      top: soundOn ? 4 : 24,
                      transition: 'top 0.28s cubic-bezier(0.4,0,0.2,1), background-color 0.4s ease',
                    }}
                  />
                </Box>
              );
            })()}
          </Box>
        );
      })()}
    </>
  );
}

function HomePage() {
  return (
    <Box
      sx={{
        p: 4,
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h3" gutterBottom>
        Starter Kit
      </Typography>
      <Typography color="text.secondary">Your design system foundation</Typography>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route index element={<IntroLanding />} />
          <Route path="starter" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
