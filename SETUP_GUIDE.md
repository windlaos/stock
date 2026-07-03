# 설정 및 배포 가이드

## 1단계: 로컬 환경 설정

### 1.1 프로젝트 초기화
```bash
# 프로젝트 디렉토리 진입
cd D:\Stock

# 의존성 설치 (이미 되어있으면 스킵)
npm install
```

### 1.2 환경 변수 설정

**로컬 개발용 (.env.local 생성)**
```bash
# .env.local 파일 생성 (Git에 커밋되지 않음)
# 필요한 경우에만 다음 값들을 추가하세요:

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Vercel 환경 변수 설정 (필수)**
```
Vercel 대시보드 > 프로젝트 > Settings > Environment Variables

다음 변수들을 추가하세요:
- ANTHROPIC_API_KEY: sk-ant-... (Anthropic Console에서 발급)
- VITE_SUPABASE_URL: https://your-project.supabase.co (선택사항)
- VITE_SUPABASE_ANON_KEY: eyJhbGc... (선택사항)
```

## 2단계: 로컬 개발

### 2.1 개발 서버 실행
```bash
npm run dev
```

브라우저가 자동으로 http://localhost:5173 에서 열립니다.

### 2.2 기본 테스트
1. 주식 종목 코드 입력 (예: AAPL, GOOGL, MSFT)
2. "분석하기" 버튼 클릭
3. Claude AI의 분석 결과 확인

### 2.3 Mock 데이터 모드
Supabase를 설정하지 않았다면 자동으로 Mock 데이터를 사용합니다.
(src/constants/mockData.js 참고)

## 3단계: 프로덕션 빌드

### 3.1 빌드 실행
```bash
npm run build
```

빌드 결과는 `dist/` 디렉토리에 생성됩니다.

### 3.2 빌드 결과 확인
```bash
npm run preview
```

로컬에서 프로덕션 빌드를 미리 확인할 수 있습니다.

## 4단계: Vercel 배포

### 4.1 Vercel CLI 설치 (미설치 시)
```bash
npm install -g vercel
```

### 4.2 Vercel 프로젝트 연결
```bash
vercel link
```

처음 배포할 때만 필요합니다.

### 4.3 Preview 배포 (테스트)
```bash
npm run deploy
# 또는
vercel
```

배포 완료 후 Preview URL을 얻을 수 있습니다.

### 4.4 프로덕션 배포
```bash
vercel --prod
```

**주의: 프로덕션 배포 전 확인사항**
- ✅ Vercel 대시보드에 환경 변수 설정 완료
- ✅ 로컬 테스트 완료
- ✅ 모든 민감한 정보가 환경 변수로 설정됨 (하드코딩 없음)

## 5단계: API 키 발급

### 5.1 Anthropic API 키 발급
1. https://console.anthropic.com/ 접속
2. 로그인 (계정 없으면 가입)
3. API Keys 섹션에서 새 키 생성
4. 키를 Vercel 환경 변수에 추가: `ANTHROPIC_API_KEY`

### 5.2 Supabase 설정 (선택사항)
1. https://supabase.com/ 접속
2. 새 프로젝트 생성
3. Project Settings에서 URL과 Anon Key 확인
4. 다음 값들을 Vercel 환경 변수에 추가:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## 6단계: 보안 체크리스트

배포 전 다음 항목들을 확인하세요:

- [ ] ANTHROPIC_API_KEY가 .env 또는 코드에 하드코딩되어 있지 않음
- [ ] Supabase 키가 .env.local에만 있고 Git에 커밋되지 않음
- [ ] .gitignore에 `.env.local`이 포함됨
- [ ] Vercel 대시보드에 모든 환경 변수가 설정됨
- [ ] 클라이언트 코드가 ANTHROPIC_API_KEY를 직접 사용하지 않음
- [ ] 서버리스 함수(api/analyze.js)만 ANTHROPIC_API_KEY 사용
- [ ] Rate limiting이 활성화됨 (api/analyze.js)

## 7단계: 운영 및 모니터링

### 7.1 Vercel 대시보드 모니터링
```
Vercel 대시보드 > 프로젝트 > Analytics
- 응답 시간
- 에러율
- 함수 실행 시간
```

### 7.2 로그 확인
```bash
vercel logs
```

### 7.3 배포 롤백 (문제 발생 시)
```bash
vercel rollback
```

## 문제 해결

### 에러: "ANTHROPIC_API_KEY is not defined"
**원인:** Vercel 환경 변수가 설정되지 않음
**해결:**
1. Vercel 대시보드 > Settings > Environment Variables 확인
2. ANTHROPIC_API_KEY 추가
3. 배포 재실행

### 에러: "Failed to parse AI response"
**원인:** Claude API 응답 형식이 잘못됨
**해결:**
1. api/analyze.js의 프롬프트 검토
2. Claude API 상태 확인
3. 로그에서 정확한 에러 메시지 확인

### 에러: "Rate limit exceeded"
**원인:** 1분당 10회 이상 요청
**해결:**
1. 요청 간격 조정
2. 필요시 rate limit 값 변경 (api/middleware/rateLimiter.js)
3. 프로덕션 환경에서는 Redis 기반 rate limiting 권장

## 참고 자료

- CLAUDE.md: 프로젝트 아키텍처 가이드
- PROJECT_STRUCTURE.md: 파일 구조 설명
- Vercel 공식 문서: https://vercel.com/docs
- Anthropic API: https://docs.anthropic.com/
