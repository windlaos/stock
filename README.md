# 🚀 AI 주식 추천 시스템 (MVP)

Anthropic Claude API와 Supabase를 연동한 AI 기반 주식 투자 분석 시스템입니다. Vercel 서버리스 인프라에 최적화된 MVP입니다.

## 📋 프로젝트 구조

```
stock-recommendation-mvp/
├── index.html                 # HTML 진입점
├── package.json              # 의존성 정의
├── vite.config.js            # Vite 빌드 설정
├── vercel.json               # Vercel 배포 설정
├── .env.example              # 환경변수 템플릿
├── .gitignore               # Git 제외 파일
│
├── src/                      # 프론트엔드 소스
│   ├── main.jsx             # React 엔트리포인트
│   ├── App.jsx              # 최상위 컴포넌트
│   ├── App.css              # 앱 스타일
│   ├── index.css            # 전역 스타일 & 디자인 토큰
│   │
│   ├── pages/
│   │   ├── StockRecommendation.jsx    # 주요 페이지
│   │   └── StockRecommendation.css
│   │
│   ├── components/
│   │   ├── StockInput.jsx             # 종목 입력 폼
│   │   ├── StockInput.css
│   │   ├── AnalysisResult.jsx         # 분석 결과 표시
│   │   └── AnalysisResult.css
│   │
│   └── services/
│       └── stockService.js             # API 클라이언트
│
└── api/                      # Vercel 서버리스 함수
    └── analyze.js            # Claude API 연동 분석 엔드포인트
```

## 🔐 보안 & 컴플라이언스

### API 키 관리 (필수)
```bash
# 1. .env 파일 생성 (로컬 개발용)
cp .env.example .env

# 2. 로컬 환경변수 설정
# .env 파일에 아래 내용 추가:
ANTHROPIC_API_KEY=sk-ant-...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Vercel 환경변수 설정
```bash
# 프로덕션 환경에서는 Vercel Dashboard에서 설정:
# Settings > Environment Variables
# - ANTHROPIC_API_KEY (클라이언트 사이드에서 접근 불가)
# - VITE_SUPABASE_URL (VITE_로 시작하면 클라이언트에 노출됨)
# - VITE_SUPABASE_ANON_KEY
```

## 🚀 초기 설정 & 실행

### 1. 프로젝트 초기화
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev
# → http://localhost:5173 에서 앱 확인
```

### 2. 로컬 개발 (필수 선행)
```bash
# 모든 기능 검증 완료 후에만 배포
npm run build      # 빌드 테스트
npm run preview    # 프로덕션 빌드 미리보기
```

### 3. Vercel에 배포
```bash
# Vercel 프로젝트 연결
vercel link

# 프리뷰 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 📌 아키텍처 및 제약 조건

### 서버리스 타임아웃 관리
- **Vercel 무료 티어 제한:** 함수 실행 시간 10초
- **현재 설정:** 최대 30초 (Hobby 플랜)
- **최적화 전략:**
  - 무거운 계산은 캐싱 활용
  - Supabase 조회 최소화
  - LLM 요청을 비동기로 처리

### 데이터 구조
```
클라이언트 (React)
    ↓ (POST /api/analyze)
Vercel 함수 (Node.js)
    ↓ (API 호출)
Anthropic Claude API
    ↓ (분석 결과)
클라이언트 (JSON 응답)
```

## 🛠️ 주요 개발 명령어

```bash
# 로컬 개발
npm run dev         # 핫 리로드로 개발 서버 실행

# 빌드 & 배포
npm run build       # 프로덕션 빌드
npm run preview     # 빌드 결과 로컬 미리보기
npm run deploy      # Vercel 배포

# 환경변수 관리 (Vercel)
vercel env pull    # 원격 환경변수 다운로드
vercel env push    # 로컬 환경변수 업로드
```

## 📊 현재 지원 종목

MVP 단계에서는 다음 3개 종목만 지원합니다:
- `AAPL` - Apple Inc.
- `GOOGL` - Alphabet Inc.
- `MSFT` - Microsoft Corporation

실제 시장 데이터는 Supabase에서 조회하도록 확장할 예정입니다.

## ⚠️ 면책 조항

이 애플리케이션은 **교육 목적**으로만 제공됩니다. 분석 결과는 실제 투자 결정의 기초로 사용할 수 없습니다.

## 🔄 다음 마일스톤

- [ ] Supabase 데이터베이스 통합 (주가 데이터 적재)
- [ ] 사용자 인증 및 포트폴리오 저장
- [ ] 실시간 주가 업데이트
- [ ] 고급 분석 지표 (RSI, MACD 등)
- [ ] 모바일 반응형 디자인 최적화
