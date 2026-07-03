/**
 * Stock Analysis Service
 * 로컬 개발: Vite 프록시를 통해 /api로 요청 → localhost:3001으로 자동 포워딩
 * 프로덕션: Vercel 함수로 직접 요청
 */

const API_BASE = process.env.NODE_ENV === 'development' ? '' : 'http://localhost:3001'

export async function analyzeStock(ticker) {
  if (!ticker || ticker.trim() === '') {
    throw new Error('종목 코드를 입력해주세요')
  }

  try {
    const url = `${API_BASE}/api/analyze`

    console.log('[📡 API 요청]')
    console.log('  URL:', url)
    console.log('  종목:', ticker)
    console.log('  환경:', process.env.NODE_ENV)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ticker: ticker.toUpperCase() }),
    })

    console.log('[📊 응답 상태]')
    console.log('  상태 코드:', response.status)
    console.log('  상태 텍스트:', response.statusText)

    if (!response.ok) {
      let errorData = {}
      try {
        errorData = await response.json()
      } catch (e) {
        // JSON 파싱 실패 시 응답 텍스트 사용
        console.error('응답 파싱 실패:', e)
      }

      const errorMessage = errorData.message || `분석 요청 실패: HTTP ${response.status}`
      console.error('[❌ API 에러]', errorMessage)
      throw new Error(errorMessage)
    }

    const data = await response.json()

    console.log('[✅ 분석 완료]')
    console.log('  종목:', data.ticker)
    console.log('  추천:', data.recommendation)
    console.log('  데이터:', data)

    // 전체 응답 필드 반환
    return {
      ticker: data.ticker,
      name: data.name,
      market: data.market,
      currency: data.currency,
      current_price: data.current_price,
      pe_ratio: data.pe_ratio,
      dividend_yield: data.dividend_yield,
      recommendation: data.recommendation,
      confidence: data.confidence,
      technical_analysis: data.technical_analysis,
      fundamentals: data.fundamentals,
      risks: data.risks,
      strategy: data.strategy,
      analyzed_at: data.analyzed_at,
      data_source: data.data_source,
    }
  } catch (error) {
    console.error('[🔴 최종 에러]', error.message)
    console.error('  스택:', error.stack)
    throw error
  }
}
