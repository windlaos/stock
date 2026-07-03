/**
 * Vercel Serverless Function: /api/analyze
 * 실시간 주가 데이터 + Claude AI 분석
 */

import Anthropic from '@anthropic-ai/sdk'
import axios from 'axios'

/**
 * Yahoo Finance에서 실시간 주가 조회
 */
async function fetchFromYahooFinance(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${ticker}?modules=price,summaryDetail,defaultKeyStatistics`

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    })

    const data = response.data

    if (!data.quoteSummary?.result?.[0]) {
      throw new Error('Invalid response')
    }

    const result = data.quoteSummary.result[0]
    const priceData = result.price || {}
    const summaryData = result.summaryDetail || {}

    const currentPrice = priceData.regularMarketPrice?.raw
    if (!currentPrice) throw new Error('No price')

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
      source: 'Yahoo Finance API'
    }
  } catch (error) {
    throw error
  }
}

/**
 * Alpha Vantage API에서 실시간 주가 조회 (미국만)
 */
async function fetchFromAlphaVantage(ticker) {
  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY || 'demo'
    const cleanTicker = ticker.trim().toUpperCase()

    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${cleanTicker}&apikey=${apiKey}`
    const response = await axios.get(url, { timeout: 10000 })
    const data = response.data

    if (data['Error Message'] || !data['Global Quote'] || !data['Global Quote']['05. price']) {
      throw new Error('No price data')
    }

    const quote = data['Global Quote']
    const currentPrice = parseFloat(quote['05. price'])

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
    throw error
  }
}

/**
 * Finnhub API에서 실시간 주가 조회 (미국만)
 */
async function fetchFromFinnhub(ticker) {
  try {
    if (ticker.includes('.KS')) {
      throw new Error('Finnhub은 한국 주식 미지원')
    }

    const apiKey = process.env.FINNHUB_API_KEY || 'demo'
    const cleanTicker = ticker.trim().toUpperCase()

    const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${cleanTicker}&token=${apiKey}`
    const quoteResponse = await axios.get(quoteUrl, { timeout: 10000 })
    const quoteData = quoteResponse.data

    if (quoteData.c === undefined) throw new Error('No price data')

    let companyName = cleanTicker
    try {
      const companyUrl = `https://finnhub.io/api/v1/stock/profile2?symbol=${cleanTicker}&token=${apiKey}`
      const companyResponse = await axios.get(companyUrl, { timeout: 10000 })
      if (companyResponse.data.name) companyName = companyResponse.data.name
    } catch (e) {
      // 계속 진행
    }

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
    throw error
  }
}

/**
 * 다중 API 폴백으로 실시간 주가 조회
 */
async function getRealTimeStockData(ticker) {
  const cleaned = ticker.trim().toUpperCase()

  let yahooTicker
  const isKorean = /^\d{6}$/.test(cleaned)

  if (isKorean) {
    yahooTicker = `${cleaned}.KS`
  } else if (/^[A-Z]{1,5}$/.test(cleaned)) {
    yahooTicker = cleaned
  } else {
    throw new Error(
      '올바른 종목 코드를 입력하세요.\n- 미국: 영문 대문자\n- 한국: 6자리 숫자'
    )
  }

  const errors = []

  // Yahoo Finance 시도
  try {
    return await fetchFromYahooFinance(yahooTicker)
  } catch (error) {
    errors.push(error)
  }

  // 미국 주식: Alpha Vantage 시도
  if (!isKorean) {
    try {
      return await fetchFromAlphaVantage(cleaned)
    } catch (error) {
      errors.push(error)
    }
  }

  // 미국 주식: Finnhub 시도
  if (!isKorean) {
    try {
      return await fetchFromFinnhub(cleaned)
    } catch (error) {
      errors.push(error)
    }
  }

  // 모든 API 실패
  throw new Error(
    `실시간 주가 조회 실패: ${cleaned}\n` +
    `지원: 미국(AAPL, TSLA 등), 한국(005930, 035720 등)\n` +
    `네트워크 연결을 확인하세요.`
  )
}

