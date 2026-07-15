/**
 * lerpColor - 두 HEX 색상을 t(0~1)로 선형 보간
 *
 * 컬러 아크(옐로 → 그린)의 중간값을 계산할 때 사용한다.
 *
 * @param {string} a - 시작 HEX (예: '#F5E642') [Required]
 * @param {string} b - 종료 HEX (예: '#AAFF00') [Required]
 * @param {number} t - 보간 비율 0~1 (범위 밖은 clamp) [Required]
 * @returns {string} 보간된 'rgb(r, g, b)' 문자열
 *
 * Example usage:
 * const c = lerpColor('#F5E642', '#AAFF00', 0.5);
 */
export function lerpColor(a, b, t) {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const k = Math.min(1, Math.max(0, t));
  const r = Math.round(ca.r + (cb.r - ca.r) * k);
  const g = Math.round(ca.g + (cb.g - ca.g) * k);
  const bl = Math.round(ca.b + (cb.b - ca.b) * k);
  return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * hexToRgb - '#RRGGBB' | '#RGB' → { r, g, b }
 * @param {string} hex - HEX 색상 문자열 [Required]
 * @returns {{ r: number, g: number, b: number }}
 */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const full = clean.length === 3
    ? clean.split('').map((c) => c + c).join('')
    : clean;
  const int = parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}
