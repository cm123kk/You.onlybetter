/**
 * The Substance — 감각 상태 머신 훅 (Phase 1)
 *
 * 단일 입력(스크롤)이 컬러·사운드·모션을 동시에 구동한다.
 * useScrollProgress(단일 소스) → useColorArc / useSubstanceAudio / useCinematicCue.
 */

export { useScrollProgress } from './useScrollProgress';
export { useColorArc } from './useColorArc';
export { useSubstanceAudio } from './useSubstanceAudio';
export { useCinematicCue } from './useCinematicCue';
export { lerpColor } from './lerpColor';
