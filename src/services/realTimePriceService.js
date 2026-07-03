/**
 * 실시간 주가 데이터 조회 서비스
 * 다중 API 소스: yahoo-finance2 + Alpha Vantage + Finnhub
 * 지원: 미국 주식(AAPL, TSLA 등) + 한국 주식(005930 등)
 */

import yahooFinance from 'yahoo-finance2'
import axios from 'axios'

/**
 * Yahoo Finance2에서 실시간 주가 조회 (가장 안정적)
 * - 미국 주식: AAPL
 * - 한국 주식: 005930.KS
 */
async function fetchFromYahooFinance2(ticker) {
  try {
    console.log(`  [1] Yahoo Finance2 시도 중... (${ticker})`)

    const quote = await yahooFinance.quote(ticker, {
      fields: ['symbol', 'longName', 'currency', 'regularMarketPrice', 'regularMarketPreviousClose',
               'fiftyTwoWeekHigh', 'fiftyTwoWeekLow', 'trailingPE', 'dividendYield', 'marketCap']
    })

    if (!quote || !quote.regularMarketPrice) {
      throw new Error('No price data available')
    }

    const isKRStock = ticker.includes('.KS')
    console.log(`  ✅ Yahoo Finance2 성공: ${isKRStock ? '₩' : '$'}${quote.regularMarketPrice.toLocaleString()}`)

    return {
      ticker: ticker.replace('.KS', ''),
      fullTicker: ticker,
      name: quote.longName || ticker,
      market: isKRStock ? 'KR' : 'US',
      currency: quote.currency || (isKRStock ? 'KRW' : 'USD'),
      current_price: quote.regularMarketPrice,
      pe_ratio: quote.trailingPE ? quote.trailingPE.toFixed(2) : null,
      dividend_yield: quote.dividendYield ? (quote.dividendYield * 100).toFixed(2) : null,
      market_cap: quote.marketCap,
      fifty_two_week_high: quote.fiftyTwoWeekHigh || null,
      fifty_two_week_low: quote.fiftyTwoWeekLow || null,
      timestamp: new Date().toISOString(),
      source: 'Yahoo Finance API (yahoo-finance2)'
    }
  } catch (error) {
    console.log(`  ❌ Yahoo Finance2 실패: ${error.message}`)
    throw error
  }
}

/**
 * Alpha Vantage API에서 실시간 주가 조회 (미국 주식만)
 * 무료 API: https://www.alphavantage.co
 * 제한: 5 calls/minute
 */
