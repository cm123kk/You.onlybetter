import Box from '@mui/material/Box';

import { SyringeInjector } from './SyringeInjector.jsx';
import { YolkMorph } from './YolkMorph.jsx';

/**
 * SyringeInjector — 큰 주사기가 왼쪽에서 슬라이드 인 → 바늘로 주입(플런저 눌림) → 왼쪽으로 후퇴.
 * progress(0~1) 하나로 진입/주입/후퇴를 구동한다. 실사 주사기 사진(투명 PNG) + 코드 SVG 폴백.
 * 페이지에선 HOW IT WORKS 섹션의 scrollProgress를 그대로 주입한다.
 */
export default {
  title: 'Interactive/14. Motion/SyringeInjector',
  component: SyringeInjector,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '진행도 0~1 (진입→주입→후퇴)',
    },
    scale: { control: 'text', description: '주사기 이미지 폭(컨테이너 대비 %)' },
    dockX: { control: { type: 'range', min: -70, max: 10, step: 1 }, description: '도킹 translateX(%) — 바늘 도달 위치' },
    enterEnd: { control: { type: 'range', min: 0.05, max: 0.3, step: 0.01 }, description: '진입 완료 지점' },
    injectEnd: { control: { type: 'range', min: 0.2, max: 0.6, step: 0.01 }, description: '주입 완료 지점' },
    retractEnd: { control: { type: 'range', min: 0.3, max: 0.7, step: 0.01 }, description: '후퇴 완료 지점' },
  },
};

/** 기본 — 주사기 단독(판단용). progress 슬라이더로 진입→주입(액체 배출)→후퇴, 눈금·기포 확인 */
export const Default = {
  args: {
    progress: 0.2,
    scale: '66%',
    dockX: -26,
    enterEnd: 0.12,
    injectEnd: 0.33,
    retractEnd: 0.45,
  },
  render: (args) => (
    <Box sx={ { position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: '#87C1E0' } }>
      <SyringeInjector { ...args } />
    </Box>
  ),
};

/** 노른자에 주입 — 주사기(아래) → 노른자(위)가 바늘 끝을 가려 "찌르는" 느낌 */
export const IntoYolk = {
  args: { progress: 0.2, scale: '66%', dockX: -26 },
  render: (args) => (
    <Box sx={ { position: 'relative', height: '100vh', overflow: 'hidden', backgroundColor: '#87C1E0' } }>
      <SyringeInjector { ...args } sx={ { zIndex: 1 } } />
      <Box sx={ { position: 'absolute', inset: 0, zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' } }>
        <YolkMorph progress={ args.progress } size={ 360 } hasSurface={ false } hasAlbumen={ false } />
      </Box>
    </Box>
  ),
};
