/**
 * 실시간 주가 데이터 조회 서비스
 * 다중 API 소스 지원 (Yahoo Finance → Finnhub → 기본값)
 * - 미국 주식: AAPL, TSLA 등
 * - 한국 주식: 005930.KS 또는 네이버 금융
 */

/**
 * Yahoo Finance에서 실시간 주가 조회 (기본 소스)
 */
async function fetchFromYahooFinance(ticker) {
  try {
    console.log(`  [1] Yahoo Finance 시도 중... (${ticker})`)

    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryDetail,defaultKeyStatistics`

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()

    if (!data.quoteSummary?.result?.[0]) {
      throw new Error('Invalid response structure')
    }

    const result = data.quoteSummary.result[0]
    const priceData = result.price || {}
    const summaryData = result.summaryDetail || {}

    const currentPrice = priceData.regularMarketPrice?.raw
    if (!currentPrice) {
      throw new Error('No price data')
    }

    console.log(`  ✅ Yahoo Finance 성공: $${currentPrice}`)

    const isKRStock = ticker.includes('.KS')
    return {
      ticker: ticker.replace('.KS', ''),
      fullTicker: ticker,
      name: priceData.longName || priceData.shortName || ticker,
      market: isKRStock ? 'KR' : 'US',
      currency: priceData.currency || (isKRStock ? 'KRW' : 'USD'),
      current_price: currentPrice,
      pe_ratio: summaryData.trailingPE?.raw || null,
      dividend_yield: summaryData.trailingAnnualDividendYield?.raw
        ? (summaryData.trailingAnnualDividendYield.raw * 100).toFixed(2)
        : null,
      market_cap: summaryData.marketCap?.raw || null,
      fifty_two_week_high: summaryData.fiftyTwoWeekHigh?.raw || null,
      fifty_two_week_low: summaryData.fiftyTwoWeekLow?.raw || null,
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance'
    }
  } catch (error) {
    console.log(`  ❌ Yahoo Finance 실패: ${error.message}`)
    throw error
  }
}

/**
 * Finnhub API에서 실시간 주가 조회 (대체 소스)
 * 무료 API, 미국 주식 지원
 */
async function fetchFromFinnhub(ticker) {
  // Finnhub API 키 (데모용 무료 키)
  // 실제 배포 시에는 environment variable에서 로드
  const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'demo'

  try {
    console.log(`  [2] Finnhub API 시도 중... (${ticker})`)

    // Finnhub은 .KS 접미사를 지원하지 않으므로 미국 주식만 처리
    if (ticker.includes('.KS')) {
      throw new Error('Finnhub은 한국 주식을 지원하지 않음')
    }

    const cleanTicker = ticker.trim().toUpperCase()

    // 실시간 주가 조회
    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${cleanTicker}&token=${FINNHUB_API_KEY}`
    const quoteResponse = await fetch(quoteUrl)

    if (!quoteResponse.ok) {
      throw new Error(`HTTP ${quoteResponse.status}`)
    }

    const quoteData = await quoteResponse.json()

    // 필수 데이터 확인
    if (quoteData.c === undefined) {
      throw new Error('No price data from Finnhub')
    }

    // 회사 정보 조회
    let companyName = cleanTicker
    try {
      const companyUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${cleanTicker}&token=${FINNHUB_API_KEY}`
      const companyResponse = await fetch(companyUrl)
      if (companyResponse.ok) {
        const companyData = await companyResponse.json()
        companyName = companyData.name || cleanTicker
      }
    } catch (e) {
      // 회사 정보 조회 실패해도 계속 진행
    }

    console.log(`  ✅ Finnhub 성공: $${quoteData.c}`)

    return {
      ticker: cleanTicker,
      fullTicker: cleanTicker,
      name: companyName,
      market: 'US',
      currency: 'USD',
      current_price: quoteData.c, // Current price
      pe_ratio: null, // Finnhub 무료 tier에서는 PE ratio 미제공
      dividend_yield: null,
      market_cap: null,
      fifty_two_week_high: quoteData.h, // 52주 최고
      fifty_two_week_low: quoteData.l, // 52주 최저
      timestamp: new Date().toISOString(),
      source: 'Finnhub API'
    }
  } catch (error) {
    console.log(`  ❌ Finnhub 실패: ${error.message}`)
    throw error
  }
}

/**
 * 한국 주식 Mock 데이터
 */
async function fetchKoreanStockMock(krCode) {
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

  console.log(`  ✅ 한국 주식 Mock 데이터: ${data.name} - ₩${data.current_price.toLocaleString()}`)

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
    source: 'Mock Data (한국 주식)'
  }
}

/**
 * 미국 주식 Mock 데이터
 */
async function fetchUSStockMock(ticker) {
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

  console.log(`  ✅ 미국 주식 Mock 데이터: ${data.name} - $${data.current_price}`)

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
    source: 'Mock Data (미국 주식)'
  }
}

/**
 * 다중 API를 순차적으로 시도하여 실시간 데이터 조회
 * @param {string} ticker - 종목 코드 (AAPL 또는 005930.KS)
 * @returns {Promise<Object>} 실시간 주가 데이터
 */
export async function getRealTimeStockData(ticker) {
  const cleaned = ticker.trim().toUpperCase()

  console.log(`\n📊 실시간 주가 데이터 조회: ${cleaned}`)
  console.log('━'.repeat(50))

  let yahooTicker

  // 1. 종목 타입 판단 및 야후 ticker 변환
  if (/^\d{6}$/.test(cleaned)) {
    // 한국 주식 (6자리 숫자)
    yahooTicker = `${cleaned}.KS`
  } else if (/^[A-Z]{1,5}$/.test(cleaned)) {
    // 미국 주식 (영문)
    yahooTicker = cleaned
  } else {
    throw new Error(
      '올바른 종목 코드를 입력하세요.\n' +
      '- 미국: 영문 대문자 (예: AAPL, TSLA)\n' +
      '- 한국: 6자리 숫자 (예: 005930)'
    )
  }

  // 2. 다중 API 시도 (우선순위 순서)
  const errors = []

  // 먼저 Yahoo Finance 시도
  try {
    return await fetchFromYahooFinance(yahooTicker)
  } catch (error) {
    errors.push(error)
  }

  // Yahoo Finance 실패 시 Finnhub 시도 (미국 주식만)
  if (!yahooTicker.includes('.KS')) {
    try {
      return await fetchFromFinnhub(yahooTicker)
    } catch (error) {
      errors.push(error)
    }
  }

  // Mock 데이터 폴백
  if (yahooTicker.includes('.KS')) {
    try {
      return await fetchKoreanStockMock(cleaned)
    } catch (error) {
      errors.push(error)
    }
  } else {
    try {
      return await fetchUSStockMock(yahooTicker)
    } catch (error) {
      errors.push(error)
    }
  }

  // 모든 데이터 소스 실패
  console.log('━'.repeat(50))
  console.error('\n❌ 모든 데이터 소스에서 실패:')
  errors.forEach((err, i) => {
    console.error(`  [${i + 1}] ${err.message}`)
  })

  throw new Error(
    `실시간 주가 조회 실패: ${cleaned}\n` +
    '지원하는 종목: 미국(AAPL, TSLA 등), 한국(005930, 035720 등)'
  )
}
