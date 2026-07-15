import { useCallback, useEffect, useRef, useState } from 'react';

import { SAMPLE_MANIFEST } from './substanceAudioAssets';

/**
 * useSubstanceAudio - 하이브리드(샘플 + Web Audio 합성) 사운드 엔진
 *
 * 영화의 유기적 사운드(수중/버블/인젝션/막)는 순수 합성으로 도달 불가 →
 * 저작권 프리(CC0) 실제 녹음 샘플을 우선 사용하고, 파일이 없으면 합성으로 폴백한다.
 * 톤 계열(드론 L1 · 딩 L5)은 합성 유지. 파일은 public/audio/substance/ 에 배치.
 *
 * 레이어:
 * - L1 베이스 드론(합성): 40→55Hz + 미세 디튠 비팅. 스크롤 진행도로 주파수 상승 + 그린 구간 펄스.
 * - L2 세포막 스트레칭(샘플→합성폴백): 끈적한 늘어남.
 * - L3 분열 임팩트(샘플→합성폴백): 습하고 육중한 파열(+합성 킥 보강).
 * - L4 액체 버블링(샘플 루프→합성 스케줄러 폴백): 수중 점성 기포. 탭 백그라운드 시 정지.
 * - L5 딩~ 시그니처(합성): 저역 벨, 임상적 비팅. pitchDown 변형.
 * - 인젝션(샘플→합성폴백): "주사액이 물에 퍼짐" — 수중 lowpass dispersion(뾱 아님).
 *
 * 제약: AudioContext는 사용자 제스처(토글 ON) 후에만 생성/resume. 앰비언트는 ambientGain 경유
 * → Phase 03 침묵 시 덕킹, 60Hz 형광등 허밍만 잔류. visibilitychange로 버블 정지(배터리).
 *
 * @param {React.RefObject<number>} progressRef - 스크롤 진행도 ref(드론 주파수 구동) [Optional]
 * @param {object} options - 설정 [Optional]
 * @param {boolean} options.initialEnabled - 초기 활성 여부 [Optional, 기본값: false]
 * @returns {object} { isEnabled, isReady, toggle, setEnabled, triggerDing, triggerStretch, triggerSplit, triggerInjection, triggerCharge, setPhaseSilence }
 *
 * Example usage:
 * const audio = useSubstanceAudio(progressRef);
 * // <Switch checked={audio.isEnabled} onChange={audio.toggle} />
 * // audio.triggerInjection();
 */
