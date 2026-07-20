import { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import { CellDivisionCanvas } from './CellDivisionCanvas.jsx';

/**
 * CellDivisionCanvas — 형광 그린 세포가 스크롤 진행에 따라 분열하는 살아있는 배경.
 * 하이브리드(실사 세포 사진 텍스처 + 코드 분열). 이미지(public/cell-green.png)가 없으면
 * 절차적 발광 그라디언트로 폴백한다. progress로 밀도·분열 속도를 구동하고 분열 시 onDivision 호출.
 */
export default {
  title: 'Interactive/12. Scroll/CellDivisionCanvas',
  component: CellDivisionCanvas,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '스크롤 진행도 0~1 (세포 밀도·분열 속도)',
    },
    count: {
      control: { type: 'number', min: 1, max: 40 },
      description: '최대 세포 수',
    },
    color: { control: 'color', description: '절차적 폴백 세포 색' },
    onDivision: { action: 'division', description: '세포 분열 시작 시 호출' },
  },
};

/** 기본 — Controls의 progress로 밀도/분열 조절 (검정 배경 위 발광) */
export const Default = {
  args: {
    progress: 0.5,
    count: 14,
    color: '#AAFF00',
  },
  render: (args) => (
    <Box sx={ { height: '80vh', backgroundColor: 'background.default' } }>
      <CellDivisionCanvas { ...args } />
    </Box>
  ),
};

/** progress 슬라이더 + 분열 카운터 데모 */
const ScrubDemo = () => {
  const [progress, setProgress] = useState(0.2);
  const [divisions, setDivisions] = useState(0);

  return (
    <Box sx={ { position: 'relative', height: '80vh', backgroundColor: 'background.default' } }>
      <CellDivisionCanvas progress={ progress } onDivision={ () => setDivisions((n) => n + 1) } />
      <Box sx={ { position: 'absolute', bottom: 24, left: 24, right: 24, zIndex: 1 } }>
        <Typography variant="overline" color="text.secondary" sx={ { display: 'block' } }>
          { `Progress: ${progress.toFixed(2)} · Divisions: ${divisions}` }
        </Typography>
        <Slider
          value={ progress }
          onChange={ (_, next) => setProgress(next) }
          min={ 0 }
          max={ 1 }
          step={ 0.01 }
          color="secondary"
        />
      </Box>
    </Box>
  );
};

export const Scrub = {
  render: () => <ScrubDemo />,
};
