# THE SUBSTANCE — 컴포넌트 생성 · 구현 계획

> 02(UX Flow)·03(Visual Direction)·04(Desire UX)에서 확정된 서사·비주얼·감각 원칙을 실제 코드로 옮기는 실행 계획. 이 문서는 "무엇을 어떤 순서로 만드는가"의 단일 참조다. 상태는 진행하며 갱신한다.

---

## 핵심 결정 (구현을 지배하는 값)

| 영역 | 결정 |
|------|------|
| **테마** | 스타터킷 `default.js`를 제자리 교체(격리 안 함). 5색 다크 팔레트 + Bebas Neue ALL CAPS(-0.03em) + glow 섀도우 + `theme.substance.*`. borderRadius 0·spacing 8 유지 |
| **배경(살아있는 3레이어)** | **순수 코드 생성** — 스크롤·사운드 반응 위해 영상/이미지 아님. 단 **무조건 실사(photorealistic)**, 플랫 일러스트 금지 |
| **실사 기법** | 노른자·인젝션 퍼짐은 **하이브리드**(실제/생성 사진 텍스처 + 코드 변형: SVG `<image>` clip·gooey·displacement·tint). 세포는 셰이더/Canvas metaball 후보 |
| **인젝션 퍼짐** | 잉크가 물에 퍼지는 **매크로 플룸**(레퍼런스 `assets/reference/*.jpg`). 용기 크롭아웃, 플룸만 full-bleed. 컬러 아크 tint + SUBMIT burst |
| **사운드** | **하이브리드** — 유기음은 CC0 샘플, 톤(드론·딩)은 합성. 딩 = 계시의 종(3~4회). 인젝션 = 수중 dispersion. **기본 ON**(첫 스크롤에 resume) |
| **L6 보이스 라인** | 설계만, **구현 보류** — 조립 단계에서 결정 |

---

## 현재 상태

| Phase | 항목 | 상태 |
|-------|------|------|
| 0 | 테마·폰트(`default.js`, `preview.jsx`) | ✅ 완료 |
| 1 | 훅: useScrollProgress · useColorArc · useSubstanceAudio · useCinematicCue | ✅ 완료 |
| 1 | useScrollLock (인트로 스크롤 리듬) | ⬜ 미구현 |
| — | 오디오 하이브리드 엔진 + CC0 샘플(수중 dispersion·합성 블롭·영화 딩) | ✅ 완료 |
| 2 | SubstanceLogo (`common/ui/`) | ✅ 완료 |
| 2 | YolkMorph (`motion/`) — 하이브리드 실사 노른자 | ✅ 완료 (realism 확인 중) |
| 2 | VanishingDisclaimer · ProtocolPhaseCard(+LockedPhase) · DualitySequence · RequestConsideration | ✅ 완료 (병렬 제작) |
| 2 | CellDivisionCanvas (실사 세포) | ⬜ realism 확정 후 |

---

## Phase 2 — 신규 컴포넌트 (Desire UX 렌즈)

| 컴포넌트 | 배치 | Desire UX 역할 | 오디오 |
|----------|------|----------------|--------|
| SubstanceLogo | `common/ui/` | 워드마크 없는 익명 아이덴티티. hover 분리=분열 예고 | ◗◗ hover 틱(선택) |
| YolkMorph | `motion/` | 노른자=원본 자아, 갈라짐=변질 시작 (실사 사진 하이브리드) | L2 스트레치 |
| CellDivisionCanvas | `scroll/` | 살아있는 배경=이유 없는 각성 | 분열→L3, 이후 L4 |
| DualitySequence | `kinetic-typography/` | YOU 분화(옐로/그린)=거울/모방욕망 | 키워드 딩 |
| ProtocolPhaseCard | `card/` | 공개도 full/half/locked=정보 결핍 | — |
| LockedPhase | (ProtocolPhaseCard의 locked로 통합) | Phase03 금지=reactance, hover 침묵 | 앰비언트 컷+형광등 허밍 |
| VanishingDisclaimer | `typography/` | 대가 은닉(읽으려면 사라짐), focus 접근성 | — |
| RequestConsideration | `templates/` | 확답 없는 제출=해소 유보 | 인젝션 수중 dispersion |

---

## Phase 3 — 기존 컴포넌트 수정 (sx/props 오버라이드)

| 컴포넌트 | 변경 |
|----------|------|
| FadeTransition | blur 초기값 + 상향(POV 등장) |
| PerspectiveTransition | 미세 skew/rotate 스크롤 연동(대칭 붕괴) |
| ScrollScaleContainer | 극단 scale(8x→1x, 매크로 풀아웃) |
| GradientOverlay (문서의 "GradientOverlayDynamic" = 실제 이 파일) | 색 옐로→그린 아크, 스크롤 연동 → 나아가 인젝션 dispersion 셰이더로 발전 |
| Button/Switch/TextField [MUI] | CTA 반전 · 음소거 토글(fixed, 기본 ON) · 이메일 입력 |
| HighlightedTypography | #AAFF00 pulse glow |

---

## Phase 4 — 조립 (8섹션 + 인트로)

`src/stories/template`에 조립. 섹션별 컬러 아크·시네마틱 큐·사운드 배선 + **바뀐 카피 콘텐츠 주입**(HERO "You've already imagined it." / "Forever." / 푸터 fine-print) + **L6 보이스 라인 여부 결정** + 음소거 토글 기본 ON·첫 스크롤 resume.

섹션: 00 INTRO → 01 HERO → 02 PROBLEM → 03 SUBSTANCE/DUALITY → 04 PROTOCOL(Phase03 잠금) → 05 THEY KNOW → 06 PRICING → 07 ACCESS(기울어짐) → 08 FOOTER + [fixed] 음소거 토글.

---

## 진행 순서

```
[완료] 테마·폰트 → 훅 4종 → 오디오 하이브리드+샘플 → SubstanceLogo → YolkMorph(실사)
[진행] 서사·UI 컴포넌트 병렬(VanishingDisclaimer · ProtocolPhaseCard · DualitySequence · RequestConsideration)
[다음] CellDivisionCanvas(실사 세포, realism 확정 후) → 인젝션 dispersion 배경(셰이더)
       → Phase 3 기존 수정 → useScrollLock → Phase 4 조립
```

> **원칙**: 실사 realism 기준은 노른자에서 확정한 뒤 세포·액체 전부에 동일 적용한다. 배경은 코드지만 반드시 사진급.
