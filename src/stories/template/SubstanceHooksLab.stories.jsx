import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';

import {
  useScrollProgress,
  useColorArc,
  useSubstanceAudio,
  useCinematicCue,
} from '../../utils/substance';

/**
 * Substance Hooks Lab
 *
 * Phase 1 감각 상태 머신 훅(useScrollProgress / useColorArc / useSubstanceAudio /
 * useCinematicCue)을 한 화면에서 검증하는 개발용 하네스다. 실제 랜딩 UI가 아니라,
 * 스크롤→컬러 아크(히스테리시스)·사운드 5레이어·과잉 조명 플래시를 직접 체감하기 위한 랩.
 *
 * 사용법:
 * 1. 스크롤을 내려 컬러가 옐로→그린으로 물드는지, 위로 올릴 때 즉시 복귀하지 않는지(히스테리시스) 확인.
 * 2. SOUND 토글 ON(사용자 제스처) → 드론/버블 시작. 각 버튼으로 딩/스트레치/분열/주사음 트리거.
 * 3. PHASE 03 영역에 hover → 앰비언트 침묵 + 형광등 허밍.
 * 4. FLASH 버튼 → 과잉 조명(최대 4회, 예산 소진 후 무시).
 */
function HooksLab() {
  const introRef = useRef(null);

  // 인트로 섹션(500vh)을 통과하는 진행도 — 단일 소스
  const { progress, activeStep, progressRef } = useScrollProgress(introRef, { steps: 11 });
  const { color, arcValue } = useColorArc(progressRef);
  const audio = useSubstanceAudio(progressRef);
  const { isFlashing, flash, remainingFlashes } = useCinematicCue();

  // [진단] 레이어별 on/off — "빠른 소리" 범인 격리용
  const [droneOn, setDroneOn] = useState(true);
  const [pulseOn, setPulseOn] = useState(true);
  const [bubbleOn, setBubbleOn] = useState(true);
  const toggleLayer = (layer) => {
    if (layer === 'drone') { const v = !droneOn; setDroneOn(v); audio.setDroneEnabled(v); }
    if (layer === 'pulse') { const v = !pulseOn; setPulseOn(v); audio.setPulseEnabled(v); }
    if (layer === 'bubble') { const v = !bubbleOn; setBubbleOn(v); audio.setBubbleEnabled(v); }
  };

  const stat = (label, value) => (
    <Stack direction="row" justifyContent="space-between" sx={ { gap: 3 } }>
      <Typography variant="caption" sx={ { color: 'text.secondary' } }>{ label }</Typography>
      <Typography variant="caption" sx={ { color: 'secondary.main' } }>{ value }</Typography>
    </Stack>
  );

  return (
    <Box ref={ introRef } sx={ { position: 'relative', minHeight: '500vh', bgcolor: 'background.default' } }>
      {/* 컬러 아크 배경 (fixed) */}
      <Box
        sx={ {
          position: 'fixed',
          inset: 0,
          backgroundColor: color,
          opacity: 0.28,
          transition: 'background-color 60ms linear',
          pointerEvents: 'none',
          zIndex: 0,
        } }
      />

      {/* 과잉 조명 플래시 오버레이 */}
      <Box
        sx={ {
          position: 'fixed',
          inset: 0,
          backgroundColor: '#F5F5F0',
          opacity: isFlashing ? 0.9 : 0,
          transition: 'opacity 120ms ease-out',
          pointerEvents: 'none',
          zIndex: 5,
        } }
      />

      {/* HUD (fixed 좌상단) */}
      <Box
        sx={ {
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 10,
          p: 2,
          minWidth: 240,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(10,10,10,0.7)',
          backdropFilter: 'blur(4px)',
        } }
      >
        <Typography variant="h6" sx={ { mb: 1 } }>Substance Lab</Typography>
        { stat('scrollProgress', progress.toFixed(3)) }
        { stat('arcValue (hys.)', arcValue.toFixed(3)) }
        { stat('activeStep', `${activeStep} / 10`) }
        { stat('audio', audio.isEnabled ? (audio.isReady ? 'READY' : 'INIT…') : 'OFF') }
        { stat('flashes left', remainingFlashes) }
      </Box>

      {/* 컨트롤 (fixed 우하단) */}
      <Box
        sx={ {
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 10,
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'rgba(10,10,10,0.7)',
          backdropFilter: 'blur(4px)',
        } }
      >
        <Stack spacing={ 1 }>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="caption">SOUND</Typography>
            <Switch checked={ audio.isEnabled } onChange={ audio.toggle } color="secondary" />
          </Stack>

          {/* [진단] 레이어 격리 — 어느 걸 끄면 "빠른 소리"가 멈추는지 */}
          <Typography variant="caption" sx={ { color: 'error.main', mt: 1 } }>레이어 격리(진단)</Typography>
          <Button variant={ droneOn ? 'contained' : 'outlined' } color="error" onClick={ () => toggleLayer('drone') }>
            드론 { droneOn ? 'ON' : 'OFF' }
          </Button>
          <Button variant={ pulseOn ? 'contained' : 'outlined' } color="error" onClick={ () => toggleLayer('pulse') }>
            펄스 { pulseOn ? 'ON' : 'OFF' }
          </Button>
          <Button variant={ bubbleOn ? 'contained' : 'outlined' } color="error" onClick={ () => toggleLayer('bubble') }>
            버블 { bubbleOn ? 'ON' : 'OFF' }
          </Button>

          <Button variant="outlined" color="secondary" onClick={ () => audio.triggerDing({}) }>Ding</Button>
          <Button variant="outlined" color="secondary" onClick={ () => audio.triggerDing({ pitchDown: true }) }>Ding ↓ (pitch)</Button>
          <Button variant="outlined" color="secondary" onClick={ audio.triggerStretch }>Stretch (L2)</Button>
          <Button variant="outlined" color="secondary" onClick={ audio.triggerSplit }>Split (L3)</Button>
          <Button variant="outlined" color="secondary" onClick={ audio.triggerInjection }>Injection</Button>
          <Button variant="outlined" color="secondary" onClick={ audio.triggerCharge }>CTA Charge</Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={ () => flash() }
          >
            Overbright Flash
          </Button>
        </Stack>
      </Box>

      {/* 스크롤 가이드 콘텐츠 */}
      <Stack sx={ { position: 'relative', zIndex: 1 } }>
        <Box sx={ { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
          <Typography variant="h2" sx={ { color: 'text.primary' } }>Scroll to activate ▽</Typography>
        </Box>

        {/* PHASE 03 침묵 hover 존 */}
        <Box
          onMouseEnter={ () => audio.setPhaseSilence(true) }
          onMouseLeave={ () => audio.setPhaseSilence(false) }
          sx={ {
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed',
            borderColor: 'error.main',
            mx: 8,
          } }
        >
          <Typography variant="h3" sx={ { color: 'error.main' } }>
            PHASE 03 — hover = silence
          </Typography>
        </Box>

        <Box sx={ { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
          <Typography variant="h2" sx={ { color: 'text.primary' } }>Green zone (pulse base)</Typography>
        </Box>
        <Box sx={ { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
          <Typography variant="h1" sx={ { color: 'secondary.main' } }>You. Are. One.</Typography>
        </Box>
        <Box sx={ { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
          <Typography variant="h4" sx={ { color: 'text.secondary' } }>Scroll back up — note the hysteresis</Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export default {
  title: 'Template/Substance Hooks Lab',
  component: HooksLab,
  parameters: {
    layout: 'fullscreen',
  },
};

export const Lab = {
  render: () => <HooksLab />,
};
