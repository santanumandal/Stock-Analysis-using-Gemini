
import React, { useState, useCallback, useMemo } from 'react';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Newspaper, 
  Info, 
  HelpCircle, 
  Activity, 
  ArrowRight, 
  ExternalLink, 
  BarChart as BarChartIcon,
  ShieldCheck,
  Calendar,
  Layers,
  Zap,
  DollarSign
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { analyzeStock } from './geminiService';
import { StockAnalysis, AnalysisStatus } from './types';

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 animate-pulse">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
    <p className="text-gray-600 font-medium">Deep-diving into financial reports and news...</p>
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
    <h1 className="text-4xl md:text-5xl font-extrabold mb-4 uppercase tracking-tight">BharatStock Insight</h1>
    <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
      Your intelligent companion for Indian Markets. We break down balance sheets and market trends into clear, actionable human insights.
    </p>
    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
      <span className="bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm flex items-center gap-2">
        <Layers size={16} /> Industry PE
      </span>
      <span className="bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm flex items-center gap-2">
        <Zap size={16} /> Quality Scores
      </span>
      <span className="bg-white/20 px-4 py-2 rounded-full border border-white/30 backdrop-blur-sm flex items-center gap-2">
        <DollarSign size={16} /> Dividend Tracking
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
      setError('Analysis encountered an issue. Check the ticker or try again shortly.');
      setStatus(AnalysisStatus.ERROR);
    }
  }, [ticker]);

  const chartData = useMemo(() => {
    if (!analysis) return null;
    const parseVal = (str: any) => {
      if (typeof str === 'number') return str;
      const cleaned = str.replace(/[^\d.]/g, '');
      return parseFloat(cleaned) || 0;
    };
    const mainPE = analysis.metrics.find(m => m.label.toLowerCase().includes('p/e'))?.value || '0';
    return [
      { name: analysis.ticker, pe: parseVal(mainPE), isMain: true },
      ...analysis.peerComparison.map(peer => ({
        name: peer.peerName,
        pe: parseVal(peer.peRatio),
        isMain: false
      }))
    ];
  }, [analysis]);

  return (
    <div className="min-h-screen pb-20 px-4 md:px-8 bg-[#fdfdfd]">
      <nav className="max-w-7xl mx-auto py-6 flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <TrendingUp size={24} />
          </div>
          <span className="text-2xl font-black text-gray-900 tracking-tighter">BHARAT<span className="text-blue-600">STOCK</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
          <a href="#" className="hover:text-blue-600 transition">Screener</a>
          <a href="#" className="hover:text-blue-600 transition">Learn</a>
          <button className="bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 transition">Premium</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          <input
            type="text"
            placeholder="Type Stock Name (e.g. RELIANCE, ZOMATO)..."
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            className="w-full pl-16 pr-40 py-6 bg-white shadow-2xl shadow-blue-100 rounded-3xl border border-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all text-xl font-bold placeholder:text-gray-300"
          />
          <button
            type="submit"
            disabled={status === AnalysisStatus.LOADING}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-black hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50"
          >
            ANALYZE
          </button>
        </form>
      </div>

      <div className="max-w-7xl mx-auto">
        {status === AnalysisStatus.IDLE && <WelcomeHero />}
        {status === AnalysisStatus.LOADING && <LoadingState />}
        {status === AnalysisStatus.ERROR && <ErrorState message={error} />}

        {status === AnalysisStatus.SUCCESS && analysis && (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            
            {/* Essential Stock Info */}
            <header className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <h1 className="text-5xl font-black text-gray-900 tracking-tight">{analysis.companyName}</h1>
                  <span className="bg-gray-100 text-gray-600 text-sm font-black px-4 py-1.5 rounded-full uppercase">{analysis.ticker}</span>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <p className="text-2xl font-bold text-blue-600">{analysis.currentPrice}</p>
                  <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                  <div className="flex items-center gap-2 text-gray-500 font-bold uppercase text-xs tracking-widest">
                    <Layers size={14} /> {analysis.industry}
                  </div>
                  <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-black">
                    IND. P/E: {analysis.industryPE}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1">Market Sentiment</p>
                    <div className="flex items-center gap-2 text-green-600 font-black text-lg">
                      <Zap size={20} fill="currentColor" /> STRENGTH
                    </div>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Side: Metrics & Charts */}
              <div className="lg:col-span-8 space-y-12">
                
                {/* Quality Factors Grid */}
                <section>
                  <div className="flex items-center gap-3 mb-6">
                    <ShieldCheck className="text-blue-600" size={24} />
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Quality Assessment</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {analysis.qualityFactors.map((q, idx) => (
                      <div key={idx} className="bg-white p-7 rounded-3xl border border-gray-100 hover:shadow-xl hover:shadow-blue-50 transition-all group">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-black text-gray-900 uppercase tracking-wide text-sm">{q.factor}</h4>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            q.status === 'Good' ? 'bg-green-100 text-green-700' : 
                            q.status === 'Risk' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            {q.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">{q.description}</p>
                        <div className="bg-gray-50 p-4 rounded-2xl group-hover:bg-blue-50 transition-colors">
                          <p className="text-[10px] font-black text-blue-600 uppercase mb-1">Impact Indicator</p>
                          <p className="text-xs font-bold text-gray-700">{q.indicator}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Quarterly Performance Chart */}
                <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <BarChartIcon className="text-blue-600" size={24} />
                      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Sales vs Profit Growth</h2>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analysis.quarterlyHistory}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748b' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#2563eb" fillOpacity={1} fill="url(#colorSales)" strokeWidth={3} name="Total Sales" />
                        <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={3} name="Net Profit" />
                        <Legend verticalAlign="top" height={36}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="mt-6 text-xs text-gray-400 font-bold italic text-center">Data represents relative performance over the last four reporting quarters.</p>
                </section>

                {/* Standard Metrics Grid */}
                <section>
                   <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      {analysis.metrics.map((m, i) => (
                        <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex flex-col justify-between">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">{m.label}</p>
                          <p className="text-2xl font-black text-gray-900 mb-2">{m.value}</p>
                          <div className="bg-blue-50/50 p-3 rounded-xl">
                            <p className="text-[10px] text-blue-800 font-bold leading-tight">{m.explanation}</p>
                          </div>
                        </div>
                      ))}
                   </div>
                </section>

                {/* Peer Comparison Chart */}
                <section className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                  <h2 className="text-xl font-black mb-8 flex items-center gap-3">
                    <Layers className="text-blue-600" size={20} /> Valuations vs Peers
                  </h2>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData || []} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 800 }} width={100} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} />
                        <Bar dataKey="pe" radius={[0, 8, 8, 0]} barSize={32}>
                          {(chartData || []).map((entry, index) => (
                            <Cell key={index} fill={entry.isMain ? '#2563eb' : '#cbd5e1'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              {/* Right Side: Sidebar */}
              <div className="lg:col-span-4 space-y-10">
                
                {/* Recommendations */}
                <section className="bg-gray-900 p-8 rounded-[40px] text-white shadow-2xl shadow-blue-200">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4">Short Term Strategy</h3>
                      <p className="text-sm font-medium leading-relaxed text-gray-300">{analysis.shortTermRecommendation}</p>
                    </div>
                    <div className="h-px bg-white/10"></div>
                    <div>
                      <h3 className="text-xs font-black text-green-400 uppercase tracking-widest mb-4">Wealth Builder (Long Term)</h3>
                      <p className="text-sm font-medium leading-relaxed text-gray-300">{analysis.longTermRecommendation}</p>
                    </div>
                  </div>
                </section>

                {/* Dividend History */}
                <section className="bg-white p-8 rounded-[40px] border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="text-blue-600" size={20} />
                    <h2 className="text-xl font-black text-gray-900 tracking-tight">Dividends</h2>
                  </div>
                  <div className="space-y-4">
                    {analysis.dividendHistory.map((div, i) => (
                      <div key={i} className="flex items-center justify-between group">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase">{div.date}</span>
                          <span className="text-sm font-bold text-gray-800">{div.type}</span>
                        </div>
                        <div className="bg-gray-50 px-4 py-2 rounded-xl group-hover:bg-green-50 transition-colors">
                           <span className="text-sm font-black text-gray-900">₹{div.amount}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* News Section */}
                <section className="space-y-4">
                  <h2 className="text-xl font-black flex items-center gap-3 px-2">
                    <Newspaper size={20} className="text-blue-600" /> Buzzing Now
                  </h2>
                  <div className="space-y-4">
                    {analysis.latestNews.map((n, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-gray-50 shadow-sm hover:border-blue-200 transition-all">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[8px] font-black uppercase text-gray-400">{n.source}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            n.sentiment === 'positive' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {n.sentiment}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-gray-900 leading-tight">{n.headline}</h4>
                      </div>
                    ))}
                  </div>
                </section>

                 {/* Historical Performance Context */}
                 <section className="bg-blue-600 p-8 rounded-[40px] text-white">
                    <h2 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Historical Context</h2>
                    <p className="text-sm leading-relaxed font-bold italic opacity-90">
                      "{analysis.historicalPerformance}"
                    </p>
                 </section>

                {/* Sources */}
                {analysis.sources.length > 0 && (
                  <section className="px-2">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase mb-3">Verified Research Links</h3>
                    <div className="flex flex-wrap gap-2">
                      {analysis.sources.map((s, i) => (
                        <a 
                          key={i} 
                          href={s.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-white border border-gray-100 px-3 py-1.5 rounded-xl text-[10px] font-bold text-blue-600 flex items-center gap-1.5 hover:bg-blue-600 hover:text-white transition-all"
                        >
                          {s.title.slice(0, 15)}... <ExternalLink size={10} />
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

      <footer className="mt-20 border-t border-gray-100 pt-10 text-center text-gray-400 text-xs font-bold">
        <p>&copy; 2025 BHARATSTOCK INSIGHT. AI-POWERED ANALYSIS FOR EDUCATIONAL PURPOSES ONLY.</p>
      </footer>
    </div>
  );
};

export default App;
