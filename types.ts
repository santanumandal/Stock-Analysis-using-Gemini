
export interface Metric {
  label: string;
  value: string | number;
  explanation: string;
  isPositive?: boolean;
}

export interface PeerComparison {
  peerName: string;
  stockPrice: string;
  peRatio: string;
  marketCap: string;
}

export interface NewsItem {
  headline: string;
  source: string;
  summary: string;
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface StockAnalysis {
  ticker: string;
  companyName: string;
  currentPrice: string;
  metrics: Metric[];
  peerComparison: PeerComparison[];
  historicalPerformance: string;
  latestNews: NewsItem[];
  shortTermRecommendation: string;
  longTermRecommendation: string;
  marketTrendSummary: string;
  sources: { title: string; uri: string }[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