async function fetchFromAlphaVantage(ticker) {
  try {
    console.log(`  [2] Alpha Vantage API 시도 중... (${ticker})`)

    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo'
    const cleanTicker = ticker.trim().toUpperCase()

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${cleanTicker}&apikey=${apiKey}`

    const response = await axios.get(url, { timeout: 10000 })
    const data = response.data

    if (data['Error Message']) {
      throw new Error(data['Error Message'])
    }

    if (!data['Global Quote'] || !data['Global Quote']['05. price']) {
      throw new Error('No price data available')
    }

    const quote = data['Global Quote']
    const currentPrice = parseFloat(quote['05. price'])

    console.log(`  ✅ Alpha Vantage 성공: $${currentPrice.toLocaleString()}`)

    return {
      ticker: cleanTicker,
      fullTicker: cleanTicker,
      name: quote['01. symbol'] || cleanTicker,
      market: 'US',
      currency: 'USD',
      current_price: currentPrice,
      pe_ratio: null,
      dividend_yield: null,
      market_cap: null,
      fifty_two_week_high: parseFloat(quote['08. 52 week high']) || null,
      fifty_two_week_low: parseFloat(quote['09. 52 week low']) || null,
      timestamp: new Date().toISOString(),
      source: 'Alpha Vantage API'
    }
  } catch (error) {
    console.log(`  ❌ Alpha Vantage 실패: ${error.message}`)
    throw error
  }
}

/**
 * Finnhub API에서 실시간 주가 조회 (미국 주식만)
 * 무료 API: https://finnhub.io
 * 제한: 60 calls/minute (무료 tier)
 */
async function fetchFromFinnhub(ticker) {
  try {
    console.log(`  [3] Finnhub API 시도 중... (${ticker})`)

    if (ticker.includes('.KS')) {
      throw new Error('Finnhub은 한국 주식을 지원하지 않음')
    }

    const apiKey = process.env.FINNHUB_API_KEY || 'demo'
    const cleanTicker = ticker.trim().toUpperCase()

    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${cleanTicker}&token=${apiKey}`
    const quoteResponse = await axios.get(quoteUrl, { timeout: 10000 })
    const quoteData = quoteResponse.data

    if (quoteData.c === undefined) {
      throw new Error('No price data available')
    }

    let companyName = cleanTicker
    try {
      const companyUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${cleanTicker}&token=${apiKey}`
      const companyResponse = await axios.get(companyUrl, { timeout: 10000 })
      if (companyResponse.data.name) {
        companyName = companyResponse.data.name
      }
    } catch (e) {
      // 회사명 조회 실패해도 계속 진행
    }

    console.log(`  ✅ Finnhub 성공: $${quoteData.c.toLocaleString()}`)

    return {
      ticker: cleanTicker,
      fullTicker: cleanTicker,
      name: companyName,
      market: 'US',
      currency: 'USD',
      current_price: quoteData.c,
      pe_ratio: null,
      dividend_yield: null,
      market_cap: null,
      fifty_two_week_high: quoteData.h || null,
      fifty_two_week_low: quoteData.l || null,
      timestamp: new Date().toISOString(),
      source: 'Finnhub API'
    }
  } catch (error) {
    console.log(`  ❌ Finnhub 실패: ${error.message}`)
    throw error
  }
}

/**
 * 종목 코드 형식 자동 감지 및 변환
 * @param {string} ticker - 종목 코드 (예: 'AAPL', '005930')
 * @returns {Object} { yahooTicker, isKorean, originalTicker }
 */
function detectAndConvertTicker(ticker) {
  const cleaned = ticker.trim().toUpperCase()

  if (/^\d{6}$/.test(cleaned)) {
    // 6자리 숫자 → 한국 주식
    return {
      yahooTicker: `${cleaned}.KS`,
      isKorean: true,
      originalTicker: cleaned
    }
  } else if (/^[A-Z]{1,5}$/.test(cleaned)) {
    // 영문 → 미국 주식
    return {
      yahooTicker: cleaned,
      isKorean: false,
      originalTicker: cleaned
    }
  } else {
    throw new Error(
      '올바른 종목 코드를 입력하세요.\n' +
      '- 미국: 영문 대문자 (예: AAPL, TSLA, MSFT)\n' +
      '- 한국: 6자리 숫자 (예: 005930, 035720)'
    )
  }
}

/**
 * 실시간 주가 조회 - 다중 API 소스 자동 폴백
 * 우선순위: Yahoo Finance2 → Alpha Vantage/Finnhub → 에러 반환
 *
 * @param {string} ticker - 종목 코드
 * @returns {Promise<Object>} 실시간 주가 데이터
 */
export async function getRealTimeStockData(ticker) {
  console.log(`\n📊 실시간 주가 데이터 조회: ${ticker}`)
  console.log('━'.repeat(60))

  // 1단계: 종목 코드 형식 감지
  const { yahooTicker, isKorean, originalTicker } = detectAndConvertTicker(ticker)

  const errors = []

  // 2단계: Yahoo Finance2 시도 (한국 + 미국 모두 지원)
  try {
    return await fetchFromYahooFinance2(yahooTicker)
  } catch (error) {
    errors.push({ source: 'Yahoo Finance2', message: error.message })
  }

  // 3단계: 미국 주식의 경우 Alpha Vantage 또는 Finnhub 시도
  if (!isKorean) {
    try {
      return await fetchFromAlphaVantage(originalTicker)
    } catch (error) {
      errors.push({ source: 'Alpha Vantage', message: error.message })
    }

    try {
      return await fetchFromFinnhub(originalTicker)
    } catch (error) {
      errors.push({ source: 'Finnhub', message: error.message })
    }
  }

  // 4단계: 모든 API 실패 → 에러 반환
  console.log('━'.repeat(60))
  console.error('\n❌ 모든 데이터 소스에서 실패:')
  errors.forEach((err, i) => {
    console.error(`  [${i + 1}] ${err.source}: ${err.message}`)
  })

  throw new Error(
    `실시간 주가 조회 실패: ${originalTicker}\n` +
    `지원하는 종목:\n` +
    `- 미국: AAPL, TSLA, MSFT, GOOGL, AMZN, NVDA 등 모든 US 주식\n` +
    `- 한국: 005930, 035720, 000660 등 모든 KRX 종목\n` +
    `네트워크 연결을 확인하고 다시 시도하세요.`
  )
}
