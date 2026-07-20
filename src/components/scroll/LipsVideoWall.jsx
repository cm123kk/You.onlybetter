import { forwardRef, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** 립스 루프 영상(그레이딩 완료) + 폴백 스틸. public/video/ 에 배치 */
const DEFAULT_WEBM = '/video/lips-loop.webm';
const DEFAULT_MP4 = '/video/lips-loop.mp4';
const DEFAULT_POSTER = '/video/lips-poster.jpg';

/** 욕망 3연 — 배경 증식 1스텝당 1개씩 교체 stamp */
const DEFAULT_WORDS = ['Younger.', 'More beautiful.', 'More perfect.'];
/** 각 단어(=격자 단계)가 활성화되는 progress 임계값 */
const DEFAULT_STEPS = [0, 0.4, 0.75];
/** 단계별 격자 한 변 타일 수 (1×1 → 3×3 → 5×5) */
const DEFAULT_GRID_STEPS = [1, 3, 5];

/** progress → 활성 스텝 인덱스 (threshold 이하 중 가장 큰 것) */
const stepIndexOf = (progress, steps) => {
  let idx = 0;
  for (let i = 0; i < steps.length; i += 1) {
    if (progress >= steps[i]) idx = i;
  }
  return idx;
};

/** cover-fit 으로 소스(영상/이미지)를 대상 셀 사각형에 그린다 (중앙 크롭) */
const drawCover = (ctx, src, dx, dy, dw, dh, srcW, srcH) => {
  if (!srcW || !srcH || dw <= 0 || dh <= 0) return;
  const srcAspect = srcW / srcH;
  const dstAspect = dw / dh;
  let sx;
  let sy;
  let sw;
  let sh;
  if (srcAspect > dstAspect) {
    sh = srcH;
    sw = srcH * dstAspect;
    sx = (srcW - sw) / 2;
    sy = 0;
  } else {
    sw = srcW;
    sh = srcW / dstAspect;
    sx = 0;
    sy = (srcH - sh) / 2;
  }
  ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
};

/**
 * LipsVideoWall 컴포넌트
 *
 * The Substance 인트로 "욕망 비트"("…a better version of yourself?" 직후). 그레이딩된
 * 립스 루프 영상 1개가 **풀블리드 배경**으로 화면을 채우고, scrollProgress 에 따라
 * **단일 → 2×2/3×3 → 풀 CRT TV 월(격자)**로 멀티플라이된다("어디서나 방송되는 젊음").
 * 영상 1개만 디코드해 캔버스로 N×N 타일링하므로 다수 <video> 동시재생을 피한다.
 *
 * 핵심 규칙:
 * 1. **텍스트 1개 = 배경 증식 1스텝** — 욕망 3연("Younger./More beautiful./More perfect.")을
 *    격자 단계와 1:1로 동기해 **하나씩 교체** stamp(동시 노출 금지, DualitySequence 방식 아님).
 * 2. **하나의 소스** — 별도 타이머 없이 progress 에서 격자 밀도·활성 단어를 파생.
 * 3. reduced-motion 시 멀티플라이 대신 poster 스틸 유지(단일), 텍스트는 그대로 순차 stamp.
 *
 * 애니메이션 값은 ref+rAF 로 관리(리렌더 없음), 활성 단어 인덱스만 상태(트리거)로 둔다.
 *
 * Props:
 * @param {number} progress - 이 비트의 로컬 진행도 0~1 (격자 밀도·활성 단어 구동) [Optional, 기본값: 0]
 * @param {string[]} words - 순차 stamp 할 단어 목록 [Optional, 기본값: 욕망 3연]
 * @param {number[]} steps - 각 단어가 활성화되는 progress 임계값 [Optional, 기본값: [0, 0.4, 0.75]]
 * @param {number[]} gridSteps - 단계별 격자 한 변 타일 수 [Optional, 기본값: [1, 3, 5]]
 * @param {string} videoWebm - 립스 루프 webm 경로 [Optional, 기본값: '/video/lips-loop.webm']
 * @param {string} videoMp4 - 립스 루프 mp4 폴백 경로 [Optional, 기본값: '/video/lips-loop.mp4']
 * @param {string} posterSrc - 영상 로드 전/폴백 스틸 경로 [Optional, 기본값: '/video/lips-poster.jpg']
 * @param {string} textColor - stamp 텍스트 색 (theme 토큰 또는 색상값). 인트로 활성화 스크립트와 동일한 형광 그린 [Optional, 기본값: 'secondary.main']
 * @param {function} onStep - 활성 단어(=격자 단계) 진입 시 호출 (인덱스 전달, 사운드 트리거) [Optional]
 * @param {object} sx - 루트 컨테이너 MUI sx 스타일 [Optional]
 *
 * Example usage:
 * <LipsVideoWall progress={ introProgress } onStep={ (i) => audio.stinger(i) } />
 */
const LipsVideoWall = forwardRef(function LipsVideoWall({
  progress = 0,
  words = DEFAULT_WORDS,
  steps = DEFAULT_STEPS,
  gridSteps = DEFAULT_GRID_STEPS,
  videoWebm = DEFAULT_WEBM,
  videoMp4 = DEFAULT_MP4,
  posterSrc = DEFAULT_POSTER,
  textColor = 'secondary.main',
  onStep,
  sx,
  ...props
}, ref) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const stateRef = useRef({
    poster: null, raf: 0, w: 0, h: 0, last: 0, flickerAt: -1, prevGrid: 1,
    progress: 0, steps: DEFAULT_STEPS, gridSteps: DEFAULT_GRID_STEPS, reduce: false,
  });

  /** 활성 단어 인덱스 — 유일한 리렌더 트리거(애니값 아님) */
  const activeIndex = stepIndexOf(progress, steps);

  /** 최신 progress·설정을 rAF 루프에 ref 로 전달(재구독 없이) */
  useEffect(() => {
    stateRef.current.progress = progress;
    stateRef.current.steps = steps;
    stateRef.current.gridSteps = gridSteps;
  }, [progress, steps, gridSteps]);

  /** 단어(=격자 단계) 진입 시 사운드 콜백 1회 */
  useEffect(() => {
    if (typeof onStep === 'function') onStep(activeIndex);
  }, [activeIndex, onStep]);

  /** 폴백 스틸 로드(영상 미준비/reduced-motion 시 소스) */
  useEffect(() => {
    if (!posterSrc) return undefined;
    const img = new Image();
    img.onload = () => { stateRef.current.poster = img; };
    img.onerror = () => { stateRef.current.poster = null; };
    img.src = posterSrc;
    return () => { img.onload = null; img.onerror = null; };
  }, [posterSrc]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const st = stateRef.current;
    const video = videoRef.current;
    st.reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /** reduced-motion 이 아니면 muted 루프 자동재생(정책 허용) */
    if (video && !st.reduce) {
      const tryPlay = () => { const p = video.play(); if (p && p.catch) p.catch(() => {}); };
      if (video.readyState >= 2) tryPlay();
      else video.addEventListener('loadeddata', tryPlay, { once: true });
    }

    let scanline = null;
    const buildScanline = (dpr) => {
      const off = document.createElement('canvas');
      off.width = 1;
      off.height = Math.max(2, Math.round(3 * dpr));
      const octx = off.getContext('2d');
      octx.fillStyle = 'rgba(0,0,0,0.22)';
      octx.fillRect(0, 0, 1, Math.max(1, Math.round(1 * dpr)));
      scanline = ctx.createPattern(off, 'repeat');
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      st.w = rect.width;
      st.h = rect.height;
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildScanline(dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /** 현재 그릴 소스(영상 우선, 미준비면 포스터) + 원본 해상도 반환 */
    const pickSource = () => {
      if (video && video.readyState >= 2 && !st.reduce) {
        return { src: video, sw: video.videoWidth, sh: video.videoHeight };
      }
      if (st.poster) return { src: st.poster, sw: st.poster.naturalWidth, sh: st.poster.naturalHeight };
      return null;
    };

    /** 격자 위 CRT 처리 — 베젤(격자선) + 스캔라인 + 비네트 */
    const drawCrt = (gridSide) => {
      const { w, h } = st;
      if (gridSide > 1) {
        // 베젤: 셀 경계에 어두운 선 + 안쪽 미세 하이라이트
        ctx.lineWidth = Math.max(2, w / gridSide * 0.05);
        ctx.strokeStyle = 'rgba(10,8,6,0.85)';
        for (let r = 0; r < gridSide; r += 1) {
          for (let c = 0; c < gridSide; c += 1) {
            ctx.strokeRect((c * w) / gridSide, (r * h) / gridSide, w / gridSide, h / gridSide);
          }
        }
      }
      // 스캔라인(전역 1패스)
      if (scanline) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = scanline;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }
      // CRT 비네트(가장자리 어둡게)
      const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    };

    const step = (t) => {
      const { w, h } = st;
      const p = st.progress;
      const gridSteps2 = st.gridSteps;
      const idx = stepIndexOf(p, st.steps);
      const gridSide = st.reduce ? 1 : (gridSteps2[idx] || 1);

      // 단계 전환 시 CRT 파워온 플리커 트리거
      if (gridSide !== st.prevGrid) { st.flickerAt = t; st.prevGrid = gridSide; }

      ctx.clearRect(0, 0, w, h);
      const source = pickSource();
      if (source) {
        for (let r = 0; r < gridSide; r += 1) {
          for (let c = 0; c < gridSide; c += 1) {
            drawCover(
              ctx, source.src,
              (c * w) / gridSide, (r * h) / gridSide, w / gridSide, h / gridSide,
              source.sw, source.sh,
            );
          }
        }
        drawCrt(gridSide);
      }

      // 파워온 플리커: 전환 직후 ~160ms 밝기 펄스
      if (st.flickerAt >= 0) {
        const dt = (t - st.flickerAt) / 160;
        if (dt < 1) {
          const a = Math.sin(dt * Math.PI) * 0.35;
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `rgba(255,230,240,${ a })`;
          ctx.fillRect(0, 0, w, h);
          ctx.restore();
        } else {
          st.flickerAt = -1;
        }
      }

      st.raf = requestAnimationFrame(step);
    };
    st.raf = requestAnimationFrame(step);

    /** 탭 백그라운드 시 재생/루프 정지(배터리) */
    const onVisibility = () => {
      if (!video || st.reduce) return;
      if (document.hidden) video.pause();
      else { const pr = video.play(); if (pr && pr.catch) pr.catch(() => {}); }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(st.raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const currentWord = words[activeIndex] ?? '';

  return (
    <Box
      ref={ ref }
      role="img"
      aria-label={ words.join(' ') }
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
      {/* 오프스크린 성격의 립스 소스 — 시각적으로 숨기고 캔버스로만 draw */}
      <Box
        component="video"
        ref={ videoRef }
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
        poster={ posterSrc }
        aria-hidden="true"
        sx={ { position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' } }
      >
        { videoWebm ? <source src={ videoWebm } type="video/webm" /> : null }
        { videoMp4 ? <source src={ videoMp4 } type="video/mp4" /> : null }
      </Box>

      {/* 풀블리드 타일링 캔버스 */}
      <Box
        component="canvas"
        ref={ canvasRef }
        sx={ { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' } }
      />

      {/* 욕망 3연 — 1개씩 교체 stamp (blur→선명, key 로 재마운트해 애니메이션 재생) */}
      <Box
        sx={ {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          px: 2,
        } }
      >
        <Typography
          key={ activeIndex }
          variant="h1"
          sx={ {
            color: textColor,
            textTransform: 'uppercase',
            textAlign: 'center',
            fontSize: 'clamp(2.5rem, 9vw, 7rem)',
            lineHeight: 1,
            letterSpacing: '-0.02em',
            textShadow: '0 0 24px rgba(170,255,0,0.55), 0 2px 18px rgba(0,0,0,0.55)',
            willChange: 'opacity, filter, transform',
            '@keyframes lipsStamp': {
              from: { opacity: 0, filter: 'blur(14px)', transform: 'scale(1.06)' },
              to: { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
            },
            animation: 'lipsStamp 260ms cubic-bezier(0.16, 1, 0.3, 1) both',
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
              filter: 'none',
            },
          } }
        >
          { currentWord }
        </Typography>
      </Box>
    </Box>
  );
});

export { LipsVideoWall };
