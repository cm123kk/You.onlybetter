import { useState } from 'react';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

import { IntroLogoBleed } from './IntroLogoBleed.jsx';

/**
 * IntroLogoBleed — The Substance 인트로 오프닝. 흰 배경 + 검은 ◗◗ 로고로 시작해 progress로
 * 검정이 원형 확산(로고 블리드)하며 배경이 #0A0A0A로 바뀌고, 그 위에 활성화 스크립트가
 * 형광 그린으로 순차 stamp된다. 블리드 완료 시 좌상단에 흰 로고가 등장한다.
 * 페이지에서는 인트로 구간의 scrollProgress를 progress로 주입한다.
 */
export default {
  title: 'Interactive/12. Scroll/IntroLogoBleed',
  component: IntroLogoBleed,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '인트로 진행도 0~1 (블리드 + 스크립트 리빌 구동)',
    },
    bleedEnd: {
      control: { type: 'range', min: 0.1, max: 0.6, step: 0.02 },
      description: '블리드가 완료되는 진행도 지점',
    },
    logoSize: {
      control: { type: 'number', min: 48, max: 240 },
      description: '시작 중앙 로고 크기(px)',
    },
    hasGnbLogo: {
      control: 'boolean',
      description: '블리드 완료 시 좌상단 흰 로고 노출',
    },
    lines: { control: 'object', description: '활성화 스크립트 라인 { text, isDing }' },
    onLineReveal: { action: 'lineReveal', description: '라인 stamp 시 호출' },
    onBleedComplete: { action: 'bleedComplete', description: '블리드 완료 시 1회 호출' },
  },
};

/** 기본 — progress 슬라이더로 블리드와 스크립트 리빌을 직접 확인 */
export const Default = {
  args: {
    progress: 0,
    bleedEnd: 0.3,
    logoSize: 96,
    hasGnbLogo: true,
  },
  render: (args) => (
    <Box sx={ { height: '100vh' } }>
      <IntroLogoBleed { ...args } />
    </Box>
  ),
};

/** 인터랙티브 — 슬라이더가 곧 스크롤. 리빌/블리드 완료 로그로 사운드 트리거 타이밍 확인 */
const ScrollDemo = () => {
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState('대기 중 — 슬라이더를 올려보세요');

  return (
    <Box sx={ { position: 'relative', height: '100vh' } }>
      <IntroLogoBleed
        progress={ progress }
        onLineReveal={ (i, line) => setLog(`라인 ${ i } stamp: "${ line.text }"${ line.isDing ? ' (딩~)' : '' }`) }
        onBleedComplete={ () => setLog('블리드 완료 → GNB 로고 등장') }
      />
      <Box
        sx={ {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          p: 2,
          backgroundColor: 'rgba(10,10,10,0.7)',
          backdropFilter: 'blur(4px)',
        } }
      >
        <Typography variant="overline" color="secondary.main" sx={ { display: 'block' } }>
          { `진행: ${ (progress * 100).toFixed(0) }% · ${ log }` }
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

export const Interactive = {
  render: () => <ScrollDemo />,
};
