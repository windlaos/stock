import { useState } from 'react'
import StockInput from '../components/StockInput'
import AnalysisResult from '../components/AnalysisResult'
import { analyzeStock } from '../services/stockService'
import './StockRecommendation.css'

export default function StockRecommendation() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async (ticker) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await analyzeStock(ticker)
      setResult(data)
    } catch (err) {
      setError(err.message || '분석 중 오류가 발생했습니다.')
      console.error('Analysis error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="stock-recommendation">
      <div className="input-section">
        <StockInput onAnalyze={handleAnalyze} disabled={loading} />
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>AI가 분석 중입니다...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <h3>⚠️ 오류 발생</h3>
          <p>{error}</p>
        </div>
      )}

      {result && <AnalysisResult data={result} />}
    </div>
  )
}
