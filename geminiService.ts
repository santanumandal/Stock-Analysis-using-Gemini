
import { GoogleGenAI, Type } from "@google/genai";
import { StockAnalysis } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const STOCK_ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    ticker: { type: Type.STRING },
    companyName: { type: Type.STRING },
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
    "ticker", "companyName", "currentPrice", "metrics", "peerComparison", 
    "historicalPerformance", "latestNews", "shortTermRecommendation", 
    "longTermRecommendation", "marketTrendSummary"
  ]
};

export async function analyzeStock(ticker: string): Promise<StockAnalysis> {
  const prompt = `Analyze the Indian stock "${ticker}" (NSE/BSE). Provide a detailed, beginner-friendly summary.
  Include:
  1. Key metrics (P/E, Market Cap, PB, ROE, etc.) and explain what they mean for a novice.
  2. Peer comparison with at least 2 competitors in the Indian market.
  3. Historical performance over the last 1-5 years.
  4. Latest news from the last month and how it affects the stock/trend.
  5. Clear, fact-based short-term and long-term recommendations.
  Use simple language. No complex economic jargon without explanation.`;

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
  
  // Extract grounding URLs
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title || 'Source',
      uri: chunk.web.uri
    }));

  return { ...data, sources };
}
