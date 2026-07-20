import Box from '@mui/material/Box';
import { ProtocolPhaseCard } from './ProtocolPhaseCard';

export default {
  title: 'Component/3. Card/ProtocolPhaseCard',
  component: ProtocolPhaseCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    docs: {
      description: {
        component: `
## ProtocolPhaseCard

The Substance "THE PROTOCOL" 섹션의 Phase 카드.
공개도(disclosure)에 따라 정보 노출 정도가 달라지며, LockedPhase 기능이 disclosure='locked' 상태로 통합되어 있습니다.

### 공개 상태 (disclosure)
- **full**: 본문 전체 공개. \`isIrreversible\`로 'IRREVERSIBLE' 뱃지 노출 (Phase 01 ACTIVATION)
- **half**: 본문 후반부를 검열 바(블러 블록)로 가려 정보 결핍을 유도 (Phase 02 STABILIZATION)
- **locked**: 카드 전체 흐림/잠금. hover 시 error.main 'ACCESS DENIED' 오버레이 페이드 인 (Phase 03 CONTINUATION)

### locked hover 콜백
- \`onLockHoverStart\` / \`onLockHoverEnd\`로 hover 시작/해제를 알려 페이지에서 사운드 침묵 등을 트리거할 수 있습니다.
        `,
      },
    },
  },
  argTypes: {
    phaseId: {
      control: 'text',
      description: 'Phase 식별 번호 (예: 01)',
    },
    label: {
      control: 'text',
      description: 'Phase 명칭 (예: ACTIVATION)',
    },
    disclosure: {
      control: 'select',
      options: ['full', 'half', 'locked'],
      description: '공개 상태',
    },
    body: {
      control: 'text',
      description: 'Phase 본문 텍스트',
    },
    isIrreversible: {
      control: 'boolean',
      description: 'Irreversible 뱃지 표시 여부',
    },
    onLockHoverStart: {
      action: 'lockHoverStart',
      description: 'locked 상태 hover 시작 콜백',
    },
    onLockHoverEnd: {
      action: 'lockHoverEnd',
      description: 'locked 상태 hover 해제 콜백',
    },
    sx: {
      control: 'object',
      description: '추가 스타일',
    },
  },
};

/**
 * 기본 예시 (전문 공개)
 */
export const Default = {
  args: {
    phaseId: '01',
    label: 'ACTIVATION',
    disclosure: 'full',
    body: 'The substance separates the self. A new, better version emerges from within. This process cannot be undone once it begins.',
    isIrreversible: true,
  },
  render: (args) => (
    <ProtocolPhaseCard { ...args } sx={ { width: 420 } } />
  ),
};

/**
 * 절반 공개 — 후반부 검열 바로 정보 결핍 유도
 */
export const HalfDisclosure = {
  args: {
    phaseId: '02',
    label: 'STABILIZATION',
    disclosure: 'half',
    body: 'Balance is required. Seven days of activation, seven days of rest. Deviation from the protocol results in consequences that remain undisclosed at this tier.',
    isIrreversible: false,
  },
  render: (args) => (
    <ProtocolPhaseCard { ...args } sx={ { width: 420 } } />
  ),
};

/**
 * 전체 잠금 — hover 시 ACCESS DENIED 오버레이
 */
export const Locked = {
  args: {
    phaseId: '03',
    label: 'CONTINUATION',
    disclosure: 'locked',
    body: 'The cycle does not end. It only deepens beyond the point of return.',
    isIrreversible: false,
  },
  render: (args) => (
    <ProtocolPhaseCard { ...args } sx={ { width: 420 } } />
  ),
};

/**
 * 세 단계 공개도 비교 (full / half / locked)
 */
export const DisclosureStages = {
  render: () => (
    <Box sx={ { display: 'flex', gap: 3, flexWrap: 'wrap' } }>
      <ProtocolPhaseCard
        phaseId="01"
        label="ACTIVATION"
        disclosure="full"
        body="The substance separates the self. A new version emerges from within."
        isIrreversible
        sx={ { width: 340 } }
      />
      <ProtocolPhaseCard
        phaseId="02"
        label="STABILIZATION"
        disclosure="half"
        body="Balance is required. Seven days of activation, seven days of rest without exception at any cost."
        sx={ { width: 340 } }
      />
      <ProtocolPhaseCard
        phaseId="03"
        label="CONTINUATION"
        disclosure="locked"
        body="The cycle does not end. It only deepens beyond the point of return."
        sx={ { width: 340 } }
      />
    </Box>
  ),
};