// ===== API 핸들러 =====
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { ticker } = req.body

    if (!ticker || typeof ticker !== 'string') {
      return res.status(400).json({
        message: 'Invalid ticker symbol',
        example: '미국: AAPL, TSLA / 한국: 005930, 035720'
      })
    }

    console.log(`\n[🔍 분석 시작] 종목: ${ticker}`)

    // 1️⃣ 실시간 주가 조회
    console.log('[1️⃣  단계] 실시간 주가 데이터 조회 중...')
    let stockData
    try {
      stockData = await getRealTimeStockData(ticker)
      const currencySymbol = stockData.currency === 'KRW' ? '₩' : '$'
      console.log(`[✅ 성공] ${stockData.name} - ${currencySymbol}${stockData.current_price.toLocaleString()}`)
      console.log(`[📊 소스] ${stockData.source}`)
    } catch (error) {
      console.error(`[❌ 실패] ${error.message}`)
      return res.status(404).json({
        message: error.message
      })
    }

    // 2️⃣ Claude AI 분석
    console.log('\n[2️⃣  단계] Claude AI 분석 중...')

    let analysis
    const hasValidApiKey =
      process.env.ANTHROPIC_API_KEY &&
      !process.env.ANTHROPIC_API_KEY.includes('dummy') &&
      !process.env.ANTHROPIC_API_KEY.includes('test')

    if (!hasValidApiKey) {
      console.log('[⚠️  경고] Claude API 키 미설정 - 기본 분석만 제공')
      analysis = {
        recommendation: 'HOLD',
        confidence: 50,
        technical_analysis: '실시간 데이터 수집 완료. AI 분석을 위해 ANTHROPIC_API_KEY 설정이 필요합니다.',
        fundamentals: `현재가: ${stockData.currency === 'KRW' ? '₩' : '$'}${stockData.current_price.toLocaleString()}`,
        risks: 'AI 분석 미실행',
        strategy: 'API 키를 설정하고 다시 시도하세요.'
      }
    } else {
      const client = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      })

      const currencySymbol = stockData.currency === 'KRW' ? '₩' : '$'
      const analysisPrompt = `
【 실시간 주가 정보 (${stockData.source}) 】
종목: ${stockData.name} (${stockData.ticker})
시장: ${stockData.market === 'KR' ? '한국 (KOSPI/KOSDAQ)' : '미국 (NASDAQ/NYSE)'}
현재가: ${currencySymbol}${stockData.current_price.toLocaleString()}
PER: ${stockData.pe_ratio ? stockData.pe_ratio.toFixed(2) : '정보 없음'}
배당수익률: ${stockData.dividend_yield || '정보 없음'}%
52주 최고: ${stockData.fifty_two_week_high ? currencySymbol + stockData.fifty_two_week_high.toLocaleString() : '정보 없음'}
52주 최저: ${stockData.fifty_two_week_low ? currencySymbol + stockData.fifty_two_week_low.toLocaleString() : '정보 없음'}
시가총액: ${stockData.market_cap ? (stockData.market_cap / 1e9).toFixed(1) + 'B' : '정보 없음'}
데이터 업데이트: ${new Date(stockData.timestamp).toLocaleString('ko-KR')}

【 분석 요청 】
위 실시간 데이터를 기반으로 현재 매수/매도 타이밍을 분석하세요.

다음 JSON으로만 응답하세요:
{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": 0-100,
  "technical_analysis": "가격 추세와 이동평균 분석 (100-150자)",
  "fundamentals": "PER, 배당, 시가총액 기반 평가 (100-150자)",
  "risks": "현재 시점의 주요 위험 요소 (100-150자)",
  "strategy": "현재 가격대에서의 투자 전략 (100-150자)"
}
      `

      try {
        const message = await client.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: analysisPrompt,
            },
          ],
        })

        const content = message.content[0].type === 'text' ? message.content[0].text : ''

        try {
          analysis = JSON.parse(content)
          console.log(`[✅ 성공] 추천: ${analysis.recommendation}, 신뢰도: ${analysis.confidence}%`)
        } catch (e) {
          console.error('[❌ JSON 파싱 실패]')
          return res.status(500).json({
            message: 'AI 응답 파싱 실패',
            error: e.message
          })
        }
      } catch (error) {
        console.error('[❌ Claude API 오류]', error.message)
        return res.status(500).json({
          message: 'Claude API 호출 실패',
          error: error.message
        })
      }
    }

    if (!analysis.recommendation || analysis.confidence === undefined) {
      return res.status(500).json({
        message: 'Invalid analysis format'
      })
    }

    console.log('\n[✅ 분석 완료]\n')

    return res.status(200).json({
      ticker: stockData.ticker,
      fullTicker: stockData.fullTicker,
      name: stockData.name,
      market: stockData.market,
      currency: stockData.currency,
      current_price: stockData.current_price,
      pe_ratio: stockData.pe_ratio,
      dividend_yield: stockData.dividend_yield,
      market_cap: stockData.market_cap,
      fifty_two_week_high: stockData.fifty_two_week_high,
      fifty_two_week_low: stockData.fifty_two_week_low,
      recommendation: analysis.recommendation,
      confidence: analysis.confidence,
      technical_analysis: analysis.technical_analysis,
      fundamentals: analysis.fundamentals,
      risks: analysis.risks,
      strategy: analysis.strategy,
      analyzed_at: new Date().toISOString(),
      data_source: stockData.source,
      ai_model: hasValidApiKey ? 'Claude 3.5 Sonnet' : '기본 분석'
    })
  } catch (error) {
    console.error('[🔴 오류]', error)
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
}
