import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import logo from '../../../assets/reference/logo.jpg';

/**
 * DocCover 컴포넌트
 *
 * The Substance 기획 문서 스토리의 캔버스 커버.
 * 검은 배경(#0A0A0A) 위 ◗◗ 로고 + 문서 타이틀을 표시하고,
 * 전체 마크다운 본문은 Storybook Docs 탭에서 렌더된다.
 *
 * Props:
 * @param {string} title - 문서 타이틀 (ALL CAPS 권장) [Required]
 *
 * Example usage:
 * <DocCover title="01 — PROJECT SUMMARY" />
 */
export function DocCover({ title }) {
  return (
    <Box
      sx={ {
        minHeight: '60vh',
        width: '100%',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        py: 8,
      } }
    >
      <Box component="img" src={ logo } alt="◗◗" sx={ { width: 96, height: 'auto' } } />
      <Typography
        sx={ {
          color: '#F5F5F0',
          fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          textTransform: 'uppercase',
          textAlign: 'center',
          px: 2,
        } }
      >
        { title }
      </Typography>
      <Typography sx={ { color: 'rgba(245,245,240,0.4)', fontSize: '0.75rem', letterSpacing: '0.2em' } }>
        FULL DOCUMENT → DOCS TAB
      </Typography>
    </Box>
  );
}
