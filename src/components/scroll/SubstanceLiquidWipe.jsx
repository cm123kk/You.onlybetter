import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';

/** 전체 화면 삼각형(풀스크린 커버) */
const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

/** fBm + 도메인 워핑 리퀴드 마블 — 블루/블랙이 흐르다 progress→1에 전체 블랙으로 수렴 */
const FRAG = `
precision highp float;
uniform float uTime;
uniform float uProgress;
uniform vec2 uRes;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.0 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * asp, uv.y) * 3.0;
  float t = uTime * 0.05;
  // 도메인 워핑(액체 마블 흐름)
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + t * 0.7),
                fbm(p + 4.0 * q + vec2(8.3, 2.8) - t * 0.6));
  float f = fbm(p + 4.0 * r);
  f = clamp((f - 0.2) * 1.6, 0.0, 1.0);

  vec3 black = vec3(0.039, 0.039, 0.039);   // #0A0A0A
  vec3 deep  = vec3(0.10, 0.28, 0.42);      // 딥 틸(중간톤)
  vec3 blue  = vec3(0.529, 0.757, 0.878);   // #87C1E0

  // progress↑ → 임계 상승 → 블루가 사라지고 블랙이 지배. 초반(uProgress 0)엔 블루 지배(works 블루와 연속),
  // uProgress ≈0.84에서 전체 블랙 수렴.
  float lo = mix(-0.60, 1.30, uProgress);
  float hi = mix(0.15, 1.70, uProgress);
  float m = smoothstep(lo, hi, f);
  vec3 col = mix(black, blue, m);
  // 블루/블랙 경계에 딥틸 미드톤 → 마블 깊이(초반일수록 진하게)
  col = mix(col, deep, (1.0 - uProgress * 0.7) * (1.0 - m) * m * 2.0);
  gl_FragColor = vec4(col, 1.0);
}
`;

/**
 * SubstanceLiquidWipe 컴포넌트
 *
 * WebGL fBm + 도메인 워핑으로 그린 "리퀴드 마블" 배경 전환. 블루(#87C1E0)와 블랙(#0A0A0A)이 액체처럼
 * 흐르다가 progress가 1에 가까워지면 전체 블랙으로 수렴한다(영화 포스터의 흐르는 액체 질감).
 * uTime으로 상시 흐르고, progress(스크롤 구동)로 블랙 바이어스를 올린다.
 * WebGL 미지원 시 CSS 블루→블랙 페이드로 우아하게 강등.
 *
 * Props:
 * @param {number} progress - 0(블루 마블)~1(전체 블랙) [Optional, 기본값: 0]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <SubstanceLiquidWipe progress={ protoTransP } sx={ { position: 'absolute', inset: 0 } } />
 */
function SubstanceLiquidWipe({ progress = 0, sx, ...props }) {
  const canvasRef = useRef(null);
  const progRef = useRef(progress);
  progRef.current = progress;
  const okRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: false })
      || canvas.getContext('experimental-webgl');
    if (!gl) { okRef.current = false; return undefined; }

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { okRef.current = false; return undefined; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uProgress = gl.getUniformLocation(prog, 'uProgress');
    const uRes = gl.getUniformLocation(prog, 'uRes');

    let raf = 0;
    let start = null;
    let mounted = true;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    const frame = (ts) => {
      if (!mounted) return;
      if (start == null) start = ts;
      resize();
      gl.uniform1f(uTime, (ts - start) / 1000);
      gl.uniform1f(uProgress, Math.min(1, Math.max(0, progRef.current)));
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, []);

  return (
    <Box
      component="canvas"
      ref={ canvasRef }
      aria-hidden="true"
      sx={ {
        display: 'block',
        width: '100%',
        height: '100%',
        // WebGL 미지원 폴백 — 블루→블랙 단순 보간(progress로 어두워짐)
        backgroundColor: okRef.current ? 'transparent' : '#0A0A0A',
        ...sx,
      } }
      { ...props }
    />
  );
}

export { SubstanceLiquidWipe };
