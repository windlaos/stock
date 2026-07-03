/**
 * 주가 데이터 조회 서비스 (Mock 데이터)
 * 한국 주식 + 미국 주식 지원
 */

/**
 * 한국 주식 Mock 데이터
 */
function fetchKoreanStockMock(krCode) {
  const KR_STOCK_DATA = {
    '005930': {
      name: '삼성전자',
      current_price: 74500,
      pe_ratio: 11.2,
      dividend_yield: 2.1,
      fifty_two_week_high: 92000,
      fifty_two_week_low: 61000
    },
    '000660': {
      name: 'SK하이닉스',
      current_price: 185000,
      pe_ratio: 7.8,
      dividend_yield: 1.8,
      fifty_two_week_high: 210000,
      fifty_two_week_low: 145000
    },
    '005380': {
      name: '현대자동차',
      current_price: 215000,
      pe_ratio: 3.5,
      dividend_yield: 5.2,
      fifty_two_week_high: 260000,
      fifty_two_week_low: 180000
    },
    '051910': {
      name: 'LG화학',
      current_price: 682000,
      pe_ratio: 9.1,
      dividend_yield: 0.9,
      fifty_two_week_high: 820000,
      fifty_two_week_low: 560000
    },
    '035420': {
      name: 'NAVER',
      current_price: 385000,
      pe_ratio: 16.5,
      dividend_yield: 0.2,
      fifty_two_week_high: 480000,
      fifty_two_week_low: 280000
    },
    '035720': {
      name: '카카오',
      current_price: 58000,
      pe_ratio: 14.2,
      dividend_yield: 0.5,
      fifty_two_week_high: 85000,
      fifty_two_week_low: 42000
    }
  }

  const data = KR_STOCK_DATA[krCode]
  if (!data) {
    throw new Error(`지원하지 않는 한국 주식: ${krCode}`)
  }

  console.log(`  ✅ 한국 주식 Mock: ${data.name} - ₩${data.current_price.toLocaleString()}`)

  return {
    ticker: krCode,
    fullTicker: `${krCode}.KS`,
    name: data.name,
    market: 'KR',
    currency: 'KRW',
    current_price: data.current_price,
    pe_ratio: data.pe_ratio,
    dividend_yield: data.dividend_yield,
    market_cap: null,
    fifty_two_week_high: data.fifty_two_week_high,
    fifty_two_week_low: data.fifty_two_week_low,
    timestamp: new Date().toISOString(),
    source: 'Mock Data'
  }
}

/**
 * 미국 주식 Mock 데이터
 */
function fetchUSStockMock(ticker) {
  const US_STOCK_DATA = {
    'AAPL': { name: 'Apple Inc.', current_price: 228.36, pe_ratio: 35.2, dividend_yield: 0.42, fifty_two_week_high: 254.33, fifty_two_week_low: 168.50 },
    'TSLA': { name: 'Tesla Inc.', current_price: 393.45, pe_ratio: 68.5, dividend_yield: 0.0, fifty_two_week_high: 414.50, fifty_two_week_low: 238.10 },
    'MSFT': { name: 'Microsoft Corporation', current_price: 445.78, pe_ratio: 38.1, dividend_yield: 0.73, fifty_two_week_high: 468.25, fifty_two_week_low: 309.48 },
    'GOOGL': { name: 'Alphabet Inc.', current_price: 195.68, pe_ratio: 25.3, dividend_yield: 0.0, fifty_two_week_high: 207.53, fifty_two_week_low: 142.62 },
    'AMZN': { name: 'Amazon.com Inc.', current_price: 208.45, pe_ratio: 58.2, dividend_yield: 0.0, fifty_two_week_high: 220.85, fifty_two_week_low: 140.45 },
    'NVDA': { name: 'NVIDIA Corporation', current_price: 134.78, pe_ratio: 72.3, dividend_yield: 0.07, fifty_two_week_high: 152.88, fifty_two_week_low: 58.50 }
  }

  const cleanTicker = ticker.trim().toUpperCase()
  const data = US_STOCK_DATA[cleanTicker]
  if (!data) {
    throw new Error(`지원하지 않는 미국 주식: ${cleanTicker}`)
  }

  console.log(`  ✅ 미국 주식 Mock: ${data.name} - $${data.current_price}`)

  return {
    ticker: cleanTicker,
    fullTicker: cleanTicker,
    name: data.name,
    market: 'US',
    currency: 'USD',
    current_price: data.current_price,
    pe_ratio: data.pe_ratio,
    dividend_yield: data.dividend_yield,
    market_cap: null,
    fifty_two_week_high: data.fifty_two_week_high,
    fifty_two_week_low: data.fifty_two_week_low,
    timestamp: new Date().toISOString(),
    source: 'Mock Data'
  }
}

/**
 * 주가 데이터 조회 (Mock 데이터)
 */
export async function getRealTimeStockData(ticker) {
  console.log(`\n📊 주가 데이터 조회: ${ticker}`)
  console.log('━'.repeat(50))

  const cleaned = ticker.trim().toUpperCase()

  // 한국 주식 (6자리 숫자)
  if (/^\d{6}$/.test(cleaned)) {
    return fetchKoreanStockMock(cleaned)
  }

  // 미국 주식 (영문)
  if (/^[A-Z]{1,5}$/.test(cleaned)) {
    return fetchUSStockMock(cleaned)
  }

  // 잘못된 형식
  throw new Error(
    '올바른 종목 코드를 입력하세요.\n' +
    '- 미국: 영문 대문자 (AAPL, TSLA, MSFT)\n' +
    '- 한국: 6자리 숫자 (005930, 035720)'
  )
}
