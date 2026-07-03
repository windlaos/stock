# 프로젝트 파일 구조 가이드

## 개요

CLAUDE.md의 보안 컴플라이언스와 서버리스 아키텍처 제약을 완벽히 준수하는 MVP 프로젝트 구조입니다.

## 디렉토리 구조

```
stock/
├── src/                          # React 프론트엔드 (Vite SPA)
│   ├── main.jsx                  # 진입점
│   ├── App.jsx                   # 루트 컴포넌트
│   ├── index.css                 # 글로벌 스타일
│   │
│   ├── pages/                    # 페이지 컴포넌트
│   │   └── StockRecommendation.jsx
│   │
│   ├── components/               # UI 컴포넌트
│   │   ├── StockInput.jsx
│   │   ├── AnalysisResult.jsx
│   │   └── ui/                   # 재사용 가능한 UI 컴포넌트
│   │       ├── LoadingSpinner.jsx
│   │       └── ErrorBoundary.jsx
│   │
│   ├── services/                 # API 및 데이터 서비스
│   │   ├── stockService.js       # Claude API 분석 요청
│   │   └── supabaseClient.js     # Supabase 클라이언트 (선택사항)
│   │
│   ├── hooks/                    # 커스텀 React 훅
│   │   └── useStockAnalysis.js
│   │
│   ├── constants/                # 상수 정의
│   │   ├── config.js             # 환경 변수 중앙 관리
│   │   └── mockData.js           # Mock 데이터
│   │
│   └── utils/                    # 유틸리티 함수
│       └── validators.js         # 입력 검증, XSS 방지
│
├── api/                          # Vercel 서버리스 함수
│   ├── analyze.js                # POST /api/analyze (Claude 분석)
│   └── middleware/               # API 미들웨어
│       └── rateLimiter.js        # Rate limiting
│
├── .env                          # 공개 환경 설정 (커밋됨)
├── .env.example                  # 예시 (커밋됨)
├── .env.local                    # 로컬 개발 환경 (커밋 안 함)
├── .env.production               # 프로덕션 설정 템플릿
├── .gitignore                    # Git 제외 파일
│
├── package.json                  # 프로젝트 메타데이터 및 의존성
├── vite.config.js                # Vite 빌드 설정
├── vercel.json                   # Vercel 배포 설정
├── index.html                    # HTML 진입점
│
├── CLAUDE.md                     # 프로젝트 아키텍처 가이드라인
├── PROJECT_STRUCTURE.md          # 이 파일
└── README.md                     # 프로젝트 설명
```

## 보안 컴플라이언스 (CLAUDE.md 준수)

### ✅ API 키 관리

**금지 사항 (절대 하면 안됨):**
```javascript
// ❌ 잘못된 예: 하드코딩
const API_KEY = "sk-ant-abc123xyz";
```

**권장 사항 (이렇게 하세요):**
```javascript
// ✅ 올바른 예: 환경 변수만 사용
// src/services/stockService.js (클라이언트)
const API_BASE = import.meta.env.VITE_API_BASE;

// api/analyze.js (서버리스 함수)
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,  // Vercel 대시보드에서 설정
});
```

### ✅ 환경 분리

**로컬 개발 (.env.local)**
```bash
# .env.local (커밋 안 함)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**프로덕션 (Vercel)**
```
Vercel Dashboard > Settings > Environment Variables
- ANTHROPIC_API_KEY
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
```

## 데이터 흐름

### 1. 사용자 요청 (클라이언트)
```
StockInput 컴포넌트
    ↓
useStockAnalysis 훅 (validateTicker)
    ↓
stockService.analyzeStock()
```

### 2. API 요청
```
HTTP POST http://localhost:3001/api/analyze
{
  "ticker": "AAPL"
}
```

### 3. 서버 처리 (서버리스 함수)
```
/api/analyze 엔드포인트
    ↓
Rate Limiting 체크
    ↓
입력 검증 (validateTicker)
    ↓
Claude API 호출 (ANTHROPIC_API_KEY 환경 변수)
    ↓
응답 파싱 및 검증
    ↓
JSON 응답 반환
```

### 4. 결과 표시 (클라이언트)
```
AnalysisResult 컴포넌트
    ↓
기술적 분석, 펀더멘탈, 위험요소 표시
```

## 개발 명령어

```bash
# 로컬 개발 서버 실행 (localhost:5173)
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 결과 미리보기
npm run preview

# Vercel 배포 (preview)
npm run deploy

# Vercel 프로덕션 배포
vercel --prod
```

## 서버리스 함수 제약 고려사항

**Vercel 무료 티어 제한:**
- 함수 실행 타임아웃: 30초 (설정됨)
- 메모리: 512MB
- 최대 요청 크기: 6MB

**최적화 팁:**
1. Claude API 응답을 캐싱하기 (Supabase 활용)
2. Rate limiting으로 과도한 요청 방지
3. 불필요한 미들웨어 최소화
4. Mock 데이터로 오프라인 테스트

## 다음 단계

1. **Supabase 설정** (선택사항)
   - `src/services/supabaseClient.js` 활성화
   - 실시간 주가 데이터 테이블 생성

2. **환경 변수 설정**
   - `.env.local`에 로컬 개발용 값 입력
   - Vercel 대시보드에 프로덕션 값 설정

3. **로컬 테스트**
   ```bash
   npm run dev
   ```

4. **Vercel 배포**
   ```bash
   npm run deploy  # preview
   vercel --prod   # production
   ```

## 참고 자료

- CLAUDE.md: 프로젝트 아키텍처 요구사항
- Vite 공식 문서: https://vitejs.dev/
- Vercel 함수: https://vercel.com/docs/functions
- Anthropic Claude API: https://docs.anthropic.com/
