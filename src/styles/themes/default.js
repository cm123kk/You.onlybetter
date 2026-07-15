/**
 * Default Theme — THE SUBSTANCE
 *
 * 스타터킷의 기본 디자인 토큰을 이 프로젝트(The Substance 랜딩)에 맞게 재정의한 테마입니다.
 * 피그마의 Design Tokens / Variables와 동일한 역할입니다.
 *
 * ## 핵심 철학
 * - **Clinical Dark**: #0A0A0A 딥 블랙 배경 (순수 #000 아님, 필름 LUT의 silky black)
 * - **5색 고정 팔레트**: 아래 5색 외 임의 색상 사용 금지
 *   - #0A0A0A 배경 / #F5F5F0 텍스트 / #F5E642 옐로(정적·로고) / #AAFF00 그린(동적·액체) / #C41E3A 레드(경고·극소량)
 * - **ALL CAPS 단일 서체**: Bebas Neue, 본문 개념 없음(모든 텍스트가 헤드라인), letterSpacing -0.03em
 * - **Sharp Corners**: borderRadius 0 (임상적 사각 기하학 — 유지)
 * - **Glow, not Shadow**: 다크 표면에서 그림자 대신 #AAFF00 발광
 */

import { createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';

// ============================================================
// 0. Substance 5색 토큰 (Single Source)
// ============================================================
const BLACK = '#0A0A0A'; // background — deep silky black
const WHITE = '#F5F5F0'; // text — warm clinical white
const YELLOW = '#F5E642'; // primary — yolk yellow · 정적 · 로고 ◗◗
const GREEN = '#AAFF00'; // secondary — ampoule green · 동적 · 액체/hover/CTA
const RED = '#C41E3A'; // error — 경고 · Phase 03 · 면책 (극소량)

// ============================================================
// 1. Color Tokens (색상 토큰)
// ============================================================
const palette = {
  mode: 'dark',
  // 브랜드 색상
  primary: {
    light: '#FFF17A',
    main: YELLOW, // 옐로 — 로고·원본 자아 (정적)
    dark: '#C9BE2F',
    contrastText: BLACK,
  },
  secondary: {
    light: '#C4FF4D',
    main: GREEN, // 그린 — 활성화된 서브스탠스 (동적)
    dark: '#7FBF00',
    contrastText: BLACK,
  },

  // 상태 색상 (Feedback) — 5색 팔레트 밖 사용 금지. 오용 방지를 위해 팔레트 내로 매핑.
  error: {
    light: '#E14257',
    main: RED, // 딥 레드 — 경고·Phase 03·면책 (페이지 전체 3~4곳 이하)
    dark: '#9B1730',
    contrastText: WHITE,
  },
  warning: {
    light: '#FFF17A',
    main: YELLOW,
    dark: '#C9BE2F',
    contrastText: BLACK,
  },
  success: {
    light: '#C4FF4D',
    main: GREEN,
    dark: '#7FBF00',
    contrastText: BLACK,
  },
  info: {
    light: '#C4FF4D',
    main: GREEN,
    dark: '#7FBF00',
    contrastText: BLACK,
  },

  // 텍스트 색상 — 항상 warm white on black (반전 없음, CTA hover만 예외)
  text: {
    primary: WHITE,
    secondary: 'rgba(245, 245, 240, 0.6)',
    disabled: 'rgba(245, 245, 240, 0.38)',
  },

  // 배경 색상 — 플랫 다크
  background: {
    default: BLACK,
    paper: BLACK,
  },

  // 구분선
  divider: 'rgba(245, 245, 240, 0.12)',

  // 액션 상태
  action: {
    active: 'rgba(245, 245, 240, 0.7)',
    hover: 'rgba(245, 245, 240, 0.06)',
    selected: 'rgba(245, 245, 240, 0.12)',
    disabled: 'rgba(245, 245, 240, 0.3)',
    disabledBackground: 'rgba(245, 245, 240, 0.12)',
    focus: 'rgba(245, 245, 240, 0.12)',
  },

  // Grey 스케일 (유지 — 유틸리티용)
  grey: {
    50: grey[50],
    100: grey[100],
    200: grey[200],
    300: grey[300],
    400: grey[400],
    500: grey[500],
    600: grey[600],
    700: grey[700],
    800: grey[800],
    900: grey[900],
  },
};

// ============================================================
// 2. Typography Tokens (타이포그래피 토큰)
// ============================================================
// 단일 서체 · ALL CAPS 전용 · 본문 개념 없음(모든 텍스트가 헤드라인, 크기만 다름)
const FONT_STACK = "'Bebas Neue', 'Arial Narrow', 'Oswald', sans-serif";

const typography = {
  // 기본 폰트 패밀리 (헤딩=본문 통일)
  fontFamily: FONT_STACK,

  // 헤딩 폰트 패밀리 (동일 — 단일 서체)
  headingFontFamily: FONT_STACK,

  // 폰트 크기 기준
  fontSize: 14,
  htmlFontSize: 16,

  // 폰트 굵기 (Bebas Neue는 단일 웨이트 — 폴백 시 heavy)
  fontWeightLight: 400,
  fontWeightRegular: 400,
  fontWeightMedium: 400,
  fontWeightBold: 700,

  // 헤딩 스타일 — condensed 특성상 큰 사이즈에서 임팩트 극대화
  h1: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
    fontSize: 'clamp(4rem, 12vw, 9rem)', // Chapter/Hero — "NOT FOR EVERYONE"
    lineHeight: 0.95,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
  },
  h2: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
    fontSize: 'clamp(2.5rem, 6vw, 4rem)', // Section title
    lineHeight: 1,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
  },
  h3: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
    fontSize: 'clamp(2rem, 5vw, 3rem)',
    lineHeight: 1,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
  },
  h4: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
    fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', // Phase 라벨
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
  },
  h5: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
    fontSize: '1.5rem',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
  },
  h6: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
    fontSize: '1.25rem',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
  },

  // "본문" — 존재하지 않음. 활성화 스크립트도 헤드라인 취급 (크기만 작게)
  body1: {
    fontFamily: FONT_STACK,
    fontSize: '1.5rem', // Body-as-headline
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
  },
  body2: {
    fontFamily: FONT_STACK,
    fontSize: '1.25rem',
    lineHeight: 1.15,
    letterSpacing: '-0.03em',
    textTransform: 'uppercase',
  },

  // 부제목
  subtitle1: {
    fontFamily: FONT_STACK,
    fontSize: '1.25rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
  },
  subtitle2: {
    fontFamily: FONT_STACK,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    textTransform: 'uppercase',
  },

  // 버튼 — 전면 ALL CAPS
  button: {
    fontFamily: FONT_STACK,
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  // Fine print — 같은 폰트·같은 웨이트, 크기만 작게 (면책·클리니컬 데이터)
  caption: {
    fontFamily: FONT_STACK,
    fontSize: '0.75rem',
    lineHeight: 1.4,
    letterSpacing: '0.01em',
    textTransform: 'uppercase',
  },
  overline: {
    fontFamily: FONT_STACK,
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

// ============================================================
// 3. Spacing Token (간격 토큰) — 유지
// ============================================================
const spacing = 8; // 기본 단위: 8px (임상적 사각 그리드에 부합 — 변경 없음)

// ============================================================
// 4. Shape Token (모양 토큰) — 유지
// ============================================================
const shape = {
  borderRadius: 0, // Sharp corners (0px) — 임상적 사각 기하학
};

// ============================================================
// 5. Shadow Tokens (그림자 토큰) — Glow(발광) 개념으로 전환
// ============================================================
// 다크 배경에서는 dimmed shadow 대신 #AAFF00 글로우. 일반 표면은 그림자 거의 없음(플랫).
const customShadows = {
  none: 'none',
  sm: 'none',
  md: 'none',
  lg: '0 0 20px rgba(170, 255, 0, 0.2)',
  xl: '0 0 32px rgba(170, 255, 0, 0.35)',
  glow: '0 0 20px rgba(170, 255, 0, 0.4)', // 그린 요소 hover 발광
};

// ============================================================
// 6. Breakpoints (브레이크포인트) — 유지
// ============================================================
const breakpoints = {
  values: {
    xs: 0, // 모바일
    sm: 600, // 태블릿 세로
    md: 900, // 태블릿 가로
    lg: 1200, // 데스크톱
    xl: 1536, // 대형 데스크톱
  },
};

// ============================================================
// 7. Z-Index (레이어 순서)
// ============================================================
const zIndex = {
  mobileStepper: 1000,
  fab: 1050,
  speedDial: 1050,
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
};

// ============================================================
// 8. Transitions (전환 효과)
// ============================================================
const transitions = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// ============================================================
// 9. Component Overrides (컴포넌트 오버라이드)
// ============================================================
const components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: BLACK,
        scrollbarWidth: 'thin',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: BLACK,
        backgroundImage: 'none', // MUI dark elevation overlay 제거 (플랫 표면)
        boxShadow: 'none',
      },
      elevation0: { boxShadow: customShadows.none },
      elevation1: { boxShadow: customShadows.none },
      elevation2: { boxShadow: customShadows.none },
      elevation3: { boxShadow: customShadows.lg },
      elevation4: { boxShadow: customShadows.xl },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        textTransform: 'uppercase', // 전면 ALL CAPS
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        backgroundColor: BLACK,
        backgroundImage: 'none',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 0, // Sharp — 이 페이지는 4px 예외 없이 전부 각짐
      },
    },
  },
};

