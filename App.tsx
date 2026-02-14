
import React, { useState, useCallback } from 'react';
import { Search, TrendingUp, BarChart3, Newspaper, Info, HelpCircle, Activity, ArrowRight, ExternalLink } from 'lucide-react';
import { analyzeStock } from './geminiService';
import { StockAnalysis, AnalysisStatus } from './types';

// Components defined outside for better performance
const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-pulse">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-gray-600 font-medium">Analyzing market data and fetching latest news...</p>
    <p className="text-gray-400 text-sm mt-2">Connecting with Google Search for real-time accuracy</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
  <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-start gap-3 mt-8">
    <div className="mt-1"><Activity size={20} /></div>
    <div>
      <h3 className="font-bold">Analysis Failed</h3>
      <p className="text-sm">{message}</p>
    </div>
  </div>
);

const WelcomeHero: React.FC = () => (
  <div className="text-center py-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl text-white mb-12 shadow-xl px-4">
    <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Master the Indian Stock Market</h1>
    <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
      Smarter insights for every investor. We decode complex financial metrics into simple, actionable summaries powered by AI.
    </p>
    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
      <span className="bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm flex items-center gap-2">
        <Activity size={16} /> Real-time Data
      </span>
      <span className="bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm flex items-center gap-2">
        <HelpCircle size={16} /> Beginner Friendly
      </span>
      <span className="bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm flex items-center gap-2">
        <Newspaper size={16} /> News Integrated
      </span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [analysis, setAnalysis] = useState<StockAnalysis | null>(null);
  const [error, setError] = useState('');

  const handleSearch = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticker.trim()) return;

    setStatus(AnalysisStatus.LOADING);
    setError('');
    
    try {
      const result = await analyzeStock(ticker);
      setAnalysis(result);
      setStatus(AnalysisStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError('Could not analyze the stock. Please ensure the ticker (e.g., RELIANCE, HDFCBANK) is correct.');
      setStatus(AnalysisStatus.ERROR);
    }
  }, [ticker]);

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8">
      {/* Header */}
      <nav className="max-w-6xl mx-auto py-6 flex items-center justify-between border-b mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <TrendingUp size={24} />
          </div>
          <span className="text-xl font-bold text-gray-800 tracking-tight">BharatStock <span className="text-blue-600">Insight</span></span>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
          <a href="#" className="hover:text-blue-600">Market Overview</a>
          <a href="#" className="hover:text-blue-600">Educational Hub</a>
          <a href="#" className="bg-blue-50 text-blue-600 px-4 py-2 rounded-full hover:bg-blue-100 transition">Pro Features</a>
        </div>
      </nav>

      {/* Search Bar */}
      <div className="max-w-3xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={24} />
          <input
            type="text"
            placeholder="Search NSE/BSE Stock (e.g. RELIANCE, TCS, ZOMATO)..."
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full pl-14 pr-32 py-5 bg-white border-2 border-transparent shadow-lg rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg font-medium"
          />
          <button
            type="submit"
            disabled={status === AnalysisStatus.LOADING}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            Analyze
          </button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 justify-center text-xs text-gray-500">
          <span>Popular:</span>
          {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATASTEEL'].map(t => (
            <button key={t} onClick={() => {setTicker(t); handleSearch();}} className="hover:text-blue-600 transition underline underline-offset-2">{t}</button>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {status === AnalysisStatus.IDLE && <WelcomeHero />}
        
        {status === AnalysisStatus.LOADING && <LoadingState />}
        
        {status === AnalysisStatus.ERROR && <ErrorState message={error} />}

        {status === AnalysisStatus.SUCCESS && analysis && (
          <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black text-gray-900">{analysis.companyName}</h1>
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase">{analysis.ticker}</span>
                </div>
                <p className="text-gray-500 font-medium">Current Market Price: <span className="text-gray-900 font-bold">{analysis.currentPrice}</span></p>
              </div>
              <div className="flex gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-1">Overall Sentiment</p>
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold">
                    <Activity size={16} /> Bullish Trend
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Analysis Column */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Metrics Grid */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="text-blue-600" size={20} />
                    <h2 className="text-xl font-bold text-gray-800">Key Metrics Explained</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {analysis.metrics.map((m, idx) => (
                      <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{m.label}</p>
                          <div className={`p-1 rounded ${m.isPositive ? 'bg-green-100' : 'bg-red-100'}`}>
                            <TrendingUp size={14} className={m.isPositive ? 'text-green-600' : 'text-red-600'} />
                          </div>
                        </div>
                        <p className="text-2xl font-black text-gray-900 mb-2">{m.value}</p>
                        <div className="flex items-start gap-2 bg-blue-50/50 p-3 rounded-xl">
                          <Info size={16} className="text-blue-500 mt-1 shrink-0" />
                          <p className="text-xs text-blue-800 leading-relaxed font-medium">{m.explanation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Peer Comparison */}
                <section className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6">
                    <HelpCircle className="text-blue-600" size={20} />
                    <h2 className="text-xl font-bold text-gray-800">Market Position vs Peers</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-widest">Company</th>
                          <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-widest text-center">Price</th>
                          <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-widest text-center">P/E Ratio</th>
                          <th className="pb-4 font-bold text-gray-400 text-xs uppercase tracking-widest text-right">Market Cap</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {analysis.peerComparison.map((peer, i) => (
                          <tr key={i} className="group">
                            <td className="py-4 font-bold text-gray-800">{peer.peerName}</td>
                            <td className="py-4 text-center font-medium">{peer.stockPrice}</td>
                            <td className="py-4 text-center">
                              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-bold">{peer.peRatio}</span>
                            </td>
                            <td className="py-4 text-right font-medium text-gray-600">{peer.marketCap}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Historical Performance */}
                <section className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-3xl text-white">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Activity size={20} className="text-blue-400" /> Historical Performance
                  </h2>
                  <p className="text-gray-300 leading-relaxed text-sm md:text-base">
                    {analysis.historicalPerformance}
                  </p>
                </section>
              </div>

              {/* Sidebar: News & Recommendations */}
              <div className="space-y-8">
                {/* Recommendations */}
                <section className="bg-white p-6 rounded-3xl shadow-lg border-t-4 border-blue-600 flex flex-col gap-6">
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Short Term Outlook (1-3 Mo)</h3>
                    <div className="bg-blue-50 p-4 rounded-2xl">
                      <p className="text-sm text-blue-900 font-medium leading-relaxed">{analysis.shortTermRecommendation}</p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-100"></div>
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Long Term Outlook (1 yr+)</h3>
                    <div className="bg-indigo-50 p-4 rounded-2xl">
                      <p className="text-sm text-indigo-900 font-medium leading-relaxed">{analysis.longTermRecommendation}</p>
                    </div>
                  </div>
                </section>

                {/* News Feed */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <Newspaper className="text-blue-600" size={20} />
                    <h2 className="text-xl font-bold text-gray-800">Latest Developments</h2>
                  </div>
                  <div className="space-y-4">
                    {analysis.latestNews.map((news, i) => (
                      <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                            news.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 
                            news.sentiment === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {news.sentiment}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">{news.source}</span>
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm mb-2 leading-tight">{news.headline}</h4>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">{news.summary}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-xs text-gray-600 italic">"{analysis.marketTrendSummary}"</p>
                  </div>
                </section>

                {/* Sources Section */}
                {analysis.sources.length > 0 && (
                  <section className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                     <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Verified Sources</h3>
                     <div className="space-y-2">
                        {analysis.sources.map((source, i) => (
                          <a 
                            key={i} 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between text-xs text-blue-600 hover:text-blue-800 transition py-1"
                          >
                            <span className="truncate pr-4">{source.title}</span>
                            <ExternalLink size={12} className="shrink-0" />
                          </a>
                        ))}
                     </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating CTA for feedback/share */}
      {status === AnalysisStatus.SUCCESS && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white px-6 py-4 rounded-full shadow-2xl border border-gray-100 flex items-center gap-6 z-50">
          <button className="text-sm font-bold text-gray-700 hover:text-blue-600 flex items-center gap-2">
            <BarChart3 size={18} /> Download PDF
          </button>
          <div className="w-px h-6 bg-gray-200"></div>
          <button className="text-sm font-bold text-blue-600 flex items-center gap-2">
            Share Insights <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
