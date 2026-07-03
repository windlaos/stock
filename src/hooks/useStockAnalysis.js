// 주식 분석 커스텀 훅

import { useState, useCallback } from 'react';
import { analyzeStock } from '../services/stockService';
import { validateTicker } from '../utils/validators';

export function useStockAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ticker, setTicker] = useState('');

  const analyze = useCallback(async (inputTicker) => {
    setError(null);
    setLoading(true);

    try {
      const validTicker = validateTicker(inputTicker);
      setTicker(validTicker);

      const result = await analyzeStock(validTicker);
      setAnalysis(result);
      return result;
    } catch (err) {
      const errorMessage = err.message || '분석 중 오류가 발생했습니다';
      setError(errorMessage);
      setAnalysis(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setAnalysis(null);
    setError(null);
    setTicker('');
  }, []);

  return {
    analysis,
    loading,
    error,
    ticker,
    analyze,
    reset,
  };
}
