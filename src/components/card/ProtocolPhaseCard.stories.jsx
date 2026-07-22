import { useRef } from 'react';
import Box from '@mui/material/Box';
import { ProtocolPhaseCard } from './ProtocolPhaseCard';
import { useScrollProgress } from '../../utils/substance/useScrollProgress';

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
    kitFrames: {
      control: 'object',
      description: '키트 뜯기 프레임 시퀀스(봉인→개봉). 있으면 텍스트+키트 side-by-side 배치',
    },
    scrollProgress: {
      control: { type: 'range', min: 0, max: 1, step: 0.01 },
      description: 'Phase 진행도 0~1 → 키트 뜯기(openProgress) 구동',
    },
    kitSegments: {
      control: { type: 'number', min: 0, max: 7 },
      description: '넘버링 키트 게이지 칸 수(STABILIZER/FOOD=7, ACTIVATOR=0)',
    },
    kitActiveSegment: {
      control: { type: 'number', min: 0, max: 7 },
      description: '현재 소진 넘버(1~kitSegments)',
    },
    onAdminister: {
      action: 'administer',
      description: '키트 완전 개봉 시 1회(인젝션 사운드)',
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
 * 키트 + 세로 페이즈 프로그레스 레일 — Phase 01 ACTIVATION.
 * scrollProgress 슬라이더로: (1) 레일 연결선이 흰색→형광으로 채워지고 (2) 동시에 ACTIVATOR 키트가
 * 봉인→완전 개봉으로 뜯긴다(1.0에서 완전 개봉·administer). 임팩트 있게 큰 키트 이미지.
 */
export const WithKit = {
  args: {
    phaseId: '01',
    label: 'ACTIVATION',
    disclosure: 'full',
    body: 'ONE ACTIVATION. YOUR OTHER SELF IS BORN — YOUNGER, MORE PERFECT. ADMINISTERED ONCE.',
    kitFrames: [
      '/kit/activator-f1.png',
      '/kit/activator-f2.png',
      '/kit/activator-f3.png',
      '/kit/activator-f4.png',
    ],
    scrollProgress: 0,
    kitSegments: 0,
    kitActiveSegment: 0,
  },
  render: (args) => (
    <ProtocolPhaseCard { ...args } sx={ { width: 1040, maxWidth: '94vw' } } />
  ),
};

/**
 * 스크롤 구동 데모 — 캔버스를 스크롤하면 (1) 좌측 레일 선이 흰색→형광으로 차오르고
 * (2) 동시에 ACTIVATOR 키트가 봉인→완전 개봉으로 뜯긴다. (진짜 scrollProgress로 구동)
 */
function ScrollDemoCard() {
  const ref = useRef(null);
  const { progress } = useScrollProgress(ref);
  return (
    <Box ref={ ref } sx={ { height: '320vh', position: 'relative', backgroundColor: 'background.default' } }>
      <Box sx={ { position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, md: 4 } } }>
        <ProtocolPhaseCard
          phaseId="01"
          label="ACTIVATION"
          body="ONE ACTIVATION. YOUR OTHER SELF IS BORN — YOUNGER, MORE PERFECT. ADMINISTERED ONCE."
          kitFrames={ [
            '/kit/activator-f1.png',
            '/kit/activator-f2.png',
            '/kit/activator-f3.png',
            '/kit/activator-f4.png',
          ] }
          scrollProgress={ progress }
          sx={ { width: '100%', maxWidth: 1100 } }
        />
      </Box>
    </Box>
  );
}

export const ScrollDemo = {
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => <ScrollDemoCard />,
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