export function useSubstanceAudio(progressRef, { initialEnabled = false } = {}) {
  const [isEnabled, setIsEnabled] = useState(initialEnabled);
  const [isReady, setIsReady] = useState(false);

  const ctxRef = useRef(null);
  const nodesRef = useRef(null);
  const noiseRef = useRef(null);
  const buffersRef = useRef({});
  const samplesStartedRef = useRef(false);
  const bubbleTimerRef = useRef(null);
  const bubbleLoopRef = useRef(null);
  const bubbleGenRef = useRef(0); // 스케줄러 세대 — 이전 체인 무효화(겹침 방지)
  const driveRafRef = useRef(null);
  const silencedRef = useRef(false);
  const pulseMutedRef = useRef(false); // [진단] 펄스 레이어 뮤트
  const enabledRef = useRef(initialEnabled);

  /** 현재 오디오 시각 */
  const now = () => (ctxRef.current ? ctxRef.current.currentTime : 0);

  /** 흰 노이즈 버퍼(1회 생성, 스트레칭/분열/인젝션 폴백 재사용) */
  const getNoise = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return null;
    if (noiseRef.current) return noiseRef.current;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    noiseRef.current = buffer;
    return buffer;
  }, []);

  /** 오디오 그래프 지연 생성(제스처 후 1회) */
  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // ambient(드론/펄스/버블) → ambientGain → master (Phase 침묵 시 덕킹 대상)
    const ambientGain = ctx.createGain();
    ambientGain.gain.value = 1;
    ambientGain.connect(master);

    // L1 드론: 살짝 디튠된 두 사인 → lowpass
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 160;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.14;
    droneFilter.connect(droneGain);
    droneGain.connect(ambientGain);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 40;
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 40.4;
    osc1.connect(droneFilter);
    osc2.connect(droneFilter);
    osc1.start();
    osc2.start();

    // 그린 구간 펄스 베이스
    const pulseOsc = ctx.createOscillator();
    pulseOsc.type = 'triangle';
    pulseOsc.frequency.value = 55;
    const pulseGain = ctx.createGain();
    pulseGain.gain.value = 0;
    pulseOsc.connect(pulseGain);
    pulseGain.connect(ambientGain);
    pulseOsc.start();

    // 형광등 허밍(60Hz) — 평소 무음, Phase 침묵 시만 등장 (master 직결)
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sawtooth';
    humOsc.frequency.value = 60;
    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'bandpass';
    humFilter.frequency.value = 120;
    humFilter.Q.value = 8;
    const humGain = ctx.createGain();
    humGain.gain.value = 0;
    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(master);
    humOsc.start();

    nodesRef.current = {
      master, ambientGain, droneFilter, droneGain, osc1, osc2, pulseGain, humGain,
    };
    return ctx;
  }, []);

  /** CC0 샘플 로드(fetch → decode). 실패(404 등)는 조용히 건너뜀 → 합성 폴백 */
  const loadSamples = useCallback(async (ctx) => {
    if (samplesStartedRef.current) return;
    samplesStartedRef.current = true;
    await Promise.all(Object.entries(SAMPLE_MANIFEST).map(async ([key, cfg]) => {
      try {
        const res = await fetch(cfg.url);
        if (!res.ok) return;
        const arr = await res.arrayBuffer();
        const buf = await ctx.decodeAudioData(arr);
        buffersRef.current[key] = buf;
      } catch {
        // 파일 없음/디코드 실패 → 합성 폴백 유지
      }
    }));
    console.log('[substance-audio] 샘플 로드 결과:', Object.keys(buffersRef.current), '(비어있으면 파일 404 → 서버 재시작 필요)');
  }, []);

  /** 버퍼 1회 재생 헬퍼 */
  const playBuffer = useCallback((key, { destination, gain = 1, rate = 1 } = {}) => {
    const ctx = ctxRef.current;
    const buf = buffersRef.current[key];
    if (!ctx || !buf) return null;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.playbackRate.value = rate;
    const g = ctx.createGain();
    g.gain.value = gain;
    src.connect(g);
    g.connect(destination || nodesRef.current.master);
    src.start();
    src.stop(ctx.currentTime + buf.duration / rate + 0.05);
    return { src, g };
  }, []);

  /** 합성 버블 1개(폴백 스케줄러 + 인젝션 클러스터 공용) */
  const synthBubble = useCallback((t) => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes) return;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const f0 = 240 + Math.random() * 460;
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.exponentialRampToValueAtTime(f0 * 1.8, t + 0.08);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(g);
    g.connect(nodes.ambientGain);
    osc.start(t);
    osc.stop(t + 0.14);
  }, []);

  /**
   * 합성 "블롭" 1개 — 점성 있는 단일 물방울(부우웁…).
   * 팔레트의 물방울 샘플이 전부 짧은 fizz(부르르)라 느린 단발이 불가능 → 직접 합성.
   * 저역 사인이 살짝 올랐다 툭 떨어지고 lowpass로 잠긴다. 완전 제어 → 느림 100% 보장.
   */
  const synthGloop = useCallback((t) => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes) return;
    const f0 = 90 + Math.random() * 70; // 90~160Hz 저역
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.linearRampToValueAtTime(f0 * 1.5, t + 0.06); // 물방울 상승
    osc.frequency.exponentialRampToValueAtTime(f0 * 0.7, t + 0.42); // 툭 떨어짐
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 700; // 잠긴 톤(고역 없음)
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.connect(lp);
    lp.connect(g);
    g.connect(nodes.ambientGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }, []);

  // ── L4: 버블링 — 합성 "블롭"을 느린 간격으로 (샘플은 전부 fizz라 미사용) ──
  const stopBubbles = useCallback(() => {
    bubbleGenRef.current += 1; // 진행 중인 모든 스케줄러 체인 무효화
    if (bubbleTimerRef.current) {
      clearTimeout(bubbleTimerRef.current);
      bubbleTimerRef.current = null;
    }
    if (bubbleLoopRef.current) {
      try {
        bubbleLoopRef.current.src.stop();
      } catch {
        // 이미 정지됨
      }
      bubbleLoopRef.current = null;
    }
  }, []);

  const startBubbles = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes || !enabledRef.current) return;
    stopBubbles();
    const gen = bubbleGenRef.current; // 이 체인의 세대 — 바뀌면 즉시 종료

    // 합성 "블롭"을 느린 간격(3~5.5s)으로 하나씩. 팔레트 물방울 샘플은 전부 짧은 fizz라
    // 재생속도를 낮춰도 "빠른 기포"로 들려 미사용. 합성은 완전 제어라 느림 100% 보장.
    const schedule = () => {
      if (gen !== bubbleGenRef.current) return; // 겹친 옛 체인 → 종료
      if (!enabledRef.current || document.hidden || silencedRef.current) {
        bubbleTimerRef.current = setTimeout(schedule, 800);
        return;
      }
      synthGloop(now());
      console.log('[substance-audio] 💧 gloop @', Math.round(performance.now()), 'gen', gen);
      bubbleTimerRef.current = setTimeout(schedule, 3000 + Math.random() * 2500);
    };
    bubbleTimerRef.current = setTimeout(schedule, 600);
  }, [stopBubbles, synthGloop]);

  // ── L5: 딩~ 시그니처 — 영화 실제 딩 샘플 우선, 합성 폴백 ───────────
  const triggerDing = useCallback(({ pitchDown = false } = {}) => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes || !enabledRef.current) return;

    // 샘플(영화 딩) 우선. pitchDown = 재생속도 하강(dematerialized voice)
    if (playBuffer('ding', { destination: nodes.master, gain: 0.9, rate: pitchDown ? 0.6 : 1 })) {
      return;
    }

    // 합성 폴백: 저역 벨 + 임상적 비팅
    const t = now();
    const base = pitchDown ? 294 : 440; // D4 / A4

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = pitchDown ? 1300 : 2200;
    const bus = ctx.createGain();
    bus.gain.value = 1;
    lp.connect(bus);
    bus.connect(nodes.master);

    const partials = [
      { mult: 1, gain: 0.16 },
      { mult: 2.01, gain: 0.06 },
      { mult: 3.86, gain: 0.02 },
    ];
    partials.forEach(({ mult, gain }) => {
      [0, 7].forEach((cents, di) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base * mult, t);
        osc.detune.setValueAtTime(cents, t);
        if (pitchDown) {
          osc.frequency.exponentialRampToValueAtTime(base * mult * 0.5, t + 2.6);
        }
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        // 완만한 attack(0.04s): 날카로운 트랜지언트 제거 → "알림/경보"가 아니라
        // 피어오르는 사원의 종. startle(놀람) 반사를 줄여 도망이 아닌 몰입으로.
        g.gain.linearRampToValueAtTime(gain / (di + 1), t + 0.04);
        // 긴 tail(2.8s): 의식적 잔향 = 계시의 무게.
        g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
        osc.connect(g);
        g.connect(lp);
        osc.start(t);
        osc.stop(t + 2.9);
      });
    });
  }, [playBuffer]);

  // ── L2: 세포막 스트레칭 — 샘플 우선, 합성 폴백 ─────────────────
  const triggerStretch = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes || !enabledRef.current) return;
    if (playBuffer('stretch', { destination: nodes.ambientGain, gain: 0.8 })) return;
    const buffer = getNoise();
    if (!buffer) return;
    const t = now();
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(200, t);
    bp.frequency.exponentialRampToValueAtTime(1400, t + 1.5);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.08, t + 0.4);
    g.gain.linearRampToValueAtTime(0, t + 1.5);
    src.connect(bp);
    bp.connect(g);
    g.connect(nodes.ambientGain);
    src.start(t);
    src.stop(t + 1.6);
  }, [getNoise, playBuffer]);

  // ── L3: 분열 임팩트 — 샘플(+합성 킥 보강) 또는 합성 폴백 ─────────
  const triggerSplit = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes || !enabledRef.current) return;
    const t = now();
    const hasSample = !!playBuffer('split', { destination: nodes.master, gain: 0.9 });

    // 저역 킥은 샘플 유무와 무관하게 보강(육중함)
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(34, t + 0.15);
    const og = ctx.createGain();
    og.gain.setValueAtTime(hasSample ? 0.18 : 0.3, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(og);
    og.connect(nodes.master);
    osc.start(t);
    osc.stop(t + 0.2);

    if (hasSample) return;
    // 합성 폴백: 습한 노이즈 버스트
    const buffer = getNoise();
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 900;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    src.connect(lp);
    lp.connect(g);
    g.connect(nodes.master);
    src.start(t);
    src.stop(t + 0.16);
  }, [getNoise, playBuffer]);

  // ── 인젝션 — "주사액이 물에 퍼짐": 수중 lowpass dispersion ─────────
  const triggerInjection = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes || !enabledRef.current) return;
    const t = now();

    // 수중 버스: highpass 60 + lowpass 1100 → 먹먹하게 잠긴 질감
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 60;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 1100;
    hp.connect(lp);
    lp.connect(nodes.master);

    // 추가 submerged 베드: "Underwater Yell" 앰비언스 — 강한 lowpass(360Hz) + 피치다운(0.8x)
    // 으로 목소리(yell) 명료도를 제거하고 잠긴 톤만 얹는다. 인젝션 순간(~2.5s)만 페이드로 사용.
    const subBuf = buffersRef.current.injectionSubmerge;
    if (subBuf) {
      const s = ctx.createBufferSource();
      s.buffer = subBuf;
      s.playbackRate.value = 0.8;
      const shp = ctx.createBiquadFilter();
      shp.type = 'highpass';
      shp.frequency.value = 40;
      const slp = ctx.createBiquadFilter();
      slp.type = 'lowpass';
      slp.frequency.value = 360;
      const sg2 = ctx.createGain();
      sg2.gain.setValueAtTime(0, t);
      sg2.gain.linearRampToValueAtTime(0.45, t + 0.15);
      sg2.gain.exponentialRampToValueAtTime(0.0001, t + 2.5);
      s.connect(shp);
      shp.connect(slp);
      slp.connect(sg2);
      sg2.connect(nodes.master);
      s.start(t);
      s.stop(t + 2.6);
    }

    const sample = playBuffer('injection', { destination: hp, gain: 0.95 });

    if (!sample) {
      // 합성 폴백: 노이즈 whoosh(하강 스윕) = 액체 퍼짐 + 버블 클러스터
      const buffer = getNoise();
      if (buffer) {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        const sweep = ctx.createBiquadFilter();
        sweep.type = 'lowpass';
        sweep.frequency.setValueAtTime(1400, t);
        sweep.frequency.exponentialRampToValueAtTime(300, t + 1.3);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.16, t + 0.12);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.8);
        src.connect(sweep);
        sweep.connect(hp);
        src.start(t);
        src.stop(t + 1.9);
      }
      // 물에 퍼지는 기포 다발
      for (let i = 0; i < 16; i += 1) {
        synthBubble(t + 0.05 + Math.random() * 1.5);
      }
    }

    // 공용: 액체 밀림 저역 스웰(퍼짐의 질량감)
    const swell = ctx.createOscillator();
    swell.type = 'sine';
    swell.frequency.setValueAtTime(70, t);
    swell.frequency.exponentialRampToValueAtTime(38, t + 0.6);
    const sg = ctx.createGain();
    sg.gain.setValueAtTime(0.0001, t);
    sg.gain.linearRampToValueAtTime(0.2, t + 0.1);
    sg.gain.exponentialRampToValueAtTime(0.001, t + 0.9);
    swell.connect(sg);
    sg.connect(nodes.master);
    swell.start(t);
    swell.stop(t + 1);
  }, [getNoise, playBuffer, synthBubble]);

  // ── CTA hover: 미세 충전음(상승 톤) ───────────────────────────
  const triggerCharge = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes || !enabledRef.current) return;
    const t = now();
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.18);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.04, t + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    osc.connect(g);
    g.connect(nodes.master);
    osc.start(t);
    osc.stop(t + 0.22);
  }, []);

  // ── Phase 03: 앰비언트 침묵 + 형광등 허밍 ─────────────────────
  const setPhaseSilence = useCallback((on) => {
    const ctx = ctxRef.current;
    const nodes = nodesRef.current;
    if (!ctx || !nodes) return;
    silencedRef.current = !!on;
    const t = now();
    const ramp = on ? 0.05 : 0.3;
    nodes.ambientGain.gain.cancelScheduledValues(t);
    nodes.ambientGain.gain.setValueAtTime(nodes.ambientGain.gain.value, t);
    nodes.ambientGain.gain.linearRampToValueAtTime(on ? 0 : 1, t + ramp);
    nodes.humGain.gain.cancelScheduledValues(t);
    nodes.humGain.gain.setValueAtTime(nodes.humGain.gain.value, t);
    nodes.humGain.gain.linearRampToValueAtTime(on ? 0.06 : 0, t + ramp);
  }, []);

  const setEnabled = useCallback((next) => setIsEnabled(next), []);
  const toggle = useCallback(() => setIsEnabled((prev) => !prev), []);

  // [진단] 레이어별 on/off — 랩 UI 버튼용. "빠른 소리" 범인 격리에 사용.
  const setDroneEnabled = useCallback((on) => {
    const n = nodesRef.current;
    if (n) n.droneGain.gain.value = on ? 0.14 : 0;
  }, []);
  const setPulseEnabled = useCallback((on) => {
    pulseMutedRef.current = !on;
  }, []);
  const setBubbleEnabled = useCallback((on) => {
    if (on) startBubbles(); else stopBubbles();
  }, [startBubbles, stopBubbles]);

  // 활성/비활성 전환: 마스터 페이드 + 샘플 로드 + 버블 + 첫 딩~
  useEffect(() => {
    enabledRef.current = isEnabled;

    if (!isEnabled) {
      const nodes = nodesRef.current;
      const ctx = ctxRef.current;
      if (ctx && nodes) {
        const t = ctx.currentTime;
        nodes.master.gain.cancelScheduledValues(t);
        nodes.master.gain.setValueAtTime(nodes.master.gain.value, t);
        nodes.master.gain.linearRampToValueAtTime(0, t + 0.1);
      }
      stopBubbles();
      return undefined;
    }

    const ctx = ensureContext();
    if (!ctx) return undefined;
    if (ctx.state === 'suspended') ctx.resume();
    const nodes = nodesRef.current;
    const t = ctx.currentTime;
    nodes.master.gain.cancelScheduledValues(t);
    nodes.master.gain.setValueAtTime(nodes.master.gain.value, t);
    nodes.master.gain.linearRampToValueAtTime(1, t + 0.3);
    queueMicrotask(() => setIsReady(true));

    startBubbles(); // 샘플 로드 전엔 합성 폴백으로 시작
    loadSamples(ctx).then(() => {
      if (enabledRef.current) startBubbles(); // 로드되면 샘플 루프로 교체
    });

    // [진단용] 레이어별 on/off 스위치 — 콘솔에서 껐다 켜며 "빠른 소리" 범인 격리
    window.__sfx = {
      drone: (on = true) => { const n = nodesRef.current; if (n) n.droneGain.gain.value = on ? 0.14 : 0; console.log('[sfx] drone', on); },
      pulse: (on = true) => { pulseMutedRef.current = !on; console.log('[sfx] pulse', on); },
      bubble: (on = true) => { if (on) startBubbles(); else stopBubbles(); console.log('[sfx] bubble', on); },
      master: (v = 1) => { const n = nodesRef.current; if (n) n.master.gain.value = v; console.log('[sfx] master', v); },
    };
    // Storybook iframe 컨텍스트 혼란 방지 — 상위 창에도 노출(같은 오리진)
    try { if (window.top && window.top !== window) window.top.__sfx = window.__sfx; } catch { /* cross-origin */ }
    console.log('[sfx] 진단 준비됨 → 콘솔에 __sfx.drone(false) / __sfx.pulse(false) / __sfx.bubble(false) 를 하나씩 입력해, 빠른 소리가 사라지는 게 무엇인지 확인');

    // 첫 활성화 = 드론 + 버블 페이드인만. 딩은 "부팅음"이 아니라 계시의 종 —
    // 소비자(랜딩)가 서사 비트("This is the Substance." 등)에서 triggerDing()을 직접 호출.
    // 첫 진입에 자동 딩을 치지 않는 이유: 의미에 붙지 않은 딩은 알림/에러음처럼 들리고,
    // 디폴트 ON에서 유저가 처음 듣는 소리가 되어 첫인상을 해친다.
    return undefined;
  }, [isEnabled, ensureContext, loadSamples, startBubbles, stopBubbles]);

  // 스크롤 진행도 → 드론 주파수(40→55Hz) + 그린 구간 펄스
  useEffect(() => {
    if (!isEnabled) return undefined;
    const loop = () => {
      const nodes = nodesRef.current;
      const ctx = ctxRef.current;
      if (nodes && ctx) {
        const p = (progressRef && progressRef.current) || 0;
        const t = ctx.currentTime;
        const freq = 40 + p * 15;
        nodes.osc1.frequency.setTargetAtTime(freq, t, 0.4);
        nodes.osc2.frequency.setTargetAtTime(freq + 0.4, t, 0.4);
        const pulse = pulseMutedRef.current ? 0 : Math.max(0, p - 0.5) * 0.12;
        nodes.pulseGain.gain.setTargetAtTime(pulse, t, 0.5);
      }
      driveRafRef.current = requestAnimationFrame(loop);
    };
    driveRafRef.current = requestAnimationFrame(loop);
    return () => {
      if (driveRafRef.current) cancelAnimationFrame(driveRafRef.current);
    };
  }, [isEnabled, progressRef]);

  // 탭 백그라운드 → 버블 정지(배터리), 복귀 시 재개
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) {
        stopBubbles();
      } else if (enabledRef.current) {
        startBubbles();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [startBubbles, stopBubbles]);

  // 언마운트 정리
  useEffect(() => () => {
    stopBubbles();
    if (driveRafRef.current) cancelAnimationFrame(driveRafRef.current);
    if (ctxRef.current) {
      ctxRef.current.close();
      ctxRef.current = null;
    }
  }, [stopBubbles]);

  return {
    isEnabled,
    isReady,
    toggle,
    setEnabled,
    triggerDing,
    triggerStretch,
    triggerSplit,
    triggerInjection,
    triggerCharge,
    setPhaseSilence,
    setDroneEnabled,
    setPulseEnabled,
    setBubbleEnabled,
  };
}
