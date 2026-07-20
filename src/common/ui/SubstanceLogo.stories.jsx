import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { SubstanceLogo } from './SubstanceLogo.jsx';

/**
 * SubstanceLogo — The Substance ◗◗ 아이덴티티 심볼.
 * 워드마크 없이 이 심볼 하나로 브랜드가 성립하며, hover 시 두 반원이 좌우로 벌어져
 * "분열/이중 자아"를 드러낸다. 색상은 theme 토큰(기본 primary.main = 옐로)을 사용한다.
 */
export default {
  title: 'Common/SubstanceLogo',
  component: SubstanceLogo,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'number', min: 16, max: 240 },
      description: '심볼 정사각 크기(px)',
    },
    color: {
      control: 'text',
      description: '심볼 색상 theme 토큰 (예: primary.main, secondary.main)',
    },
    hasSplitOnHover: {
      control: 'boolean',
      description: 'hover 시 두 반원 분리 애니메이션 활성화',
    },
    splitGap: {
      control: { type: 'number', min: 0, max: 30 },
      description: 'hover 분리 간격 (SVG 좌표 단위, size에 비례)',
    },
    title: {
      control: 'text',
      description: '접근성 라벨 (aria-label)',
    },
    onClick: { action: 'clicked', description: '클릭 핸들러 (지정 시 role=button)' },
  },
};

/** 기본 — Controls로 크기·색·분리 간격을 직접 조작 (마우스를 올려 분리 확인) */
export const Default = {
  args: {
    size: 96,
    color: 'primary.main',
    hasSplitOnHover: true,
    splitGap: 8,
    title: 'The Substance',
  },
};

/** 주요 변형 — 크기 / 색(정적 옐로 vs 동적 그린) / 분리 on·off */
export const Variants = {
  render: () => (
    <Stack direction="row" spacing={ 5 } alignItems="flex-end">
      <Stack spacing={ 1 } alignItems="center">
        <SubstanceLogo size={ 48 } />
        <Typography variant="caption" color="text.secondary">48 · 옐로</Typography>
      </Stack>
      <Stack spacing={ 1 } alignItems="center">
        <SubstanceLogo size={ 96 } />
        <Typography variant="caption" color="text.secondary">96 · 옐로</Typography>
      </Stack>
      <Stack spacing={ 1 } alignItems="center">
        <SubstanceLogo size={ 96 } color="secondary.main" />
        <Typography variant="caption" color="text.secondary">그린(예외)</Typography>
      </Stack>
      <Stack spacing={ 1 } alignItems="center">
        <SubstanceLogo size={ 96 } hasSplitOnHover={ false } />
        <Typography variant="caption" color="text.secondary">분리 off</Typography>
      </Stack>
    </Stack>
  ),
};
