import { useState } from 'react'
import './StockInput.css'

export default function StockInput({ onAnalyze, disabled }) {
  const [ticker, setTicker] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (ticker.trim()) {
      onAnalyze(ticker.toUpperCase().trim())
      setTicker('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stock-input">
      <div className="input-group">
        <label htmlFor="ticker-input">종목 코드 입력</label>
        <div className="input-wrapper">
          <input
            id="ticker-input"
            type="text"
            placeholder="예) AAPL, GOOGL, MSFT"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            disabled={disabled}
            maxLength="10"
          />
          <button type="submit" disabled={disabled || !ticker.trim()}>
            분석하기
          </button>
        </div>
        <p className="help-text">
          🌍 미국 주식 (예: AAPL, TSLA, MSFT) 또는 🇰🇷 한국 주식 (예: 005930, 035720)의 종목 코드를 입력하세요
        </p>
      </div>
    </form>
  )
}
