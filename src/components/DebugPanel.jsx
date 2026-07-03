import { useState, useEffect } from 'react'
import './DebugPanel.css'

export default function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false)
  const [apiStatus, setApiStatus] = useState(null)
  const [apiUrl, setApiUrl] = useState('')

  useEffect(() => {
    // 마운트 시 API URL 확인
    const url = `${process.env.NODE_ENV === 'development' ? '' : 'http://localhost:3001'}/api/health`
    setApiUrl(url)

    // 헬스 체크 자동 실행
    checkApiHealth()
    const interval = setInterval(checkApiHealth, 5000)
    return () => clearInterval(interval)
  }, [])

  const checkApiHealth = async () => {
    try {
      const url = `${process.env.NODE_ENV === 'development' ? '' : 'http://localhost:3001'}/api/health`
      const response = await fetch(url)
      const data = await response.json()

      setApiStatus({
        connected: response.ok,
        statusCode: response.status,
        data: data,
        timestamp: new Date().toLocaleTimeString('ko-KR')
      })
    } catch (error) {
      setApiStatus({
        connected: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString('ko-KR')
      })
    }
  }

  const testConnection = async () => {
    try {
      const response = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'connection', timestamp: new Date().toISOString() })
      })
      const data = await response.json()

      setApiStatus({
        connected: response.ok,
        statusCode: response.status,
        data: data,
        timestamp: new Date().toLocaleTimeString('ko-KR'),
        testRun: true
      })
    } catch (error) {
      setApiStatus({
        connected: false,
        error: error.message,
        timestamp: new Date().toLocaleTimeString('ko-KR'),
        testRun: true
      })
    }
  }

  return (
    <div className="debug-panel">
      <button
        className="debug-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title="개발자 디버그 패널"
      >
        🔧
      </button>

      {isOpen && (
        <div className="debug-content">
          <h4>🔍 네트워크 디버그</h4>

          <div className="debug-section">
            <label>API URL:</label>
            <code>{apiUrl || '/api'}</code>
          </div>

          <div className="debug-section">
            <label>상태:</label>
            {apiStatus ? (
              <div className={`status-box ${apiStatus.connected ? 'success' : 'error'}`}>
                <p>
                  {apiStatus.connected ? '✅ 연결됨' : '❌ 연결 실패'}
                  {apiStatus.statusCode && ` (${apiStatus.statusCode})`}
                </p>
                {apiStatus.error && <p className="error-msg">{apiStatus.error}</p>}
                <p className="timestamp">{apiStatus.timestamp}</p>
              </div>
            ) : (
              <p>확인 중...</p>
            )}
          </div>

          <div className="debug-actions">
            <button onClick={checkApiHealth} className="btn-test">
              헬스 체크
            </button>
            <button onClick={testConnection} className="btn-test">
              연결 테스트
            </button>
          </div>

          <details className="debug-details">
            <summary>상세 정보</summary>
            <pre>{JSON.stringify(apiStatus, null, 2)}</pre>
          </details>

          <div className="debug-tips">
            <h5>💡 문제 해결 팁</h5>
            <ul>
              <li>❌ 연결 실패: <code>npm run server:dev</code>가 실행 중인지 확인</li>
              <li>📍 포트: localhost:3001에서 API 서버가 실행 중인지 확인</li>
              <li>🔑 API 키: .env 파일의 ANTHROPIC_API_KEY 설정 확인</li>
              <li>🌐 CORS: 브라우저 개발자 도구 콘솔에서 CORS 에러 확인</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
