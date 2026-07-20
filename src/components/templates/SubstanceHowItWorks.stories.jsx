import { useRef } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import { SubstanceHowItWorks } from './SubstanceHowItWorks.jsx';
import { useScrollProgress } from '../../utils/substance';

/**
 * SubstanceHowItWorks — The Substance "원리 설명" 섹션. 하나의 progress로 좌측 주사기 배출 →
 * 노른자 그린 주입 → 꿀렁 → 분열 → 배경 세포 분열이 동시에 구동된다. 페이지에서는 뷰포트보다
 * 긴 섹션의 sticky 타임라인(useScrollProgress)으로 progress를 주입한다.
 */
export default {
  title: 'Section/How It Works',
  component: SubstanceHowItWorks,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '섹션 진행도 0~1 (주사기·노른자·세포 동시 구동)',
    },
    yolkSize: {
      control: { type: 'number', min: 200, max: 700 },
      description: '중앙 노른자 크기(px)',
    },
    hasSyringe: { control: 'boolean', description: '가로 주사기(SyringeInjector)' },
    hasCells: { control: 'boolean', description: '배경 세포 분열 레이어' },
    onCellDivision: { action: 'cellDivision', description: '세포 분열 시 호출(사운드)' },
  },
};

/** 기본 — progress 슬라이더로 배출→주입→분열 시퀀스를 직접 확인 */
export const Default = {
  args: {
    progress: 0,
    yolkSize: 600,
    hasSyringe: true,
    hasCells: false,
  },
  render: (args) => (
    <Box sx={ { height: '100vh' } }>
      <SubstanceHowItWorks { ...args } />
    </Box>
  ),
};

/** 실제 스크롤 — 300vh 섹션의 sticky 타임라인에서 useScrollProgress로 구동 */
const ScrollSection = () => {
  const sectionRef = useRef(null);
  const { progress } = useScrollProgress(sectionRef);

  return (
    <Box>
      <Box sx={ { height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' } }>
        <Typography variant="overline" color="text.secondary">↓ 스크롤하여 섹션에 진입</Typography>
      </Box>
      <Box ref={ sectionRef } sx={ { position: 'relative', height: '320vh' } }>
        <Box sx={ { position: 'sticky', top: 0, height: '100vh' } }>
          <SubstanceHowItWorks progress={ progress } />
        </Box>
      </Box>
      <Box sx={ { height: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'background.default' } }>
        <Typography variant="overline" color="text.secondary">섹션 종료</Typography>
      </Box>
    </Box>
  );
};

export const Scroll = {
  render: () => <ScrollSection />,
};
