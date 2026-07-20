import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { YolkMorph } from './YolkMorph.jsx';

/**
 * YolkMorph — 계란 노른자(원본 자아)가 둘로 분열하는 실사 SVG 비주얼.
 * 돔 그라디언트 + 젖은 specular + gooey 필터로 진짜 노른자처럼 렌더하며,
 * progress(0~1)로 분열을 제어한다(페이지에서는 scrollProgress 파생값 주입).
 */
export default {
  title: 'Interactive/14. Motion/YolkMorph',
  component: YolkMorph,
  tags: ['autodocs'],
  parameters: {
    backgrounds: { default: 'dark' },
  },
  argTypes: {
    size: {
      control: { type: 'number', min: 80, max: 480 },
      description: '정사각 크기(px)',
    },
    progress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: '분열 진행도 0(온전) ~ 1(완전 분열)',
    },
    maxSeparation: {
      control: { type: 'number', min: 20, max: 80 },
      description: '최대 분리 거리(SVG 좌표 단위)',
    },
    zoom: {
      control: { type: 'range', min: 1, max: 2.2, step: 0.05 },
      description: '사진 확대율 (클수록 노른자만, 낮추면 테두리 흰자 점액질 살짝)',
    },
    redMute: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: '중앙 붉은 점 뭉개기 강도 0(자연)~1(완전 제거)',
    },
    hasSurface: {
      control: 'boolean',
      description: '표면 배경 렌더 (top-down flat-lay)',
    },
    surfaceColor: {
      control: 'color',
      description: '표면 배경색 (영화 노른자 씬 = 소프트 블루)',
    },
    hasAlbumen: {
      control: 'boolean',
      description: '노른자 주변 반투명 흰자 웅덩이',
    },
    hasShadow: {
      control: 'boolean',
      description: '접촉 그림자/AO (바닥에 놓인 느낌)',
    },
    hasWobble: {
      control: 'boolean',
      description: 'idle 호흡 애니메이션 (reduced-motion에서 정지)',
    },
  },
};

/** 기본 — progress 슬라이더를 움직여 분열을 직접 확인 */
export const Default = {
  args: {
    size: 300,
    progress: 0,
    maxSeparation: 46,
    zoom: 1.15,
    redMute: 0.1,
    hasSurface: true,
    surfaceColor: '#87C1E0',
    hasAlbumen: true,
    hasShadow: true,
    hasWobble: true,
  },
};

/** 시퀀스 — 온전 → 그린 주입 → 꿀렁(활성화) → 분열 */
export const Sequence = {
  render: () => (
    <Stack direction="row" spacing={ 4 } alignItems="center">
      { [
        { p: 0, label: '온전' },
        { p: 0.28, label: '주입' },
        { p: 0.5, label: '꿀렁' },
        { p: 0.8, label: '분열 중' },
        { p: 1, label: '분열' },
      ].map(({ p, label }) => (
        <Stack key={ p } spacing={ 1 } alignItems="center">
          <YolkMorph size={ 150 } progress={ p } hasWobble={ false } />
          <Typography variant="caption" color="text.secondary">{ label } ({ p })</Typography>
        </Stack>
      )) }
    </Stack>
  ),
};
