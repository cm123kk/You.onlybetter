import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 새로고침 시 브라우저가 이전 스크롤 위치로 복원하는 것 방지 → 매번 최상단(로고 첫 순간)에서 시작.
if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