// ============================================================
// Theme 생성
// ============================================================
const defaultTheme = createTheme({
  palette,
  typography,
  spacing,
  shape,
  breakpoints,
  zIndex,
  transitions,
  components,
});

// 커스텀 속성 추가 (타입 확장 없이 접근 가능하도록)
defaultTheme.customShadows = customShadows;

/**
 * Substance 전용 커스텀 토큰 (MUI 표준 팔레트 밖)
 * theme.substance.* 로 접근 — 컬러 아크·발광·과잉조명 등 페이지 전용 값
 */
defaultTheme.substance = {
  arcYellow: YELLOW, // 컬러 아크 시작점 (옐로 100%)
  arcGreen: GREEN, // 컬러 아크 종점 (그린 100%)
  glowGreen: '0 0 20px rgba(170, 255, 0, 0.4)', // hover 발광
  deniedRed: RED, // ACCESS DENIED
  overbright: 'brightness(2.2)', // 과잉 조명 플래시
  maxWidth: 680, // 센터 컬럼 폭(px)
};

/**
 * 대시보드 스타일 설정 (Default) — 다크로 정합
 */
defaultTheme.dashboard = {
  style: 'default',
  iconStyle: 'outlined',
  iconWeight: 400,
  cardBorderRadius: 0,
  cardColors: [
    'linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 100%)',
    'linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 100%)',
    'linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 100%)',
    'linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 100%)',
    'linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 100%)',
    'linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 100%)',
  ],
  subCardColors: [
    'linear-gradient(to bottom, #121212 0%, #121212 100%)',
    'linear-gradient(to bottom, #121212 0%, #121212 100%)',
    'linear-gradient(to bottom, #121212 0%, #121212 100%)',
    'linear-gradient(to bottom, #121212 0%, #121212 100%)',
    'linear-gradient(to bottom, #121212 0%, #121212 100%)',
    'linear-gradient(to bottom, #121212 0%, #121212 100%)',
  ],
  textColor: palette.text.primary,
  textSecondary: palette.text.secondary,
  textShadow: '0 0 0 rgba(0, 0, 0, 0)',
  backdropFilter: 'blur(0px)',
  WebkitBackdropFilter: 'blur(0px)',
  border: '1px solid rgba(245, 245, 240, 0.12)',
  borderColor: 'rgba(245, 245, 240, 0.12)',
  shadow: customShadows.lg,
  subBorder: '1px solid rgba(245, 245, 240, 0.06)',
  subShadow: '0 0 0 rgba(0, 0, 0, 0)',
  subBackdropFilter: 'blur(0px)',
  subBorderRadius: 0,
  dividerColor: 'rgba(245, 245, 240, 0.12)',
  progressHeight: 6,
  progressTrackColor: 'rgba(245, 245, 240, 0.08)',
  progressBarColor: palette.secondary.main,
  progressGradient: false,
  progressBorderRadius: 0,
  background: BLACK,
  atmosphere: 'linear-gradient(to bottom, #0A0A0A 0%, #0A0A0A 100%)',
  atmosphereOpacity: 0,
  accentColor: palette.secondary.main,
  accentColors: {
    wind: GREEN,
    humidity: YELLOW,
    uvIndex: GREEN,
    pressure: YELLOW,
  },
  blobs: null,
};

export default defaultTheme;

// 개별 토큰 내보내기 (문서화용)
export {
  palette,
  typography,
  spacing,
  shape,
  customShadows,
  breakpoints,
  zIndex,
  transitions,
  components,
};
