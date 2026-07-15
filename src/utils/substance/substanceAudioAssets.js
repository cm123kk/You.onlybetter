/**
 * Substance 오디오 샘플 매니페스트 (하이브리드 엔진)
 *
 * 유기적 사운드(수중/버블/인젝션/막)는 순수 합성으로는 영화 질감에 도달할 수 없어
 * 저작권 프리(CC0) 실제 녹음을 사용한다. 톤 계열(드론·딩)만 Web Audio 합성 유지.
 *
 * 파일은 `public/audio/substance/`에 넣으면 런타임에 `/audio/substance/*` 로 로드된다.
 * 파일이 없으면(fetch 404) 엔진이 자동으로 합성 폴백으로 전환하므로, 파일 없이도 깨지지 않는다.
 *
 * ── 사운드 소싱 가이드 (CC0, 로그인 없이 다운로드: pixabay.com/sound-effects / freesound.org) ──
 * - bubbling  : "underwater bubbles", "viscous bubbling", "hydrophone" — 루프용, 5s+ 점성 있는 기포
 * - injection : "ink in water", "liquid dispersion underwater", "underwater whoosh" — 2~4s, 물에 퍼지는
 * - stretch   : "wet squelch", "slime stretch", "membrane" — 1~1.5s, 끈적하게 늘어나는
 * - split     : "wet splat", "flesh impact", "squish burst" — ~0.3s, 습하고 육중한 파열
 *
 * 파일 포맷: .mp3 권장(용량·호환). 파일명은 아래 url과 정확히 일치시킬 것.
 */
export const SAMPLE_MANIFEST = {
  // 단발 물방울(느린 스케줄러용) — 점성 있는 "또옥…또옥…". L4의 주 소스.
  bubbleA: { url: '/audio/substance/bubble-a.mp3', loop: false },
  bubbleB: { url: '/audio/substance/bubble-b.mp3', loop: false },
  // 연속 수중 앰비언스(폴백 전용 — 단발 샘플 없을 때만 낮은 볼륨 베드로)
  bubbling: { url: '/audio/substance/bubbling-underwater.mp3', loop: true },
  injection: { url: '/audio/substance/injection-disperse.mp3', loop: false },
  // injectionSubmerge: 수중 앰비언스 베드("Underwater Yell") — 강한 lowpass로 yell 제거, 잠긴 톤만 얹음
  injectionSubmerge: { url: '/audio/substance/injection-submerge.mp3', loop: false },
  stretch: { url: '/audio/substance/membrane-stretch.mp3', loop: false },
  split: { url: '/audio/substance/division-splat.mp3', loop: false },
  // ding: 영화 실제 딩(오마주). pitchDown은 재생속도(playbackRate)로 dematerialized 처리.
  ding: { url: '/audio/substance/ding-substance.mp3', loop: false },
};
