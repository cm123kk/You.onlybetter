// 기획 문서를 단일 소스(docs/)에서 그대로 가져온다 (Vite ?raw)
import planMd from '../../../../docs/the-substance/05-implementation-plan.md?raw';
import { DocCover } from './DocCover.jsx';

/**
 * THE SUBSTANCE — 05. Implementation Plan (컴포넌트 생성 · 구현 계획)
 *
 * 02(UX Flow)·03(Visual Direction)·04(Desire UX)의 확정 원칙을 코드로 옮기는 실행 계획.
 * 핵심 결정(테마 교체·실사 하이브리드·하이브리드 사운드), Phase별 컴포넌트, 진행 순서/상태.
 * 원본: docs/the-substance/05-implementation-plan.md
 */
export default {
  title: 'Overview/The Substance/05. Implementation Plan',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: { component: planMd },
    },
  },
};

/** 커버 — 전체 계획은 Docs 탭 참조 */
export const Doc = {
  name: 'Implementation Plan',
  render: () => <DocCover title="05 — IMPLEMENTATION PLAN" />,
};
