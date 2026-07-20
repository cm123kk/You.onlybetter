import { forwardRef } from 'react';
import Box from '@mui/material/Box';

import syringeImg from '../../assets/reference/syringe-clean.png';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/**
 * SyringeInjector 컴포넌트 (실사 PNG · 가로 주입)
 *
 * 투명 배경 실사 주사기 PNG를 progress(0~1)로 왼쪽에서 슬라이드 인 → 도킹(바늘이 대상에 닿음)
 * → 유지(주입) → 왼쪽으로 후퇴시킨다. 실사 이미지라 유리·바늘·눈금·액체가 그대로 사실적이며,
 * 바늘 끝은 상위 레이어(노른자)가 가려 "찌르는" 느낌을 만든다(주입은 노른자의 그린 플룸으로 표현).
 *
 * Props:
 * @param {number} progress - 진행도 0~1 (부모 scrollProgress) [Optional, 기본값: 0]
 * @param {string} scale - 주사기 이미지 폭(컨테이너 대비 %) [Optional, 기본값: '66%']
 * @param {number} dockX - 도킹 translateX(이미지 폭 대비 %) — 바늘 끝 도달 위치 [Optional, 기본값: -26]
 * @param {number} enterEnd - 진입 완료 지점 [Optional, 기본값: 0.12]
 * @param {number} injectEnd - 주입 완료 지점 [Optional, 기본값: 0.33]
 * @param {number} retractEnd - 후퇴 완료 지점 [Optional, 기본값: 0.45]
 * @param {object} sx - 루트 스타일 [Optional]
 *
 * Example usage:
 * <SyringeInjector progress={ scrollProgress } />
 */
const SyringeInjector = forwardRef(function SyringeInjector({
  progress = 0,
  scale = '66%',
  dockX = -26,
  enterEnd = 0.12,
  injectEnd = 0.33,
  retractEnd = 0.45,
  sx,
  ...props
}, ref) {
  const p = clamp01(progress);
  const enterStartX = dockX - 100; // 완전히 왼쪽 밖(바늘도 화면 밖)
  const retractX = dockX - 110;

  let tx = enterStartX;
  let visible = true;
  if (p >= retractEnd) {
    visible = false;
    tx = retractX;
  } else if (p < enterEnd) {
    tx = enterStartX + (p / enterEnd) * (dockX - enterStartX); // 진입: 밖 → 도킹
  } else if (p <= injectEnd) {
    tx = dockX; // 주입 중 고정
  } else {
    const r = (p - injectEnd) / (retractEnd - injectEnd);
    tx = dockX - r * (dockX - retractX); // 후퇴: 도킹 → 밖
  }

  return (
    <Box
      ref={ ref }
      aria-hidden="true"
      sx={ { position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', ...sx } }
      { ...props }
    >
      <Box
        component="img"
        src={ syringeImg }
        alt=""
        sx={ {
          position: 'absolute',
          top: '50%',
          left: 0,
          width: scale,
          height: 'auto',
          transform: `translate(${ tx }%, -50%)`,
          opacity: visible ? 1 : 0,
          willChange: 'transform',
          display: 'block',
        } }
      />
    </Box>
  );
});

export { SyringeInjector };
