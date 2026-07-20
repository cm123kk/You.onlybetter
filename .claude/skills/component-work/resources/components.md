# Components

Vibe Dictionary 텍소노미 v0.4 기반 분류. 번호는 텍소노미 카테고리 번호.

## 참조 문서

- 전체 텍소노미: `.claude/skills/component-work/resources/taxonomy-v0.4.md`
- 빠른 인덱스: `.claude/skills/component-work/resources/taxonomy-index.md`

새 컴포넌트 생성 시 위 문서에서 해당 카테고리 번호와 컴포넌트 원형을 확인한 후 구현할 것.

---

## 1. Typography — 텍스트 표현과 장식

- FitText: 컨테이너에 맞춤 텍스트 (`components/typography/FitText.jsx`)
- HighlightedTypography: 하이라이트 타이포그래피 (`components/typography/HighlightedTypography.jsx`)
- InlineTypography: 인라인 타이포그래피 (`components/typography/InlineTypography.jsx`)
- StretchedHeadline: 스트레치 헤드라인 (`components/typography/StretchedHeadline.jsx`)
- StyledParagraph: 스타일드 문단 (`components/typography/StyledParagraph.jsx`)
- Title: 타이틀 컴포넌트 (`components/typography/Title.jsx`)
- QuotedContainer: 인용 컨테이너 (`components/typography/QuotedContainer.jsx`)
- VanishingDisclaimer: The Substance 면책조항 fine-print. hover 시 페이드아웃(읽으려면 사라짐), focus/키보드로는 읽힘(접근성) (`components/typography/VanishingDisclaimer.jsx`)

## 2. Container — 시각적 경계와 그룹핑

- SectionContainer: 페이지 섹션 컨테이너. MUI Container 기반 (`components/container/SectionContainer.jsx`)
- CarouselContainer: 캐로셀 컨테이너 (`components/container/CarouselContainer.jsx`)
- RatioContainer: 비율 기반 컨테이너 (`components/container/RatioContainer.jsx`)

## 3. Card — 독립적 정보 단위

- CardContainer: 카드 기본 컨테이너. variant, padding, elevation (`components/card/CardContainer.jsx`)
- CustomCard: 미디어+콘텐츠 카드. vertical/horizontal/overlay 레이아웃 (`components/card/CustomCard.jsx`)
- ImageCard: 이미지 카드 (`components/card/ImageCard.jsx`)
- MoodboardCard: 무드보드 컬렉션 카드. 2x2 썸네일 그리드 (`components/card/MoodboardCard.jsx`)
- ProtocolPhaseCard: The Substance THE PROTOCOL Phase 카드. disclosure(full/half/locked)로 정보 공개도 제어, locked는 hover 시 ACCESS DENIED 오버레이 + 사운드 침묵 콜백(LockedPhase 통합) (`components/card/ProtocolPhaseCard.jsx`)
- Card: MUI Card 컴포넌트 [MUI]

## 4. Media — 이미지, 비디오 표시

- AspectMedia: 비율 기반 미디어 컨테이너 (`components/media/AspectMedia.jsx`)
- ImageCarousel: 이미지 캐로셀 (`components/media/ImageCarousel.jsx`)
- ImageTransition: 이미지 트랜지션 효과 (`components/media/ImageTransition.jsx`)
- CarouselIndicator: 캐로셀 인디케이터 (`components/media/CarouselIndicator.jsx`)

## 5. Data Display — 구조화된 데이터 시각화

- Table: MUI Table 컴포넌트 [MUI]

## 6. In-page Navigation — 페이지 내 탐색

- CategoryTab: 카테고리 탭 (`components/in-page-navigation/CategoryTab.jsx`)
- Tabs: MUI Tabs 컴포넌트 [MUI]

## 7. Input & Control — 사용자 입력

- FileDropzone: 파일 드래그&드롭 영역 (`components/input/FileDropzone.jsx`)
- SearchBar: 검색 입력 바 (`components/input/SearchBar.jsx`)
- TagInput: 태그 입력 필드 (`components/input/TagInput.jsx`)
- Button: MUI Button 컴포넌트 [MUI]
- Checkbox: MUI Checkbox 컴포넌트 [MUI]
- Select: MUI Select 컴포넌트 [MUI]
- Switch: MUI Switch 컴포넌트 [MUI]
- TextField: MUI TextField 컴포넌트 [MUI]

## 8. Layout — 공간 배치와 구조

