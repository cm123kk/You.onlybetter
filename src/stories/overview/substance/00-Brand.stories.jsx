import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import logo from '../../../assets/reference/logo.jpg';

/**
 * The Substance — Brand / Landing Entry
 *
 * 이 프로젝트의 유일한 아이덴티티는 ◗◗ 심볼(로고)이다.
 * 제품명("THE SUBSTANCE")이나 브랜드네임을 큰 글씨로 노출하지 않는다.
 * 랜딩 최초 진입 화면은 검은 배경(#0A0A0A) 위 이 로고 하나 —
 * 모든 스크롤 서사가 여기서 시작한다.
 */
export default {
  title: 'Overview/The Substance/00. Brand',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          '## ◗◗ — The Only Identity',
          '',
          '브랜드네임도, 제품명도, 워드마크도 없다. **심볼이 곧 브랜드**다.',
          '두 개의 마주보는 반원 — 분열 / 창조 / 이중 자아.',
          '',
          '- **로고 전용 브랜딩**: "THE SUBSTANCE" 텍스트를 크게 노출하지 않는다.',
          '- **랜딩 시작점**: 최초 진입 시 검은 화면(#0A0A0A) 위 이 로고가 딱 보이고, 스크롤 서사가 여기서 출발한다.',
          '- **에셋 경로**: `src/assets/reference/logo.jpg`',
        ].join('\n'),
      },
    },
  },
};

/** 랜딩 최초 진입 화면 — 검은 배경 위 로고 하나 */
export const LandingEntry = {
  name: 'Landing Entry (◗◗)',
  render: () => (
    <Box
      sx={ {
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      } }
    >
      <Box
        component="img"
        src={ logo }
        alt="◗◗"
        sx={ {
          width: 'clamp(160px, 28vw, 320px)',
          height: 'auto',
          userSelect: 'none',
        } }
      />
      <Typography
        sx={ {
          color: 'rgba(245, 245, 240, 0.35)',
          fontSize: '0.7rem',
          letterSpacing: '0.35em',
          textTransform: 'uppercase',
        } }
      >
        Scroll
      </Typography>
    </Box>
  ),
};
