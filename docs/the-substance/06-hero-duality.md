# THE SUBSTANCE — HERO (Duality) 설계

> 인트로(로고 블리드 → 욕망 비트 → "THIS IS THE SUBSTANCE / You. Are. One.") 종료 직후 등장하는 **첫 서사 섹션**. SKIP INTRO의 목적지이기도 하다. 브랜드 슬로건("You. Only better.")과 이중 자아(Elizabeth/Sue)를 실사 회전 인물로 육화한다.

관련 원칙: `04-desire-ux-and-sound.md`(욕망의 UX), `02-ux-flow.md`(카피 전략), `03-visual-direction.md`(컬러/톤).

---

## 1. 서사적 자리 · 배경 연속성

```
인트로(검정 #0A0A0A) → ★ HERO(검정 유지) → [검정→블루 리퀴드 와이프] → HOW IT WORKS(블루 #87C1E0)
```

- 인트로 끝도 검정, HERO도 검정 → **배경 이음새 없음**(같은 sticky 씬에서 진행).
- HERO는 "판매"가 아니라 **욕망의 명명·초대**. 유저가 이미 아는 것을 가리킬 뿐.

---

## 2. 카피 (04-DesireUX 4대 원칙 준수)

**헤드라인 (ALL CAPS, Bebas Neue):**
```
YOU. ONLY BETTER.
```
- 브랜드 슬로건 = 가장 순수한 욕망-대상. 인트로에서 형성된 욕망을 한 점에 응축.

**서브카피 (순차 리빌):**
```
You've done everything. And still, the mirror knows.
You've already imagined it — yourself, younger. Forever.
The Substance is here for it.
```

| 라인 | 원칙 근거 |
|------|-----------|
| the mirror knows | 위협 아님 = **이미 아는 고통의 명명**(간파당함=자석). 욕망(Younger…)이 인트로에서 먼저 온 뒤라 순서 원칙 충족 |
| You've already imagined it | 유혹을 **선언하지 않고** 유저 자신의 욕망을 가리킴(문서 지정 문구) |
| Forever | 불가역 = 상실 아닌 **보상**(영원한 젊음=선물). 상실 뉘앙스는 제출 후에만 |
| here for it | "사세요" 아님. 조용한 **도착** |

> 금지: 구체적 상실 폭로("won't come back"), 유혹 선언("you'll say yes"), 헤드라인화된 경고.

**카피 신뢰도 가드레일:** 카피는 **안전해 보이되 욕망을 트리거**해야 한다. 임상적 신뢰(차분·단정·과장 없음)가 깔려야 "이상한 사이비 제품" 인상을 피하고, 그 위에서 열망이 작동한다. "역겹다/수상하다"는 각성이 **욕망 각성보다 크면 실패** — 심미 가드레일과 동일 원칙. mirror/Forever/imagined는 위협이 아니라 **유저가 이미 아는 것을 담담히 명명**하는 톤으로만.

---

## 3. 히어로 비주얼 — 젊은/늙은 여자 회전

