import './AnalysisResult.css'

export default function AnalysisResult({ data }) {
  const formatRecommendation = (rec) => {
    if (rec === 'BUY') return '매수'
    if (rec === 'SELL') return '매도'
    return '관망'
  }

  const getRecommendationColor = (rec) => {
    if (rec === 'BUY') return 'buy'
    if (rec === 'SELL') return 'sell'
    return 'hold'
  }

  const getMarketLabel = (market) => {
    return market === 'US' ? '미국 주식' : '한국 주식'
  }

  const getCurrencySymbol = (currency) => {
    return currency === 'USD' ? '$' : '₩'
  }

  const formatPrice = (price, currency) => {
    if (currency === 'USD') {
      return price.toFixed(2)
    }
    return price.toLocaleString('ko-KR')
  }

  return (
    <div className="analysis-result">
      <div className="result-header">
        <div className="header-top">
          <h2>{data.ticker} ({data.name})</h2>
          <span className="market-badge">{getMarketLabel(data.market)}</span>
        </div>
        <p className="analysis-time">
          분석 시간: {new Date(data.analyzed_at).toLocaleString('ko-KR')}
        </p>
      </div>

      <div className="stock-info-card">
        <div className="info-row">
          <span className="label">📊 현재 가격</span>
          <span className="value">
            {getCurrencySymbol(data.currency)}{formatPrice(data.current_price, data.currency)}
          </span>
        </div>
        {data.fifty_two_week_high && (
          <div className="info-row">
            <span className="label">52주 최고</span>
            <span className="value">
              {getCurrencySymbol(data.currency)}{formatPrice(data.fifty_two_week_high, data.currency)}
            </span>
          </div>
        )}
        {data.fifty_two_week_low && (
          <div className="info-row">
            <span className="label">52주 최저</span>
            <span className="value">
              {getCurrencySymbol(data.currency)}{formatPrice(data.fifty_two_week_low, data.currency)}
            </span>
          </div>
        )}
        {data.pe_ratio && (
          <div className="info-row">
            <span className="label">PER</span>
            <span className="value">{data.pe_ratio.toFixed(2)}</span>
          </div>
        )}
        {data.dividend_yield && (
          <div className="info-row">
            <span className="label">배당수익률</span>
            <span className="value">{data.dividend_yield}%</span>
          </div>
        )}
        {data.market_cap && (
          <div className="info-row">
            <span className="label">시가총액</span>
            <span className="value">{(data.market_cap / 1e9).toFixed(1)}B</span>
          </div>
        )}
        {data.data_source && (
          <div className="info-row">
            <span className="label">🔄 데이터 소스</span>
            <span className="value">{data.data_source}</span>
          </div>
        )}
        {data.ai_model && (
          <div className="info-row">
            <span className="label">🤖 AI 모델</span>
            <span className="value">{data.ai_model}</span>
          </div>
        )}
      </div>

      <div className="recommendation-card">
        <div className={`recommendation-badge ${getRecommendationColor(data.recommendation)}`}>
          {formatRecommendation(data.recommendation)}
        </div>
        <p className="confidence">신뢰도: {data.confidence}%</p>
      </div>

      <div className="analysis-content">
        <div className="section">
          <h3>📊 기술적 분석</h3>
          <p>{data.technical_analysis}</p>
        </div>

        <div className="section">
          <h3>📈 펀더멘탈</h3>
          <p>{data.fundamentals}</p>
        </div>

        <div className="section">
          <h3>⚠️ 위험 요소</h3>
          <p>{data.risks}</p>
        </div>

        <div className="section">
          <h3>🎯 투자 전략</h3>
          <p>{data.strategy}</p>
        </div>
      </div>

      <div className="disclaimer">
        <p>⚠️ 이 분석은 교육 목적으로만 제공되며, 실제 투자 결정의 기초로 사용할 수 없습니다.</p>
        <p>※ 한국 주식의 경우 현재 샘플 데이터입니다. 실제 API 통합이 필요합니다.</p>
      </div>
    </div>
  )
}
