// 애플리케이션 설정 상수 (환경 변수 중앙 관리)

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE || 'http://localhost:3001',
  ENDPOINTS: {
    ANALYZE: '/api/analyze',
  },
  TIMEOUT: 30000, // 30초
};

export const ENVIRONMENT = {
  isDevelopment: import.meta.env.VITE_ENV === 'development',
  isProduction: import.meta.env.VITE_ENV === 'production',
  env: import.meta.env.VITE_ENV || 'development',
};

export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL,
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

// Claude API 모델 설정 (서버리스 함수에서만 사용)
export const CLAUDE_CONFIG = {
  MODEL: 'claude-3-5-sonnet-20241022',
  MAX_TOKENS: 1024,
};

// 지원되는 주식 종목 (mock)
export const SUPPORTED_STOCKS = ['AAPL', 'GOOGL', 'MSFT'];
