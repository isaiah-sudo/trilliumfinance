'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles, Newspaper, X, Plus, Search, Check, RefreshCw, Layers, TrendingUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { getDailyThreeNews, NewsArticle } from '@/app/actions/news';
import { StockInfoDrawer } from '@/components/ui/StockInfoDrawer';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  attachedNews?: NewsArticle;
}

function TrilliumLogoMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="330 330 320 320"
      aria-hidden="true"
      className={`${className} transition-all duration-300 [&_path]:fill-current`}
    >
      <path d="M460 478v2c-1.65 1.5-3.404 2.82-5.176 4.172-4.331 4.34-5.255 8.855-5.262 14.828.145 5.502.343 9.008 4.438 13 7.41 5.527 13.79 6.867 23 6 7.996-2.028 14.412-6.118 19-13l1 10h-2l-.062 3.125c-1.96 15.159-14.199 28.396-25.594 37.46-27.369 20.233-63.328 23.847-96.281 19.29A148.4 148.4 0 0 1 338 565c1.454-17.931 17.3-38.924 29-52h2c.26-.584.52-1.168.79-1.77 8.19-15.088 30.315-26.191 46.21-31.105 7.189-2.028 14.545-3.128 21.938-4.125l3.158-.453c6.991-.823 12.347-.118 18.904 2.453" />
      <path d="M579.281 485.082c9.715 4.91 18.383 10.933 26.719 17.918l2.582 2.02c13.975 11.446 24.002 29.217 32.293 44.918.49.924.978 1.85 1.482 2.802l1.385 2.662 1.246 2.39c.949 2.07 1.546 3.985 2.012 6.208-28.394 16.311-70.951 15.934-101.937 8.188-16.248-4.75-30.312-11.896-42.442-23.672-2.571-2.553-2.571-2.553-5.422-4.703C495 542 495 542 494.375 539.75c.78-3.429 2.377-5.721 4.313-8.625C501.186 527.08 503 522.801 503 518l3.727.105q2.448.043 4.898.082l2.45.077c7.394.09 12.492-2.125 17.925-7.264 4.145-5.574 3.869-12.36 3-19-2.09-5.383-5.933-9.049-10-13v-2c16.74-5.58 38.982.717 54.281 8.082" />
      <path d="M489 338c4.223 1.646 7.072 4.77 10.188 7.938l1.745 1.763c5.046 5.162 9.65 10.589 14.067 16.299.737.92 1.475 1.84 2.234 2.79C530.117 383.27 538.371 401.614 543 422l.688 2.953c1.464 7.609 1.515 15.193 1.562 22.922l.028 3.28c-.023 5.672-.357 10.494-2.278 15.845l-6.8 1.36q-3.498.7-6.993 1.406l-1.982.399-5.71 1.151A298 298 0 0 1 512 473l2-1c.428-10.103.238-18.735-6-27v-2l-1.687-.812C504 441 504 441 501.5 439.375c-2.609-1.696-2.609-1.696-6.5-1.375v-2c-7.266 1.498-13.166 3.113-18 9-3.206 5.088-5.144 10.055-5.098 16.11l.01 2.285.026 2.355.013 2.402q.02 2.925.049 5.848c-5.807-.725-11.305-2.028-16.951-3.54-3.496-.908-6.826-1.572-10.428-1.897L441 468c-7.162-10.742-4.002-32.947-1.812-45.125.531-2.652 1.155-5.247 1.812-7.875l.488-1.955c7.427-28.739 24.967-51.418 46.184-71.557 1.55-1.404 1.55-1.404 1.328-3.488" />
      <path d="m565.063 583.188 3.2.212q3.872.264 7.737.6c-3.421 5.146-7.795 7.561-13.062 10.5l-2.597 1.47C535.295 610 535.295 610 523 610l-1 2c-1.898.379-1.898.379-4.375.563l-2.79.218L512 613l-2.336.281c-30.437 3.546-60.78-1.569-87.664-16.281a700 700 0 0 0-6-3v-2l-1.766-.344c-2.418-.71-3.96-1.669-5.984-3.156l-1.86-1.344L405 586v-1c25.63-3.041 25.63-3.041 36 4 25.273 13.816 57.357 13.511 84.5 6.125 10.636-3.259 10.636-3.259 20.433-8.406 6.492-4.164 11.576-4.194 19.13-3.532" />
    </svg>
  );
}

