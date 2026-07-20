import { forwardRef } from 'react';
import Box from '@mui/material/Box';

/**
 * SubstanceLogo 컴포넌트
 *
 * The Substance ◗◗ 심볼 — 나란히 놓인 두 반달 디스크(반원). 분열·창조·이중 자아의
 * 시각 은유이며, 워드마크 없이 이 심볼 하나로 브랜드 아이덴티티가 성립한다.
 * hover 시 두 반원이 좌우로 벌어지며 "분열"을 드러낸다. 색상은 theme 토큰
 * (기본 primary.main = 옐로 #F5E642, 움직이지 않는 정적 아이덴티티)을 사용한다.
 *
 * 동작 방식:
 * 1. 인라인 SVG 두 path(좌/우 반원)를 currentColor로 채운다 → color 토큰이 곧 심볼 색.
 * 2. hasSplitOnHover 시, hover에서 좌 반원은 왼쪽·우 반원은 오른쪽으로 translate.
 * 3. size는 정사각 픽셀 크기, splitGap은 SVG 좌표 단위(=size에 비례)로 벌어짐 정도.
 *
 * Props:
 * @param {number} size - 심볼 정사각 크기(px) [Optional, 기본값: 48]
 * @param {string} color - 심볼 색상 theme 토큰 [Optional, 기본값: 'primary.main']
 * @param {boolean} hasSplitOnHover - hover 시 두 반원 분리 애니메이션 [Optional, 기본값: true]
 * @param {number} splitGap - hover 분리 간격(SVG 단위) [Optional, 기본값: 8]
 * @param {string} title - 접근성 라벨 [Optional, 기본값: 'The Substance']
 * @param {function} onClick - 클릭 핸들러 [Optional]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <SubstanceLogo size={ 64 } />
 * <SubstanceLogo color="secondary.main" hasSplitOnHover={ false } />
 */
const SubstanceLogo = forwardRef(function SubstanceLogo({
  size = 48,
  color = 'primary.main',
  hasSplitOnHover = true,
  splitGap = 8,
  title = 'The Substance',
  onClick,
  sx,
  ...props
}, ref) {
  const isInteractive = Boolean(onClick);

  return (
    <Box
      ref={ ref }
      component="span"
      onClick={ onClick }
      role={ isInteractive ? 'button' : 'img' }
      aria-label={ title }
      tabIndex={ isInteractive ? 0 : undefined }
      sx={ {
        display: 'inline-flex',
        width: size,
        height: size,
        color,
        lineHeight: 0,
        cursor: isInteractive ? 'pointer' : 'default',
        '& .substance-logo__half': {
          transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'center',
        },
        ...(hasSplitOnHover && {
          '&:hover .substance-logo__half--left': {
            transform: `translateX(${ -splitGap }px)`,
          },
          '&:hover .substance-logo__half--right': {
            transform: `translateX(${ splitGap }px)`,
          },
        }),
        ...sx,
      } }
      { ...props }
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        width={ size }
        height={ size }
        aria-hidden="true"
        sx={ { display: 'block', fill: 'currentColor' } }
      >
        {/* 좌 반원 (flat edge on left, bulging right — "D") */}
        <path
          className="substance-logo__half substance-logo__half--left"
          d="M19 22 A28 28 0 0 1 19 78 Z"
        />
        {/* 우 반원 */}
        <path
          className="substance-logo__half substance-logo__half--right"
          d="M53 22 A28 28 0 0 1 53 78 Z"
        />
      </Box>
    </Box>
  );
});

export { SubstanceLogo };
