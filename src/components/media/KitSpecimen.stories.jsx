import Box from '@mui/material/Box';
import { KitSpecimen } from './KitSpecimen.jsx';

/** ACTIVATOR 뜯기 프레임 시퀀스 (봉인 → 코너 → 대부분 → 완전 개봉) */
const ACTIVATOR_FRAMES = [
  '/kit/activator-f1.png',
  '/kit/activator-f2.png',
  '/kit/activator-f3.png',
  '/kit/activator-f4.png',
];

/**
 * KitSpecimen — PROTOCOL 키트 실사. 봉인→개봉 프레임 시퀀스를 openProgress로 스크럽(인접 프레임
 * crossfade). 넘버링 키트(STABILIZER/FOOD)는 수직 넘버-라인 프로그레스 게이지를 오버레이한다.
 * (실사용 시 openProgress는 스크롤/Phase 진행도에서 구동)
 */
export default {
  title: 'Component/4. Media/KitSpecimen',
  component: KitSpecimen,
  tags: ['autodocs'],
  parameters: { layout: 'centered', backgrounds: { default: 'dark' } },
  argTypes: {
    frames: { control: 'object', description: '봉인→개봉 순 실사 프레임 URL 배열' },
    openProgress: { control: { type: 'range', min: 0, max: 1, step: 0.01 }, description: '뜯기 진행도 0~1 (frames 스크럽)' },
    consumedSrc: { control: 'text', description: '소진(쭈글 빈 비닐) 실사' },
    consumeProgress: { control: { type: 'range', min: 0, max: 1, step: 0.01 }, description: '소진 crossfade 0~1' },
    isConsumed: { control: 'boolean', description: 'true면 consumeProgress=1' },
    segments: { control: { type: 'number', min: 0, max: 7 }, description: '넘버링 게이지 칸 수(ACTIVATOR=0, STABILIZER/FOOD=7)' },
    activeSegment: { control: { type: 'number', min: 0, max: 7 }, description: '현재 소진 넘버(1~segments)' },
    onAdminister: { action: 'administer', description: '완전 개봉 시 1회(인젝션 사운드)' },
    label: { control: 'text', description: '접근성 라벨' },
    sx: { control: false },
  },
};

/** 기본: openProgress 슬라이더로 봉인→개봉 스크럽 (ACTIVATOR, 게이지 없음) */
export const Default = {
  args: {
    frames: ACTIVATOR_FRAMES,
    openProgress: 0.5,
    segments: 0,
    activeSegment: 0,
    label: 'ACTIVATOR',
  },
  render: (args) => (
    <Box sx={ { width: 520, height: 400, backgroundColor: 'background.default' } }>
      <KitSpecimen { ...args } />
    </Box>
  ),
};

/** 넘버링 게이지 — STABILIZER/FOOD 같은 1–7 넘버 키트의 수직 프로그레스 라인 */
export const NumberedGauge = {
  args: {
    frames: ACTIVATOR_FRAMES,
    openProgress: 0.7,
    segments: 7,
    activeSegment: 4,
    label: 'STABILIZER',
  },
  render: (args) => (
    <Box sx={ { width: 520, height: 400, backgroundColor: 'background.default' } }>
      <KitSpecimen { ...args } />
    </Box>
  ),
};
