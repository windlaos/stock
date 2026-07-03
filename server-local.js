/**
 * 로컬 개발용 API 서버 (Mock 데이터)
 */

import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import { getRealTimeStockData } from './src/services/realTimePriceService.js'

dotenv.config()

const app = express()
const PORT = process.env.LOCAL_API_PORT || 3001

// 미들웨어
app.use(cors({
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}))

app.use(express.json())

// 요청 로깅
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

// Claude 클라이언트
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// 헬스 체크
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Stock Analysis API Server',
    timestamp: new Date().toISOString(),
    port: PORT,
    features: ['Mock Price Data', 'Claude AI Analysis']
  })
})

// 테스트 연결
app.post('/api/test-connection', (req, res) => {
  res.json({
    status: 'success',
    message: '✅ 연결 성공',
    timestamp: new Date().toISOString()
  })
})

// 분석 엔드포인트
app.post('/api/analyze', async (req, res) => {
  try {
    const { ticker } = req.body

    if (!ticker || typeof ticker !== 'string') {
      return res.status(400).json({
        message: 'Invalid ticker symbol',
        example: '미국: AAPL, TSLA / 한국: 005930, 035720'
      })
    }

    console.log(`\n[🔍 분석 시작] 종목: ${ticker}`)
    console.log('━'.repeat(60))

    // 1️⃣ 주가 데이터 조회
    console.log('\n[1️⃣  단계] 주가 데이터 조회 중...')
    console.log('━'.repeat(60))
    let stockData
    try {
      stockData = await getRealTimeStockData(ticker)
      const currencySymbol = stockData.currency === 'KRW' ? '₩' : '$'
      console.log(`\n[✅ 성공]`)
      console.log(`  종목: ${stockData.name}`)
      console.log(`  가격: ${currencySymbol}${stockData.current_price.toLocaleString()}`)
      console.log(`  소스: ${stockData.source}`)
      console.log('━'.repeat(60))
    } catch (error) {
      console.error(`\n[❌ 실패] ${error.message}`)
      console.log('━'.repeat(60))
      return res.status(404).json({
        message: error.message
      })
    }

    // 2️⃣ Claude AI 분석
    console.log('\n[2️⃣ 단계] Claude AI 분석 중...')

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
        technical_analysis: '데이터 조회 완료. 상세 AI 분석을 위해 ANTHROPIC_API_KEY 설정이 필요합니다.',
        fundamentals: `현재가: ${stockData.currency === 'KRW' ? '₩' : '$'}${stockData.current_price.toLocaleString()}`,
        risks: 'AI 분석 미실행',
        strategy: 'API 키를 설정하고 다시 시도하세요.'
      }
    } else {
      const currencySymbol = stockData.currency === 'KRW' ? '₩' : '$'
      const analysisPrompt = `
당신은 전문 주식 분석가입니다.

【 주가 정보 】
종목: ${stockData.name} (${stockData.ticker})
시장: ${stockData.market === 'KR' ? '한국 (KOSPI/KOSDAQ)' : '미국 (NASDAQ/NYSE)'}
현재가: ${currencySymbol}${stockData.current_price.toLocaleString()}
PER: ${stockData.pe_ratio ? stockData.pe_ratio.toFixed(2) : '정보 없음'}
배당수익률: ${stockData.dividend_yield || '정보 없음'}%
52주 최고: ${stockData.fifty_two_week_high ? currencySymbol + stockData.fifty_two_week_high.toLocaleString() : '정보 없음'}
52주 최저: ${stockData.fifty_two_week_low ? currencySymbol + stockData.fifty_two_week_low.toLocaleString() : '정보 없음'}

【 분석 요청 】
위 데이터를 기반으로 매수/매도 타이밍을 분석하세요.

다음 JSON 형식으로 정확히 응답하세요:
{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": 0-100,
  "technical_analysis": "기술적 분석 (100-150자)",
  "fundamentals": "펀더멘탈 분석 (100-150자)",
  "risks": "주요 위험 요소 (100-150자)",
  "strategy": "투자 전략 (100-150자)"
}

응답은 유효한 JSON만 포함하세요.
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
          console.error('[❌ JSON 파싱 실패]', e.message)
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

    console.log('\n[✅ 분석 완료]')
    console.log('━'.repeat(60))

    // 최종 응답
    res.json({
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
    console.error('[🔴 서버 오류]', error)
    res.status(500).json({
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`\n${'━'.repeat(60)}`)
  console.log(`✅ Stock Analysis API Server`)
  console.log(`${'━'.repeat(60)}`)
  console.log(`📍 주소: http://localhost:${PORT}`)
  console.log(`🔍 분석: POST http://localhost:${PORT}/api/analyze`)
  console.log(`💾 데이터: Mock Data`)
  console.log(`🤖 AI 엔진: Claude 3.5 Sonnet`)
  console.log(`${'━'.repeat(60)}\n`)
})
