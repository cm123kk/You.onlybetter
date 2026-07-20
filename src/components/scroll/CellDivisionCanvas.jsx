import { forwardRef, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

/** 실사 세포 텍스처(있으면 사용, 없으면 절차적 폴백). public/ 에 배치 */
const CELL_TEXTURE_URL = '/cell-green.png';

/**
 * CellDivisionCanvas 컴포넌트
 *
 * The Substance "살아있는 배경"의 세포 분열 레이어. 형광 그린 세포들이 스크롤 진행에 따라
 * 밀도·분열 속도를 높이며 둘로 나뉜다(하이브리드: 실사 세포 사진 텍스처 + 코드 분열 모션,
 * 이미지가 없으면 절차적 그라디언트로 폴백).
 *
 * 동작 방식:
 * 1. Canvas 2D에 세포 리스트를 rAF로 그린다(위치·펄스·분열 상태는 ref로 관리, useState 미사용).
 * 2. progress(0~1)로 활성 세포 수와 분열 주기를 구동 — 높을수록 많고 빠르게 분열.
 * 3. 세포가 분열하는 순간 onDivision 콜백을 호출(페이지에서 L3 분열 사운드 트리거용).
 * 4. 세포는 텍스처가 로드되면 원형 clip으로 사진을 그리고, 아니면 발광 radial 그라디언트로 그린다.
 *
 * Props:
 * @param {number} progress - 스크롤 진행도 0~1 (세포 밀도·분열 속도) [Optional, 기본값: 0]
 * @param {number} count - 최대 세포 수 [Optional, 기본값: 14]
 * @param {string} color - 절차적 폴백 세포 색 [Optional, 기본값: '#AAFF00']
 * @param {function} onDivision - 세포 분열 시작 시 호출(사운드 트리거) [Optional]
 * @param {object} sx - 루트 컨테이너 MUI sx 스타일 [Optional]
 *
 * Example usage:
 * <CellDivisionCanvas progress={ scrollProgress } onDivision={ () => audio.triggerSplit() } />
 */
const CellDivisionCanvas = forwardRef(function CellDivisionCanvas({
  progress = 0,
  count = 14,
  color = '#AAFF00',
  onDivision,
  sx,
  ...props
}, ref) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    cells: [], img: null, raf: 0, w: 0, h: 0, last: 0, acc: 0, progress: 0, onDivision: null,
  });

  /** 최신 progress·onDivision 을 rAF 루프에 ref로 전달(재구독 없이) */
  useEffect(() => {
    stateRef.current.progress = progress;
    stateRef.current.onDivision = onDivision;
  }, [progress, onDivision]);

  /** 실사 텍스처 로드(실패 시 폴백 유지) */
  useEffect(() => {
    const img = new Image();
    img.onload = () => { stateRef.current.img = img; };
    img.onerror = () => { stateRef.current.img = null; };
    img.src = CELL_TEXTURE_URL;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const st = stateRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      st.w = rect.width;
      st.h = rect.height;
      canvas.width = Math.max(1, rect.width * dpr);
      canvas.height = Math.max(1, rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const baseR = Math.max(24, Math.min(st.w, st.h) * 0.12);
    const spawn = (x, y, r) => ({
      x, y, r, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10,
      phase: Math.random(), split: 0, splitting: false,
    });
    st.cells = [spawn(st.w / 2, st.h / 2, baseR)];

    /** 세포 하나 그리기 — 텍스처 원형 clip(발광 합성) 또는 절차적 그라디언트 */
    const drawCell = (c) => {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      if (st.img) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.clip();
        const d = c.r * 2;
        ctx.drawImage(st.img, c.x - c.r, c.y - c.r, d, d);
      } else {
        const g = ctx.createRadialGradient(c.x - c.r * 0.3, c.y - c.r * 0.3, c.r * 0.1, c.x, c.y, c.r);
        g.addColorStop(0, 'rgba(230,255,190,0.95)');
        g.addColorStop(0.45, color);
        g.addColorStop(1, 'rgba(90,150,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const step = (t) => {
      const dt = Math.min(0.05, (t - (st.last || t)) / 1000);
      st.last = t;
      const p = st.progress;
      ctx.clearRect(0, 0, st.w, st.h);

      const target = Math.max(1, Math.round(1 + p * (count - 1)));
      st.acc += dt;
      const divideEvery = Math.max(0.4, 2.2 - p * 1.8);
      if (!reduce && st.acc > divideEvery && st.cells.length < target) {
        st.acc = 0;
        const cand = st.cells.filter((c) => !c.splitting);
        if (cand.length) {
          cand[Math.floor(Math.random() * cand.length)].splitting = true;
          if (typeof st.onDivision === 'function') st.onDivision();
        }
      }

      for (let i = st.cells.length - 1; i >= 0; i -= 1) {
        const c = st.cells[i];
        if (!reduce) {
          c.x += c.vx * dt;
          c.y += c.vy * dt;
          if (c.x < c.r) { c.x = c.r; c.vx *= -1; }
          if (c.x > st.w - c.r) { c.x = st.w - c.r; c.vx *= -1; }
          if (c.y < c.r) { c.y = c.r; c.vy *= -1; }
          if (c.y > st.h - c.r) { c.y = st.h - c.r; c.vy *= -1; }
          c.phase = (c.phase + dt * 0.5) % 1;
        }

        if (c.splitting) {
          c.split += dt / 0.9;
          if (c.split >= 1) {
            const r2 = c.r * 0.8;
            const a = Math.random() * Math.PI * 2;
            const off = c.r * 0.9;
            st.cells.splice(
              i, 1,
              spawnAt(c, c.x + Math.cos(a) * off, c.y + Math.sin(a) * off, r2),
              spawnAt(c, c.x - Math.cos(a) * off, c.y - Math.sin(a) * off, r2),
            );
          } else {
            const sep = c.r * 0.9 * c.split;
            const rr = c.r * (1 - c.split * 0.12);
            drawCell({ x: c.x - sep, y: c.y, r: rr });
            drawCell({ x: c.x + sep, y: c.y, r: rr });
          }
        } else {
          const pulse = 1 + Math.sin(c.phase * Math.PI * 2) * 0.03;
          drawCell({ x: c.x, y: c.y, r: c.r * pulse });
        }
      }

      while (st.cells.length > Math.max(target, 1)) st.cells.pop();
      st.raf = requestAnimationFrame(step);
    };

    /** 분열 후 자식 세포 생성(부모 속도 계승 + 흩어짐) */
    function spawnAt(parent, x, y, r) {
      return {
        x, y, r, phase: Math.random(), split: 0, splitting: false,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
      };
    }

    st.raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(st.raf);
      ro.disconnect();
    };
  }, [count, color]);

  return (
    <Box
      ref={ ref }
      sx={ { position: 'relative', width: '100%', height: '100%', minHeight: 240, ...sx } }
      { ...props }
    >
      <Box
        component="canvas"
        ref={ canvasRef }
        sx={ { position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' } }
      />
    </Box>
  );
});

export { CellDivisionCanvas };
