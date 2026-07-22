import { forwardRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { SubstanceSyringe } from '../../common/ui/SubstanceSyringe.jsx';
import { YolkMorph } from '../motion/YolkMorph.jsx';
import { CellDivisionCanvas } from '../scroll/CellDivisionCanvas.jsx';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 영화 노른자 씬의 소프트 블루 — 섹션 전체 배경 */
const BLUE = '#87C1E0';

/**
 * SubstanceHowItWorks 컴포넌트 (섹션 조립)
 *
 * The Substance "원리 설명" 섹션. 단일 progress(0~1)가 세 요소를 동시에 구동한다:
 * 좌측 형광 주사기 게이지가 배출되며(fill 감소) → 중앙 노른자에 그린이 주입되고(inject)
 * → 노른자가 꿀렁이다(wobble) 둘로 분열하며(divide) → 배경 세포가 분열을 가속한다.
 * 페이지에서는 뷰포트보다 긴 섹션의 sticky 타임라인(useScrollProgress)에서 progress를 준다.
 *
 * 진행도 매핑:
 * - 좌측 세로 주사기 게이지 fill = 1 → 0 (0~0.33, 형광물질이 쭉 배출)
 * - 노른자 progress = p (내부적으로 주입 0~0.35 / 꿀렁 0.33~0.9 / 분열 0.55~1)
 * - 세포 progress = (p-0.5)/0.5 (분열 이후 밀도·분열 가속, 배경 opacity도 함께 상승)
 *
 * Props:
 * @param {number} progress - 섹션 진행도 0~1 (부모 scrollProgress) [Optional, 기본값: 0]
 * @param {number} yolkSize - 중앙 노른자 크기(px) [Optional, 기본값: 520]
 * @param {boolean} hasSyringe - 좌측 세로 주사기 게이지 렌더 [Optional, 기본값: true]
 * @param {boolean} hasCells - 배경 세포 분열 레이어 렌더 [Optional, 기본값: true]
 * @param {function} onCellDivision - 세포 분열 시 호출(사운드 트리거) [Optional]
 * @param {object} sx - 루트 스타일 [Optional]
 *
 * Example usage:
 * <SubstanceHowItWorks progress={ scrollProgress } />
 */
const SubstanceHowItWorks = forwardRef(function SubstanceHowItWorks({
  progress = 0,
  yolkSize = 600,
  hasSyringe = true,
  hasCells = false,
  onCellDivision,
  sx,
  ...props
}, ref) {
  const p = clamp01(progress);
  // 리빌 순서: 노른자(0~0.04) → pause → 헤더 텍스트 순차(eyebrow→title→body) → 마지막에 프로그레스바.
  const yolkOp = clamp01(p / 0.04);
  const eyebrowOp = clamp01((p - 0.10) / 0.04);
  const titleOp = clamp01((p - 0.15) / 0.045);
  const bodyOp = clamp01((p - 0.21) / 0.045);
  const barOp = clamp01((p - 0.28) / 0.045); // 텍스트 이후 마지막 리빌
  // 형광물질 배출(주입) — 바 리빌 후 0.33부터 0.55까지 완전히 비워짐(약이 다 들어가는 시점).
  const syringeFill = clamp01(1 - clamp01((p - 0.33) / 0.22));
  // 노른자 라이프사이클 로컬 진행도 — 주입(0.33~) 시작에 맞춰 리매핑. 이렇게 하면 주사기 배출 완료(≈0.55)와
  // 노른자 흡수(inject) 완료가 동기되고, 그 뒤에 부글부글(wobble)→분열(split) 순으로 진행된다.
  const yolkP = clamp01((p - 0.33) / 0.67);
  const cellProgress = clamp01((p - 0.5) / 0.5);
  const cellOpacity = cellProgress * 0.5; // 분열 구간부터 살아남(초반 blue 깨끗)

  return (
    <Box
      ref={ ref }
      sx={ {
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100vh',
        overflow: 'hidden',
        // 임시: HOW IT WORKS 배경 흰색(원복 시 BLUE + 위 라디얼 그라데이션으로 되돌리기)
        backgroundColor: '#FFFFFF',
        backgroundImage: 'none',
        ...sx,
      } }
      { ...props }
    >
      {/* 배경: 살아있는 세포 분열 — 노른자 분열 이후 밀도/가시성 상승 */}
      { hasCells && (
        <Box
          aria-hidden="true"
          sx={ { position: 'absolute', inset: 0, zIndex: 0, opacity: cellOpacity, transition: 'opacity 0.3s linear' } }
        >
          <CellDivisionCanvas progress={ cellProgress } onDivision={ onCellDivision } />
        </Box>
      ) }

      {/* 중앙 노른자 — 가장 먼저 등장(리빌 순서 1). 상단 프로그레스바와 넓은 간격을 두고 아래 공간 중앙에 크게 */}
      <Box sx={ { position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', pt: { xs: '17vh', md: '24vh' }, opacity: yolkOp, transition: 'opacity 0.2s linear' } }>
        <YolkMorph
          progress={ yolkP }
          size={ yolkSize }
          hasSurface={ false }
          hasAlbumen={ false }
          sx={ { maxWidth: '92vw', maxHeight: '62vh' } }
        />
      </Box>

      {/* 헤딩 + 제목 밑 가로 주사기 프로그레스바(세로 게이지를 회전) */}
      <Box sx={ { position: 'absolute', top: { xs: 60, md: 84 }, left: 0, right: 0, zIndex: 3, textAlign: 'center', px: 3, pointerEvents: 'none' } }>
        <Typography variant="overline" sx={ { display: 'block', color: '#08161E', letterSpacing: '0.32em', mb: 2, opacity: eyebrowOp, transition: 'opacity 0.25s ease' } }>
          HOW IT WORKS
        </Typography>
        <Typography variant="h3" sx={ { color: '#08161E', lineHeight: 0.95, fontSize: { xs: '3.6rem', md: '6.5rem' }, opacity: titleOp, transition: 'opacity 0.25s ease' } }>
          ONE BECOMES TWO
        </Typography>

        {/* 설명 — 옅고 얇은 본문(eyebrow·제목과 구분). 메커니즘 + 시적 태그라인 */}
        <Typography
          sx={ {
            maxWidth: 540,
            mx: 'auto',
            mt: { xs: 1.25, md: 1.5 },
            color: 'rgba(8,22,30,0.55)',
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: { xs: '1.1rem', md: '1.3rem' },
            fontWeight: 300,
            lineHeight: 1.15,
            letterSpacing: '0.03em',
            opacity: bodyOp,
            transition: 'opacity 0.25s ease',
          } }
        >
          Cellular replication regenerates a younger, more perfect you.
          <br />
          You are the matrix. Everything comes from you.
        </Typography>

        {/* 가로 주사기 프로그레스바 — 세로 SubstanceSyringe를 -90° 회전(디테일 그대로), 형광물질 배출 */}
        { hasSyringe && (
          <Box sx={ { position: 'relative', width: { xs: '38vw', md: '17vw' }, height: { xs: '8vw', md: '4.2vw' }, mx: 'auto', mt: { xs: 2.5, md: 3.5 }, opacity: barOp, transition: 'opacity 0.2s linear' } }>
            <Box
              sx={ {
                position: 'absolute',
                top: '50%',
                left: '50%',
                height: { xs: '38vw', md: '17vw' }, // 회전 전 세로길이 = 바 길이
                // rotate(-90deg): 배출되는 표면 끝이 왼쪽으로(=왼쪽에서부터 비워짐) / scaleX: 두께만 얇게
                transform: 'translate(-50%, -50%) rotate(-90deg) scaleX(0.72)',
                transformOrigin: 'center center',
              } }
            >
              {/* flipGradient: 어두운색을 왼쪽(배출 끝)으로 → 왼쪽 어두운 곳에서부터 사라짐.
                  endRadius=26: 관 끝을 완전 둥근 pill로(반쯤 둥근 어색함 제거) */}
              <SubstanceSyringe fill={ syringeFill } flipGradient endRadius={ 26 } />
            </Box>
          </Box>
        ) }
      </Box>

    </Box>
  );
});

export { SubstanceHowItWorks };
