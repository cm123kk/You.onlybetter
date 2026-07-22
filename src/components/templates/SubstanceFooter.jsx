import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import { SubstanceLogo } from '../../common/ui/SubstanceLogo.jsx';

/**
 * SubstanceFooter 컴포넌트
 *
 * 페이지 맨 끝. 검은 허공에 뜬 USB 드라이브 영상(멀리서 회전하며 다가와 줌인)이 뷰포트에 들어오면
 * **한 번만** 재생된다. 재생 중엔 영상만 보이고, **영상이 끝나면** 헤드라인 → 폼 → 푸터 순으로 차례로 등장.
 * SFX: 다가오는 동안 riser(빌드업), 줌인 정지 순간 impact boom.
 *
 * Props:
 * @param {string} videoSrc - 재생할 영상 경로 [Optional, 기본값: '/video/usb-drive.mp4']
 * @param {number} playbackRate - 재생 속도 배수 [Optional, 기본값: 1]
 * @param {function} onSubmit - 이메일 제출 콜백 (email) => void [Optional]
 * @param {object} sx - 루트 스타일 [Optional]
 *
 * Example usage:
 * <SubstanceFooter />
 */
function SubstanceFooter({
  videoSrc = '/video/usb-drive.mp4',
  playbackRate = 1,
  onSubmit,
  sx,
}) {
  const videoRef = useRef(null);
  const riserRef = useRef(null);
  const impactRef = useRef(null);
  const dingRef = useRef(null);
  const impactFiredRef = useRef(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [revealed, setRevealed] = useState(false); // 영상 완료 후 콘텐츠 순차 등장

  /** SFX 준비 — riser(접근), impact(정지), ding(언락 계시, 폼과 함께) */
  useEffect(() => {
    riserRef.current = new Audio('/audio/substance/footer-riser.mp3');
    riserRef.current.volume = 0.65;
    riserRef.current.preload = 'auto';
    impactRef.current = new Audio('/audio/substance/footer-impact.mp3');
    impactRef.current.volume = 0.85;
    dingRef.current = new Audio('/audio/substance/ding-long.wav');
    dingRef.current.volume = 0.6;
    // iOS 언락 — new Audio()는 사용자 제스처 안에서 1회 재생돼야 이후 프로그램 재생이 허용됨.
    //  첫 제스처에 muted play→pause로 언락(안 하면 impact/ding이 iOS에서 무음).
    const els = [riserRef.current, impactRef.current, dingRef.current];
    let unlocked = false;
    const evs = ['pointerdown', 'touchstart', 'keydown'];
    const removeUnlock = () => evs.forEach((e) => window.removeEventListener(e, unlock));
    function unlock() {
      if (unlocked) return;
      unlocked = true;
      els.forEach((a) => {
        if (!a) return;
        a.muted = true;
        const p = a.play();
        if (p && p.then) p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; });
        else a.muted = false;
      });
      removeUnlock();
    }
    evs.forEach((e) => window.addEventListener(e, unlock, { passive: true }));
    return () => {
      removeUnlock();
      els.forEach((a) => a && a.pause());
    };
  }, []);

  /** 뷰포트에 들어오면 딱 한 번 재생 (+riser 동시 시작, 클라이맥스가 영상 끝에 오도록 오프셋) */
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackRate;
    let played = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !played) {
          played = true;
          const p = v.play();
          if (p && p.catch) p.catch(() => { played = false; });
          // riser: 이미 뒷부분(빌드업+드롭)만 잘린 파일 → 처음부터 재생, 드롭이 영상 끝에 겹침
          const r = riserRef.current;
          if (r) {
            r.currentTime = 0;
            const rp = r.play();
            if (rp && rp.catch) rp.catch(() => {});
          }
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [playbackRate]);

  /** 줌인 정지 순간(영상 끝 직전)에 impact boom 1회 */
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current;
    if (!v || impactFiredRef.current) return;
    if (v.duration && v.currentTime >= v.duration - 0.45) {
      impactFiredRef.current = true;
      const i = impactRef.current;
      if (i) { i.currentTime = 0; const p = i.play(); if (p && p.catch) p.catch(() => {}); }
    }
  }, []);

  /** SUBMIT → 인젝션(수중 dispersion) 사운드 + 콜백 */
  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (email.trim() === '') return;
      const a = new Audio('/audio/substance/injection-disperse.mp3');
      a.volume = 0.7;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
      if (onSubmit) onSubmit(email);
      setSent(true);
    },
    [email, onSubmit],
  );

  /** 영상 완료 → 콘텐츠 순차 등장 + 폼 등장 타이밍에 맞춰 브랜드 딩(언락 계시) */
  const handleEnded = useCallback(() => {
    setRevealed(true);
    const d = dingRef.current;
    if (d) {
      window.setTimeout(() => {
        d.currentTime = 0;
        const p = d.play();
        if (p && p.catch) p.catch(() => {});
      }, 450); // 폼(revealSx 0.45s)과 함께 울림
    }
  }, []);

  /** 순차 등장 sx 헬퍼 — revealed일 때 delay를 두고 떠오름 */
  const revealSx = (delay) => ({
    opacity: revealed ? 1 : 0,
    transform: revealed ? 'translateY(0)' : 'translateY(24px)',
    transition: 'opacity 0.7s ease, transform 0.7s ease',
    transitionDelay: revealed ? `${delay}s` : '0s',
    pointerEvents: revealed ? 'auto' : 'none',
  });

  return (
    <Box
      component="footer"
      sx={{
        position: 'relative',
        width: '100%',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
        ...sx,
      }}
    >
      {/* USB 드라이브 영상 — aspect-ratio로 로드 전에도 높이 확보(IO 작동), 뷰 진입 시 1회 재생 */}
      <Box
        component="video"
        ref={videoRef}
        src={videoSrc}
        muted
        playsInline
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        sx={{ width: '100%', height: 'auto', aspectRatio: '1604 / 1292', display: 'block' }}
      />

      {/* 형광 그린 헤드라인 — 영상 하단 검은 여백 위로 크게 겹침(overlap). 영상 완료 후 첫 번째로 등장 */}
      <Typography
        component="h2"
        sx={{
          m: 0,
          position: 'relative',
          zIndex: 1,
          mt: { xs: '-10vw', md: '-19vw' }, // 모바일: 헤드라인 높이보다 크면 폼까지 영상 위로 끌려와 겹침 → 오버랩 축소
          width: '100%',
          textAlign: 'center',
          textTransform: 'uppercase',
          fontFamily: '"Bebas Neue", sans-serif',
          fontWeight: 400,
          lineHeight: 0.86,
          letterSpacing: '-0.01em',
          fontSize: 'clamp(2.4rem, 9vw, 7rem)',
          color: 'secondary.main',
          ...revealSx(0),
        }}
      >
        UNLOCK<br />YOUR POTENTIAL
      </Typography>

      {/* 이메일 인풋 + CTA — 두 번째로 등장 */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: '100%',
          maxWidth: 420,
          mt: { xs: 4, md: 5 },
          px: 3,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: 'stretch',
          gap: 1.5,
          ...revealSx(0.45),
        }}
      >
        <TextField
          type="email"
          placeholder="EMAIL"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          inputProps={{ 'aria-label': 'Email address' }}
          sx={{
            '& .MuiOutlinedInput-root': { backgroundColor: 'rgba(255,255,255,0.04)' },
            // 패딩·폰트 = GNB CTA와 동일
            '& .MuiOutlinedInput-input': {
              fontFamily: '"Bebas Neue", sans-serif',
              letterSpacing: '0.14em',
              fontSize: { xs: '0.85rem', md: '1rem' },
              px: { xs: 1.75, md: 2.5 },
              py: { xs: 0.75, md: 1 },
              lineHeight: 1,
            },
            '& .MuiOutlinedInput-input::placeholder': {
              fontFamily: '"Bebas Neue", sans-serif',
              letterSpacing: '0.14em',
              opacity: 0.6,
            },
          }}
        />
        <Button
          type="submit"
          sx={{
            flexShrink: 0,
            // 패딩·폰트 = GNB CTA와 동일
            px: { xs: 1.75, md: 2.5 },
            py: { xs: 0.75, md: 1 },
            whiteSpace: 'nowrap',
            color: '#0A0A0A',
            backgroundColor: 'secondary.main',
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: { xs: '0.85rem', md: '1rem' },
            letterSpacing: '0.14em',
            lineHeight: 1,
            '&:hover': { backgroundColor: '#B8F000' },
          }}
        >
          SUBMIT REQUEST
        </Button>
      </Box>

      {sent && (
        <Typography sx={{ mt: 2, fontSize: '0.72rem', letterSpacing: '0.18em', color: 'rgba(245,245,240,0.45)' }}>
          REQUEST LOGGED — ACCEPTANCE IS NOT GUARANTEED.
        </Typography>
      )}

      {/* FOOTER 베이스라인 — 세 번째로 등장. discreet(아주 흐리게), 면책조항은 hover 시 사라짐 */}
      <Box
        sx={{
          width: '100%',
          mt: { xs: 10, md: 16 },
          pt: 2,
          pb: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          textAlign: 'center',
          px: 3,
          ...revealSx(0.9),
        }}
      >
        <SubstanceLogo size={16} color="secondary.main" hasSplitOnHover={false} sx={{ opacity: 0.3 }} />
        <Typography
          sx={{
            fontFamily: '"Bebas Neue", sans-serif',
            letterSpacing: '0.24em',
            fontSize: '0.62rem',
            color: 'rgba(245,245,240,0.28)',
          }}
        >
          YOU ARE ONE. RESPECT THE BALANCE.
        </Typography>
        <Typography
          tabIndex={0}
          sx={{
            maxWidth: 560,
            fontSize: '0.56rem',
            lineHeight: 1.5,
            letterSpacing: '0.03em',
            color: 'rgba(245,245,240,0.14)',
            transition: 'opacity 0.5s ease',
            cursor: 'default',
            '&:hover': { opacity: 0 },
            '&:focus-visible': { color: 'rgba(245,245,240,0.6)', outline: 'none' },
          }}
        >
          Submission does not imply acceptance. The matrix and the other self are one. There is no going back.
        </Typography>
        <Typography sx={{ fontSize: '0.5rem', letterSpacing: '0.2em', color: 'rgba(245,245,240,0.16)' }}>
          © THE SUBSTANCE
        </Typography>
      </Box>
    </Box>
  );
}

export { SubstanceFooter };
