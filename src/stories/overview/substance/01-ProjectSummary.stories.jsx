// 기획 문서를 단일 소스(docs/)에서 그대로 가져온다 (Vite ?raw)
import summaryMd from '../../../../docs/the-substance/01-project-summary.md?raw';
import { DocCover } from './DocCover.jsx';

/**
 * THE SUBSTANCE — 01. Project Summary
 *
 * 기획 3부작 중 1편. 전체 내용은 Docs 탭에서 렌더된다.
 * 원본: docs/the-substance/01-project-summary.md
 */
export default {
  title: 'Overview/The Substance/01. Project Summary',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: { component: summaryMd },
    },
  },
};

/** 커버 — 전체 문서는 Docs 탭 참조 */
export const Doc = {
  name: 'Project Summary',
  render: () => <DocCover title="01 — PROJECT SUMMARY" />,
};
