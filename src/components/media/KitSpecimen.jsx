import { forwardRef, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** cover-fit 으로 이미지를 캔버스 사각형에 그린다(중앙 크롭) */
const drawCover = (ctx, img, w, h) => {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (!iw || !ih) return;
  const ia = iw / ih;
  const da = w / h;
  let sx;
  let sy;
  let sw;
  let sh;
  if (ia > da) { sh = ih; sw = ih * da; sx = (iw - sw) / 2; sy = 0; }
  else { sw = iw; sh = iw / da; sx = 0; sy = (ih - sh) / 2; }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
};

/**
 * KitSpecimen 컴포넌트
 *
 * The Substance PROTOCOL 키트 실사(영화 실물 "그대로"). 봉인된 진공 파우치가 스크롤에 따라
 * **윗 필름만 코너부터 뜯겨** 내용물이 드러나고(→ 소진 시 쭈글 빈 비닐로 crossfade), 넘버링
 * 키트는 **수직 넘버-라인 프로그레스 게이지**를 오버레이한다. "이미 몸에 주입됐다"의 물성.
 *
 * 뜯김 구현(핵심): **두 정합 앵커의 코드 마스크 리빌**. `sealedSrc`(윗 필름 있음)를 `openSrc`
 * (필름 제거·내용물 노출) 위에 얹고, `openProgress`가 톱니 경계를 코너(우상단)에서 좌하단으로
 * 쓸며 윗 필름만 벗겨 아래 openSrc를 드러낸다. 두 이미지가 같은 프레이밍·내용물이라 드리프트
 * 없이 "윗면만" 뜯긴다(영상/다중 생성 프레임 불필요).
 *
 * 동작 방식:
 * 1. openProgress·consumeProgress·크기·이미지 로드 변경 시에만 canvas 재드로우(rAF 루프 없음).
 * 2. openImg(전체) → 봉인 영역만 clip 하여 sealedImg → 뜯김 경계 하이라이트 순으로 합성.
 * 3. consumeProgress>0면 consumedSrc(쭈글 빈 비닐)를 위에 alpha crossfade.
 * 4. 넘버링 키트는 segments/activeSegment로 세로 눈금 게이지를 DOM 오버레이로 그린다.
 *
 * Props:
 * @param {string} sealedSrc - 봉인 실사(윗 필름 있음) [Required]
 * @param {string} openSrc - 개봉 실사(윗 필름 제거·내용물 노출, sealedSrc와 프레이밍 정합) [Required]
 * @param {string} consumedSrc - 소진 실사(쭈글 빈 비닐) [Optional]
 * @param {number} openProgress - 윗 필름 뜯김 진행도 0~1 (스크롤 구동) [Optional, 기본값: 0]
 * @param {number} consumeProgress - 소진 crossfade 0~1 [Optional, 기본값: 0]
 * @param {boolean} isConsumed - true면 consumeProgress를 1로 간주(편의) [Optional, 기본값: false]
 * @param {number} segments - 넘버링 게이지 칸 수(예: 7). 0이면 게이지 없음(ACTIVATOR 등 단일) [Optional, 기본값: 0]
 * @param {number} activeSegment - 현재 소진 위치(1~segments). 이하 칸은 dim [Optional, 기본값: 0]
 * @param {function} onAdminister - openProgress가 1에 도달할 때 1회 호출(인젝션 사운드) [Optional]
 * @param {string} label - 접근성 라벨(예: 'ACTIVATOR') [Optional, 기본값: 'Kit specimen']
 * @param {object} sx - 루트 컨테이너 MUI sx [Optional]
 *
 * Example usage:
 * <KitSpecimen sealedSrc="/kit/activator-sealed.png" openSrc="/kit/activator-open.png"
 *   openProgress={ phaseProgress } onAdminister={ () => audio.inject() } label="ACTIVATOR" />
 */
const KitSpecimen = forwardRef(function KitSpecimen({
  sealedSrc,
  openSrc,
  consumedSrc,
  openProgress = 0,
  consumeProgress = 0,
  isConsumed = false,
  segments = 0,
  activeSegment = 0,
  onAdminister,
  label = 'Kit specimen',
  sx,
  ...props
}, ref) {
  const canvasRef = useRef(null);
  const stateRef = useRef({ sealed: null, open: null, consumed: null, w: 0, h: 0, dpr: 1, administered: false });

  const openP = clamp01(openProgress);
  const consumeP = isConsumed ? 1 : clamp01(consumeProgress);

  /** openProgress가 1에 닿으면 인젝션 콜백 1회 */
  useEffect(() => {
    const st = stateRef.current;
    if (openP >= 0.999 && !st.administered) {
      st.administered = true;
      if (typeof onAdminister === 'function') onAdminister();
    } else if (openP < 0.9) {
      st.administered = false;
    }
  }, [openP, onAdminister]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const st = stateRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /** 봉인 영역 clip 경로 — 우상단에서 좌하단으로 쓰는 톱니 경계의 "아직 안 뜯긴" 쪽 */
    const clipSealed = (w, h, t) => {
      const TH = 1 - t; // t=0 → 전부 봉인, t=1 → 전부 개봉
      const bx = (y) => {
        const base = w * (2 * TH - 1 + y / h);
        const jag = reduce ? 0 : (w * 0.03) * Math.sin(y * 0.09) + (w * 0.018) * Math.sin(y * 0.23 + 1.3);
        return Math.max(-2, Math.min(w + 2, base + jag));
      };
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(bx(0), 0);
      const step = Math.max(4, h / 60);
      for (let y = step; y <= h; y += step) ctx.lineTo(bx(y), y);
      ctx.lineTo(bx(h), h);
      ctx.lineTo(0, h);
      ctx.closePath();
      return bx;
    };

    const draw = () => {
      const { w, h, dpr } = st;
      if (!w || !h) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      // 1) 개봉(내용물 노출) 레이어 — 뜯긴 곳에서 드러남
      if (st.open) drawCover(ctx, st.open, w, h);
      else if (st.sealed) drawCover(ctx, st.sealed, w, h);

      // 2) 봉인(윗 필름) 레이어 — 아직 안 뜯긴 영역만
      if (st.sealed && openP < 0.999) {
        ctx.save();
        const bx = clipSealed(w, h, openP);
        ctx.clip();
        drawCover(ctx, st.sealed, w, h);
        ctx.restore();

        // 3) 뜯김 경계 하이라이트(벗겨진 필름 엣지)
        if (openP > 0.001) {
          ctx.save();
          ctx.beginPath();
          const step = Math.max(4, h / 60);
          ctx.moveTo(bx(0), 0);
          for (let y = step; y <= h; y += step) ctx.lineTo(bx(y), y);
          ctx.lineTo(bx(h), h);
          ctx.strokeStyle = 'rgba(245,245,240,0.5)';
          ctx.lineWidth = 2;
          ctx.shadowColor = 'rgba(255,255,255,0.5)';
          ctx.shadowBlur = 6;
          ctx.stroke();
          ctx.restore();
        }
      }

      // 4) 소진(쭈글 빈 비닐) crossfade
      if (st.consumed && consumeP > 0) {
        ctx.save();
        ctx.globalAlpha = consumeP;
        drawCover(ctx, st.consumed, w, h);
        ctx.restore();
      }
    };
    st.draw = draw;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      st.w = rect.width;
      st.h = rect.height;
      st.dpr = dpr;
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    /** 이미지 로드 → 각 ref 채우고 재드로우 */
    const load = (src, key) => {
      if (!src) { st[key] = null; return; }
      const img = new Image();
      img.onload = () => { st[key] = img; draw(); };
      img.onerror = () => { st[key] = null; };
      img.src = src;
    };
    load(sealedSrc, 'sealed');
    load(openSrc, 'open');
    load(consumedSrc, 'consumed');

    return () => ro.disconnect();
  }, [sealedSrc, openSrc, consumedSrc]);

  /** progress 변화 시 재드로우(rAF 없이 on-demand) */
  useEffect(() => {
    if (stateRef.current.draw) stateRef.current.draw();
  }, [openP, consumeP]);

  return (
    <Box
      ref={ ref }
      role="img"
      aria-label={ `${ label } — ${ openP >= 0.999 ? 'opened' : 'sealed' }` }
      sx={ { position: 'relative', width: '100%', height: '100%', minHeight: 240, ...sx } }
      { ...props }
    >
      <Box
        component="canvas"
        ref={ canvasRef }
        sx={ { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' } }
      />

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
