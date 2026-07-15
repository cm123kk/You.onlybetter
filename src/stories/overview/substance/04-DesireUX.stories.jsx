// 기획 문서를 단일 소스(docs/)에서 그대로 가져온다 (Vite ?raw)
import desireUxMd from '../../../../docs/the-substance/04-desire-ux-and-sound.md?raw';
import { DocCover } from './DocCover.jsx';

/**
 * THE SUBSTANCE — 04. Desire UX (사운드 = 욕망의 채널)
 *
 * 사운드·카피·인터랙션 모든 감각 결정의 상위 원칙.
 * 욕망의 UX(불안 심고 각성 전이 → 해소 유보 → 통제권은 유저),
 * 사운드=욕망의 채널, 5개 레버, "꿈은 공개·대가는 은닉" 교정 원칙.
 * 원본: docs/the-substance/04-desire-ux-and-sound.md
 */
export default {
  title: 'Overview/The Substance/04. Desire UX',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: { component: desireUxMd },
    },
  },
};

/** 커버 — 전체 문서는 Docs 탭 참조 */
export const Doc = {
  name: 'Desire UX',
  render: () => <DocCover title="04 — DESIRE UX · SOUND" />,
};
