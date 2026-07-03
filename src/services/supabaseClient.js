// Supabase 클라이언트 초기화 (필요시 활성화)
// 주의: VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY가 환경 변수에 설정되어야 함

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../constants/config';

let supabase = null;

export function initializeSupabase() {
  if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
    console.warn('Supabase 설정이 없습니다. 로컬 mock 데이터를 사용합니다.');
    return null;
  }

  try {
    supabase = createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY);
    console.log('Supabase 클라이언트 초기화 완료');
    return supabase;
  } catch (error) {
    console.error('Supabase 초기화 실패:', error);
    return null;
  }
}

export function getSupabase() {
  if (!supabase) {
    return initializeSupabase();
  }
  return supabase;
}

// 주식 데이터 조회 (Supabase)
export async function fetchStockData(ticker) {
  const client = getSupabase();
  if (!client) {
    console.log('Mock 데이터 모드: ticker =', ticker);
    return null; // Mock 데이터 사용
  }

  try {
    const { data, error } = await client
      .from('stocks')
      .select('*')
      .eq('ticker', ticker.toUpperCase())
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase 데이터 조회 실패:', error);
    return null;
  }
}

// 분석 이력 저장 (Supabase)
export async function saveAnalysisHistory(analysis) {
  const client = getSupabase();
  if (!client) {
    console.log('Mock 모드: 분석 이력 저장 스킵');
    return null;
  }

  try {
    const { data, error } = await client
      .from('analysis_history')
      .insert([{
        ticker: analysis.ticker,
        recommendation: analysis.recommendation,
        confidence: analysis.confidence,
        created_at: new Date().toISOString(),
        analysis_data: analysis,
      }]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('분석 이력 저장 실패:', error);
    return null;
  }
}
