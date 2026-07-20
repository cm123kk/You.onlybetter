import { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import { SubstanceSyringe } from './SubstanceSyringe.jsx';

/**
 * SubstanceSyringe — 좌측 임상 주사기 게이지. 형광 그린 물질이 가득 찼다가 fill(0~1)이
 * 줄면 플런저가 내려오며 "주입"된다. 주/부 눈금(숫자 없음)으로 계측기 느낌.
 * 페이지에선 fill = 1 - scrollProgress 로 스크롤할수록 줄어들게 쓴다.
 */
export default {
  title: 'Common/SubstanceSyringe',
  component: SubstanceSyringe,
  tags: ['autodocs'],
  parameters: { backgrounds: { default: 'dark' } },
  argTypes: {
    fill: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '형광물질 레벨 0(빔)~1(가득)',
    },
    color: { control: 'text', description: '물질 색 theme 토큰' },
    minorCount: { control: { type: 'number', min: 10, max: 80 }, description: '부 눈금 간격 수' },
    majorEvery: { control: { type: 'number', min: 2, max: 10 }, description: '몇 칸마다 주 눈금' },
    hasBubbles: { control: 'boolean', description: '상승 기포 애니메이션' },
  },
};

/** 기본 — fill 슬라이더로 주입 레벨 조절 (세로라 높이 필요) */
export const Default = {
  args: {
    fill: 1,
    color: 'secondary.main',
    minorCount: 40,
    majorEvery: 5,
    hasBubbles: true,
  },
  render: (args) => (
    <Box sx={ { height: '80vh', backgroundColor: 'background.default', display: 'flex', pl: 3 } }>
      <SubstanceSyringe { ...args } />
    </Box>
  ),
};

/** 스크롤 시뮬레이션 — 슬라이더가 곧 스크롤(주입) */
const InjectDemo = () => {
  const [progress, setProgress] = useState(0);

  return (
    <Box sx={ { height: '80vh', backgroundColor: 'background.default', display: 'flex', alignItems: 'stretch', pl: 3, gap: 4 } }>
      <SubstanceSyringe fill={ 1 - progress } />
      <Box sx={ { alignSelf: 'center', width: 260 } }>
        <Typography variant="overline" color="text.secondary" sx={ { display: 'block' } }>
          { `주입 진행: ${(progress * 100).toFixed(0)}%` }
        </Typography>
        <Slider value={ progress } onChange={ (_, next) => setProgress(next) } min={ 0 } max={ 1 } step={ 0.01 } color="secondary" />
      </Box>
    </Box>
  );
};

export const Inject = {
  render: () => <InjectDemo />,
};
