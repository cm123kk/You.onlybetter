// 기획 문서를 단일 소스(docs/)에서 그대로 가져온다 (Vite ?raw)
import uxFlowMd from '../../../../docs/the-substance/02-ux-flow.md?raw';
import { DocCover } from './DocCover.jsx';

/**
 * THE SUBSTANCE — 02. UX Flow
 *
 * 기획 3부작 중 2편. 스크롤 안무 · 인터랙션→사운드 매핑 포함.
 * 원본: docs/the-substance/02-ux-flow.md
 * (Mermaid 다이어그램은 Docs 탭에서 코드 블록으로 표시된다)
 */
export default {
  title: 'Overview/The Substance/02. UX Flow',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: { component: uxFlowMd },
    },
  },
};

/** 커버 — 전체 문서는 Docs 탭 참조 */
export const Doc = {
  name: 'UX Flow',
  render: () => <DocCover title="02 — UX FLOW" />,
};
