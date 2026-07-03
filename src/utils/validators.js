// 입력 검증 유틸리티

export function validateTicker(ticker) {
  if (!ticker || typeof ticker !== 'string') {
    throw new Error('종목 코드는 문자열이어야 합니다');
  }

  const cleaned = ticker.toUpperCase().trim();

  if (cleaned.length < 1 || cleaned.length > 5) {
    throw new Error('종목 코드는 1~5자여야 합니다');
  }

  if (!/^[A-Z0-9]+$/.test(cleaned)) {
    throw new Error('종목 코드는 영문 대문자와 숫자만 포함해야 합니다');
  }

  return cleaned;
}

export function validateApiResponse(data) {
  const required = ['recommendation', 'confidence', 'technical_analysis', 'fundamentals'];

  for (const field of required) {
    if (!(field in data)) {
      throw new Error(`필수 필드 누락: ${field}`);
    }
  }

  if (!['BUY', 'SELL', 'HOLD'].includes(data.recommendation)) {
    throw new Error('유효하지 않은 추천 신호');
  }

  if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100) {
    throw new Error('신뢰도는 0~100 사이의 숫자여야 합니다');
  }

  return true;
}

export function sanitizeOutput(text) {
  // XSS 방지: HTML 태그 제거
  return text
    .replace(/<[^>]*>/g, '')
    .trim();
}
