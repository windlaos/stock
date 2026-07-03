// 에러 경계 컴포넌트

import { useState, useEffect } from 'react';

export function ErrorBoundary({ children, fallback }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error('에러 발생:', event.error);
      setError(event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      fallback || (
        <div className="error-container">
          <h2>오류가 발생했습니다</h2>
          <p>{error?.message || '알 수 없는 오류'}</p>
          <button onClick={() => setHasError(false)}>다시 시도</button>
          <style>{`
            .error-container {
              padding: 20px;
              background-color: #fee;
              border: 1px solid #fcc;
              border-radius: 4px;
              color: #c33;
            }

            .error-container button {
              margin-top: 10px;
              padding: 8px 16px;
              background-color: #3b82f6;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }

            .error-container button:hover {
              background-color: #2563eb;
            }
          `}</style>
        </div>
      )
    );
  }

  return children;
}
