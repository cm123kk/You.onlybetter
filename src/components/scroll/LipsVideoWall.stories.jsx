import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { LipsVideoWall } from './LipsVideoWall.jsx';

/**
 * LipsVideoWall — 인트로 욕망 비트. 그레이딩된 립스 루프 영상 1개를 캔버스로 풀블리드
 * 타일링해 progress 에 따라 단일 → CRT TV 월(격자)로 멀티플라이하고, 욕망 3연을
 * 격자 단계와 1:1로 하나씩 교체 stamp 한다. (실사용 시 progress 는 스크롤에서 구동)
 */
export default {
  title: 'Custom Component/LipsVideoWall',
  component: LipsVideoWall,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '비트 로컬 진행도 0~1 (격자 밀도·활성 단어 구동)',
    },
    words: { control: 'object', description: '순차 stamp 할 단어 목록' },
    steps: { control: 'object', description: '각 단어가 활성화되는 progress 임계값' },
    gridSteps: { control: 'object', description: '단계별 격자 한 변 타일 수 (예: [1,3,5])' },
    videoWebm: { control: 'text', description: '립스 루프 webm 경로' },
    videoMp4: { control: 'text', description: '립스 루프 mp4 폴백 경로' },
    posterSrc: { control: 'text', description: '영상 로드 전/폴백 스틸 경로' },
    textColor: { control: 'color', description: 'stamp 텍스트 색' },
    onStep: { action: 'step', description: '활성 단어(격자 단계) 진입 시 호출' },
    sx: { control: false, description: '루트 컨테이너 MUI sx' },
  },
};

/** 기본: progress 슬라이더로 단일→멀티플라이 단계를 직접 스크럽 */
export const Default = {
  args: {
    progress: 0.5,
    words: ['Younger.', 'More beautiful.', 'More perfect.'],
    steps: [0, 0.4, 0.75],
    gridSteps: [1, 3, 5],
    videoWebm: '/video/lips-loop.webm',
    videoMp4: '/video/lips-loop.mp4',
    posterSrc: '/video/lips-poster.jpg',
    textColor: '#AAFF00',
  },
  render: (args) => (
    <Box sx={ { height: '80vh', backgroundColor: 'background.default' } }>
      <LipsVideoWall { ...args } />
    </Box>
  ),
};

/** 3단계 스냅샷 — "단어 1개 = 격자 1스텝" 동기를 한눈에 (단일 / 3×3 / 풀 월) */
export const Steps = {
  parameters: { controls: { disable: true } },
  render: () => {
    const snapshots = [
      { p: 0.0, label: 'STEP 1 · progress 0.00 · 단일' },
      { p: 0.5, label: 'STEP 2 · progress 0.50 · 3×3' },
      { p: 0.9, label: 'STEP 3 · progress 0.90 · 풀 월' },
    ];
    return (
      <Box sx={ { display: 'grid', gridTemplateRows: 'repeat(3, 34vh)', gap: 1, p: 1, backgroundColor: 'background.default' } }>
        { snapshots.map((s) => (
          <Box key={ s.p } sx={ { position: 'relative' } }>
            <LipsVideoWall progress={ s.p } />
            <Typography
              variant="caption"
              sx={ {
                position: 'absolute', bottom: 8, left: 8, px: 1, py: 0.25,
                backgroundColor: 'rgba(0,0,0,0.6)', color: '#F5F5F0', fontFamily: 'monospace',
              } }
            >
              { s.label }
            </Typography>
          </Box>
        )) }
      </Box>
    );
  },
};