- **기법**: **i2v 회전영상 스크럽**(FLORA Kling). 실사 스틸 1장 → 느린 회전영상 생성 → ffmpeg all-intra(`-g 1`) 인코딩 → 스크롤로 `video.currentTime` 스크럽. (기존 인트로 잉크 dispersion 영상과 동일 인프라)
- **구도**: 정면 **젊은 여자**가 수직축으로 회전하며 옆/뒤의 **늙은 여자**가 드러남 — 영화의 척추 분리(Elizabeth/Sue). 단순 360° 마네킹보다 의미 우선.
- **이어지는 seam = 끈적하되 절대 gross하지 않은 막**: 두 인물이 붙은 수직 경계에 번들거리는 형광 그린(#AAFF00) 막 + 미세 늘어짐/실.
- **실사·고해상 필수** — 플랫 일러스트 금지.

### ★ 심미 가드레일 — 매혹적이되 거부감 0 (CRITICAL)

> 소비자가 "역겹다/이상하다(uncanny)"고 느끼는 순간 **구매 동기가 붕괴**한다. seam은 body-horror가 아니라 **럭셔리 세럼/코스메틱 광고의 질감**이어야 한다.

| 지향 (○) | 금지 (✕) |
|----------|----------|
| dewy·glossy·보석 같은 **반투명 그린 세럼**이 두 자아를 매끈하게 잇는 결합 | 살점·상처·힘줄·점액질 붕괴 등 body-horror·gore |
| clinical하게 깨끗한 광택, 은은한 그린 발광, 고급 앰플의 UV 형광 | 탁하거나 지저분한 질감, 축축한 불쾌감 |
| "완성된 두 번째 자아"의 우아한 탄생 | "찢겨 붙은" 그로테스크 |

- 판정 기준: **"약간 이상한데?"가 드는 비율 < 욕망이 트리거되는 비율.** uncanny valley로 넘어가면 실패.
- 영화의 body-horror는 **후반부(조인 후)의 진실**이지, 조인 전 랜딩의 미학이 아니다(꿈은 공개·대가는 은닉).

### 진행도(heroP) 매핑 (초안)
| heroP | 이벤트 |
|-------|--------|
| 0.00–0.08 | 검정에서 인물 정면(젊음) 페이드인, 드론 지속 |
| 0.08–0.20 | 헤드라인 `YOU. ONLY BETTER.` stamp + 임상 과잉조명 플래시 1회 |
| 0.20–0.70 | 스크롤로 회전 진행(젊음→늙음 리빌), 서브카피 3라인 순차 |
| 0.70–1.00 | 회전 끝 → 인물/seam이 점액으로 녹아 흐름 → 검정→블루 리퀴드 와이프 |

---

## 4. 히어로 추가 요소

1. **◗◗ 심볼** 작게 상단(브랜드 아이덴티티, 문서 HERO 필수).
2. **컬러 언어 투영**: 젊은 쪽 옐로(#F5E642, 원본 자아) 미세 조명 / seam 그린 발광 → 옐로→그린 아크를 인물에.
3. **임상 과잉조명 플래시** 1회(헤드라인 stamp 순간, filter brightness) — 남발 금지.
4. **필름 그레인 + 비네트** — 실사 질감.
5. **드론(펄스) 지속** — 인트로에서 이어져 몸의 각성 유지.
6. (선택) 아주 작게 `Results vary. Irreversible.` — 임상적 절제.

---

## 5. HERO(검정) → HOW IT WORKS(블루) 전환

- 회전 종료 시 인물/seam이 **점액으로 녹아 흐르고**, 그 액체가 **검정→블루 리퀴드 와이프**로 전환 → 블루 flat-lay(노른자 씬) 등장.
- **기존 `SubstanceLiquidWipe` 재활용**(PROTOCOL의 블루→검정을 여기선 검정→블루로 대칭 사용).
- 잉크 dispersion 모티프와 결이 같아 페이지 전체 시각 언어 일관.

---

## 6. 구현 계획

1. **씬 슬롯** — `App.jsx` `SCENE_VH`에 `HERO_VH`(≈700) 삽입, `heroP` 분할(인트로↔works 사이). SKIP INTRO 목적지도 HERO로.
2. **신규 컴포넌트** `src/components/scroll/SubstanceHeroDuality.jsx` — props: `progress`(회전/카피/전환 구동), `rotationVideoSrc`, `poster`. 회전영상 스크럽 + 카피 순차 리빌 + ◗◗ + seam 글로우 + 그레인. (뼈대 우선: 실사 에셋 전 placeholder 미디어로 레이아웃/카피/전환 검증)
3. **에셋 파이프라인(FLORA)** — 실사 스틸 → i2v 회전영상 → all-intra 인코딩(+poster). (문서·뼈대 확정 후 진행)
4. **전환** — heroP 꼬리에서 `SubstanceLiquidWipe`(검정→블루)로 worksP에 물림.
5. 스토리북 스토리 + `component-work/resources/components.md` 등록.

---

| 항목 | 값 |
|------|-----|
| 컴포넌트 | `src/components/scroll/SubstanceHeroDuality.jsx` |
| 카테고리 | scroll (스크롤 기반 인터랙션) |
| 헤드라인 | `YOU. ONLY BETTER.` (ALL CAPS) |
| 회전 기법 | i2v 회전영상 스크럽 |
| 전환 | SubstanceLiquidWipe 검정→블루 |
| 최초 작성 | 2026-07-20 |

---

## 7. 에셋 생성 사양 (확정)

### 파이프라인
1. **스틸 2장** — `is2i-gemini-3-pro`(Nano Banana Pro, 레퍼런스 기반): 같은 여자·같은 프레이밍/조명, (A) 극한의 젊음·미모, (B) 완전 대비되는 노화. B는 A를 레퍼런스로 생성해 동일 인물성 유지.
2. **회전영상** — `i2v-kling-2.5`(Kling 2.5, image→video): start=A / end=B(엔드프레임 지원 시)로 젊음→노화 회전 모프. 미지원 시 A 단일 + 오빗 프롬프트.
3. **인코딩** — ffmpeg all-intra(`-g 1 -crf 18 -pix_fmt yuv420p`), 스크럽용. + poster(첫 프레임).

### 사양
| 항목 | 값 |
|------|-----|
| 비디오 모델 | **Kling 2.5 (i2v)** — 실사 인물 모션·아이덴티티 제어 우수 |
| Duration | **5s** (스크럽 전용. 5초 @30fps=150프레임이면 충분 + Kling 코히런스가 길이 짧을수록 안정. 끊기면 ffmpeg minterpolate로 300프레임 보간) |
| FPS | 30 (≈150프레임, 필요시 보간 300) |
| Resolution | **1080p · 9:16 세로(1080×1920)** — 서 있는 인물·모바일 우선, 검정 배경 풀블리드 |
| 산출물 | `public/video/hero-duality-female.mp4` · `hero-duality-male.mp4` (+ 각 poster) |

**2비트 구성(여+남):** 브랜드 "you=누구나"를 강화 — 여자 duality(heroP ~0.20–0.52) → 남자 duality(~0.52–0.82) → 전환. 조명/앵글 미세 차별화로 반복감 방지. 헤드라인 `YOU. ONLY BETTER.` 유지, 남자 비트에 짧은 보조 라인. 총 에셋: 스틸 4장(여 A/B · 남 A/B) + 회전영상 2개(각 5s). SubstanceHeroDuality는 `rotationVideoSrc`를 배열/2개로 확장.

### 프롬프트 핵심(심미 가드레일 강제)
- 젊음(A): radiant flawless dewy skin, **full plump lips**, 미모의 정점, clinical luxury cosmetic campaign.
- 노화(B): 깊은 주름·볼륨 손실·완전한 대비, 단 dignified(그로테스크 아님).
- 회전/seam: glossy translucent **green serum** bridge, jewel-like, dewy — **no gore / no wounds / no body-horror**(네거티브 강제).