const QUICK_PROMPTS = [
  { label: '📊 Analyze $NVDA', query: 'Provide a detailed technical and valuation breakdown for $NVDA.' },
  { label: '📈 $AAPL vs $MSFT', query: 'Compare $AAPL and $MSFT financials, growth rates, and competitive moats.' },
  { label: '🏛️ Fed Rate Forecast', query: 'How do upcoming Federal Reserve interest rate decisions affect stock valuations?' },
  { label: '🎯 Options vs Stocks', query: 'Explain call options vs owning stock for a beginning trader with risk mitigation tips.' },
  { label: '⚡ $TSLA Valuation', query: 'Analyze $TSLA current valuation, margins, and key market catalysts.' },
];

function renderFormattedTokens(text: string, onSelectTicker?: (ticker: string) => void) {
  const parts = text.split(/(\*\*.*?\*\*|\$[A-Z]{1,5}\b)/g);
  return parts.map((part, index) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-slate-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('$') && /^\$[A-Z]{1,5}$/.test(part)) {
      const ticker = part.slice(1);
      return (
        <button
          key={index}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectTicker?.(ticker);
          }}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md text-[11px] font-black font-mono bg-blue-500/15 hover:bg-blue-500/25 text-blue-500 dark:text-blue-400 border border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer align-baseline hover:scale-105 active:scale-95 shadow-xs"
          title={`Click to view live stats for $${ticker}`}
        >
          <span>${ticker}</span>
          <TrendingUp className="w-2.5 h-2.5 inline-block opacity-75" />
        </button>
      );
    }
    return part;
  });
}

