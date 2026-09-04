'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Sparkles, Newspaper, X, Plus, Search, Check, RefreshCw, TrendingUp, Layers, Landmark, Scale, Zap } from 'lucide-react';
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
  { 
    title: '$NVDA Breakdown',
    label: 'Valuation & momentum breakdown',
    query: 'Provide a detailed technical and valuation breakdown for $NVDA.',
    badge: 'Equities',
    icon: TrendingUp 
  },
  { 
    title: '$AAPL vs $MSFT',
    label: 'Compare moats, cashflow & margins',
    query: 'Compare $AAPL and $MSFT financials, growth rates, and competitive moats.',
    badge: 'Compare',
    icon: Layers 
  },
  { 
    title: 'Fed Rate Path',
    label: 'Macro impact on asset valuations',
    query: 'How do upcoming Federal Reserve interest rate decisions affect stock valuations and bond yields?',
    badge: 'Macro',
    icon: Landmark 
  },
  { 
    title: 'Options vs Stocks',
    label: 'Hedging & risk mitigation tips',
    query: 'Explain call options vs owning stock for a beginning trader with risk mitigation tips.',
    badge: 'Strategy',
    icon: Scale 
  },
  { 
    title: '$TSLA Catalysts',
    label: 'Delivery margins & market catalysts',
    query: 'Analyze $TSLA current valuation, margins, and key market catalysts.',
    badge: 'Catalysts',
    icon: Zap 
  },
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
  const lines = text.split(/\n/);
  const elements: React.ReactNode[] = [];
  let idx = 0;

  while (idx < lines.length) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      elements.push(<div key={`space-${idx}`} className="h-1.5" />);
      idx++;
      continue;
    }

    // Check if line is part of a markdown table
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      const tableLines: string[] = [];
      while (idx < lines.length && lines[idx].trim().startsWith('|') && lines[idx].trim().endsWith('|')) {
        tableLines.push(lines[idx].trim());
        idx++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (rowStr: string) =>
          rowStr
            .slice(1, -1)
            .split('|')
            .map((c) => c.trim());

        const headers = parseRow(tableLines[0]);
        const isSeparator = (s: string) => /^[-:\s|]+$/.test(s);
        const hasSep = isSeparator(tableLines[1]);
        const bodyLines = hasSep ? tableLines.slice(2) : tableLines.slice(1);

        elements.push(
          <div key={`table-${idx}`} className="overflow-x-auto my-3 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white/50 dark:bg-slate-900/50">
            <table className="min-w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60">
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-3 py-2 font-bold text-slate-900 dark:text-white">
                      {renderFormattedTokens(h, onSelectTicker)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {bodyLines.map((row, rIdx) => {
                  const cells = parseRow(row);
                  return (
                    <tr key={rIdx} className="hover:bg-slate-500/5 transition-colors">
                      {cells.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          {renderFormattedTokens(cell, onSelectTicker)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    if (trimmed === '---') {
      elements.push(<hr key={`hr-${idx}`} className="border-slate-200/60 dark:border-slate-700/60 my-3" />);
      idx++;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h2-${idx}`} className="text-lg font-black text-slate-900 dark:text-white mt-4 mb-2">
          {renderFormattedTokens(trimmed.replace('# ', ''), onSelectTicker)}
        </h2>
      );
      idx++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h3-${idx}`} className="text-base font-extrabold text-slate-900 dark:text-white mt-3 mb-1.5">
          {renderFormattedTokens(trimmed.replace('## ', ''), onSelectTicker)}
        </h3>
      );
      idx++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h4-${idx}`} className="text-sm font-bold text-slate-900 dark:text-white mt-2.5 mb-1">
          {renderFormattedTokens(trimmed.replace('### ', ''), onSelectTicker)}
        </h4>
      );
      idx++;
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`li-${idx}`} className="flex gap-2 pl-1 my-1">
          <span className="text-emerald-500 font-bold">•</span>
          <p className="flex-1 text-slate-700 dark:text-slate-200 leading-relaxed">
            {renderFormattedTokens(trimmed.substring(2), onSelectTicker)}
          </p>
        </div>
      );
      idx++;
      continue;
    }

    const numberedMatch = trimmed.match(/^(\d+)\.\s(.*)/);
    if (numberedMatch) {
      elements.push(
        <div key={`num-${idx}`} className="flex gap-2 pl-1 my-1">
          <span className="text-emerald-500 font-bold">{numberedMatch[1]}.</span>
          <p className="flex-1 text-slate-700 dark:text-slate-200 leading-relaxed">
            {renderFormattedTokens(numberedMatch[2], onSelectTicker)}
          </p>
        </div>
      );
      idx++;
      continue;
    }

    elements.push(
      <p key={`p-${idx}`} className="text-slate-750 dark:text-slate-200 leading-relaxed">
        {renderFormattedTokens(trimmed, onSelectTicker)}
      </p>
    );
    idx++;
  }

  return <div className="space-y-2">{elements}</div>;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Ask about stocks, market trends, or attach a news article from the right to get started.',
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

  const draggedArticleRef = useRef<NewsArticle | null>(null);
  const dragCounterRef = useRef<number>(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectTicker = (ticker: string) => {
    setDrawerSymbol(ticker.toUpperCase());
    setDrawerOpen(true);
  };

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
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isThinking]);

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    setIsDraggingOver(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    let article: NewsArticle | null = null;
    try {
      const dataStr = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      if (dataStr) {
        article = JSON.parse(dataStr) as NewsArticle;
      }
    } catch (err) {
      console.error('Error dropping news article:', err);
    }

    if (!article && draggedArticleRef.current) {
      article = draggedArticleRef.current;
    }

    if (article) {
      setAttachedNews(article);
      // Keep inputValue clean - do NOT inject full title into typing area
    }
  };

  const handleAttachNews = (article: NewsArticle) => {
    setAttachedNews(article);
    // Keep inputValue clean - do NOT inject full title into typing area
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'ai',
        text: 'Ask about stocks, market trends, or attach a news article from the right to get started.',
        timestamp: new Date(),
      },
    ]);
    setAttachedNews(null);
  };

  const handleSendMessage = async (promptOverride?: string) => {
    const msgText = promptOverride || inputValue;
    if ((!msgText.trim() && !attachedNews) || isThinking) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: msgText || (attachedNews ? `Analyze: "${attachedNews.headline}"` : ''),
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
      
      {/* LEFT PANEL: Main Chat Container */}
      <div 
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex-1 rounded-3xl border transition-all duration-300 bg-white/90 dark:bg-[#1a2133]/90 backdrop-blur-md shadow-2xl flex flex-col relative overflow-hidden ${
          isDraggingOver 
            ? 'border-[var(--theme-accent,#10b981)] ring-4 ring-[var(--theme-accent-border,rgba(16,185,129,0.25))] scale-[0.995]' 
            : 'border-slate-200 dark:border-slate-700/60'
        }`}
      >
        {/* Drop Overlay Banner */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-200 pointer-events-none">
            <div className="p-4 rounded-3xl bg-[var(--theme-accent-subtle,rgba(16,185,129,0.15))] border border-[var(--theme-accent-border,rgba(16,185,129,0.3))] text-[var(--theme-accent,#10b981)] mb-3 animate-bounce">
              <Newspaper className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-black tracking-tight">Drop News Article Here</h3>
            <p className="text-xs text-[var(--theme-accent-light,#a7f3d0)] mt-1 font-semibold">Attach to chat analysis</p>
          </div>
        )}

        {/* Ambient Glow Feature Background */}
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
            className="absolute -bottom-16 -left-[25%] w-[150%] h-[260px] rounded-full blur-[80px] transform -rotate-[4deg] skew-x-12 opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--theme-accent-glow, rgba(16,185,129,0.3)), var(--theme-accent-secondary-glow, rgba(6,182,212,0.2)), transparent)',
            }}
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
            className="absolute -bottom-24 -left-[25%] w-[150%] h-[300px] rounded-full blur-[90px] transform rotate-[3deg] -skew-x-12 opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--theme-accent-secondary-glow, rgba(59,130,246,0.3)), var(--theme-accent-glow, rgba(16,185,129,0.2)), transparent)',
            }}
          />
        </div>

        {/* Clean Header Bar */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-[#121622]/60 backdrop-blur-md flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[var(--theme-accent-subtle,rgba(16,185,129,0.12))] border border-[var(--theme-accent-border,rgba(16,185,129,0.25))] text-[var(--theme-accent,#10b981)]">
              <TrilliumLogoMark className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Chat</span>
          </div>

          <button
            onClick={handleResetChat}
            title="Reset chat"
            aria-label="Reset chat"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200 dark:hover:border-slate-700/50 transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
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
                    : 'bg-[var(--theme-accent,#10b981)] border-[var(--theme-accent-border,#10b981)] text-slate-950 shadow-[0_0_10px_var(--theme-accent-glow,rgba(16,185,129,0.25))]'
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
                  {/* Attached News Bubble inside User Message */}
                  {msg.attachedNews && (
                    <div className="mb-2.5 p-2 rounded-xl bg-slate-900/40 dark:bg-slate-950/60 border border-[var(--theme-accent-border,rgba(16,185,129,0.25))] text-white text-xs flex items-center gap-2">
                      <Newspaper className="h-3.5 w-3.5 text-[var(--theme-accent,#10b981)] shrink-0" />
                      <span className="text-[10px] font-bold text-[var(--theme-accent,#10b981)] uppercase tracking-wider shrink-0">
                        {msg.attachedNews.source}
                      </span>
                      <span className="font-semibold text-xs text-slate-200 truncate" title={msg.attachedNews.headline}>
                        {msg.attachedNews.headline}
                      </span>
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
                <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 border bg-[var(--theme-accent,#10b981)] border-[var(--theme-accent-border,#10b981)] text-slate-950 shadow-[0_0_10px_var(--theme-accent-glow,rgba(16,185,129,0.25))]">
                  <TrilliumLogoMark className="h-4 w-4 text-slate-950" />
                </div>
                <div className="bg-slate-100/90 dark:bg-[#0f111a]/85 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/40 p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-md">
                  <span className="w-1.5 h-1.5 bg-[var(--theme-accent,#10b981)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--theme-accent,#10b981)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[var(--theme-accent,#10b981)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs font-semibold text-slate-400 ml-2">Analyzing...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Attached Article Bubble (replaces Prompts when article is attached) */}
        {attachedNews ? (
          <div className="px-5 py-2.5 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/70 dark:bg-[#121724]/70 backdrop-blur-md flex items-center z-10 shrink-0 animate-in fade-in duration-150">
            <div className="inline-flex items-center gap-2.5 pl-3 pr-2 py-1.5 rounded-full bg-[var(--theme-accent-bg,rgba(16,185,129,0.1))] border border-[var(--theme-accent-border,rgba(16,185,129,0.3))] text-xs shadow-xs max-w-full">
              <Newspaper className="h-3.5 w-3.5 text-[var(--theme-accent,#10b981)] shrink-0" />
              <span className="font-extrabold text-[10px] px-1.5 py-0.5 rounded bg-[var(--theme-accent-subtle,rgba(16,185,129,0.15))] text-[var(--theme-accent,#10b981)] uppercase tracking-wider shrink-0">
                {attachedNews.source}
              </span>
              <span className="text-slate-800 dark:text-slate-200 font-semibold text-xs truncate max-w-[200px] sm:max-w-[340px]" title={attachedNews.headline}>
                {attachedNews.headline}
              </span>
              <button
                type="button"
                onClick={() => setAttachedNews(null)}
                className="p-1 rounded-full hover:bg-[var(--theme-accent-subtle,rgba(16,185,129,0.2))] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0 cursor-pointer"
                title="Remove attachment"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-2.5 border-t border-slate-200/60 dark:border-slate-800/80 bg-slate-50/80 dark:bg-[#121724]/80 backdrop-blur-md flex items-center gap-2.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700/50 shrink-0">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 shrink-0 pr-2 border-r border-slate-200 dark:border-slate-800">
              <Sparkles className="h-3.5 w-3.5 text-[var(--theme-accent,#10b981)]" />
              <span>Suggested</span>
            </div>
            {QUICK_PROMPTS.map((prompt) => {
              const Icon = prompt.icon;
              return (
                <button
                  key={prompt.title}
                  type="button"
                  onClick={() => handleSendMessage(prompt.query)}
                  disabled={isThinking}
                  className="group flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-left bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/70 hover:border-[var(--theme-accent-border,rgba(16,185,129,0.4))] hover:shadow-[0_0_12px_var(--theme-accent-subtle,rgba(16,185,129,0.15))] transition-all whitespace-nowrap shrink-0 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  <div className="p-1.5 rounded-lg bg-[var(--theme-accent-subtle,rgba(16,185,129,0.12))] text-[var(--theme-accent,#10b981)] group-hover:scale-110 transition-transform shrink-0">
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-900 dark:text-white group-hover:text-[var(--theme-accent,#10b981)] transition-colors">
                        {prompt.title}
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-wider px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
                        {prompt.badge}
                      </span>
                    </div>
                    <span className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium">
                      {prompt.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Input Bar */}
        <div className="border-t border-slate-200 dark:border-slate-700/60 p-4 bg-white/80 dark:bg-[#1a2133]/85 backdrop-blur-md z-10 flex items-center gap-3 shrink-0">
          <div className="relative flex-1 h-12 bg-slate-100/70 dark:bg-[#0f111a]/70 rounded-2xl border border-slate-300/60 dark:border-slate-700/60 px-4 flex items-center">
            <input
              type="text"
              placeholder="Ask a question or discuss market news..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              className="w-full h-full bg-transparent border-0 outline-none text-slate-900 dark:text-white text-sm font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 pr-10"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={isThinking || (!inputValue.trim() && !attachedNews)}
              className="absolute right-2.5 p-2 rounded-xl bg-[var(--theme-accent,#10b981)] text-slate-950 hover:opacity-95 disabled:opacity-40 transition-all cursor-pointer shadow-[0_0_15px_var(--theme-accent-glow,rgba(16,185,129,0.3))]"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: News Context Hub */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 rounded-3xl border border-slate-200 dark:border-slate-700/60 bg-white/90 dark:bg-[#1a2133]/90 backdrop-blur-md shadow-2xl flex flex-col h-full min-h-[500px] overflow-hidden">
        
        {/* News Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[var(--theme-accent-subtle,rgba(16,185,129,0.12))] border border-[var(--theme-accent-border,rgba(16,185,129,0.25))] text-[var(--theme-accent,#10b981)]">
              <Newspaper className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Market News Hub
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Drag articles into chat or click Attach
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
              className="w-full h-9 pl-9 pr-3 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white outline-none focus:border-[var(--theme-accent,#10b981)] transition-colors"
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
                    draggedArticleRef.current = article;
                    e.dataTransfer.setData('application/json', JSON.stringify(article));
                    e.dataTransfer.setData('text/plain', JSON.stringify(article));
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onDragEnd={() => {
                    draggedArticleRef.current = null;
                  }}
                  className={`group rounded-2xl border p-3.5 transition-all duration-200 cursor-grab active:cursor-grabbing hover:border-[var(--theme-accent-border,rgba(16,185,129,0.5))] shadow-sm relative select-none ${
                    isAttached 
                      ? 'bg-[var(--theme-accent-bg,rgba(16,185,129,0.1))] border-[var(--theme-accent,#10b981)] ring-2 ring-[var(--theme-accent-border,rgba(16,185,129,0.3))]' 
                      : 'bg-slate-50/50 dark:bg-[#0f111a]/50 border-slate-200 dark:border-slate-800'
                  }`}
                  title="Drag into chat to analyze"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={article.image}
                      alt={article.headline}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 pointer-events-none"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="min-w-0 flex-1 pointer-events-none">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--theme-accent,#10b981)] truncate">
                          {article.source}
                        </span>
                        {isAttached && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-[var(--theme-accent,#10b981)] text-slate-950 shrink-0 flex items-center gap-1">
                            <Check className="h-2.5 w-2.5" /> Attached
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[var(--theme-accent,#10b981)] transition-colors line-clamp-2">
                        {article.headline}
                      </h4>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2 pointer-events-none">
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAttachNews(article);
                      }}
                      disabled={isAttached}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold transition-all flex items-center gap-1 ${
                        isAttached
                          ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-[var(--theme-accent-subtle,rgba(16,185,129,0.12))] hover:bg-[var(--theme-accent,#10b981)] text-[var(--theme-accent,#10b981)] hover:text-slate-950 border border-[var(--theme-accent-border,rgba(16,185,129,0.3))] cursor-pointer shadow-xs'
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
