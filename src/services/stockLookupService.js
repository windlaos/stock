/**
 * 주식 데이터 동적 조회 서비스
 * - 한국 종목 (6자리 숫자 코드)
 * - 미국 종목 (영문 ticker)
 * 지원
 */

// ===== 전체 Mock 주식 데이터 (로컬 개발용) =====
const MOCK_STOCK_DATABASE = {
  // 미국 주식
  'AAPL': { name: 'Apple Inc.', current_price: 182.45, pe_ratio: 28.5, dividend_yield: 0.4 },
  'GOOGL': { name: 'Alphabet Inc.', current_price: 138.22, pe_ratio: 24.3, dividend_yield: 0 },
  'MSFT': { name: 'Microsoft Corporation', current_price: 424.05, pe_ratio: 32.1, dividend_yield: 0.7 },
  'TSLA': { name: 'Tesla Inc.', current_price: 245.30, pe_ratio: 65.2, dividend_yield: 0 },
  'AMZN': { name: 'Amazon.com Inc.', current_price: 178.50, pe_ratio: 52.1, dividend_yield: 0 },
  'NVDA': { name: 'NVIDIA Corporation', current_price: 128.90, pe_ratio: 48.5, dividend_yield: 0.1 },
  'META': { name: 'Meta Platforms Inc.', current_price: 342.12, pe_ratio: 35.8, dividend_yield: 0 },
  'NFLX': { name: 'Netflix Inc.', current_price: 245.67, pe_ratio: 42.3, dividend_yield: 0 },
  'MSTR': { name: 'MicroStrategy Inc.', current_price: 523.45, pe_ratio: 78.5, dividend_yield: 0 },
  'COIN': { name: 'Coinbase Global Inc.', current_price: 89.34, pe_ratio: 15.2, dividend_yield: 0 },

  // 한국 주식
  '005930': { name: '삼성전자', current_price: 70500, pe_ratio: 12.5, dividend_yield: 1.2 },
  '000660': { name: 'SK하이닉스', current_price: 180000, pe_ratio: 8.3, dividend_yield: 2.1 },
  '005380': { name: '현대자동차', current_price: 230000, pe_ratio: 4.5, dividend_yield: 4.8 },
  '051910': { name: 'LG화학', current_price: 650000, pe_ratio: 8.1, dividend_yield: 0.8 },
  '035420': { name: 'NAVER', current_price: 350000, pe_ratio: 18.2, dividend_yield: 0.3 },
  '035720': { name: '카카오', current_price: 52000, pe_ratio: 15.7, dividend_yield: 0.6 },
  '012330': { name: '현대모비스', current_price: 290000, pe_ratio: 6.2, dividend_yield: 3.5 },
  '066570': { name: 'LG전자', current_price: 85000, pe_ratio: 9.8, dividend_yield: 2.3 },
  '068270': { name: '셀트리온', current_price: 145000, pe_ratio: 22.1, dividend_yield: 0 },
  '009540': { name: '한글과컴퓨터', current_price: 11500, pe_ratio: 18.5, dividend_yield: 0.9 }
}

/**
 * 종목 코드 타입 판단
 * @param {string} ticker - 종목 코드
 * @returns {string} 'KR' | 'US'
 */
export function detectMarket(ticker) {
  if (!ticker) return null
  const cleaned = ticker.trim().toUpperCase()
  // 6자리 숫자 = 한국 종목코드
  if (/^\d{6}$/.test(cleaned)) return 'KR'
  // 영문 = 미국 ticker
  if (/^[A-Z]{1,5}$/.test(cleaned)) return 'US'
  return null
}

/**
 * Mock 데이터에서 미국 주식 조회 (실시간 API 대신 사용)
 */
function getMockUSStock(ticker) {
  const upperTicker = ticker.toUpperCase().trim()
  const data = MOCK_STOCK_DATABASE[upperTicker]

  if (data) {
    return {
      ticker: upperTicker,
      ...data,
      market: 'US',
      currency: 'USD',
      timestamp: new Date().toISOString(),
      source: 'mock'
    }
  }

  throw new Error(
    `미국 종목 "${upperTicker}"을(를) 찾을 수 없습니다.\n` +
    `지원하는 미국 주식: AAPL, GOOGL, MSFT, TSLA, AMZN, NVDA, META, NFLX, MSTR, COIN`
  )
}

/**
 * Mock 데이터에서 한국 주식 조회
 */
function getMockKRStock(ticker) {
  const cleanedTicker = ticker.trim()
  const data = MOCK_STOCK_DATABASE[cleanedTicker]

  if (data) {
    return {
      ticker: cleanedTicker,
      ...data,
      market: 'KR',
      currency: 'KRW',
      timestamp: new Date().toISOString(),
      source: 'mock'
    }
  }

  throw new Error(
    `한국 종목 "${cleanedTicker}"을(를) 찾을 수 없습니다.\n` +
    `지원하는 한국 주식: 005930, 000660, 005380, 051910, 035420, 035720, 012330, 066570, 068270, 009540`
  )
}

/**
 * 종목 데이터 동적 조회 (한국/미국 자동 판단)
 * @param {string} ticker - 종목 코드
 * @returns {Promise<Object>} 주식 데이터
 */
export async function fetchStockData(ticker) {
  if (!ticker) throw new Error('종목 코드를 입력해주세요')

  const market = detectMarket(ticker)

  if (!market) {
    throw new Error(
      '올바른 종목 코드를 입력하세요.\n' +
      '- 미국: 영문 대문자 (예: AAPL, TSLA)\n' +
      '- 한국: 6자리 숫자 (예: 005930)'
    )
  }

  try {
    if (market === 'US') {
      return getMockUSStock(ticker)
    } else {
      return getMockKRStock(ticker)
    }
  } catch (error) {
    console.error(`Stock lookup error for ${ticker}:`, error)
    throw error
  }
}

/**
 * Supabase에서 종목 정보 조회 (향후 구현)
 * 현재는 미사용, 나중에 캐싱 목적으로 활용
 */
export async function fetchFromSupabase(ticker, supabaseClient) {
  // 향후 구현
  return null
}
