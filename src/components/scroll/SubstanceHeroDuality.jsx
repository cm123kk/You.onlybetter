import { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const clamp01 = (v) => Math.min(1, Math.max(0, v));

/** 터치/모바일(coarse pointer) 감지 — iOS는 paused video의 seek 프레임을 렌더하지 않아 스크럽이 검정으로 깨짐.
 *  이 경우 스크럽 대신 muted 루프 자동재생으로 폴백(재생 중 프레임은 iOS도 정상 렌더). */
const isCoarsePointer = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(pointer: coarse)').matches;

/**
 * SubstanceHeroDuality 컴포넌트
 *
 * The Substance 랜딩의 첫 서사 섹션(HERO). 인트로 종료(검정) 직후 같은 배경에서 이어지며,
 * 젊은 여자↔늙은 여자가 스크롤에 따라 수직축으로 회전(i2v 회전영상 스크럽)해 이중 자아(Elizabeth/Sue)를
 * 드러낸다. 두 인물이 붙은 seam엔 형광 그린 gooey 막이 번들거린다. 헤드라인 "YOU. ONLY BETTER."와
 * 서브카피가 순차 리빌되고, 꼬리 구간에서 인물이 점액으로 녹아 다음 섹션(블루) 리퀴드 와이프에 물린다.
 *
 * 동작(progress 파생, 별도 상태/타이머 없음):
 * 1. 0~0.08 인물 정면(젊음) 페이드인
 * 2. 0.08~ 헤드라인 stamp + 임상 과잉조명 플래시 1회
 * 3. 0.20~0.70 회전 스크럽(젊음→늙음) + 서브카피 3라인 순차
 * 4. 0.70~1.0 인물/seam 점액 용해(다음 섹션 전환은 부모가 리퀴드 와이프로 처리)
 *
 * ※ 실사 회전영상(rotationVideoSrc) 미제공 시 placeholder 미디어로 레이아웃/카피/전환을 검증한다(뼈대).
 *
 * Props:
 * @param {number} progress - HERO 구간 진행도 0~1 (스크롤 파생) [Optional, 기본값: 0]
 * @param {string[]} frames - 0°(젊음)→180°(늙음) 회전 프레임 시퀀스 URL 배열. rotLocal로 인접 프레임 crossfade 스크럽 [Optional, 기본값: /hero/hero-f00~f12.jpg]
 * @param {string} rotationVideoSrc - (대체) 회전 실사 영상 URL. frames 미제공 시에만 사용 [Optional]
 * @param {string} poster - 회전영상 포스터(첫 프레임) URL [Optional]
 * @param {string} headline - 헤드라인(ALL CAPS) [Optional, 기본값: 'YOU. ONLY BETTER.']
 * @param {string[]} sublines - 순차 리빌 서브카피 라인 [Optional, 기본값: DEFAULT_SUBLINES]
 * @param {number} rotationStart - 회전 스크럽 시작 progress [Optional, 기본값: 0.2]
 * @param {number} rotationEnd - 회전 스크럽 종료 progress [Optional, 기본값: 0.7]
 * @param {object} sx - 루트 추가 스타일 [Optional]
 *
 * Example usage:
 * <SubstanceHeroDuality progress={ heroP } rotationVideoSrc="/video/hero-duality.mp4" />
 */
function SubstanceHeroDuality({
  progress = 0,
  rotationVideoSrc = '/hero/hero-rotation-full.mp4',
  poster = '/hero/hero-rotation-full-poster.jpg',
  headline = 'YOU. ONLY BETTER.',
  rotationStart = 0.2,
  rotationEnd = 0.7,
  sx,
  ...props
}) {
  const p = clamp01(progress);
  const videoRef = useRef(null);
  const [coarse] = useState(isCoarsePointer);

  // 진행도 → 각 요소 매핑
  const figureIn = clamp01(p / 0.08); // 인물 페이드인
  const headlineOp = clamp01((p - 0.08) / 0.06); // 헤드라인 stamp
  const rotLocal = clamp01((p - rotationStart) / (rotationEnd - rotationStart)); // 회전 스크럽 0~1
  const meltOut = clamp01((p - 0.7) / 0.3); // 꼬리(그레인만 살짝 정리, 히어로 콘텐츠는 유지)
  const [headlineHead, ...headlineRestArr] = headline.split(' ');
  const headlineRest = headlineRestArr.join(' ');

  // 회전영상 스크럽 — rotLocal → currentTime (재생 아님, 스크롤로 프레임 훑기).
  // 전체 시퀀스가 이미 젊은여자 정면(t=0)에서 시작하므로 정방향 매핑:
  // 0=젊은여자정면 → 야누스 → 늙은여자정면 → 남자야누스 → 1=젊은남자정면.
  //
  // ※ 스크롤마다 currentTime을 바로 쓰면 시크 요청이 백로그로 쌓여 끊김(지지직) → rAF 단일 루프에서
  //   '최신 목표'만 반영하고, 아직 시크 중(v.seeking)이면 건너뛰어 한 번에 하나씩만 시크(코얼레싱).
  const targetRef = useRef(0);
  useEffect(() => { targetRef.current = rotLocal; }, [rotLocal]);
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return undefined;
    // 모바일(coarse): 스크럽 대신 muted 루프 재생 — iOS seek 렌더 실패(검정/프리즈) 회피
    if (coarse) {
      const play = () => { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); };
      if (v.readyState >= 2) play(); else v.addEventListener('loadeddata', play, { once: true });
      return undefined;
    }
    // 데스크탑: rAF 단일 루프로 스크럽(시크 코얼레싱)
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const d = v.duration;
      if (!d || Number.isNaN(d)) return;
      if (v.seeking) return; // 이전 시크 완료 전엔 새 시크 안 넣음
      const target = targetRef.current * d;
      if (Math.abs(v.currentTime - target) < 0.02) return; // 목표 도달 시 유휴
      v.currentTime = target;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [coarse]);

  return (
    <Box
      sx={ {
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '100dvh',
        overflow: 'hidden',
        backgroundColor: '#0A0A0A', // 인트로 끝과 동일 검정 → 이음새 없음
        ...sx,
      } }
      { ...props }
    >
      {/* 회전 영상 — 크게, 상단~중앙(하단은 헤더 텍스트 공간 확보). (로고는 App 레벨 고정으로 이동) */}
      <Box
        sx={ {
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          bottom: { xs: '3vh', md: '2vh' }, // 이미지 크게(하단까지). 헤더와 겹치는 부분은 아래 스크림이 어둡게 처리
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: figureIn,
          transition: 'opacity 0.3s linear',
        } }
      >
        {/* 래퍼: 영상과 동일 비율(레터박스 없음) → 마스크가 실제 인물 가장자리에 정확히. 위·아래·좌우 어둠으로 페이드 */}
        <Box
          sx={ {
            position: 'relative',
            height: '100%',
            aspectRatio: '1340 / 1080',
            maxWidth: '100%',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, #000 13%, #000 86%, transparent 100%), linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)',
            WebkitMaskComposite: 'source-in',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, #000 13%, #000 86%, transparent 100%), linear-gradient(to right, transparent 0%, #000 8%, #000 92%, transparent 100%)',
            maskComposite: 'intersect',
          } }
        >
          <Box
            component="video"
            ref={ videoRef }
            src={ rotationVideoSrc }
            poster={ poster }
            muted
            playsInline
            preload="auto"
            { ...(coarse ? { autoPlay: true, loop: true } : {}) }
            sx={ {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
              // 스크럽 영상엔 CSS filter를 걸지 않음(시크마다 필터 재페인트 → 버벅임). 색보정은 인코딩에 baking.
              transform: 'translateZ(0)', // 자체 GPU 레이어로 승격(마스크/합성 캐시)
              willChange: 'transform',
              backfaceVisibility: 'hidden',
            } }
          />
        </Box>
      </Box>

      {/* 필름 그레인 + 비네트 */}
      <Box
        aria-hidden="true"
        sx={ {
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          background: 'radial-gradient(120% 100% at 50% 40%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.5) 100%)',
          opacity: 1 - meltOut * 0.4,
        } }
      />

      {/* 하단 스크림 — 헤더 텍스트를 어둠에 앉혀 네온이 인물 위에서 뜨지 않게(screen 블렌드 깨끗) */}
      <Box
        aria-hidden="true"
        sx={ {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '46%',
          zIndex: 3,
          pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(10,10,10,0) 0%, rgba(10,10,10,0.7) 38%, #0A0A0A 62%)',
        } }
      />

      {/* 헤더 텍스트 — 하단 풀폭 대형(HTML, vw 기반 풀블리드). SVG textLength는 iOS에서 자간 오작동(겹침/짤림) → HTML로.
          전체 그린, 'ONLY BETTER.'만 베이직 그린 글로우(CSS text-shadow, em 단위라 폰트 크기 따라 스케일). */}
      <Box
        aria-label={ headline }
        sx={ {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: { xs: '1.2vh', md: 0 },
          zIndex: 4,
          px: { xs: 0.5, md: 1 },
          pointerEvents: 'none',
          opacity: headlineOp,
          textAlign: 'center',
          whiteSpace: 'nowrap',
          lineHeight: 0.82,
          color: '#AAFF00',
          fontFamily: '"Bebas Neue", sans-serif',
          fontWeight: 400,
          fontSize: '15.2vw', // 한 줄 풀블리드(모든 폭 비례) — 클립 방지 위해 살짝 보수적
          letterSpacing: '-0.005em',
        } }
      >
        <Box component="span">{ headlineHead }&nbsp;</Box>
        <Box
          component="span"
          sx={ { textShadow: '0 0 0.06em rgba(170,255,0,0.95), 0 0 0.18em rgba(170,255,0,0.55), 0 0 0.4em rgba(170,255,0,0.35)' } }
        >
          { headlineRest }
        </Box>
      </Box>
    </Box>
  );
}

export { SubstanceHeroDuality };