function FormattedMessage({ text, onSelectTicker }: { text: string; onSelectTicker?: (ticker: string) => void }) {
  const blocks = text.split(/\n/);
  
  return (
    <div className="space-y-2">
      {blocks.map((block, idx) => {
        const trimmed = block.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;
        
        if (trimmed === '---') {
          return <hr key={idx} className="border-slate-200/60 dark:border-slate-700/60 my-3" />;
        }
        
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">
              {renderFormattedTokens(trimmed.replace('### ', ''), onSelectTicker)}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-lg font-extrabold text-slate-900 dark:text-white mt-4 mb-2">
              {renderFormattedTokens(trimmed.replace('## ', ''), onSelectTicker)}
            </h3>
          );
        }
        
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={idx} className="flex gap-2 pl-1 my-1">
              <span className="text-emerald-500 font-bold">•</span>
              <p className="flex-1 text-slate-700 dark:text-slate-200 leading-relaxed">
                {renderFormattedTokens(trimmed.substring(2), onSelectTicker)}
              </p>
            </div>
          );
        }
        
        const numberedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex gap-2 pl-1 my-1">
              <span className="text-emerald-500 font-bold">{numberedMatch[1]}.</span>
              <p className="flex-1 text-slate-700 dark:text-slate-200 leading-relaxed">
                {renderFormattedTokens(numberedMatch[2], onSelectTicker)}
              </p>
            </div>
          );
        }
        
        return (
          <p key={idx} className="text-slate-750 dark:text-slate-200 leading-relaxed">
            {renderFormattedTokens(trimmed, onSelectTicker)}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Welcome to Trillium Market Intelligence. Ask any question regarding stock valuations, macroeconomic trends, or drag in news articles from the panel on the right for an in-depth financial breakdown.',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [attachedNews, setAttachedNews] = useState<NewsArticle | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const [newsList, setNewsList] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsSearch, setNewsSearch] = useState('');

  // Stock details drawer state for interactive ticker clicks
  const [drawerSymbol, setDrawerSymbol] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSelectTicker = (ticker: string) => {
    setDrawerSymbol(ticker.toUpperCase());
    setDrawerOpen(true);
  };

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    "Ask about Federal Reserve interest rate policy...",
    "Drag news article from the right panel to analyze...",
    "Ask how P/E ratios affect stock valuation...",
    "Ask for risk diversification strategies...",
    "Ask how earnings reports impact market prices..."
  ];
  const [currentPlaceholderIdx, setCurrentPlaceholderIdx] = useState(0);

  useEffect(() => {
    async function loadNews() {
      try {
        const articles = await getDailyThreeNews();
        setNewsList(articles);
      } catch (err) {
        console.error('Failed to load news context:', err);
      } finally {
        setNewsLoading(false);
      }
    }
    loadNews();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPlaceholderIdx((prev) => (prev + 1) % placeholders.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [placeholders.length]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking]);

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (dataStr) {
        const article = JSON.parse(dataStr) as NewsArticle;
        setAttachedNews(article);
        if (!inputValue.trim()) {
          setInputValue(`Analyze this news report in-depth: "${article.headline}"`);
        }
      }
    } catch (err) {
      console.error('Error dropping news article:', err);
    }
  };

  const handleAttachNews = (article: NewsArticle) => {
    setAttachedNews(article);
    if (!inputValue.trim()) {
      setInputValue(`Provide an in-depth financial breakdown of "${article.headline}"`);
    }
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const msgText = promptOverride || inputValue;
    if ((!msgText.trim() && !attachedNews) || isThinking) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: msgText || (attachedNews ? `Deep analysis of: "${attachedNews.headline}"` : ''),
      timestamp: new Date(),
      attachedNews: attachedNews || undefined,
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    const activeAttachedNews = attachedNews;
    setInputValue('');
    setAttachedNews(null);
    setIsThinking(true);

    try {
      const idToken = await auth.currentUser?.getIdToken();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken || ''}`,
        },
        body: JSON.stringify({
          messages: updatedMessages,
          attachedNews: activeAttachedNews,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch response');
      }

      const data = await response.json();
      
      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: data.text || "I focus strictly on stock trading, market analysis, financial literacy, and portfolio management. What financial topic would you like to explore?",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Error fetching AI response:', err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: `Network Error: ${err.message || 'Unable to complete request. Please try again.'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const filteredNews = newsList.filter(article => 
    article.headline.toLowerCase().includes(newsSearch.toLowerCase()) ||
    article.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
    (article.tags && article.tags.some(tag => tag.toLowerCase().includes(newsSearch.toLowerCase())))
  );

  return (
    <div className="w-full max-w-[2560px] mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[620px]">
      
      {/* LEFT PANEL: Expanded Main AI Chat Container */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 rounded-3xl border transition-all duration-300 bg-white/90 dark:bg-[#1a2133]/90 backdrop-blur-md shadow-2xl flex flex-col relative overflow-hidden ${
          isDraggingOver 
            ? 'border-emerald-500 ring-4 ring-emerald-500/20 scale-[0.995]' 
            : 'border-slate-200 dark:border-slate-700/60'
        }`}
      >
        {/* Drop Overlay Banner */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 bg-emerald-950/80 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-200">
            <div className="p-4 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mb-3 animate-bounce">
              <Newspaper className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Drop News Article Here</h3>
            <p className="text-xs text-emerald-200/80 mt-1 font-semibold">Attach to prompt for in-depth AI financial analysis</p>
          </div>
        )}

        {/* Northern Lights Feature Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-white/40 dark:bg-[#0f111a]/40 backdrop-blur-[1px]" />
          
          <motion.div
            animate={{
              x: isThinking ? [-150, 150, -150] : [-50, 50, -50],
              y: isThinking ? [20, -40, 20] : [5, -15, 5],
              opacity: isThinking ? 0.75 : 0.4,
            }}
            transition={{
              x: { duration: isThinking ? 4 : 12, repeat: Infinity, ease: "easeInOut" },
              y: { duration: isThinking ? 3 : 10, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5, ease: "easeInOut" },
            }}
            className="absolute -bottom-16 -left-[25%] w-[150%] h-[260px] rounded-full bg-gradient-to-r from-transparent via-emerald-500/30 via-teal-400/20 to-transparent blur-[80px] transform -rotate-[4deg] skew-x-12"
          />

          <motion.div
            animate={{
              x: isThinking ? [150, -150, 150] : [50, -50, 50],
              y: isThinking ? [-40, 20, -40] : [-15, 5, -15],
              opacity: isThinking ? 0.8 : 0.45,
            }}
            transition={{
              x: { duration: isThinking ? 3.5 : 10, repeat: Infinity, ease: "easeInOut" },
              y: { duration: isThinking ? 2.5 : 9, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.5, ease: "easeInOut" },
            }}
            className="absolute -bottom-24 -left-[25%] w-[150%] h-[300px] rounded-full bg-gradient-to-r from-transparent via-blue-500/30 via-cyan-400/20 to-transparent blur-[90px] transform rotate-[3deg] -skew-x-12"
          />
        </div>

        {/* Clean Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-[#121622]/60 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-500 dark:text-blue-400">
              <TrilliumLogoMark className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                Trillium Market Intelligence
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Live Analyst
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Institutional market analysis, stock valuation & drag-and-drop news context
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setMessages([{
                id: 'welcome-' + Date.now(),
                sender: 'ai',
                text: 'Welcome to Trillium Market Intelligence. Ask any question regarding stock valuations, macroeconomic trends, or drag in news articles from the panel on the right for an in-depth financial breakdown.',
                timestamp: new Date(),
              }]);
              setAttachedNews(null);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Chat
          </button>
        </div>

        {/* Messages Feed */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 z-10 relative bg-transparent scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700/50">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex gap-3 max-w-[85%] sm:max-w-[80%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-emerald-500 border-emerald-400 text-slate-900'
                }`}>
                  {msg.sender === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <TrilliumLogoMark className="h-4 w-4 text-slate-950" />
                  )}
                </div>

                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-blue-600/95 text-white rounded-tr-none font-semibold'
                    : 'bg-slate-100/90 dark:bg-[#0f111a]/85 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/40 rounded-tl-none font-medium'
                }`}>
                  {/* Attached News Pill inside User Message */}
                  {msg.attachedNews && (
                    <div className="mb-3 p-2.5 rounded-xl bg-slate-900/80 dark:bg-slate-950/80 border border-emerald-500/30 text-white text-xs space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-black uppercase">
                        <Newspaper className="h-3.5 w-3.5" /> Attached News Context
                      </div>
                      <div className="font-bold text-xs line-clamp-1">{msg.attachedNews.headline}</div>
                      <div className="text-[10px] text-slate-400">{msg.attachedNews.source}</div>
                    </div>
                  )}

                  {msg.sender === 'ai' ? (
                    <FormattedMessage text={msg.text} onSelectTicker={handleSelectTicker} />
                  ) : (
                    msg.text
                  )}
                </div>
              </motion.div>
            ))}

            {isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[80%]"
              >
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-emerald-500 border-emerald-400 text-slate-900">
                  <TrilliumLogoMark className="h-4 w-4 text-slate-950" />
                </div>
                <div className="bg-slate-100/90 dark:bg-[#0f111a]/85 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/40 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs font-semibold text-slate-400 ml-2">Analyzing market data...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attached Context Banner above input */}
        {attachedNews && (
          <div className="px-4 py-2 bg-emerald-500/10 border-t border-b border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between text-xs font-semibold z-10 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <Newspaper className="h-4 w-4 shrink-0" />
              <span className="truncate">Attached for Analysis: <strong>{attachedNews.headline}</strong></span>
            </div>
            <button 
              onClick={() => setAttachedNews(null)}
              className="p-1 hover:bg-emerald-500/20 rounded-lg transition-colors shrink-0"
              title="Remove Attached Article"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Quick-Prompt Suggestions */}
        <div className="px-4 py-2 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#121724]/70 backdrop-blur-sm flex items-center gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 shrink-0">
          <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0">
            <Sparkles className="h-3 w-3 text-emerald-400" />
            <span>Prompts:</span>
          </div>
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.label}
              type="button"
              onClick={() => handleSendMessage(prompt.query)}
              disabled={isThinking}
              className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700/60 hover:border-emerald-500/40 transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 shadow-xs"
            >
              {prompt.label}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-200 dark:border-slate-700/60 p-4 bg-white/80 dark:bg-[#1a2133]/85 backdrop-blur-md z-10 flex items-center gap-3 shrink-0">
          <div className="relative flex-1 h-12 bg-slate-100/70 dark:bg-[#0f111a]/70 rounded-2xl border border-slate-300/60 dark:border-slate-700/60 px-4 flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="w-full h-full bg-transparent border-0 outline-none text-slate-900 dark:text-white text-sm font-semibold pr-10"
            />
            {inputValue === '' && (
              <div className="absolute left-4 pointer-events-none text-slate-400 dark:text-slate-500 text-sm font-semibold overflow-hidden h-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentPlaceholderIdx}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  >
                    {placeholders[currentPlaceholderIdx]}
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            <button
              onClick={() => handleSendMessage()}
              disabled={isThinking || (!inputValue.trim() && !attachedNews)}
              className="absolute right-2.5 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 transition-all cursor-pointer shadow-md"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: News Context Hub & Drag Container */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 rounded-3xl border border-slate-200 dark:border-slate-700/60 bg-white/90 dark:bg-[#1a2133]/90 backdrop-blur-md shadow-2xl flex flex-col h-full min-h-[500px] overflow-hidden">
        
        {/* News Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Market News Hub
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Drag any report into the chat for deep AI analysis
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mt-3.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter news by ticker or macro tag..."
              value={newsSearch}
              onChange={(e) => setNewsSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Scrollable News Cards List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700/50 min-h-0">
          {newsLoading ? (
            <div className="h-full flex items-center justify-center py-12 text-slate-400">
              <RefreshCw className="h-5 w-5 animate-spin" />
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs italic">
              No news articles match your filter.
            </div>
          ) : (
            filteredNews.map((article) => {
              const isAttached = attachedNews?.id === article.id;

              return (
                <div
                  key={article.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('application/json', JSON.stringify(article));
                  }}
                  className={`group rounded-2xl border p-3.5 transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-emerald-500/60 shadow-sm relative ${
                    isAttached 
                      ? 'bg-emerald-500/10 border-emerald-500/80 ring-2 ring-emerald-500/20' 
                      : 'bg-slate-50/50 dark:bg-[#0f111a]/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={article.image}
                      alt={article.headline}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 truncate">
                          {article.source}
                        </span>
                        {isAttached && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 shrink-0 flex items-center gap-1">
                            <Check className="h-2.5 w-2.5" /> Attached
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-500 transition-colors line-clamp-2">
                        {article.headline}
                      </h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2">
                    {article.summary}
                  </p>

                  {/* Card Footer: Tags & Attach Action */}
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 overflow-hidden truncate">
                      {article.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => handleAttachNews(article)}
                      disabled={isAttached}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                        isAttached
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-slate-950 dark:text-emerald-400 border border-emerald-500/30 cursor-pointer'
                      }`}
                    >
                      <Plus className="h-3 w-3" /> {isAttached ? 'Attached' : 'Attach'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>

      {/* Stock Information Drawer for Clicked Ticker Pills */}
      <StockInfoDrawer
        symbol={drawerSymbol}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
}
