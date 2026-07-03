/**
 * Vercel Serverless Function: /api/analyze
 * Mock 데이터 + Claude AI 분석
 */

import Anthropic from '@anthropic-ai/sdk'

/**
 * 한국 주식 Mock 데이터
 */
function fetchKoreanStockMock(krCode) {
  const KR_STOCK_DATA = {
    '005930': { name: '삼성전자', current_price: 74500, pe_ratio: 11.2, dividend_yield: 2.1, fifty_two_week_high: 92000, fifty_two_week_low: 61000 },
    '000660': { name: 'SK하이닉스', current_price: 185000, pe_ratio: 7.8, dividend_yield: 1.8, fifty_two_week_high: 210000, fifty_two_week_low: 145000 },
    '005380': { name: '현대자동차', current_price: 215000, pe_ratio: 3.5, dividend_yield: 5.2, fifty_two_week_high: 260000, fifty_two_week_low: 180000 },
    '051910': { name: 'LG화학', current_price: 682000, pe_ratio: 9.1, dividend_yield: 0.9, fifty_two_week_high: 820000, fifty_two_week_low: 560000 },
    '035420': { name: 'NAVER', current_price: 385000, pe_ratio: 16.5, dividend_yield: 0.2, fifty_two_week_high: 480000, fifty_two_week_low: 280000 },
    '035720': { name: '카카오', current_price: 58000, pe_ratio: 14.2, dividend_yield: 0.5, fifty_two_week_high: 85000, fifty_two_week_low: 42000 }
  }

  const data = KR_STOCK_DATA[krCode]
  if (!data) throw new Error(`지원하지 않는 한국 주식: ${krCode}`)

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
  if (!data) throw new Error(`지원하지 않는 미국 주식: ${cleanTicker}`)

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
 * 주가 데이터 조회 (Mock)
 */
function getStockData(ticker) {
  const cleaned = ticker.trim().toUpperCase()

  if (/^\d{6}$/.test(cleaned)) {
    return fetchKoreanStockMock(cleaned)
  }

  if (/^[A-Z]{1,5}$/.test(cleaned)) {
    return fetchUSStockMock(cleaned)
  }

  throw new Error(
    '올바른 종목 코드를 입력하세요.\n- 미국: 영문 대문자\n- 한국: 6자리 숫자'
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

    // 1️⃣ 주가 데이터 조회
    console.log('[1️⃣  단계] 주가 데이터 조회 중...')
    let stockData
    try {
      stockData = getStockData(ticker)
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
        technical_analysis: '데이터 조회 완료. AI 분석을 위해 ANTHROPIC_API_KEY 설정이 필요합니다.',
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
【 주가 정보 】
종목: ${stockData.name} (${stockData.ticker})
시장: ${stockData.market === 'KR' ? '한국 (KOSPI/KOSDAQ)' : '미국 (NASDAQ/NYSE)'}
현재가: ${currencySymbol}${stockData.current_price.toLocaleString()}
PER: ${stockData.pe_ratio ? stockData.pe_ratio.toFixed(2) : '정보 없음'}
배당수익률: ${stockData.dividend_yield || '정보 없음'}%
52주 최고: ${stockData.fifty_two_week_high ? currencySymbol + stockData.fifty_two_week_high.toLocaleString() : '정보 없음'}
52주 최저: ${stockData.fifty_two_week_low ? currencySymbol + stockData.fifty_two_week_low.toLocaleString() : '정보 없음'}

【 분석 요청 】
위 데이터를 기반으로 현재 매수/매도 타이밍을 분석하세요.

다음 JSON으로만 응답하세요:
{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": 0-100,
  "technical_analysis": "가격 추세 분석 (100-150자)",
  "fundamentals": "PER, 배당 기반 평가 (100-150자)",
  "risks": "주요 위험 요소 (100-150자)",
  "strategy": "투자 전략 (100-150자)"
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
