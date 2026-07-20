import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DualitySequence from './DualitySequence';

export default {
  title: 'Interactive/11. KineticTypography/DualitySequence',
  component: DualitySequence,
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: 'text',
      description: '분화시킬 대형 텍스트',
    },
    stage: {
      control: 'radio',
      options: ['A', 'B', 'C'],
      description: '진행 단계 프리셋 (A: 온전, B: 어긋남, C: 완전 분리)',
    },
    progress: {
      control: { type: 'number', min: 0, max: 1, step: 0.05 },
      description: '분화 진행도 0~1 (지정 시 stage보다 우선)',
    },
    budStart: {
      control: { type: 'range', min: 0, max: 0.6, step: 0.02 },
      description: '두 번째가 싹트는 시작점(첫 번째 중앙 기준 오른쪽 em). 올리면 O 구멍 밖 획 안에서 시작',
    },
    spread: {
      control: { type: 'range', min: 0.3, max: 1.6, step: 0.05 },
      description: '분리 후 두 자아 사이 추가 간격(em)',
    },
    stickiness: {
      control: { type: 'range', min: 0, max: 24, step: 1 },
      description: '이어짐 점성(gooey blur 최대치). 갈라지는 중에만 적용, 분리되면 선명',
    },
  },
};

export const Default = {
  args: {
    text: 'YOU',
    stage: 'A',
    progress: undefined,
  },
};

/** stage 프리셋(A/B/C) 비교 */
export const Stages = {
  render: () => (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 4 } }>
      { ['A', 'B', 'C'].map((s) => (
        <Box key={ s }>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={ { mb: 1, display: 'block' } }
          >
            { `Stage ${s}` }
          </Typography>
          <DualitySequence text="YOU" stage={ s } />
        </Box>
      )) }
    </Box>
  ),
};

/** progress 값을 슬라이더로 직접 제어 */
const ScrubDemo = () => {
  const [progress, setProgress] = useState(0);

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3 } }>
      <DualitySequence text="YOU" progress={ progress } />
      <Box sx={ { px: 1 } }>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={ { display: 'block' } }
        >
          { `Progress: ${progress.toFixed(2)}` }
        </Typography>
        <Slider
          value={ progress }
          onChange={ (_, next) => setProgress(next) }
          min={ 0 }
          max={ 1 }
          step={ 0.01 }
        />
      </Box>
    </Box>
  );
};

export const Scrub = {
  render: () => <ScrubDemo />,
};

/** stage 토글로 전환 애니메이션(CSS transition) 확인 */
const SequenceDemo = () => {
  const [stage, setStage] = useState('A');

  return (
    <Box sx={ { display: 'flex', flexDirection: 'column', gap: 3 } }>
      <DualitySequence text="SELF" stage={ stage } />
      <ToggleButtonGroup
        value={ stage }
        exclusive
        onChange={ (_, next) => next && setStage(next) }
        sx={ { alignSelf: 'flex-start' } }
      >
        <ToggleButton value="A">Stage A</ToggleButton>
        <ToggleButton value="B">Stage B</ToggleButton>
        <ToggleButton value="C">Stage C</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export const Sequence = {
  render: () => <SequenceDemo />,
};
