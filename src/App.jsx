import { useState } from 'react'
import StockRecommendation from './pages/StockRecommendation'
import DebugPanel from './components/DebugPanel'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>📈 AI 주식 추천 시스템</h1>
        <p className="subtitle">Claude AI와 함께하는 스마트 투자 분석</p>
      </header>
      <main className="app-main">
        <StockRecommendation />
      </main>
      {/* 개발자 디버그 패널 (개발 환경에서만 표시) */}
      {process.env.NODE_ENV === 'development' && <DebugPanel />}
    </div>
  )
}

export default App
