import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { defaultTheme as theme } from './styles/themes';
import { IntroLogoBleed, SubstanceHeroDuality } from './components/scroll';
import { SubstanceHowItWorks } from './components/templates/SubstanceHowItWorks.jsx';
import { SubstanceFooter } from './components/templates/SubstanceFooter.jsx';
import { ProtocolPhaseCard } from './components/card';
import { SubstanceLogo } from './common/ui/SubstanceLogo.jsx';
import { useScrollProgress } from './utils/substance/useScrollProgress';

// 스크롤 프레임마다 부모가 리렌더돼도 props(진행도)가 안 바뀌면 재렌더 스킵 → HOW IT WORKS 구간에서
// IntroLogoBleed(무거운 SVG 필터)의 불필요한 매 프레임 재렌더 제거(끊김 완화).
const IntroLogoBleedMemo = memo(IntroLogoBleed);
const SubstanceHowItWorksMemo = memo(SubstanceHowItWorks);
const SubstanceHeroDualityMemo = memo(SubstanceHeroDuality);

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 배경 사운드 소스 — WAV(인코더 패딩 없음)로 루프 이음새 매끈하게. 후보 교체: youth-magic ↔ youth-retro ↔ youth-cm7-arp */
// 사운드는 muted 자동재생이 확실히 허용되는 <video>(2x2 더미영상+오디오 mp4)로 재생 → muted로 미리
// 돌다가 스크롤 첫 제스처에 언뮤트 → "스크롤=소리"(클릭 불필요). muted <audio>는 이 브라우저가 자동재생 차단.
const PULSE_SRC = '/audio/substance/bass-pulse-loop.mp4';
const YOUTH_SRC = '/audio/substance/youth-magic-loop.mp4';
const INJECTION_SRC = '/audio/substance/injection-river.mp4'; // 인젝션 비트 수중 dispersion 베드
const DING_SRC = '/audio/substance/ding-long.mp4'; // THIS IS THE SUBSTANCE 계시의 종 — 단일 긴 딩~~(반복 아님)
// hidden 사운드 <video> 스타일 — 렌더는 되되 사실상 안 보이게. display:none/opacity:0/1px는 브라우저가
// "안 보임"으로 판단해 절전 pause할 수 있어 금지 → 실체 있는 크기 + 거의 0 opacity로 재생 유지.
const SND_SX = { position: 'fixed', width: 64, height: 64, bottom: 0, right: 0, opacity: 0.01, pointerEvents: 'none', zIndex: -1 };
const LIPS_START = 0.33; // 이 진행도(립스월)부터 youth 레이어 인 (IntroLogoBleed lipsStart와 동일)
const INJECTION_START = 0.60; // 인젝션 비트(ONE SINGLE INJECTION) 사운드 인 (IntroLogoBleed injectionStart와 동일)

/** iOS 오디오 언락 — new Audio() SFX는 사용자 제스처 안에서 1회 재생돼야 이후 프로그램 재생이 허용됨.
 *  첫 제스처에 주어진 요소들을 muted play→pause로 언락한 뒤 리스너를 뗀다. 반환값=수동 해제 함수. */
function attachAudioUnlock(elements) {
  let done = false;
  const evs = ['pointerdown', 'touchstart', 'keydown'];
  const remove = () => evs.forEach((e) => window.removeEventListener(e, unlock));
  function unlock() {
    if (done) return;
    done = true;
    elements.forEach((a) => {
      if (!a) return;
      a.muted = true;
      const p = a.play();
      if (p && p.then) p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; });
      else a.muted = false;
    });
    remove();
  }
  evs.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
  return remove;
}

/**
 * 인트로 랜딩 — 긴 스크롤 섹션(750vh)을 sticky 풀뷰포트 IntroLogoBleed가 통과 진행도로 구동.
 *
 * 사운드(스크롤 위치 구동):
 * - 로고 정지(progress≈0): 무음
 * - 스크롤 시작(로고 커짐·텍스트): **펄스만** 페이드인
 * - 립스월(progress≥LIPS_START): **youth arp** 추가
 * 오디오는 브라우저 정책상 첫 유효 제스처(클릭/키/터치)에서 unlock되며, 이후 볼륨은 progress로 게이팅.
 */
/** 통합 씬 — 인트로+전환+HOW IT WORKS를 하나의 sticky 뷰포트에서 진행(섹션 갭 없음 → 배경이 블루가 되면
 *  같은 화면에서 곧바로 노른자가 뜸). 각 구간 vh 비율로 진행도 분할. */
