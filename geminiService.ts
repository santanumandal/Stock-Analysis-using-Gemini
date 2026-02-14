
import { GoogleGenAI, Type } from "@google/genai";
import { StockAnalysis } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const STOCK_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ticker: { type: Type.STRING },
    companyName: { type: Type.STRING },
    industry: { type: Type.STRING },
    industryPE: { type: Type.STRING },
    currentPrice: { type: Type.STRING },
    metrics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          value: { type: Type.STRING },
          explanation: { type: Type.STRING },
          isPositive: { type: Type.BOOLEAN }
        },
        required: ["label", "value", "explanation"]
      }
    },
    peerComparison: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          peerName: { type: Type.STRING },
          stockPrice: { type: Type.STRING },
          peRatio: { type: Type.STRING },
          marketCap: { type: Type.STRING }
        },
        required: ["peerName", "stockPrice", "peRatio", "marketCap"]
      }
    },
    quarterlyHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING },
          sales: { type: Type.NUMBER },
          profit: { type: Type.NUMBER }
        },
        required: ["period", "sales", "profit"]
      }
    },
    dividendHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          amount: { type: Type.STRING },
          type: { type: Type.STRING }
        },
        required: ["date", "amount", "type"]
      }
    },
    qualityFactors: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          factor: { type: Type.STRING },
          description: { type: Type.STRING },
          indicator: { type: Type.STRING },
          status: { type: Type.STRING }
        },
        required: ["factor", "description", "indicator", "status"]
      }
    },
    historicalPerformance: { type: Type.STRING },
    latestNews: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
          source: { type: Type.STRING },
          summary: { type: Type.STRING },
          sentiment: { type: Type.STRING }
        },
        required: ["headline", "source", "summary", "sentiment"]
      }
    },
    shortTermRecommendation: { type: Type.STRING },
    longTermRecommendation: { type: Type.STRING },
    marketTrendSummary: { type: Type.STRING }
  },
  required: [
    "ticker", "companyName", "industry", "industryPE", "currentPrice", "metrics", 
    "peerComparison", "quarterlyHistory", "dividendHistory", "qualityFactors",
    "historicalPerformance", "latestNews", "shortTermRecommendation", 
    "longTermRecommendation", "marketTrendSummary"
  ]
};

export async function analyzeStock(ticker: string): Promise<StockAnalysis> {
  const prompt = `Analyze the Indian stock "${ticker}" (NSE/BSE). Provide a detailed, beginner-friendly summary.
  Include:
  1. Industry name and Industry P/E ratio.
  2. Metrics: P/E, Debt to Equity, ROE (Return on Equity), Price to Book (P/B), Market Cap.
  3. Quarterly Sales vs Profit history for the last 4 quarters (provide numeric values for Sales and Profit).
  4. Dividend history (last 3-4 entries with dates and types like Final/Interim).
  5. Quality Key Factors: Mention 3-4 core strengths or risks (e.g., Management, Cash Flow, Competitive Moat) with a brief explanation of what it indicates.
  6. Peer comparison with at least 2 competitors.
  7. Historical performance, news, and fact-based short/long term recommendations.
  Explain terms simply for someone who doesn't understand economics.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: STOCK_ANALYSIS_SCHEMA,
    },
  });

  const rawJson = response.text || '{}';
  const data: StockAnalysis = JSON.parse(rawJson);
  
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title || 'Source',
      uri: chunk.web.uri
    }));

  return { ...data, sources };
}
