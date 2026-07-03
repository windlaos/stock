// Mock 데이터 (프로토타입 및 테스트용)
// 실제 프로덕션에서는 Supabase에서 조회

export const MOCK_STOCK_DATA = {
  AAPL: {
    name: 'Apple Inc.',
    current_price: 182.45,
    pe_ratio: 28.5,
    dividend_yield: 0.4,
    market_cap: '2.8T',
    sector: 'Technology',
  },
  GOOGL: {
    name: 'Alphabet Inc.',
    current_price: 138.22,
    pe_ratio: 24.3,
    dividend_yield: 0,
    market_cap: '1.8T',
    sector: 'Technology',
  },
  MSFT: {
    name: 'Microsoft Corporation',
    current_price: 424.05,
    pe_ratio: 32.1,
    dividend_yield: 0.7,
    market_cap: '3.1T',
    sector: 'Technology',
  },
};

export const MOCK_ANALYSIS = {
  AAPL: {
    recommendation: 'BUY',
    confidence: 78,
    technical_analysis: '상승 추세 확인, 이동평균선 위에 형성',
    fundamentals: '강력한 실적, 높은 현금 흐름',
    risks: '경제 침체 가능성, 규제 리스크',
    strategy: '장기 보유 추천, 저가 매수 고려',
  },
};
