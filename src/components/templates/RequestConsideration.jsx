import { forwardRef, useState, useCallback } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

/**
 * RequestConsideration 템플릿
 *
 * The Substance "ACCESS" 섹션의 최종 폼 래퍼.
 * 구매가 아니라 "지원(고려 요청)"이다. 이메일 하나와 "SUBMIT REQUEST" 버튼만 있으며,
 * 제출해도 확답을 주지 않는다. 성공 피드백조차 안심이 아니라 불안을 남긴다.
 * 실제 네트워크 전송은 없으며 UI 시연 전용이다.
 *
 * 동작 방식:
 * 1. 이메일 입력 후 SUBMIT REQUEST 제출
 * 2. submitState: 'idle' → 'submitting'(버튼 비활성) → 'submitted'
 * 3. 'submitted'에서 확답 없는 경고 메시지 표시
 * 4. onSubmit(email) 콜백 호출 (페이지에서 사운드 트리거 등에 사용)
 *
 * Props:
 * @param {function} onSubmit - 제출 시 호출되는 콜백 (email) => void [Optional]
 * @param {boolean} isTilted - 대칭 붕괴용 미세 기울임 적용 여부 [Optional, 기본값: false]
 * @param {object} sx - 추가 스타일 [Optional]
 *
 * Example usage:
 * <RequestConsideration onSubmit={(email) => playInjection(email)} isTilted />
 */
const RequestConsideration = forwardRef(function RequestConsideration(
  { onSubmit, isTilted = false, sx },
  ref,
) {
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState('idle');

  const isSubmitting = submitState === 'submitting';
  const isSubmitted = submitState === 'submitted';

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (isSubmitting || email.trim() === '') {
        return;
      }
      setSubmitState('submitting');
      if (onSubmit) {
        onSubmit(email);
      }
      window.setTimeout(() => {
        setSubmitState('submitted');
      }, 900);
    },
    [email, isSubmitting, onSubmit],
  );

  return (
    <Box
      ref={ ref }
      component="form"
      onSubmit={ handleSubmit }
      sx={ {
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        maxWidth: 520,
        p: { xs: 4, md: 6 },
        backgroundColor: 'background.default',
        border: '1px solid',
        borderColor: 'text.primary',
        transform: isTilted ? 'rotate(-1.2deg) skewX(-1deg)' : 'none',
        transition: 'transform 240ms ease',
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
        },
        ...sx,
      } }
    >
      <Typography
        variant="h2"
        component="h2"
        sx={ { color: 'primary.main', lineHeight: 0.9 } }
      >
        REQUEST CONSIDERATION
      </Typography>

      <Typography variant="h5" sx={ { color: 'text.secondary' } }>
        SUBMISSION DOES NOT IMPLY ACCEPTANCE
      </Typography>

      <TextField
        type="email"
        label="EMAIL"
        value={ email }
        onChange={ (event) => setEmail(event.target.value) }
        required
        fullWidth
        disabled={ isSubmitting }
        inputProps={ { 'aria-label': 'Email address for consideration request' } }
      />

      <Button
        type="submit"
        fullWidth
        disabled={ isSubmitting }
        sx={ {
          py: 1.5,
          color: 'text.primary',
          backgroundColor: 'transparent',
          border: '1px solid',
          borderColor: 'secondary.main',
          transition: 'background-color 200ms ease, color 200ms ease',
          '&:hover': {
            backgroundColor: 'secondary.main',
            color: '#0A0A0A',
          },
          '&.Mui-disabled': {
            borderColor: 'text.secondary',
            color: 'text.secondary',
          },
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        } }
      >
        { isSubmitting ? 'SUBMITTING' : 'SUBMIT REQUEST' }
      </Button>

      { isSubmitted ? (
        <Stack
          spacing={ 1 }
          role="status"
          aria-live="polite"
          sx={ {
            animation: 'requestConsiderationReveal 320ms ease both',
            '@keyframes requestConsiderationReveal': {
              from: { opacity: 0, transform: 'translateY(6px)' },
              to: { opacity: 1, transform: 'translateY(0)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
          } }
        >
          <Typography variant="h4" sx={ { color: 'error.main' } }>
            REQUEST LOGGED
          </Typography>
          <Typography variant="h6" sx={ { color: 'text.primary' } }>
            ACCEPTANCE IS NOT GUARANTEED
          </Typography>
          <Typography variant="h6" sx={ { color: 'text.secondary' } }>
            THERE&apos;S NO GOING BACK
          </Typography>
        </Stack>
      ) : null }
    </Box>
  );
});

export { RequestConsideration };
