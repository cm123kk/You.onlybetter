// 기획 문서를 단일 소스(docs/)에서 그대로 가져온다 (Vite ?raw)
import visualMd from '../../../../docs/the-substance/03-visual-direction.md?raw';
import { DocCover } from './DocCover.jsx';

/**
 * THE SUBSTANCE — 03. Visual Direction
 *
 * 기획 3부작 중 3편. 컬러 5색 · 타이포 · 토큰 변경표.
 * 원본: docs/the-substance/03-visual-direction.md
 */
export default {
  title: 'Overview/The Substance/03. Visual Direction',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: { component: visualMd },
    },
  },
};

/** 커버 — 전체 문서는 Docs 탭 참조 */
export const Doc = {
  name: 'Visual Direction',
  render: () => <DocCover title="03 — VISUAL DIRECTION" />,
};
