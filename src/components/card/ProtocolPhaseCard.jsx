import { forwardRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <ProtocolPhaseCard
 *   phaseId="03"
 *   label="CONTINUATION"
 *   disclosure="locked"
 *   body="The cycle does not end."
 *   onLockHoverStart={ silenceSound }
 *   onLockHoverEnd={ restoreSound }
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
  sx,
  ...props
}, ref) {
  const [isLockHovered, setIsLockHovered] = useState(false);

  const isLocked = disclosure === 'locked';
  const isHalf = disclosure === 'half';

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
        border: '1px solid',
        borderColor: isLocked ? 'error.main' : 'text.primary',
        backgroundColor: 'background.default',
        color: 'text.primary',
        p: { xs: 5, md: 8 },
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      } }
      { ...props }
    >
      {/* 헤더: Phase 번호 + 명칭 */}
      <Box
        sx={ {
          display: 'flex',
          alignItems: 'baseline',
          gap: 3,
          mb: 6,
          opacity: isLocked ? 0.25 : 1,
          filter: isLocked ? 'blur(2px)' : 'none',
          transition: 'opacity 0.4s ease',
        } }
      >
        <Typography
          variant="h2"
          sx={ {
            lineHeight: 1,
            color: 'secondary.main',
          } }
        >
          { phaseId }
        </Typography>
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

      {/* Irreversible 뱃지 (full + isIrreversible) */}
      { isIrreversible && !isLocked && (
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
          opacity: isLocked ? 0.2 : 1,
          filter: isLocked ? 'blur(4px)' : 'none',
          transition: 'opacity 0.4s ease, filter 0.4s ease',
        } }
      >
        { body && (
          <Typography
            variant="body1"
            component="p"
            sx={ { color: 'text.primary', m: 0 } }
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
