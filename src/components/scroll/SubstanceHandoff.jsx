import { forwardRef } from 'react';
import Box from '@mui/material/Box';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 영화 노른자 씬 소프트 블루 */
const BLUE = '#87C1E0';

/**
 * SubstanceHandoff 컴포넌트 (INTRO → HOW IT WORKS 시네마틱 전환 오버레이)
 *
 * IntroLogoBleed 위에 겹쳐 렌더되는 투명 오버레이. "THIS IS THE SUBSTANCE" 녹아내림 자체는
 * IntroLogoBleed(meltProgress)가 담당하고, 이 컴포넌트는 그 위에서 배경을 중앙→밖으로 블루로
 * 확산시키는 역할만 한다(헤더/바/노른자는 뒤이은 SubstanceHowItWorks가 단독 소유 → 중복 방지).
 * 끝(1.0) 상태 = 화면 전체 블루 = SubstanceHowItWorks 시작 배경과 일치해 끊김 없이 넘어간다.
 *
 * 진행도 매핑:
 * - 0.12~1.0 배경 블루 안→밖 확산(원형 scale-up, ease-in). 코너까지 덮이는 시점이 씬 끝(≈0.87)에
 *   가깝도록 가속 → 화면이 다 덮인 뒤 남는 "빈 블루" 스크롤을 최소화하고 곧바로 HOW IT WORKS로 인계.
 *
 * Props:
 * @param {number} progress - 전환 진행도 0~1 (부모 handoffPhase) [Optional, 기본값: 0]
 * @param {object} sx - 루트 스타일 [Optional]
 *
 * Example usage:
 * <SubstanceHandoff progress={ handoffPhase } />
 */
const SubstanceHandoff = forwardRef(function SubstanceHandoff({
  progress = 0,
  sx,
  ...props
}, ref) {
  const t = clamp01(progress);
  const blue = clamp01((t - 0.12) / 0.88);
  const blueEased = blue ** 2.2; // ease-in: 초반 천천히 → 끝에서 급격히 화면을 덮음(빈 블루 구간 최소화)

  return (
    <Box
      ref={ ref }
      aria-hidden="true"
      sx={ {
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        pointerEvents: 'none',
        opacity: t > 0 ? 1 : 0,
        ...sx,
      } }
      { ...props }
    >
      {/* 배경 블루 — 중앙에서 밖으로 확산(안→밖). IntroLogoBleed(검정) 위를 블루가 덮어감 */}
      <Box
        aria-hidden="true"
        sx={ {
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '46vmax',
          height: '46vmax',
          zIndex: 0,
          opacity: blue > 0 ? 1 : 0,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${ BLUE } 62%, rgba(135,193,224,0) 100%)`,
          transform: `translate(-50%, -50%) scale(${ 0.04 + blueEased * 6.5 })`,
          transformOrigin: 'center',
          willChange: 'transform',
        } }
      />
    </Box>
  );
});

export { SubstanceHandoff };