const INTRO_VH = 750;
const HANDOFF_VH = 90; // 인트로 melt → 검정(HERO와 동일 배경)
const HERO_VH = 900; // ★ HERO(이중자아 회전) — 인트로 다음, HOW IT WORKS 앞
const WIPE_VH = 260; // HERO(검정) → HOW IT WORKS 자연 크로스페이드(길게 → 더 부드럽게)
const WORKS_VH = 400;
const PROTOCOL_VH = 1150; // THE PROTOCOL(블루→검정 전환 + Phase 01 뜯기 + 02 소진 + 03 스위치 주입)
// 인트로+HERO+전환+HOW IT WORKS+THE PROTOCOL을 전부 하나의 sticky 씬에서 진행 → 섹션 seam 원천 제거
const SCENE_VH = INTRO_VH + HANDOFF_VH + HERO_VH + WIPE_VH + WORKS_VH + PROTOCOL_VH;
const P_HANDOFF = INTRO_VH / SCENE_VH; // 인트로 melt(→검정) 시작
const P_HERO = (INTRO_VH + HANDOFF_VH) / SCENE_VH; // HERO 시작
const P_WIPE = (INTRO_VH + HANDOFF_VH + HERO_VH) / SCENE_VH; // 검정→블루 와이프 시작
const P_WORKS = (INTRO_VH + HANDOFF_VH + HERO_VH + WIPE_VH) / SCENE_VH; // HOW IT WORKS 시작
const P_PROTO = (INTRO_VH + HANDOFF_VH + HERO_VH + WIPE_VH + WORKS_VH) / SCENE_VH; // THE PROTOCOL 시작
const PROTO_TRANS = 0.14; // protoP 이 구간까지 블루→검정 리퀴드 전환, 이후 Phase 카드들

