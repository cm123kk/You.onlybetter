import { forwardRef } from 'react';
import Typography from '@mui/material/Typography';

/**
 * VanishingDisclaimer 컴포넌트
 *
 * "읽으려 하면 사라지는" 역설을 구현한 면책조항(disclaimer) 텍스트.
 * 평소엔 fine-print로 흐릿하게 보이다가 hover 시 opacity 0으로 페이드아웃된다.
 * 단, 접근성을 위해 focus/키보드(focus-within) 시에는 다시 완전히 보이도록 유지해
 * 법적 고지를 최소한 보장한다.
 *
 * 동작 흐름:
 * 1. 기본 opacity는 baseOpacity (fine print, caption variant, text.secondary)
 * 2. hasFadeOnHover가 true면 hover 시 opacity 0으로 페이드아웃 (transition 0.4s)
 * 3. focus-within 시 opacity 1로 복귀 (키보드 접근성 보장)
 * 4. tabIndex=0으로 focus 가능
 * 5. prefers-reduced-motion 환경에서는 transition을 제거하되 hover/focus 동작은 유지
 *
 * Props:
 * @param {React.ReactNode} children - 면책 전문 (text 미지정 시 사용) [Optional]
 * @param {string} text - 면책 전문 (children 대체용) [Optional]
 * @param {boolean} hasFadeOnHover - hover 시 사라짐 여부 [Optional, 기본값: true]
 * @param {number} baseOpacity - 평소 흐릿함 정도 (0~1) [Optional, 기본값: 0.5]
 * @param {object} sx - 추가 스타일 오버라이드 [Optional]
 *
 * Example usage:
 * <VanishingDisclaimer text="Results vary. Irreversible. There's no going back." />
 * <VanishingDisclaimer hasFadeOnHover={ false } baseOpacity={ 0.7 }>
 *   Effects are permanent.
 * </VanishingDisclaimer>
 */
const VanishingDisclaimer = forwardRef(function VanishingDisclaimer({
  children,
  text,
  hasFadeOnHover = true,
  baseOpacity = 0.5,
  sx,
  ...props
}, ref) {
  const content = text ?? children;

  return (
    <Typography
      ref={ ref }
      variant="caption"
      component="p"
      tabIndex={ 0 }
      sx={ {
        color: 'text.secondary',
        opacity: baseOpacity,
        outline: 'none',
        cursor: 'default',
        transition: 'opacity 0.4s ease',
        ...(hasFadeOnHover && {
          '&:hover': {
            opacity: 0,
          },
        }),
        '&:focus-within, &:focus-visible, &:focus': {
          opacity: 1,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
        ...sx,
      } }
      { ...props }
    >
      { content }
    </Typography>
  );
});

export { VanishingDisclaimer };