- PhiSplit: 황금비 분할 레이아웃 (`components/layout/PhiSplit.jsx`)
- SplitScreen: 좌우 분할 레이아웃. ratio, stackAt, stackOrder 지원 (`components/layout/SplitScreen.jsx`)
- BentoGrid: 벤토 그리드 레이아웃 (`components/layout/BentoGrid.jsx`)
- LineGrid: 그리드 아이템 사이 1px 라인 자동 삽입 (`components/layout/LineGrid.jsx`)
- FullPageContainer: 전체 페이지 컨테이너 (`components/layout/FullPageContainer.jsx`)
- PageContainer: 반응형 페이지 컨테이너. PC maxWidth 고정, 모바일 100% (`components/layout/PageContainer.jsx`)
- AppShell: 반응형 앱 셸. GNB + 메인 콘텐츠 영역 (`components/layout/AppShell.jsx`)
- StickyAsideCenterLayout: 대칭 3열 그리드. sticky aside + 페이지 정중앙 콘텐츠 + 빈 대칭 칼럼 (`components/layout/StickyAsideCenterLayout.jsx`)
- Grid: MUI Grid 컴포넌트 [MUI]
- Masonry: MUI Masonry 컴포넌트 [MUI]

## 9. Overlay & Feedback — 맥락적 정보 표시

- Dialog: MUI Dialog 컴포넌트 [MUI]

## 10. Navigation (Global) — 페이지 간 이동

- GNB: 반응형 글로벌 네비게이션 바. 데스크탑 메뉴 / 모바일 Drawer (`components/navigation/GNB.jsx`)
- NavMenu: 네비게이션 메뉴 (`components/navigation/NavMenu.jsx`)
- SlidingHighlightMenu: 슬라이딩 하이라이트 메뉴. hover 시 layoutId 기반 인디케이터 이동, background/underline, horizontal/vertical (`components/navigation/SlidingHighlightMenu.jsx`)

## 11. KineticTypography (Interactive) — 텍스트 애니메이션 효과

- RandomRevealText: 랜덤 순서 blur 리빌 타이포그래피. Fisher-Yates 셔플 기반 (`components/kinetic-typography/RandomRevealText.jsx`)
- ScrambleText: 텍스트 스크램블 전환 효과. requestAnimationFrame 기반 (`components/kinetic-typography/ScrambleText.jsx`)
- ScrollRevealText: 스크롤 진행에 따른 텍스트 순차 리빌 (`components/kinetic-typography/ScrollRevealText.jsx`)
- DualitySequence: 단일 텍스트가 원본 자아(옐로)/활성화된 자아(그린)로 분화되는 THE DUALITY 키네틱 타이포. stage/progress 제어, CSS transform 기반 (`components/kinetic-typography/DualitySequence.jsx`)

## 13. ContentTransition (Interactive) — 섹션 간 전환

- HorizontalScrollContainer: 세로 스크롤→가로 이동 변환 컨테이너. 픽셀 기반 DOM 측정, Framer Motion (`components/content-transition/HorizontalScrollContainer.jsx`)

## 12. Scroll (Interactive) — 스크롤 기반 효과

- VideoScrubbing: 스크롤 기반 비디오 스크러빙 (`components/scroll/VideoScrubbing.jsx`)
- IntroLogoBleed: The Substance 인트로 오프닝. 흰 배경+검은 ◗◗ 로고 → progress로 검정이 원형 확산(로고 블리드)해 배경 #0A0A0A 전환 → 형광 그린 활성화 스크립트 순차 stamp(누적). 블리드 완료 시 좌상단 흰 로고 등장. onLineReveal/onBleedComplete 콜백(사운드/GNB 연동), reduced-motion 대응. 부모 scrollProgress 구동 (`components/scroll/IntroLogoBleed.jsx`)
- CellDivisionCanvas: The Substance 살아있는 배경 세포 분열 레이어. 형광 그린 세포가 progress로 밀도·분열 구동, 분열 시 onDivision(사운드) 콜백. 하이브리드(실사 텍스처 public/cell-green.png + 코드, 없으면 절차적 폴백) (`components/scroll/CellDivisionCanvas.jsx`)
- ScrollScaleContainer: 뷰포트 노출 비율 연동 스케일 컨테이너. Framer Motion useScroll + useTransform (`components/scroll/ScrollScaleContainer.jsx`)
- LipsVideoWall: The Substance 인트로 "욕망 비트". 그레이딩된 립스 루프 영상 1개를 캔버스로 풀블리드 타일링해 progress로 단일→2×2/3×3→풀 CRT TV 월(베젤·스캔라인·비네트·파워온 플리커)로 멀티플라이. 욕망 3연("Younger./More beautiful./More perfect.")을 격자 단계와 1:1로 하나씩 교체 stamp, onStep(사운드) 콜백. 영상 1개만 디코드(다수 video 회피), 애니값 ref+rAF, reduced-motion 시 poster 단일 유지+텍스트 stamp, 탭 백그라운드 시 pause. public/video/lips-loop.webm(+mp4, lips-poster.jpg) (`components/scroll/LipsVideoWall.jsx`)

