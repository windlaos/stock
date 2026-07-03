// Rate Limiter 미들웨어 (간단한 in-memory 구현)
// 실제 프로덕션에서는 Redis 또는 데이터베이스 기반 구현 권장

const requestCounts = new Map();
const WINDOW_MS = 60000; // 1분
const MAX_REQUESTS = 10; // 1분당 최대 10개 요청

export function rateLimiter(req, res) {
  const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(clientIp)) {
    requestCounts.set(clientIp, []);
  }

  const timestamps = requestCounts.get(clientIp);
  const recentRequests = timestamps.filter(ts => now - ts < WINDOW_MS);

  if (recentRequests.length >= MAX_REQUESTS) {
    res.status(429).json({
      message: '요청이 너무 많습니다. 잠시 후 다시 시도하세요.',
      retryAfter: Math.ceil((recentRequests[0] + WINDOW_MS - now) / 1000),
    });
    return false;
  }

  recentRequests.push(now);
  requestCounts.set(clientIp, recentRequests);

  // 오래된 데이터 정리 (메모리 누수 방지)
  if (Math.random() < 0.01) {
    for (const [ip, times] of requestCounts.entries()) {
      const valid = times.filter(ts => now - ts < WINDOW_MS * 2);
      if (valid.length === 0) {
        requestCounts.delete(ip);
      } else {
        requestCounts.set(ip, valid);
      }
    }
  }

  return true;
}
