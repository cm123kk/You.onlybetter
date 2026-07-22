import { useRef } from 'react';
import Box from '@mui/material/Box';
import { SubstanceHeroDuality } from './SubstanceHeroDuality.jsx';
import { useScrollProgress } from '../../utils/substance/useScrollProgress';

/**
 * SubstanceHeroDuality — 랜딩 HERO(이중 자아). 인트로 종료(검정) 직후 이어지며, 스크롤로 젊음↔늙음
 * 회전(i2v 영상 스크럽)을 드러내고 "YOU. ONLY BETTER." + 서브카피를 순차 리빌한다.
 * (실사 회전영상 rotationVideoSrc 미제공 시 placeholder 미디어로 레이아웃/카피/전환 검증)
 */
export default {
  title: 'Component/Scroll/SubstanceHeroDuality',
  component: SubstanceHeroDuality,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen', backgrounds: { default: 'dark' } },
  argTypes: {
    progress: { control: { type: 'range', min: 0, max: 1, step: 0.01 }, description: 'HERO 진행도 0~1(스크롤 파생)' },
    rotationVideoSrc: { control: 'text', description: '젊음→늙음 회전 실사 영상(all-intra) URL' },
    poster: { control: 'text', description: '회전영상 포스터 URL' },
    headline: { control: 'text', description: '헤드라인(ALL CAPS)' },
    sublines: { control: 'object', description: '순차 리빌 서브카피 라인' },
    rotationStart: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    rotationEnd: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    sx: { control: false },
  },
};

/** 기본 — progress 슬라이더로 인물 페이드인 → 헤드라인 stamp → 회전 → 카피 → 용해 스크럽 */
export const Default = {
  args: { progress: 0.3 },
  render: (args) => (
    <Box sx={ { height: '100vh' } }>
      <SubstanceHeroDuality { ...args } />
    </Box>
  ),
};

/** 스크롤 구동 데모 — 실제 스크롤로 회전/카피가 진행되는 모습(320vh sticky) */
function ScrollDemoHero() {
  const ref = useRef(null);
  const { progress } = useScrollProgress(ref);
  return (
    <Box ref={ ref } sx={ { height: '320vh', position: 'relative', backgroundColor: '#0A0A0A' } }>
      <Box sx={ { position: 'sticky', top: 0, height: '100vh' } }>
        <SubstanceHeroDuality progress={ progress } />
      </Box>
    </Box>
  );
}

export const ScrollDemo = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => <ScrollDemoHero />,
};