## 14. Motion (Interactive) — 스토리텔링 모션

- FadeTransition: 기본 opacity 전환 애니메이션. 등장/퇴장 페이드 + 방향 슬라이드, IntersectionObserver 자동 트리거 (`components/motion/FadeTransition.jsx`)
- PerspectiveTransition: 3D 원근 회전 전환. 뒤로 누워있다가 세워지는 효과, CSS perspective + rotateX, IntersectionObserver 자동 트리거 (`components/motion/PerspectiveTransition.jsx`)
- MarqueeContainer: 무한 루프 수평 흐름 컨테이너. CSS keyframes 기반 (`components/motion/MarqueeContainer.jsx`)
- SyringeInjector: 가로 주사기 주입 모션. 투명 배경 실사 주사기 PNG(`assets/reference/syringe-real.png`)를 progress(0~1)로 왼쪽 슬라이드 인 → 도킹(주입) → 왼쪽 후퇴. 실사 이미지라 유리·바늘·눈금·액체가 사실적, 바늘 끝은 상위 노른자 레이어가 가려 "찌르는" 느낌(주입은 노른자 그린 플룸으로 표현). scale·dockX로 크기/도달 위치 튜닝 (`components/motion/SyringeInjector.jsx`)
- YolkMorph: 계란 노른자(원본 자아)가 둘로 분열하는 하이퍼리얼 SVG. 실사 사진 텍스처 + progress(0~1) 3단계(그린 주입 잉크 텐드릴 → 용암 블리스터 기포 꿀렁 → gooey 점성 pinch 분열). 광택 sheen은 블러 밖(분열 중/후에도 crisp), 블러는 pinch에만(완전 분열 시 선명). 실사(플랫 아님) (`components/motion/YolkMorph.jsx`)

## 15. DynamicColor (Interactive) — 동적 색상 변화

- GradientOverlay: Three.js WebGL 스크롤 반응형 그라데이션 배경. Simplex Noise + 필름 그레인 (`components/dynamic-color/GradientOverlay.jsx`)
- GradientOverlayDynamic: Next.js 동적 import 래퍼 (ssr: false). 페이지에서 사용 시 이것을 import (`components/dynamic-color/GradientOverlayDynamic.jsx`)

---

## Common (유틸리티)

- SubstanceLogo: The Substance ◗◗ 아이덴티티 심볼(마주보는 두 반원). hover 시 두 반원 분리 애니메이션, 색상 theme 토큰(기본 primary.main). SVG 벡터·플랫(로고이므로 실사 아님) (`common/ui/SubstanceLogo.jsx`)
- SubstanceSyringe: The Substance 좌측 임상 주사기 게이지. fill(0~1)로 형광물질 레벨, 주/부 눈금+플런저, 스크롤로 줄며 "주입" 시각화(발광) (`common/ui/SubstanceSyringe.jsx`)
- Indicator: 범용 인디케이터 (`common/ui/Indicator.jsx`)
- Placeholder: 스토리 예제용 FPO 플레이스홀더 시스템. Box/Image/Media/Text/Line/Paragraph/Card 서브컴포넌트 (`common/ui/Placeholder.jsx`)
- FilterBar: 필터 바 (`components/templates/FilterBar.jsx`)
- SubstanceHowItWorks: The Substance "원리 설명" 섹션 조립. 단일 progress로 좌측 주사기 게이지 배출(fill 1→0) → 노른자 그린 주입→꿀렁→분열(YolkMorph) → 배경 세포 분열 가속(CellDivisionCanvas)을 동시 구동. sticky 타임라인(useScrollProgress) 연동, onCellDivision 콜백(사운드) (`components/templates/SubstanceHowItWorks.jsx`)
- RequestConsideration: The Substance ACCESS 최종 폼 래퍼. 구매 아닌 "지원(고려 요청)". 이메일 1개 + SUBMIT REQUEST, 제출해도 확답 없음(성공 피드백조차 불안). isTilted 대칭 붕괴 (`components/templates/RequestConsideration.jsx`)
