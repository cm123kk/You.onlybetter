# THE SUBSTANCE — Visual Direction

> 이 문서는 랜딩페이지 전용 비주얼 언어를 정의한다. 현재 프로젝트 기본 테마(라이트·화이트·블루·Outfit)를 거의 전면 재정의하되, 브랜드에 이미 부합하는 토큰(`borderRadius: 0`, `spacing: 8`)은 의도적으로 유지한다. 이 페이지는 별도 다크 테마(예: `themes/substance.js`)로 격리하는 것을 전제로 한다 — 기존 컴포넌트의 라이트 테마를 오염시키지 않는다.

---

## 브랜딩 원칙 — 로고 전용 (CRITICAL)

- **유일한 아이덴티티는 ◗◗ 로고**다. "THE SUBSTANCE" 제품명·브랜드네임을 큰 글씨로 노출하지 않는다 (워드마크 없음).
- **랜딩 시작점**: 최초 진입 화면은 #0A0A0A 검은 배경 위 **로고 하나만 선명하게** 중앙에 — 텍스트·설명 없이. 모든 스크롤 서사가 여기서 출발한다.
- **로고 에셋**: `src/assets/reference/logo.jpg` (검정 배경 위 노란 두 반원). 구현 시 SVG 벡터화 권장(hover 분리 애니메이션·색상 토큰화 위해). 색상은 `substance.arcYellow`(#F5E642).
- 제품명은 필요 시 footer 등에 **fine print 크기**로만 등장 (헤드라인 취급 금지).

---

## 톤앤매너

- **키워드**: Clinical(임상적) / Anonymous(익명적) / Irreversible(불가역적) / Seductive(유혹적) / Living(살아있는)
- **설명**: 새하얀 타일 욕실의 과잉 조명처럼 **임상적으로 정밀하되 어딘가 어긋난** 느낌. 브랜드명·설명 없이 심볼 하나로 성립하는 익명성. 차갑고 단정한 선언조 — 묻지 않고 안다, 팔지 않고 선택한다. 그러나 배경은 세포처럼 살아 숨쉬고, 색은 옐로에서 그린으로 변질된다. **멸균된 표면 아래 유기적 생명이 꿈틀대는** 이중성이 핵심.
- **레퍼런스 무드**: 영화 USB 패키징(순백+블랙타이포+심볼 하나), 엘리자베스 아파트 욕실(20cm 타일·과잉조명), 앰풀 클로즈업(UV 형광 그린), 챕터 타이틀 카드(ELISABETH/SUE), 《2001: A Space Odyssey》 무균 복도.

---

## 컬러 방향

현재 테마는 라이트모드(화이트 배경 · 블루 primary)다. The Substance는 **다크 5색 고정 팔레트**로 전면 교체한다. 5색 외 임의 색상 사용 금지.

| 용도 | 현재 토큰 | 현재값 | 변경값 | 근거 |
|------|----------|--------|--------|------|
| Background | `background.default` | #FFFFFF | **#0A0A0A** | 필름 LUT의 "deep and silky" 블랙. 순수 #000 아님 |
| Surface/Text | `text.primary` | rgba(0,0,0,0.87) | **#F5F5F0** | 아파트 타일의 약간 웜한 클리니컬 화이트 |
| Primary (심볼) | `primary.main` | #0000FF | **#F5E642** | 계란 노른자 옐로 — 로고 ◗◗, 원본 자아. **정적 요소** |
| Secondary (액체) | `secondary.main` | #263238 | **#AAFF00** | 앰풀 형광 그린 — 활성화된 서브스탠스. **모션·hover·인터랙션** |
| Error (결과) | `error.main` | #d32f2f | **#C41E3A** | 딥 레드 — 경고·Phase 03·면책. **극소량만** |
| mode | `palette.mode` | light | **dark** | 전 페이지 다크 |

### 컬러 사용 규칙 (CRITICAL)

- **옐로(#F5E642) = 정적**: 로고, 노른자, "원본 자아". 움직이지 않는 요소에만
- **그린(#AAFF00) = 동적**: 살아있는 액체, 애니메이션, hover, CTA 채움. 움직이는 모든 것
- **레드(#C41E3A) = 결과**: 경고·Phase 03 잠금·면책조항 전용. 페이지 전체에서 3~4곳 이하
- **텍스트 반전 없음**: 기본은 항상 #F5F5F0 on #0A0A0A. 유일한 예외는 CTA hover(그린 채움 + #0A0A0A 텍스트)

### 컬러 아크 (스크롤 연동 애니메이션)

정적 팔레트와 별개로, **배경 파티클·컬러 값이 스크롤 진행에 따라 lerp**된다.

| scrollProgress | 컬러 상태 | 서사 |
|----------------|----------|------|
| 0.0 | #F5E642 (옐로 100%) | 잠들어 있는 원본 자아 (엘리자베스) |
| 0.3–0.7 | 옐로→그린 전이 | 활성화 진행 (변질) |
| 1.0 | #AAFF00 (그린 100%) | 완전 활성화된 서브스탠스 (수) |

> 위로 스크롤 시 약한 히스테리시스(즉시 복귀 X) — "진행됐다"는 감각. 구현: `useColorArc` 훅.

---

## 타이포그래피 방향

현재 헤딩은 Outfit(라틴)+Pretendard(한글)다. The Substance는 **단일 서체 · ALL CAPS 전용 · 본문 개념 없음**으로 전면 교체. 모든 텍스트가 헤드라인처럼 취급된다(크기만 다름).

| 요소 | 현재 설정 | 변경 방향 | 근거 |
|------|----------|----------|------|
| 폰트 패밀리 | Pretendard/Outfit | **Bebas Neue** (1순위 Dharma Gothic Condensed ExBold) | 영화 커스텀 서체 최근접, condensed heavy |
| 케이스 | 혼용 | **ALL CAPS 전용, 예외 없음** | 영화 타이포 규칙 |
| 자간 | -0.02em~0 | **-0.03em (타이트)** | 거의 붙은 글자 |
| 웨이트 | 300~900 혼용 | **heavy/extrabold만** | 단일 헤비 웨이트 |
| 본문(body) | 16px 1.6 | **본문 서체 없음** — 모든 텍스트가 헤드라인 | 브랜드에 body 없음 |
| 색상 | text.primary | **#F5F5F0 고정** (반전 없음) | CTA hover만 예외 |
| textTransform(button) | none | **uppercase** | 전면 ALL CAPS |

### 타이포 스케일 (역할 기반)

condensed 서체 특성상 큰 사이즈에서 임팩트가 극대화된다. 극단적 대비를 준다.

| 역할 | 예상 크기 | 용도 |
|------|----------|------|
| Chapter/Hero | clamp(4rem, 12vw, 9rem) | "NOT FOR EVERYONE", 인트로 대형 순간 |
| Section title | clamp(2.5rem, 6vw, 4rem) | 섹션 헤드라인, Phase 라벨 |
| Body-as-headline | 1.25rem~1.5rem | 활성화 스크립트 본문(그래도 헤드라인 취급) |
| Fine print | 0.75rem | 면책·클리니컬 데이터 — **같은 폰트·같은 웨이트, 크기만 작게** |

> 폰트 로딩 전략: Bebas Neue는 Google Fonts, Dharma Gothic은 Adobe Fonts CDN. FOUT 방지 위해 `font-display: swap` + 폴백은 condensed sans(예: 'Arial Narrow'). CLS 최소화.

---

## 간격 및 레이아웃

- **spacing 기본 단위**: 8px **유지** (현재 테마와 동일 — 변경 불필요)
- **borderRadius**: 0 **유지** (Sharp corners — 임상적 사각 기하학에 완벽 부합. 영화 타일 그리드 미학)
- **주요 레이아웃 패턴**: 단일 센터 컬럼, `max-width: 680px`. 스크롤 인트로 캔버스만 full-bleed
- **여백**: 압도적 여백. 콘텐츠는 의도적으로 희박하게 — 비어 있음 자체가 압박
- **대칭→붕괴**: 초반 완벽 센터 정렬 → 후반(ACCESS) 미세 skew/rotate로 대칭 붕괴
- **반응형 브레이크포인트**: 현재 테마 값 유지(xs0/sm600/md900/lg1200/xl1536). 모바일에서 스크롤 잠금 완화, Canvas 파티클 수 감소

### Shadow / Elevation

- 현재 dimmed shadow(blur only) 대신, 다크 배경에서는 **glow(발광)** 개념으로 전환
- 그린 요소 hover 시 `0 0 20px rgba(170,255,0,0.4)` 형태의 #AAFF00 글로우
- 일반 표면은 그림자 거의 없음 — 플랫한 임상적 표면

---

## 레퍼런스

> 사용자 제공 브리프 기반. 외부 이미지 URL은 사용자가 별도 제공 시 추가.

| # | 레퍼런스 | 참고 포인트 |
|---|---------|------------|
| 1 | 영화 USB 패키징 | 순백 바탕 · 블랙 타이포만 · 심볼 하나 → 극단적 미니멀 |
| 2 | 엘리자베스 아파트 욕실 | 20×20cm 흰 타일 · 블랙 줄눈 · 과잉 조명 → sharp grid, 클리니컬 밝기 |
| 3 | 앰풀 클로즈업 | UV 반응 형광 그린 → #AAFF00 액체 질감·발광 |
| 4 | 챕터 타이틀 카드 | ELISABETH/SUE/MONSTRO — ALL CAPS condensed 대형 타이포 |
| 5 | 《2001: A Space Odyssey》 무균 복도 | 대칭·무균·불안한 정밀함 |
| 6 | 로고 심볼 ◗◗ | 두 마주보는 반원 — 분열/이중자아. hover 시 분리 애니메이션 |

---

## 변경 필요 토큰 요약

구현 시 신규 `themes/substance.js` (또는 기존 테마 확장)에 반영할 토큰 목록. 기존 `default.js`는 건드리지 않고 별도 테마로 격리.

| 토큰 경로 | 현재값 | 변경값 | 적용 대상 |
|-----------|--------|--------|----------|
| `palette.mode` | light | **dark** | 전 페이지 |
| `palette.background.default` | #FFFFFF | **#0A0A0A** | 배경 |
| `palette.background.paper` | #FFFFFF | **#0A0A0A** | 표면 (플랫) |
| `palette.text.primary` | rgba(0,0,0,0.87) | **#F5F5F0** | 모든 텍스트 |
| `palette.primary.main` | #0000FF | **#F5E642** | 로고·정적 옐로 |
| `palette.secondary.main` | #263238 | **#AAFF00** | 액체·동적 그린 |
| `palette.error.main` | #d32f2f | **#C41E3A** | 경고·잠금·면책 |
| `typography.fontFamily` | Pretendard… | **'Bebas Neue', 'Arial Narrow', sans-serif** | 전 페이지 단일 |
| `typography.headingFontFamily` | Outfit… | **동일(단일 서체)** | 헤딩=본문 통일 |
| `typography.*.letterSpacing` | -0.02em~0 | **-0.03em** | 전 스케일 |
| `typography.*.textTransform` | none/일부 | **uppercase** | 전 요소 |
| `shape.borderRadius` | 0 | **0 (유지)** | Sharp — 변경 없음 |
| `spacing` | 8 | **8 (유지)** | 변경 없음 |
| `customShadows` | dimmed(blur) | **glow(그린 발광) 추가** | hover 상태 |

### 신규 커스텀 토큰 (테마 확장 속성)

MUI 표준 팔레트 밖의, 이 페이지 전용 값. `theme.substance.*`로 접근.

| 커스텀 토큰 | 값 | 용도 |
|------------|-----|------|
| `substance.arcYellow` | #F5E642 | 컬러 아크 시작점 |
| `substance.arcGreen` | #AAFF00 | 컬러 아크 종점 |
| `substance.glowGreen` | 0 0 20px rgba(170,255,0,0.4) | hover 발광 |
| `substance.deniedRed` | #C41E3A | ACCESS DENIED |
| `substance.overbright` | brightness(2.2) | 과잉 조명 플래시 |
| `substance.maxWidth` | 680 | 센터 컬럼 폭 |

---

## 기존 테마와의 관계 (격리 원칙)

- **격리**: The Substance 비주얼은 `default.js`를 수정하지 않는다. 별도 다크 테마로 분리 → 기존 컴포넌트/스토리의 라이트 테마 무손상
- **유지 토큰의 이유**: `borderRadius: 0`(sharp)와 `spacing: 8`은 우연히도 이 브랜드의 임상적 사각 미학과 완전히 일치 → 재사용이 곧 정합
- **재활용 컴포넌트 적용**: ux-flow에서 재활용/수정 지정한 기존 컴포넌트(ScrollRevealText, SectionContainer 등)는 이 다크 테마 `ThemeProvider` 하위에서 렌더 → sx 오버라이드로 5색 팔레트 주입

> ⚠️ **업데이트 노트(2026-07-14)**: 위 "격리 원칙"은 이후 방향 변경으로 **폐기**되었다. 스타터킷의 `default.js` 토큰 자체를 이 프로젝트에 맞게 전면 교체하기로 결정 → 별도 `substance.js` 없이 단일 다크 테마로 운용한다. (별도 테마 격리 대신 스타터킷을 프로젝트에 맞게 갱신하는 워크플로우)

---

## 공식 브랜딩·마케팅 레퍼런스 (영화 제작진 오피셜)

> 영화 자체가 완결된 브랜드 시스템을 갖고 있으므로, 임의 창작 대신 **제작진이 실제로 만든 아이덴티티를 근거로** 디자인한다. 아래는 배급사(MUBI)·타이틀 디자이너·인월드 제품 디자인에 대한 조사 결과다. 출처는 문서 하단.

### 1. 커스텀 서체 — 브랜딩의 실제 주인공

- **설계자**: **Gilles Pointeau + FUGU Productions**. 영화의 시각 아이덴티티(인필름 그래픽 + 프로모션 캠페인) 전체를 담당. **상업적으로 구매 불가**.
- **형태 특성**: **narrow, bold weight** / **ALL CAPS 전용** / **타이트한 자간**. 목적은 "epic significance, intensity and tension" — 차갑고 명령적이며 공격적인 톤으로 서사와 동조.
- **핵심 통찰**: 이 브랜드의 커뮤니케이션은 **로고 심볼이 아니라 서체가 주도**한다. 로고 ◗◗는 드물게 등장하고, **모든 화면 지배력은 타이포에서 나온다**. → 우리 랜딩도 "워드마크 없이 타이포로 지배" 원칙을 강화.
- **인필름 사용처**: USB 속 마케팅 프레젠테이션 영상(**검정 배경 위 흰 텍스트**), 챕터 라벨(**ELISABETH / SUE / MONSTRO ELISASUE**).
- **설계자 자기비평(디테일 참고)**: 'E·F·L'이 narrow-bold 치고 다소 넓음, 'E' 폭이 'H'와 같음, 'TA'·'BS' 커닝을 더 조일 여지 — 우리가 대체 서체(Bebas Neue)를 쓸 때 **자간을 더 타이트(-0.03em)하게** 가져갈 근거.

### 2. 로고 심볼 ◗◗ — 도플갱어의 시각 은유

- **구성**: 마주보는 **두 개의 노란 반원**. 옐로 = **계란 노른자 = "matrix"(원본 자아)**.
- **의미**: 주사 시 벌어지는 일 — **도플갱어(또 다른 나) 생성** — 의 직접 은유. 분열/창조, 갈라진 자아, (임신한) 배(belly)의 형상까지 중의적.
- **사용 빈도**: **의도적으로 희소**. 남발하지 않아 등장할 때 무게가 실림. → 우리 랜딩에서도 ◗◗는 인트로 시작점·HERO·ACCESS·FOOTER 등 **소수 지점에만** 배치(현행 설계와 일치).

### 3. 컬러 심볼리즘 (제작진 의도 기준)

| 색 | 인월드 의미 | 비고 |
|----|------------|------|
| **옐로** | 계란 노른자 = 원본 자아(matrix). Demi Moore의 **노란 코트** = "shield, hope", 약의 코어 이미지와의 링크 | **정적**·로고 |
| **그린** | 앰풀 **액체**. 서브스탠스가 **변질**되며 옐로→그린으로 진행(엘리자베스→수) | **동적**·활성화 |
| **블랙** | 미니멀·독점적 마케팅 배경 | 표면 |
| **레드** | 경고/결과 | 극소량 |

> 컬러 아크(옐로→그린)는 우리가 만든 장치가 아니라 **영화 제작진이 명시한 "변질(deterioration)" 서사** 그대로다 — 스크롤로 이 전이를 재현하는 것이 핵심.

### 4. 제품 디자인 미학 — "seductive minimalism"

- 표현: **"stripped down / pure / clean / almost completely devoid of distractions / mostly black."**
- 전략: **less is more** — 정보를 줄여 **exclusivity·mystery·ambiguity**를 만든다(=우리의 "정보 결핍" 유혹 설계와 정확히 동일 논리).
- 제작진/평론이 든 **포지셔닝 비교 브랜드**: **HUEL · IL MAKIAGE · SOYLENT** (미니멀 럭셔리/기능성 소비재). → 레이아웃·카피 톤의 벤치마크로 활용 가능.
- **제품이 하나의 캐릭터처럼 작동**: "commanding attention, telling the characters clearly what to do" — 자본주의적 심리 압박. → CTA·카피를 "선언/지시" 어조로.

### 5. 마케팅 캠페인 (MUBI)

- **배급/캠페인 주체**: **MUBI** (전 세계 배급권). 공식 포스터·굿즈(MUBI Shop)로 미니멀 블랙 아이덴티티 확장.
- **공식 카피(그대로 인용, 우리 인트로 스크립트의 원천)**:
  > "Have you ever dreamt of a better version of yourself? **You, only better in every way.** You should try this new product, it's called The Substance. **IT CHANGED MY LIFE.** With The Substance, you can generate another you: **younger, more beautiful, more perfect.**"
- **포스터 아트**: 공식 MUBI 포스터 외 한정판 실크스크린(아티스트 **Jay Shaw**, 18"×24" 핸드넘버), "Mutant" 포스터 등 — 스플릿 페이스/이중 자아 모티프.

### 6. 우리 랜딩 적용 요약

| 오피셜 근거 | 우리 페이지 결정 |
|------------|-----------------|
| 서체가 브랜딩을 주도, 로고는 희소 | 워드마크 없음 · 타이포 지배 · ◗◗ 소수 배치 |
| ALL CAPS · narrow bold · 타이트 자간 | Bebas Neue · uppercase · letterSpacing -0.03em |
| 옐로(노른자/원본)→그린(액체/변질) | 스크롤 컬러 아크 = 변질 서사 재현 |
| seductive minimalism / less is more | 압도적 여백 · 정보 결핍 유혹 설계 |
| 공식 카피 "You, only better" | 인트로 활성화 스크립트 원문으로 사용 |
| 제품=캐릭터, 명령형 | 선언/지시 어조 카피, 확답 없는 CTA |

---

## 출처 (Sources)

- Lorain Colors — [*The Substance — Branding and typography design*](https://loraincolors.com/the-substance-branding-typography-design)
- Aleksey Busygin — [*◗◗ in "The Substance" (2024)*](https://alekseybusygin.medium.com/in-the-substance-2024-2d69c6bcf14b)
- [MUBI — The Substance (official)](https://mubi.com/en/us/films/the-substance) · [MUBI Shop — Official Poster](https://shop.mubi.com/products/the-substance-official-poster)
- Typography.Guru — [secondary font ID discussion](https://typography.guru/forums/topic/140178-help-with-identifying-secondary-font-on-the-substance-movie-poster/)
