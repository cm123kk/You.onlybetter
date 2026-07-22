import { forwardRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { KitSpecimen } from '../media/KitSpecimen.jsx';

const clampFill = (v) => Math.min(1, Math.max(0, v));

/**
 * ProtocolPhaseCard 컴포넌트
 *
 * The Substance "THE PROTOCOL" 섹션의 Phase 카드.
 * 공개도(disclosure)에 따라 3가지 상태로 정보를 노출한다.
 * LockedPhase 기능을 disclosure='locked' 상태로 통합했다.
 *
 * 동작 방식:
 * 1. disclosure='full' — 본문 전체 공개. isIrreversible 시 'IRREVERSIBLE' 뱃지 표시
 * 2. disclosure='half' — 본문 후반부를 검열 바(블러 블록)로 가려 정보 결핍 유혹
 * 3. disclosure='locked' — 카드 전체 흐림/잠금. hover 시 error.main 'ACCESS DENIED' 오버레이 페이드 인
 *    hover 시작/해제에 onLockHoverStart/onLockHoverEnd 콜백 호출(페이지 사운드 침묵 트리거용)
 *
 * Props:
 * @param {string} phaseId - Phase 식별 번호 (예: '01') [Required]
 * @param {string} label - Phase 명칭 (예: 'ACTIVATION') [Required]
 * @param {string} disclosure - 공개 상태 ('full' | 'half' | 'locked') [Optional, 기본값: 'full']
 * @param {string} body - Phase 본문 텍스트 [Optional, 기본값: '']
 * @param {boolean} isIrreversible - Irreversible 뱃지 표시 여부 [Optional, 기본값: false]
 * @param {function} onLockHoverStart - locked 상태 hover 시작 콜백 [Optional]
 * @param {function} onLockHoverEnd - locked 상태 hover 해제 콜백 [Optional]
 * @param {string[]} kitFrames - 키트 뜯기 프레임 시퀀스(봉인→개봉). 있으면 카드가 텍스트+키트 side-by-side(SplitScreen)로 배치 [Optional]
 * @param {string} kitConsumedSrc - 키트 소진(쭈글 빈 비닐) 실사 [Optional]
 * @param {number} kitSegments - 넘버링 키트 게이지 칸 수(STABILIZER/FOOD=7, ACTIVATOR=0) [Optional, 기본값: 0]
 * @param {number} kitActiveSegment - 현재 소진 넘버(1~kitSegments) [Optional, 기본값: 0]
 * @param {boolean} hasRailLine - 세로 프로그레스바(채움 라인) 표시. false면 노드/컬럼은 유지하고 라인만 숨김 → 바디 텍스트 위치 불변(마지막 단계) [Optional, 기본값: true]
 * @param {number} scrollProgress - Phase 진행도 0~1 → 키트 뜯기(openProgress) 구동 [Optional, 기본값: 0]
 * @param {function} onAdminister - 키트가 완전히 개봉(뜯김 완료)될 때 1회 호출(인젝션 사운드) [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProtocolPhaseCard
 *   phaseId="01"
 *   label="ACTIVATION"
 *   body="ONE ACTIVATION. YOUR OTHER SELF IS BORN."
 *   isIrreversible
 *   kitFrames={ ['/kit/activator-01-sealed.png', '/kit/activator-05-fully-torn.png'] }
 *   scrollProgress={ phaseProgress }
 *   onAdminister={ playInjection }
 * />
 */
const ProtocolPhaseCard = forwardRef(function ProtocolPhaseCard({
  phaseId,
  label,
  disclosure = 'full',
  body = '',
  isIrreversible = false,
  onLockHoverStart,
  onLockHoverEnd,
  kitFrames,
  kitConsumedSrc,
  kitSegments = 0,
  kitActiveSegment = 0,
  kitFrameSnap = false,
  lockPreview = false,
  hasRailLine = true,
  scrollProgress = 0,
  onAdminister,
  sx,
  ...props
}, ref) {
  const hasKit = Array.isArray(kitFrames) && kitFrames.length > 0;
  const hasRail = hasKit; // 키트 페이즈 카드 = 좌측 단일 노드 레일(컬럼 자리 유지 → 텍스트 위치 고정)
  // hasRailLine=false면 프로그레스바(세로 채움 라인)만 숨김. 노드/컬럼 footprint는 그대로 두어
  // 바디 텍스트가 다른 페이즈와 동일 위치에 남는다(마지막 단계 Phase 03 = 진행할 다음 없음).
  const railFill = clampFill(scrollProgress); // 노드 아래 선을 형광으로 채우는 양(이 페이즈 진행도)
  const [isLockHovered, setIsLockHovered] = useState(false);

  const isLocked = disclosure === 'locked';
  const isHalf = disclosure === 'half';
  // lockPreview: locked이되 콘텐츠(키트·본문)는 흐리지 않고 보이게(주입·티저 노출) — 게이트는 hover ACCESS DENIED만.
  const lockDim = isLocked && !lockPreview;

  /**
   * 본문을 half 상태에서 공개/검열 두 조각으로 분할한다.
   * 앞 60%는 공개, 나머지는 검열 바로 가린다.
   */
  const splitBody = () => {
    if (!isHalf || !body) {
      return { visible: body, redacted: '' };
    }
    const cut = Math.ceil(body.length * 0.6);
    return { visible: body.slice(0, cut), redacted: body.slice(cut) };
  };

  const { visible, redacted } = splitBody();

  /**
   * locked hover 진입: 콜백 호출 + 오버레이 페이드 인
   */
  const handleLockEnter = () => {
    if (!isLocked) return;
    setIsLockHovered(true);
    if (onLockHoverStart) onLockHoverStart();
  };

  /**
   * locked hover 해제: 콜백 호출 + 오버레이 페이드 아웃
   */
  const handleLockLeave = () => {
    if (!isLocked) return;
    setIsLockHovered(false);
    if (onLockHoverEnd) onLockHoverEnd();
  };

  return (
    <Box
      ref={ ref }
      onMouseEnter={ handleLockEnter }
      onMouseLeave={ handleLockLeave }
      sx={ {
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 0,
        border: hasKit && !isLocked ? 'none' : '1px solid',
        borderColor: isLocked ? 'error.main' : 'text.primary',
        backgroundColor: 'background.default',
        color: 'text.primary',
        p: { xs: 2.5, md: 3 },
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      } }
      { ...props }
    >
      {/* 콘텐츠 — 키트 있으면 텍스트 + 키트 좌우 배치(md 이하 스택) */}
      <Box
        sx={ {
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 3, md: 4 },
          flexGrow: 1,
          alignItems: 'stretch',
        } }
      >
        {/* 세로 페이즈 프로그레스 레일 — 형광 원 노드 + 연결선(흰색 → scrollProgress로 형광 채워짐) */}
        { hasRail && (
          <Box
            aria-hidden="true"
            sx={ {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              alignSelf: 'stretch',
              flexShrink: 0,
            } }
          >
            {/* 이 페이즈 번호 노드(형광 원) */}
            <Box
              sx={ {
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: 'secondary.main',
                color: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '1.35rem',
                boxShadow: '0 0 14px rgba(170,255,0,0.5)',
              } }
            >
              { phaseId }
            </Box>
            {/* 노드에서 이어지는 선(프로그레스바) — 흰색, scrollProgress로 위→아래 형광 채워짐.
                마지막 단계(hasRailLine=false)는 진행할 다음이 없어 라인 생략(노드만 남김 = 종점). */}
            { hasRailLine && (
              <Box sx={ { position: 'relative', width: 2, flexGrow: 1, mt: 1.5, backgroundColor: 'rgba(245,245,240,0.35)' } }>
                <Box
                  sx={ {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${ railFill * 100 }%`,
                    backgroundColor: 'secondary.main',
                    boxShadow: '0 0 8px rgba(170,255,0,0.7)',
                    transition: 'height 0.12s linear',
                  } }
                />
              </Box>
            ) }
          </Box>
        ) }

        {/* 텍스트 컬럼 */}
        <Box sx={ { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' } }>
      {/* 헤더: Phase 번호 + 명칭 */}
      <Box
        sx={ {
          display: 'flex',
          alignItems: 'baseline',
          gap: 3,
          mb: 6,
          opacity: lockDim ? 0.25 : 1,
          filter: lockDim ? 'blur(2px)' : 'none',
          transition: 'opacity 0.4s ease',
        } }
      >
        {/* Phase 번호는 kit 모드에선 좌측 레일 노드가 담당 → 헤더에선 숨김 */}
        { !hasRail && (
          <Typography
            variant="h2"
            sx={ {
              lineHeight: 1,
              color: 'secondary.main',
            } }
          >
            { phaseId }
          </Typography>
        ) }
        <Typography
          variant="h3"
          sx={ {
            lineHeight: 1,
            color: 'text.primary',
          } }
        >
          { label }
        </Typography>
      </Box>

      {/* Irreversible 뱃지 (full + isIrreversible, 단 kit 모드에선 숨김) */}
      { isIrreversible && !isLocked && !hasKit && (
        <Box sx={ { mb: 4 } }>
          <Typography
            variant="overline"
            sx={ {
              display: 'inline-block',
              px: 2,
              py: 0.5,
              border: '1px solid',
              borderColor: 'primary.main',
              color: 'primary.main',
              letterSpacing: '0.2em',
            } }
          >
            IRREVERSIBLE
          </Typography>
        </Box>
      ) }

      {/* 본문 */}
      <Box
        sx={ {
          flexGrow: 1,
          opacity: lockDim ? 0.2 : 1,
          filter: lockDim ? 'blur(4px)' : 'none',
          transition: 'opacity 0.4s ease, filter 0.4s ease',
        } }
      >
        { body && (
          <Typography
            component="p"
            sx={ hasKit ? {
              m: 0,
              color: '#F5F5F0',
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              fontWeight: 300,
              lineHeight: 1.15,
              letterSpacing: '0.03em',
              opacity: 0.55,
            } : { color: 'text.primary', m: 0 } }
          >
            { visible }
            { isHalf && redacted && (
              <Box
                component="span"
                aria-hidden="true"
                sx={ {
                  display: 'inline',
                  color: 'transparent',
                  backgroundColor: 'text.primary',
                  opacity: 0.85,
                  userSelect: 'none',
                  filter: 'blur(3px)',
                  ml: 0.5,
                } }
              >
                { redacted }
              </Box>
            ) }
          </Typography>
        ) }
      </Box>
        </Box>{/* /텍스트 컬럼 */}

        {/* 키트 컬럼 — 뜯기 이미지 시퀀스(KitSpecimen). scrollProgress로 봉인→개봉 스크럽. 임팩트 있게 크게 */}
        { hasKit && (
          <Box
            sx={ {
              flex: { xs: '1 1 auto', md: '4 1 0' },
              minWidth: 0,
              minHeight: { xs: 380, md: 620 },
              display: 'flex',
              opacity: lockDim ? 0.2 : 1,
              filter: lockDim ? 'blur(4px)' : 'none',
              transition: 'opacity 0.4s ease, filter 0.4s ease',
            } }
          >
            <KitSpecimen
              frames={ kitFrames }
              openProgress={ scrollProgress }
              consumedSrc={ kitConsumedSrc }
              segments={ kitSegments }
              activeSegment={ kitActiveSegment }
              frameSnap={ kitFrameSnap }
              onAdminister={ onAdminister }
              label={ label }
              objectPosition="center top"
            />
          </Box>
        ) }
      </Box>{/* /콘텐츠 */}

      {/* locked ACCESS DENIED 오버레이 (hover 시 페이드 인) */}
      { isLocked && (
        <Box
          aria-hidden={ !isLockHovered }
          sx={ {
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'background.default',
            opacity: isLockHovered ? 0.92 : 0,
            pointerEvents: 'none',
            transition: 'opacity 0.4s ease',
            '@media (prefers-reduced-motion: reduce)': {
              transition: 'none',
            },
          } }
        >
          <Typography
            variant="h3"
            sx={ {
              color: 'error.main',
              letterSpacing: '0.15em',
              transform: isLockHovered ? 'scale(1)' : 'scale(0.96)',
              transition: 'transform 0.4s ease',
              '@media (prefers-reduced-motion: reduce)': {
                transform: 'none',
                transition: 'none',
              },
            } }
          >
            ACCESS DENIED
          </Typography>
        </Box>
      ) }
    </Box>
  );
});

export { ProtocolPhaseCard };