function IntroLanding() {
  const sceneRef = useRef(null);
  const { progress: sceneProgress } = useScrollProgress(sceneRef);
  // 하나의 진행도(sceneProgress)를 구간별 분할(전부 같은 sticky → seam 없음)
  const introPhase = clamp01(sceneProgress / P_HERO); // 인트로 라인/블리드(melt까지 HERO 시작에 완료)
  const handoffPhase = clamp01((sceneProgress - P_HANDOFF) / (P_HERO - P_HANDOFF)); // 인트로 melt → 검정
  const heroP = clamp01((sceneProgress - P_HERO) / (P_WIPE - P_HERO)); // HERO 이중자아 회전
  const wipeP = clamp01((sceneProgress - P_WIPE) / (P_WORKS - P_WIPE)); // 검정→블루 와이프
  const worksP = clamp01((sceneProgress - P_WORKS) / (P_PROTO - P_WORKS)); // HOW IT WORKS
  const protoP = clamp01((sceneProgress - P_PROTO) / (1 - P_PROTO)); // THE PROTOCOL
  // THE PROTOCOL: 앞 PROTO_TRANS 구간은 블루→검정 리퀴드 전환, 이후 Phase 01 → 02 → 03 순차 크로스페이드.
  const protoTransP = clamp01(protoP / PROTO_TRANS);
  // Phase 01 ACTIVATION — 키트 뜯기, 카드 페이드 인/아웃
  const p01Kit = clamp01((protoP - 0.17) / 0.19);
  const card01Op = clamp01((protoP - 0.15) / 0.03) * (1 - clamp01((protoP - 0.38) / 0.05));
  // Phase 02 STABILIZATION — 소진 스크럽(하드컷 스냅, 번호 baked-in)
  const p02Kit = clamp01((protoP - 0.45) / 0.19);
  const card02Op = clamp01((protoP - 0.42) / 0.04) * (1 - clamp01((protoP - 0.66) / 0.05));
  // Phase 03 CONTINUATION [LOCKED] — SWITCH 코일에 그린 주입(off-frame 끝에서 관통). 부드러운 크로스페이드
  const p03Kit = clamp01((protoP - 0.74) / 0.22);
  const card03Op = clamp01((protoP - 0.70) / 0.04);
  // 사운드 게이팅은 인트로 진행도 기준(립스월 타이밍 유지)
  const progress = introPhase;
  const pulseRef = useRef(null);
  const youthRef = useRef(null);
  const injectionRef = useRef(null);
  const dingRef = useRef(null);
  const dingFiredRef = useRef(false);
  // iOS는 video.volume을 무시(볼륨 기반 페이드 무효) → 와이프를 지나면 muted로 확실히 정지시키기 위한 플래그
  const bedsSilentRef = useRef(false);
  const interactedRef = useRef(false);
  const unlockedRef = useRef(false); // 아무 제스처(스크롤 포함)라도 있으면 소리 낼 의사 있음
  const activatedRef = useRef(false); // 진짜 활성화 제스처(클릭/키/터치)만 — 브라우저가 언뮤트 허용
  const soundOnRef = useRef(true);
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);
  const [entered, setEntered] = useState(false); // 입장 게이트(ENTER) — 클릭=활성화 제스처로 소리 언락

  // ENTER — 제스처 컨텍스트 안에서 즉시 언뮤트(브라우저 정책 확실 충족) + 게이트 닫기. 이후 스크롤로 진행.
  const handleEnter = useCallback(() => {
    setEntered(true);
    unlockedRef.current = true; activatedRef.current = true; interactedRef.current = true;
    if (soundOnRef.current) {
      [pulseRef.current, youthRef.current, injectionRef.current].forEach((a) => {
        if (!a) return;
        a.muted = false;
        const p = a.play(); if (p && p.catch) p.catch(() => {});
      });
    }
  }, []);

  // 오디오는 선언적 <audio autoPlay muted>(return 하단)로 렌더 → muted 재생이 실제로 걸림(new Audio()
  // 무음 autoplay는 브라우저에서 안 걸리는 경우가 많음). 재생 중 요소의 언뮤트는 휠/스크롤에도 허용 →
  // 첫 제스처(스크롤 포함)에 pulse/youth/injection 언뮤트. 딩은 여기서 언뮤트 안 함(0.80 트리거로만).
  const setAudioMuted = useCallback((el, ref) => {
    if (el) { el.muted = true; el.volume = 0; const p = el.play(); if (p && p.catch) p.catch(() => {}); }
    ref.current = el;
  }, []);
  const setPulseEl = useCallback((el) => setAudioMuted(el, pulseRef), [setAudioMuted]);
  const setYouthEl = useCallback((el) => setAudioMuted(el, youthRef), [setAudioMuted]);
  const setInjectionEl = useCallback((el) => setAudioMuted(el, injectionRef), [setAudioMuted]);
  const setDingEl = useCallback((el) => setAudioMuted(el, dingRef), [setAudioMuted]);

  // 제스처 감지 — 의사(unlock)와 "진짜 활성화"(activated)를 구분.
  //  - wheel/scroll/touchmove: 활성화 아님 → 소리 낼 의사만(브라우저가 언뮤트 허용하면 소리, 아니면 무음 유지)
  //  - pointerdown/click/keydown/touchstart: 진짜 활성화 → 브라우저가 언뮤트를 확실히 허용
  useEffect(() => {
    const anyEvs = ['wheel', 'scroll', 'touchmove'];
    const actEvs = ['pointerdown', 'click', 'keydown', 'touchstart'];
    const onAny = () => { unlockedRef.current = true; interactedRef.current = true; };
    const onAct = () => {
      unlockedRef.current = true; activatedRef.current = true; interactedRef.current = true;
      // ★ 제스처 핸들러 컨텍스트 안에서 즉시 언뮤트+재생 → 브라우저가 확실히 허용(setInterval 밖 언뮤트는 취약).
      //   이후 첫 클릭/탭/키 한 번이면 소리 확정(스크롤만으로는 정책상 언뮤트 불가).
      if (soundOnRef.current) {
        [pulseRef.current, youthRef.current, injectionRef.current].forEach((a) => {
          if (!a) return;
          a.muted = false;
          const p = a.play(); if (p && p.catch) p.catch(() => {});
        });
      }
    };
    anyEvs.forEach((ev) => window.addEventListener(ev, onAny, { passive: true }));
    actEvs.forEach((ev) => window.addEventListener(ev, onAct, { passive: true }));
    return () => {
      anyEvs.forEach((ev) => window.removeEventListener(ev, onAny));
      actEvs.forEach((ev) => window.removeEventListener(ev, onAct));
    };
  }, []);

  // ★ 단일 관리자(single writer) — muted/play를 여기서만 제어. 250ms 자가치유로 레이스·깜빡임 제거.
  //  wantSound = 제스처 있었고 && soundOn. 언뮤트했는데 브라우저가 재생 거부(활성화 없는 언뮤트)하면
  //  무음으로라도 계속 재생 유지 → "있었다 없었다" 방지(진짜 클릭/키 한 번이면 소리 확정).
  useEffect(() => {
    const sync = () => {
      const wantSound = unlockedRef.current && soundOnRef.current;
      // bedsSilent: 인트로 베드(펄스/youth/injection)를 확실히 무음화(iOS 볼륨 무시 대응). 와이프 지나면 true.
      const wantMuted = !wantSound || bedsSilentRef.current;
      [pulseRef.current, youthRef.current, injectionRef.current].forEach((a) => {
        if (!a) return;
        if (a.muted !== wantMuted) a.muted = wantMuted;
        if (a.paused) {
          const p = a.play();
          if (p && p.catch) p.catch(() => {
            // 언뮤트 재생이 거부됐고 아직 진짜 활성화 전이면 → 무음 재생으로 폴백(안정)
            if (!wantMuted && !activatedRef.current) { a.muted = true; const q = a.play(); if (q && q.catch) q.catch(() => {}); }
          });
        }
      });
    };
    sync();
    const id = setInterval(sync, 250);
    return () => clearInterval(id);
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
    // 펄스: 인트로 시작~HERO까지 "끊김 없이 연속" 재생. 0으로 안 떨어지고 인트로 0.3 → HERO 0.14로 부드럽게,
    // HERO 끝(와이프)에서만 페이드아웃. (playbackRate 조작 없음 → 타임스트레치 지지직 없음)
    const pulseRampIn = clamp01((progress - 0.02) / 0.05); // 로고 정지 구간만 무음, 스크롤 시작하면 인
    const pulseBase = heroP > 0 ? 0.07 : (0.3 - 0.23 * handoffPhase); // 인트로 0.3 → handoff 0.3→0.07 → HERO 0.07(낮게)
    const pulseEndFade = 1 - clamp01((wipeP - 0.15) / 0.55); // HERO 끝 와이프에서 페이드아웃
    pulse.volume = pulseRampIn * pulseBase * pulseEndFade;
    // 와이프를 지나면 인트로 베드 확실히 무음(iOS 볼륨 무시 대응) — sync 루프가 muted로 반영. 위로 되돌리면 해제.
    bedsSilentRef.current = wipeP >= 0.85;
    youth.volume = clamp01((progress - LIPS_START) / 0.04) * (1 - clamp01((progress - 0.55) / 0.05)) * 0.25;
    injection.volume = clamp01((progress - INJECTION_START) / 0.05) * (1 - clamp01((progress - 0.72) / 0.08)) * 0.4;
    // 딩: 0.80에서 1회만 트리거(반복 아님, 하나의 긴 딩~~). 볼륨은 melt와 함께 아웃.
    ding.volume = (1 - clamp01((handoffPhase - 0.10) / 0.55)) * 0.5;
    if (progress >= 0.80 && !dingFiredRef.current) {
      dingFiredRef.current = true;
      ding.currentTime = 0;
      ding.muted = !soundOnRef.current; // 이 순간에만 언뮤트(로고 구간엔 muted 유지)
      const dp = ding.play(); if (dp && dp.catch) dp.catch(() => {});
    } else if (progress < 0.78) {
      dingFiredRef.current = false; // 위로 스크롤 시 재트리거 허용
    }
  }, [progress, handoffPhase, heroP, wipeP]);

  // SFX (HOW IT WORKS 섹션) — worksProgress 윈도우 기반. 구간에 들어오면 1회 재생, 벗어나면 즉시 pause
  // (긴 파일이 다음 단계로 새지 않게). soundOn OFF나 구간 이탈 시 정지.
  //  - squish(철퍽): 노른자 등장 순간만 (텍스트 리빌 전 0.09에 끊김)
  //  - inject(big bubble): 인젝션 시작 순간만, 볼륨 낮게(분열음이 묻히지 않게)
  //  - split(egg/cell split): 분열 구간, 분열 완료(0.9)에 정지
  const worksSfxRef = useRef(null);
  useEffect(() => {
    const mk = (src, vol) => { const a = new Audio(src); a.preload = 'auto'; a.volume = vol; return a; };
    const items = {
      squish: { a: mk('/audio/substance/yolk-squelch.mp3', 0.55), start: 0.02, end: 0.09, fired: false },
      inject: { a: mk('/audio/substance/injection-bubble.mp3', 0.3), start: 0.32, end: 0.5, fired: false },
      split: { a: mk('/audio/substance/division-splat.mp3', 0.65), start: 0.68, end: 0.96, fired: false },
    };
    worksSfxRef.current = items;
    const detachUnlock = attachAudioUnlock(Object.values(items).map((o) => o.a)); // iOS 언락
    return () => {
      detachUnlock();
      Object.values(items).forEach((o) => o.a.pause());
      worksSfxRef.current = null;
    };
  }, []);
  useEffect(() => {
    const s = worksSfxRef.current;
    if (!s) return;
    const canPlay = soundOn && interactedRef.current;
    Object.values(s).forEach((o) => {
      if (worksP >= o.start && worksP < o.end) {
        if (!o.fired && canPlay) { o.fired = true; o.a.currentTime = 0; const pr = o.a.play(); if (pr && pr.catch) pr.catch(() => {}); }
      } else if (worksP >= o.end) {
        o.fired = true; // 구간 통과 — 재생 안 함
        o.a.pause(); // 긴 파일이 다음 단계로 새지 않게 정지
      } else {
        o.fired = false; // 구간 이전(되돌림) — 다시 울릴 수 있게 리셋
        o.a.pause();
      }
    });
  }, [worksP, soundOn]);

  // HERO 보이스오버 — 스크롤 임계점을 지나면 자르지 않고 큐에 쌓고, 한 라인이 끝나면 다음 라인 재생.
  // → 스크롤 속도와 무관하게 모든 라인이 끝까지 순차로 다 나옴(겹침/스킵 없음). 위로 되돌리면 리셋해 재트리거.
  const heroVoRef = useRef(null);
  const voQueueRef = useRef([]);
  const voPlayingRef = useRef(false);
  const playNextVo = useCallback(() => {
    if (voPlayingRef.current) return; // 재생 중이면 대기(끝나면 ended가 다음 호출)
    const q = voQueueRef.current;
    if (!q.length) return;
    const a = q.shift();
    voPlayingRef.current = true;
    a.currentTime = 0;
    const p = a.play(); if (p && p.catch) p.catch(() => { voPlayingRef.current = false; });
  }, []);
  useEffect(() => {
    const mk = (src) => { const a = new Audio(src); a.preload = 'auto'; a.volume = 0.18; return a; };
    const items = [
      { a: mk('/hero/vo/vo1.mp3'), trigger: 0.14, reset: 0.10, fired: false }, // 헤드라인 stamp 직후
      { a: mk('/hero/vo/vo2.mp3'), trigger: 0.30, reset: 0.26, fired: false }, // 회전 초·중반
      { a: mk('/hero/vo/vo3.mp3'), trigger: 0.60, reset: 0.56, fired: false }, // 회전 후반(남성 전이)
    ];
    const onEnded = () => { voPlayingRef.current = false; playNextVo(); };
    items.forEach((o) => o.a.addEventListener('ended', onEnded));
    heroVoRef.current = items;
    const detachUnlock = attachAudioUnlock(items.map((o) => o.a)); // iOS 언락
    return () => {
      detachUnlock();
      items.forEach((o) => { o.a.removeEventListener('ended', onEnded); o.a.pause(); });
      voQueueRef.current = [];
      voPlayingRef.current = false;
      heroVoRef.current = null;
    };
  }, [playNextVo]);
  useEffect(() => {
    const items = heroVoRef.current;
    if (!items) return;
    // 소리 OFF: 전부 정지 + 큐 비움
    if (!soundOn) {
      items.forEach((o) => o.a.pause());
      voQueueRef.current = [];
      voPlayingRef.current = false;
      return;
    }
    // 인트로 맨 위로 되돌아오면 전 라인 리셋(다음 입장 시 처음부터 다시)
    if (heroP <= 0) { items.forEach((o) => { o.fired = false; }); return; }
    const canPlay = interactedRef.current;
    items.forEach((o) => {
      if (heroP >= o.trigger) {
        if (!o.fired && canPlay) {
          o.fired = true;
          if (!voQueueRef.current.includes(o.a)) voQueueRef.current.push(o.a); // 자르지 않고 큐잉
          playNextVo();
        }
      } else if (heroP < o.reset) {
        o.fired = false; // 위로 되돌림 — 재트리거 허용
      }
    });
  }, [heroP, soundOn, playNextVo]);

  // THE PROTOCOL SFX — 각 Phase 키트 애니메이션 시작 구간에서 원샷(protoP 기준).
  //  - protocol-1(포장 필름 뜯기): Phase 01 개봉 스크럽(p01Kit 활성 ≈ 0.17~0.36)
  //  - protocol-2(내용물 소진/석션): Phase 02 소진 스크럽(p02Kit 활성 ≈ 0.45~0.64)
  //  - protocol-3(액체 코일 주입): Phase 03 주입 스크럽(p03Kit 활성 ≈ 0.74~0.96)
  const protoSfxRef = useRef(null);
  const protoIdleRef = useRef(null);
  useEffect(() => {
    const mk = (src, vol) => { const a = new Audio(src); a.preload = 'auto'; a.volume = vol; return a; };
    const items = {
      // peel: 클립이 0.6s로 짧아 스크럽하면 되감김으로 끊김 → 원샷(진입 시 1회).
      peel: { a: mk('/audio/substance/protocol-1.mp3', 0.6), start: 0.17, end: 0.42, scrub: false, fired: false },
      // drain/inject: 긴 클립을 스크롤에 매핑. seek 대신 playbackRate로 부드럽게 추종(지지직 방지).
      drain: { a: mk('/audio/substance/protocol-2.mp3', 0.6), start: 0.45, end: 0.68, scrub: true, fired: false },
      // Phase 3는 protocol-3.mp3 가운데 구간 추출 + 저역 드론 배경음 제거한 protocol-3-clean.mp3 사용
      inject: { a: mk('/audio/substance/protocol-3-clean.mp3', 0.6), start: 0.74, end: 0.99, scrub: true, fired: false },
    };
    protoSfxRef.current = items;
    const detachUnlock = attachAudioUnlock(Object.values(items).map((o) => o.a)); // iOS 언락
    return () => {
      detachUnlock();
      Object.values(items).forEach((o) => o.a.pause());
      if (protoIdleRef.current) clearTimeout(protoIdleRef.current);
      protoSfxRef.current = null;
    };
  }, []);
  useEffect(() => {
    const s = protoSfxRef.current;
    if (!s) return;
    const canPlay = soundOn && interactedRef.current;
    let anyScrubActive = false;
    Object.values(s).forEach((o) => {
      const inside = protoP >= o.start && protoP < o.end;
      if (inside && canPlay) {
        if (o.scrub) {
          // 스크럽: 구간 진행도(0~1)를 재생 위치에 매핑하되, seek가 아니라 playbackRate로 추종.
          // 재생이 목표보다 앞서면 느리게(<1), 뒤처지면 빠르게(>1) → 스크롤 속도에 부드럽게 늘어남.
          anyScrubActive = true;
          const dur = o.a.duration;
          if (dur && isFinite(dur)) {
            const frac = (protoP - o.start) / (o.end - o.start);
            const target = Math.max(0, Math.min(dur - 0.03, frac * dur));
            const drift = target - o.a.currentTime;
            if (Math.abs(drift) > 1.0) { o.a.currentTime = target; o.a.playbackRate = 1; } // 큰 점프(재진입)만 seek
            else { o.a.playbackRate = Math.max(0.5, Math.min(1.8, 1 + drift * 4)); } // 미세 추종
          }
          if (o.a.paused) { const pr = o.a.play(); if (pr && pr.catch) pr.catch(() => {}); }
        } else if (!o.fired) {
          // 원샷(짧은 포장음): 진입 시 1회. 구간 이탈 시 fired 리셋 → 위·아래 재진입마다 다시.
          o.fired = true; o.a.currentTime = 0; o.a.playbackRate = 1;
          const pr = o.a.play(); if (pr && pr.catch) pr.catch(() => {});
        }
      } else if (!inside) {
        // 구간 밖(위/아래 모두) → 정지 + 처음으로 되감기 → 재진입 시 처음부터.
        if (!o.a.paused) o.a.pause();
        o.a.currentTime = 0; o.a.playbackRate = 1; o.fired = false;
      }
    });
    // 스크롤 정지 감지: 이 effect는 protoP가 변할 때(=스크롤 중)만 재실행된다. 잠시 갱신이 없으면
    // 스크롤이 멈춘 것 → 스크럽 사운드만 정지(재생 헤드 그 자리에 멈춤). 원샷은 자연히 끝나게 둔다.
    if (protoIdleRef.current) clearTimeout(protoIdleRef.current);
    if (anyScrubActive) {
      protoIdleRef.current = setTimeout(() => {
        const cur = protoSfxRef.current;
        if (cur) Object.values(cur).forEach((o) => { if (o.scrub && !o.a.paused) o.a.pause(); });
      }, 140);
    }
  }, [protoP, soundOn]);

  const toggleSound = useCallback(() => {
    // 토글 클릭 = 진짜 활성화 제스처 → 이후 언뮤트 확정. loop muted/play는 single-writer sync가 반영.
    activatedRef.current = true;
    unlockedRef.current = true;
    setSoundOn((v) => {
      const next = !v;
      if (dingRef.current) dingRef.current.muted = !next; // 딩은 sync 밖 → 여기서 직접 반영
      return next;
    });
  }, []);

  // SKIP INTRO — HERO 시작 지점으로 스크롤. 클릭 자체가 오디오 unlock 제스처도 됨.
  const skipIntro = useCallback(() => {
    const el = sceneRef.current;
    if (!el) return;
    const scrollable = el.offsetHeight - window.innerHeight;
    const target = el.offsetTop + P_HERO * scrollable + 4;
    window.scrollTo({ top: target, behavior: 'smooth' });
  }, []);

  return (
    <>
      {/* 선언적 muted autoplay 오디오 — new Audio()보다 무음 재생이 실제로 걸림(→스크롤 언뮤트 작동) */}
      {/* 사운드 = 오디오만 담은 mp4를 hidden <video>로. display:none은 자동재생 차단 가능성 → 1px opacity 0 */}
      <Box component="video" ref={setPulseEl} src={PULSE_SRC} loop autoPlay muted playsInline preload="auto" sx={SND_SX} />
      <Box component="video" ref={setYouthEl} src={YOUTH_SRC} loop autoPlay muted playsInline preload="auto" sx={SND_SX} />
      <Box component="video" ref={setInjectionEl} src={INJECTION_SRC} loop autoPlay muted playsInline preload="auto" sx={SND_SX} />
      <Box component="video" ref={setDingEl} src={DING_SRC} autoPlay muted playsInline preload="auto" sx={SND_SX} />

      {/* 입장 게이트 — ENTER(아웃라인, 소리 언락 후 스크롤 안내로 전환) + SKIP INTRO(텍스트 클릭, 히어로 점프) */}
      {(() => {
        const onLight = progress < 0.08; // 흰 배경(로고)
        const gateOp = clamp01(1 - progress / 0.05); // 스크롤 시작하면 페이드아웃
        const introOn = introPhase < 0.98;
        const faint = onLight ? 'rgba(10,10,10,0.55)' : 'rgba(245,245,240,0.6)';
        const line = onLight ? 'rgba(10,10,10,0.28)' : 'rgba(245,245,240,0.32)';
        const strong = onLight ? '#0A0A0A' : '#F5F5F0';
        return (
          <>
            {gateOp > 0.01 && (
              !entered ? (
                <Box
                  component="button"
                  onClick={handleEnter}
                  sx={{
                    position: 'fixed', left: '50%', bottom: '13%', transform: 'translateX(-50%)', zIndex: 9,
                    px: 3, py: 1, borderRadius: '999px', border: '1px solid', borderColor: line,
                    backgroundColor: 'transparent', color: faint, cursor: 'pointer',
                    fontFamily: '"Bebas Neue", sans-serif', fontSize: '0.92rem', letterSpacing: '0.16em',
                    opacity: gateOp, transition: 'opacity 0.3s ease, color 0.35s ease, border-color 0.35s ease',
                    '&:hover': { color: strong, borderColor: strong },
                  }}
                >
                  ENTER
                </Box>
              ) : (
                <Typography
                  component="div"
                  sx={{
                    position: 'fixed', left: '50%', bottom: '14%', transform: 'translateX(-50%)', zIndex: 9,
                    fontSize: '0.72rem', letterSpacing: '0.18em', color: faint, opacity: gateOp,
                    userSelect: 'none', pointerEvents: 'none', transition: 'opacity 0.3s ease, color 0.4s ease',
                  }}
                >
                  SCROLL TO ACTIVATE
                </Typography>
              )
            )}
            {introOn && (
              <Box
                component="button"
                onClick={skipIntro}
                sx={{
                  position: 'fixed', left: '50%', bottom: '6%', transform: 'translateX(-50%)', zIndex: 9,
                  border: 'none', backgroundColor: 'transparent', color: faint, cursor: 'pointer', p: 0.5,
                  fontFamily: '"Bebas Neue", sans-serif', fontSize: '0.74rem', letterSpacing: '0.12em',
                  opacity: 0.55, textDecoration: 'none',
                  transition: 'opacity 0.3s ease, color 0.4s ease',
                  '&:hover': { opacity: 0.95, color: strong },
                }}
              >
                SKIP INTRO
              </Box>
            )}
          </>
        );
      })()}
      {/* GNB 로고 — 블리드 완료 후 좌상단 고정(상시). 그린 ◗◗(검정·흰 배경 모두 가시). 인트로→히어로 사라짐/재등장 없음 */}
      <Box sx={{ position: 'fixed', top: { xs: 20, md: 36 }, left: { xs: 20, md: 44 }, zIndex: 20, opacity: clamp01((introPhase - 0.08) / 0.06), pointerEvents: 'none' }}>
        <SubstanceLogo size={44} color="secondary.main" hasSplitOnHover={false} />
      </Box>

      {/* GNB CTA — 우상단 고정, HERO 진입부터 상시 노출(형광 그린 pill). heroP로 페이드인 후 이후 구간 계속 유지 */}
      <Box
        component="button"
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 30 },
          right: { xs: 20, md: 44 },
          zIndex: 20,
          opacity: clamp01(heroP / 0.05),
          pointerEvents: heroP > 0 ? 'auto' : 'none',
          cursor: 'pointer',
          appearance: 'none',
          border: 'none',
          borderRadius: '6px',
          backgroundColor: 'secondary.main',
          color: '#0A0A0A',
          px: { xs: 1.75, md: 2.5 },
          py: { xs: 0.75, md: 1 },
          fontFamily: '"Bebas Neue", sans-serif',
          fontSize: { xs: '0.85rem', md: '1rem' },
          letterSpacing: '0.14em',
          lineHeight: 1,
          whiteSpace: 'nowrap',
          transition: 'filter 0.25s ease, opacity 0.4s ease',
          '&:hover': { filter: 'brightness(1.12)' },
        }}
      >
        UNLOCK YOUR POTENTIAL
      </Box>

      {/* 통합 씬 — 인트로 + 전환 + HOW IT WORKS + THE PROTOCOL을 전부 하나의 sticky 뷰포트에서 진행.
          섹션을 나누지 않으므로 사이에 죽은 중간 영역(seam)이 생기지 않는다. works(블루)에서 THE PROTOCOL로
          같은 화면에서 이어짐: 블루 액체가 배수되며 검정 노출 → 검정 위 Phase 01 키트 뜯기. */}
      <Box ref={sceneRef} sx={{ position: 'relative', height: `${SCENE_VH}vh`, backgroundColor: '#0A0A0A' }}>
        <Box sx={{ position: 'sticky', top: 0, height: '100dvh', width: '100%', overflow: 'hidden' }}>
          {/* 인트로 — melt는 검정으로 수렴(HERO와 동일 배경). 블루 아님. GNB 로고는 App 레벨 고정으로 대체(중복 방지) */}
          <IntroLogoBleedMemo progress={introPhase} meltProgress={handoffPhase} bluePhase={handoffPhase} bleedColor="#0A0A0A" hasGnbLogo={false} />
          {/* HERO — 이중자아 회전(검정). 인트로 다음, 와이프 전까지 표시 */}
          {heroP > 0 && wipeP < 1 && (
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 2 }}>
              <SubstanceHeroDualityMemo progress={heroP} rotationStart={0.06} rotationEnd={0.94} />
            </Box>
          )}
          {/* HERO(검정) → HOW IT WORKS(흰) 자연 크로스페이드 — works가 smoothstep으로 부드럽게 페이드인 */}
          {wipeP > 0 && (
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 4, opacity: wipeP * wipeP * (3 - 2 * wipeP) }}>
              <SubstanceHowItWorksMemo progress={worksP} />
            </Box>
          )}
          {/* THE PROTOCOL 오버레이 — 같은 sticky 안. HOW IT WORKS → 검정으로 자연 페이드(리퀴드 마블 제거) →
              검정 위에서 Phase 01 ACTIVATION 키트가 스크롤로 뜯김(protoKitP). */}
          {protoP > 0 && (
            <Box sx={{ position: 'absolute', inset: 0, zIndex: 5 }}>
              {/* 검정 배경 페이드 인 — works(흰) 위로 검정이 자연스럽게 차오름 */}
              <Box sx={{ position: 'absolute', inset: 0, zIndex: 1, backgroundColor: '#0A0A0A', opacity: clamp01(protoTransP / 0.6) }} />
              {/* THE PROTOCOL 섹션 타이틀 — 상단 절대배치(카드가 못 밀어 안 잘림). 흰색, 검정 정착과 함께 등장 */}
              <Typography
                variant="overline"
                sx={{
                  position: 'absolute', top: { xs: 60, md: 84 }, left: 0, right: 0, zIndex: 3,
                  textAlign: 'center', color: '#F5F5F0', letterSpacing: '0.34em',
                  opacity: clamp01((protoTransP - 0.8) / 0.14), pointerEvents: 'none',
                }}
              >
                THE PROTOCOL
              </Typography>
              {/* Phase 카드 영역 — 타이틀 아래 중앙. Phase 01(뜯기) → Phase 02(소진) 순차 크로스페이드 */}
              {card01Op > 0 && (
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: 4 }, pt: { xs: 13, md: 16 }, pb: { xs: 3, md: 4 }, opacity: card01Op }}>
                  <ProtocolPhaseCard
                    phaseId="01"
                    label="ACTIVATION"
                    body="ONE ACTIVATION. AND THE BETTER YOU WAKES — YOUNGER, SHARPER, THE VERSION YOU ALWAYS KNEW WAS IN THERE. ADMINISTERED ONCE. YOURS, FOREVER."
                    kitFrames={['/kit/activator-f1.png', '/kit/activator-f2.png', '/kit/activator-f3.png', '/kit/activator-f4.png']}
                    scrollProgress={p01Kit}
                    sx={{ width: '100%', maxWidth: 1320, maxHeight: '100%' }}
                  />
                </Box>
              )}
              {card02Op > 0 && (
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: 4 }, pt: { xs: 13, md: 16 }, pb: { xs: 3, md: 4 }, opacity: card02Op }}>
                  <ProtocolPhaseCard
                    phaseId="02"
                    label="STABILIZATION"
                    body="SEVEN DAYS. SEVEN DOSES. THE RHYTHM THAT KEEPS YOU BOTH. FEED THE MATRIX, FEED THE OTHER SELF — HOLD THE BALANCE."
                    kitFrames={['/kit/stabilizer-f1.png', '/kit/stabilizer-f2.png', '/kit/stabilizer-f3.png', '/kit/stabilizer-f4.png']}
                    scrollProgress={p02Kit}
                    kitFrameSnap
                    sx={{ width: '100%', maxWidth: 1320, maxHeight: '100%' }}
                  />
                </Box>
              )}
              {card03Op > 0 && (
                <Box sx={{ position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2, md: 4 }, pt: { xs: 13, md: 16 }, pb: { xs: 3, md: 4 }, opacity: card03Op }}>
                  <ProtocolPhaseCard
                    phaseId="03"
                    label="CONTINUATION"
                    body="BEYOND THE SEVENTH DAY, THE PROTOCOL CONTINUES ON ITS OWN. A NEW KIT ARRIVES AT YOUR DOORSTEP EVERY WEEK — UNTIL YOU DECIDE TO TERMINATE THE SERVICE."
                    kitFrames={['/kit/switch-f1.png', '/kit/switch-f2.png', '/kit/switch-f3.png', '/kit/switch-f4.png']}
                    scrollProgress={p03Kit}
                    hasRailLine={false}
                    sx={{ width: '100%', maxWidth: 1320, maxHeight: '100%' }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* 푸터 — THE PROTOCOL 씬 다음. 검은 허공에 뜬 USB 드라이브 영상(멀리서 회전하며 다가와 줌인)이
          뷰포트에 들어오면 처음부터 1회 재생. 영상은 이미 1.5배속으로 인코딩됨(setpts). */}
      <SubstanceFooter videoSrc="/video/usb-drive.mp4" />

      {/* 음소거 토글 — 우측 하단 고정, 기본 ON. 옆에 작은 SOUND ON/OFF 라벨.
          인트로 초반 흰 배경(로고)에선 진회색, 배경이 검어지면 형광 그린으로 적응 */}
      {(() => {
        const onLight = progress < 0.08; // 아직 흰 배경(로고 블리드 전)
        const onBlue = handoffPhase > 0.8 && protoTransP < 0.4; // 블루 구간에만 다크 잉크(검정 전환되면 다시 그린)
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
        minHeight: '100dvh',
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
