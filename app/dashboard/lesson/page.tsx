'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useSettings } from '@/context/SettingsContext';
import { 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  X, 
  Lock, 
  Flame, 
  Star, 
  Trophy, 
  Sparkles, 
  RefreshCw, 
  HelpCircle, 
  ArrowRight, 
  ArrowLeft, 
  Award, 
  PlayCircle, 
  RotateCcw, 
  ShieldCheck, 
  Zap,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart2,
  Percent,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface TermProps {
  word: string;
  definition: string;
}

function FinancialTerm({ word, definition }: TermProps) {
  return (
    <span className="relative group cursor-pointer inline-block mx-0.5">
      <span className="underline decoration-dotted decoration-blue-500 hover:decoration-blue-400 font-bold text-blue-600 dark:text-blue-400 transition-colors">
        {word}
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 rounded-xl bg-slate-900/95 dark:bg-slate-800/95 text-white border border-slate-700/50 shadow-2xl text-xs font-medium opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100 z-50 text-center backdrop-blur-sm">
        <span className="font-extrabold text-blue-400 block mb-1">{word}</span>
        {definition}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95" />
      </span>
    </span>
  );
}

// ----------------------------------------------------
// Lesson & Unit Data Definition (20 Interactive Lessons)
// ----------------------------------------------------
export interface Lesson {
  id: number;
  unitId: number;
  title: string;
  subtitle: string;
  icon: string;
  xp: number;
  trilliums: number;
  externalLink?: string;
  slides: {
    title: string;
    content: string;
    keyTakeaway: string;
  }[];
  toolType: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface Unit {
  id: number;
  title: string;
  subtitle: string;
  color: string; // tailwind color theme
  badgeIcon: string;
  lessons: Lesson[];
}

const UNITS: Unit[] = [
  {
    id: 1,
    title: "Unit 1: Fundamentals of Money & Markets",
    subtitle: "Master core financial concepts, purchasing power, and stock market basics.",
    color: "emerald",
    badgeIcon: "💵",
    lessons: [
      {
        id: 1,
        unitId: 1,
        title: "1. Money & Purchasing Power",
        subtitle: "Understand fiat money, inflation, and why $100 today isn't $100 tomorrow.",
        icon: "💵",
        xp: 50,
        trilliums: 10,
        slides: [
          {
            title: "What is Purchasing Power?",
            content: "Purchasing power is the amount of real goods or services that one unit of money can buy. Over time, inflation causes prices to rise, which reduces your purchasing power.",
            keyTakeaway: "Inflation erodes cash value over time. Investing helps your money grow faster than inflation."
          },
          {
            title: "Fiat Currency vs Assets",
            content: "Paper money (fiat currency) is backed by government trust. Unlike gold or real estate, governments can print more fiat currency, decreasing its relative value.",
            keyTakeaway: "Holding pure cash long-term leads to a loss of purchasing power."
          }
        ],
        toolType: "inflation_calc",
        quiz: [
          {
            question: "What happens to your purchasing power when inflation occurs?",
            options: [
              "It increases because prices drop.",
              "It decreases because goods become more expensive.",
              "It stays exactly the same forever."
            ],
            correctIndex: 1,
            explanation: "Inflation raises prices, which means each dollar buys fewer goods and services."
          },
          {
            question: "Why do investors buy productive assets like stocks?",
            options: [
              "To keep money hidden under a mattress.",
              "To outpace inflation and build long-term real wealth.",
              "Because cash never loses value."
            ],
            correctIndex: 1,
            explanation: "Stocks and productive assets tend to grow faster than the rate of inflation."
          }
        ]
      },
      {
        id: 2,
        unitId: 1,
        title: "2. How Stock Exchanges Work",
        subtitle: "Discover how buyers and sellers trade fractional ownership of real companies.",
        icon: "🏛️",
        xp: 50,
        trilliums: 10,
        slides: [
          {
            title: "What is a Stock?",
            content: "A stock (or share) represents partial ownership of a public company. If a company has 1,000,000 shares and you buy 10,000, you own 1% of that business!",
            keyTakeaway: "Stocks make you a real business owner with rights to future profits."
          },
          {
            title: "Stock Exchanges & Order Matching",
            content: "Exchanges like NYSE and NASDAQ bring buyers (Bid) and sellers (Ask) together. When the highest bid meets the lowest ask, a trade executes instantly.",
            keyTakeaway: "Stock prices move based on supply (sellers) and demand (buyers)."
          }
        ],
        toolType: "order_sim",
        quiz: [
          {
            question: "If a company has 1,000 shares total and you own 100 shares, how much of the company do you own?",
            options: ["1%", "10%", "50%"],
            correctIndex: 1,
            explanation: "100 divided by 1,000 equals 10% ownership of the company."
          },
          {
            question: "What drives stock prices up in the market?",
            options: [
              "More buyers wanting to buy than sellers willing to sell.",
              "The government manually setting daily stock prices.",
              "Sellers offering stocks for free."
            ],
            correctIndex: 0,
            explanation: "High demand relative to supply forces prices upward as buyers compete."
          }
        ]
      },
      {
        id: 3,
        unitId: 1,
        title: "3. Reading Stock Quotes",
        subtitle: "Decode tickers, bid/ask spreads, volume, and 52-week price ranges.",
        icon: "📊",
        xp: 50,
        trilliums: 10,
        slides: [
          {
            title: "Elements of a Stock Quote",
            content: "Every stock quote shows a Ticker Symbol (e.g. AAPL), current Market Price, Net Change ($ and %), Volume (shares traded today), and 52-Week High/Low.",
            keyTakeaway: "Stock quotes give you a real-time snapshot of market sentiment."
          },
          {
            title: "Understanding Bid and Ask",
            content: "The Bid is the highest price a buyer is willing to pay. The Ask is the lowest price a seller is willing to accept. The difference is the Spread.",
            keyTakeaway: "Popular stocks have tiny spreads, while rare stocks have wider spreads."
          }
        ],
        toolType: "quote_scanner",
        quiz: [
          {
            question: "What does a stock's 'Ticker Symbol' represent?",
            options: [
              "A unique 1 to 5 letter code identifying a company (e.g. MSFT).",
              "The phone number of the company CEO.",
              "The tax ID of the stock broker."
            ],
            correctIndex: 0,
            explanation: "Ticker symbols provide quick identification for trading stocks on exchanges."
          }
        ]
      },
      {
        id: 4,
        unitId: 1,
        title: "4. Cash Flow & Compounding",
        subtitle: "Learn how compound interest turns small monthly savings into vast fortunes.",
        icon: "📈",
        xp: 60,
        trilliums: 12,
        slides: [
          {
            title: "The Magic of Compound Interest",
            content: "Albert Einstein called compound interest the 8th wonder of the world. You earn interest not just on your initial money, but on previous interest as well!",
            keyTakeaway: "Time is your greatest asset. Starting early doubles and triples returns."
          }
        ],
        toolType: "compound_calc",
        quiz: [
          {
            question: "Why is starting to invest in your 20s better than starting in your 40s?",
            options: [
              "Because compound interest has decades more time to multiply gains.",
              "Because stocks only go up in your 20s.",
              "Because banks don't allow 40-year-olds to invest."
            ],
            correctIndex: 0,
            explanation: "More years allow interest to compound exponentially on top of prior gains."
          }
        ]
      },
      {
        id: 5,
        unitId: 1,
        title: "5. Risk vs Reward & Volatility",
        subtitle: "Balance risk tolerance and portfolio volatility to avoid panic selling.",
        icon: "⚖️",
        xp: 60,
        trilliums: 12,
        slides: [
          {
            title: "Understanding Volatility",
            content: "Volatility measures how wildly a stock's price fluctuates. High volatility can yield big gains or sharp drops. Low volatility provides stability.",
            keyTakeaway: "Higher prospective returns always come with higher potential risk."
          }
        ],
        toolType: "risk_matrix",
        quiz: [
          {
            question: "What is the relationship between financial risk and potential return?",
            options: [
              "Higher potential returns generally require taking higher potential risk.",
              "High risk guarantees high profits every single day.",
              "Low risk investments always produce maximum wealth."
            ],
            correctIndex: 0,
            explanation: "Risk and return are directly correlated in financial markets."
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Unit 2: Stock Valuation & Fundamental Analysis",
    subtitle: "Analyze corporate balance sheets, P/E ratios, earnings, and dividends.",
    color: "blue",
    badgeIcon: "🔍",
    lessons: [
      {
        id: 6,
        unitId: 2,
        title: "6. Company Fundamentals & EPS",
        subtitle: "Read income statements, revenue growth, and Earnings Per Share.",
        icon: "📑",
        xp: 65,
        trilliums: 15,
        slides: [
          {
            title: "Revenue vs Net Income",
            content: "Revenue is total sales. Net Income is what remains after paying all expenses, taxes, and wages. Earnings Per Share (EPS) = Net Income / Total Shares.",
            keyTakeaway: "EPS tells you how much profit the company makes for every share you hold."
          }
        ],
        toolType: "financial_stmt",
        quiz: [
          {
            question: "How is Earnings Per Share (EPS) calculated?",
            options: [
              "Net Income divided by Total Shares Outstanding.",
              "Total Sales divided by Stock Price.",
              "Company Cash minus Liabilities."
            ],
            correctIndex: 0,
            explanation: "EPS distributes total net profits across every existing share of stock."
          }
        ]
      },
      {
        id: 7,
        unitId: 2,
        title: "7. Valuation Multiples & P/E Ratio",
        subtitle: "Determine whether a stock is bargains-cheap or dangerously overvalued.",
        icon: "🏷️",
        xp: 65,
        trilliums: 15,
        slides: [
          {
            title: "Price-to-Earnings (P/E) Ratio",
            content: "P/E = Stock Price / EPS. If a stock trades at $50 and EPS is $5, P/E is 10. It shows how many dollars investors pay for $1 of company profit.",
            keyTakeaway: "High P/E means high expected growth; low P/E may mean a bargain or a struggling company."
          }
        ],
        toolType: "pe_eval",
        quiz: [
          {
            question: "If a stock costs $100 and earns $10 per share per year, what is its P/E ratio?",
            options: ["10", "100", "5"],
            correctIndex: 0,
            explanation: "$100 price divided by $10 earnings = P/E of 10."
          }
        ]
      },
      {
        id: 8,
        unitId: 2,
        title: "8. Dividends & Passive Income",
        subtitle: "Earn quarterly cash payouts from profitable dividend-paying stocks.",
        icon: "💸",
        xp: 70,
        trilliums: 15,
        slides: [
          {
            title: "What is a Dividend?",
            content: "A dividend is cash paid out directly to shareholders from company profits. Dividend Yield = (Annual Dividend per Share / Stock Price) * 100.",
            keyTakeaway: "Reinvesting dividends (DRIP) compounds your total returns rapidly."
          }
        ],
        toolType: "dividend_calc",
        quiz: [
          {
            question: "What is Dividend Yield?",
            options: [
              "The percentage of stock price paid out as cash to shareholders annually.",
              "The interest rate charged by a bank on a car loan.",
              "The fee you pay to sell stock."
            ],
            correctIndex: 0,
            explanation: "Dividend yield measures annual cash income relative to the stock's purchase price."
          }
        ]
      },
      {
        id: 9,
        unitId: 2,
        title: "9. Market Capitalization Classes",
        subtitle: "Navigate Mega-Caps, Large-Caps, Mid-Caps, and Small-Cap growth stocks.",
        icon: "🏢",
        xp: 70,
        trilliums: 15,
        slides: [
          {
            title: "Calculating Market Cap",
            content: "Market Cap = Stock Price * Total Shares. Mega-cap ($200B+), Large-cap ($10B-$200B), Mid-cap ($2B-$10B), Small-cap ($300M-$2B).",
            keyTakeaway: "Large caps offer stability; small caps offer higher growth potential and volatility."
          }
        ],
        toolType: "market_cap",
        quiz: [
          {
            question: "If Company A has 1 Billion shares at $200 per share, what is its Market Cap?",
            options: ["$200 Billion (Mega-Cap)", "$2 Billion (Mid-Cap)", "$20 Million (Micro-Cap)"],
            correctIndex: 0,
            explanation: "1 Billion * $200 = $200 Billion total market valuation."
          }
        ]
      },
      {
        id: 10,
        unitId: 2,
        title: "10. Bull vs Bear Market Cycles",
        subtitle: "Survive market crashes, market corrections, and booming bull rallies.",
        icon: "🐂",
        xp: 75,
        trilliums: 18,
        slides: [
          {
            title: "Bull vs Bear Markets",
            content: "A Bull Market is a sustained rise (+20% or more). A Bear Market is a drop of 20% or more from recent peaks due to economic fear.",
            keyTakeaway: "Bear markets create historic buying opportunities for disciplined investors."
          }
        ],
        toolType: "bull_bear",
        quiz: [
          {
            question: "What officially defines a Bear Market?",
            options: [
              "A market decline of 20% or more from recent high prices.",
              "A sunny day on Wall Street.",
              "A 2% drop in one afternoon."
            ],
            correctIndex: 0,
            explanation: "A 20% drop across broad market indices signifies a bear market."
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Unit 3: Portfolio Strategy & Execution Mechanics",
    subtitle: "Execute advanced orders, construct ETF portfolios, and manage debt.",
    color: "purple",
    badgeIcon: "💼",
    lessons: [
      {
        id: 11,
        unitId: 3,
        title: "11. Order Types: Market, Limit, Stop",
        subtitle: "Control your exact entry and exit prices with precision limit & stop orders.",
        icon: "🎯",
        xp: 80,
        trilliums: 18,
        slides: [
          {
            title: "Market vs Limit vs Stop Orders",
            content: "Market Order: Fills immediately at best available price. Limit Order: Fills ONLY at your target price or better. Stop-Loss: Sells automatically if price drops to protect against loss.",
            keyTakeaway: "Use Limit orders to avoid slippage and Stop-Loss orders to cap downside."
          }
        ],
        toolType: "order_type_sim",
        quiz: [
          {
            question: "Which order type guarantees execution speed over exact price?",
            options: ["Market Order", "Limit Order", "Stop-Loss Order"],
            correctIndex: 0,
            explanation: "Market orders execute immediately at whatever current price sellers demand."
          }
        ]
      },
      {
        id: 12,
        unitId: 3,
        title: "12. Asset Allocation & Sectors",
        subtitle: "Protect capital across Technology, Healthcare, Financials, and Energy.",
        icon: "🍕",
        xp: 80,
        trilliums: 18,
        slides: [
          {
            title: "Don't Put All Eggs in One Basket",
            content: "Spread your capital across different sectors (Tech, Finance, Energy, Consumer Goods). If one sector suffers, others insulate your portfolio.",
            keyTakeaway: "Diversification reduces portfolio volatility without sacrificing overall return."
          }
        ],
        toolType: "sector_pie",
        quiz: [
          {
            question: "Why should an investor diversify across multiple market sectors?",
            options: [
              "To prevent a crash in one sector from wiping out their entire portfolio.",
              "To pay double the transaction fees.",
              "Because owning only 1 stock is illegal."
            ],
            correctIndex: 0,
            explanation: "Diversification lowers overall risk exposure to single company or industry failures."
          }
        ]
      },
      {
        id: 13,
        unitId: 3,
        title: "13. Index Funds & Expense Ratios",
        subtitle: "Outperform 90% of active fund managers with low-cost index ETFs.",
        icon: "📦",
        xp: 85,
        trilliums: 20,
        slides: [
          {
            title: "ETFs & Mutual Funds",
            content: "An Exchange Traded Fund (ETF) holds hundreds of stocks in 1 ticker (e.g. S&P 500 ETF). Pay attention to Expense Ratios (annual management fee %).",
            keyTakeaway: "A 1.5% fee can eat over 30% of your lifetime investment wealth!"
          }
        ],
        toolType: "etf_fee",
        quiz: [
          {
            question: "Why are low expense ratios (e.g. 0.03%) crucial for long-term investors?",
            options: [
              "High fees compound exponentially over time and strip away massive investment returns.",
              "Low fee funds pay zero taxes.",
              "High fee funds always outperform low fee funds."
            ],
            correctIndex: 0,
            explanation: "Management fees compound over decades, making low-cost index ETFs superior."
          }
        ]
      },
      {
        id: 14,
        unitId: 3,
        title: "14. Debt, Borrowing & Leverage",
        subtitle: "Understand margin interest, debt leverage, and simulator cash borrowing.",
        icon: "💳",
        xp: 90,
        trilliums: 20,
        externalLink: "/dashboard/lesson/debt-leverage",
        slides: [
          {
            title: "Leverage is a Double-Edged Sword",
            content: "Borrowing money (margin/leverage) amplifies both gains and losses. If a leveraged trade goes wrong, you can lose more than your initial cash deposit!",
            keyTakeaway: "Always calculate interest rates and maintain safety buffers when using margin."
          }
        ],
        toolType: "debt_calc",
        quiz: [
          {
            question: "What is a major risk of trading with borrowed leverage?",
            options: [
              "You can lose more money than you initially deposited.",
              "The stock market instantly closes.",
              "Interest rates automatically become 0%."
            ],
            correctIndex: 0,
            explanation: "Leverage magnifies losses. If the stock falls sharply, you still owe the full principal plus interest."
          }
        ]
      },
      {
        id: 15,
        unitId: 3,
        title: "15. Short Selling & Bearish Bets",
        subtitle: "Profit when stock prices fall by borrowing and selling shares back.",
        icon: "📉",
        xp: 90,
        trilliums: 20,
        slides: [
          {
            title: "How Short Selling Works",
            content: "To Short: Borrow stock from broker -> Sell at $100 -> Stock drops to $60 -> Buy back at $60 -> Return shares to broker. Profit = $40 per share!",
            keyTakeaway: "Shorting has UNLIMITED downside risk because a stock price can rise infinitely!"
          }
        ],
        toolType: "short_sim",
        quiz: [
          {
            question: "Why is short selling considered higher risk than buying regular stock?",
            options: [
              "Because a stock's price can rise infinitely, leading to unlimited potential losses.",
              "Because you cannot make money when stocks drop.",
              "Because short selling is illegal."
            ],
            correctIndex: 0,
            explanation: "When buying stock, your max loss is 100%. When shorting, a stock can rise 500%+, leading to huge debts."
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Unit 4: Advanced Trading & Financial Mastery",
    subtitle: "Master options payoff curves, technical chart analysis, taxes, and discipline.",
    color: "amber",
    badgeIcon: "🎓",
    lessons: [
      {
        id: 16,
        unitId: 4,
        title: "16. Options Mechanics: Calls & Puts",
        subtitle: "Understand strike prices, expirations, leverage, and option contracts.",
        icon: "⚡",
        xp: 95,
        trilliums: 25,
        slides: [
          {
            title: "Calls vs Puts",
            content: "Call Option: Right to BUY stock at Strike Price. Put Option: Right to SELL stock at Strike Price. Contracts expire on a set date.",
            keyTakeaway: "Options provide powerful leverage but can expire completely worthless."
          }
        ],
        toolType: "options_payoff",
        quiz: [
          {
            question: "If you expect a stock's price to surge dramatically upward, which option contract do you buy?",
            options: ["Call Option", "Put Option", "Short Option"],
            correctIndex: 0,
            explanation: "Buying a Call option gives you the right to buy stock at a lower fixed strike price as market price rises."
          }
        ]
      },
      {
        id: 17,
        unitId: 4,
        title: "17. Technical Analysis & Chart Patterns",
        subtitle: "Spot trends with Candlesticks, Moving Averages (SMA), and Support levels.",
        icon: "🕯️",
        xp: 95,
        trilliums: 25,
        slides: [
          {
            title: "Candlestick Anatomy",
            content: "Each candle shows Open, High, Low, Close (OHLC). Green candle: Closed higher than opened. Red candle: Closed lower than opened. Wicks show price extremes.",
            keyTakeaway: "Technical patterns reveal buyer/seller momentum and key psychological support zones."
          }
        ],
        toolType: "chart_pattern",
        quiz: [
          {
            question: "What does a Green Candlestick indicate on a price chart?",
            options: [
              "The closing price was higher than the opening price for that time period.",
              "The stock was delisted from the stock exchange.",
              "The company lost all revenue."
            ],
            correctIndex: 0,
            explanation: "Green candles signal price appreciation over the selected time interval."
          }
        ]
      },
      {
        id: 18,
        unitId: 4,
        title: "18. Macroeconomics & The Federal Reserve",
        subtitle: "Discover how Fed interest rate hikes impact stock markets and inflation.",
        icon: "🌐",
        xp: 100,
        trilliums: 25,
        slides: [
          {
            title: "Federal Reserve & Interest Rates",
            content: "When the Fed raises interest rates, borrowing becomes expensive, slowing the economy down to tame inflation. High rates pressure stock valuations.",
            keyTakeaway: "'Don't fight the Fed' is a classic Wall Street proverb for a reason!"
          }
        ],
        toolType: "fed_rate",
        quiz: [
          {
            question: "How do higher Federal Reserve interest rates usually impact stock valuations?",
            options: [
              "They increase borrowing costs for businesses, often cooling stock valuations.",
              "They instantly double all company stock prices.",
              "They eliminate corporate taxes."
            ],
            correctIndex: 0,
            explanation: "Higher interest rates increase corporate debt costs and make conservative bonds more attractive."
          }
        ]
      },
      {
        id: 19,
        unitId: 4,
        title: "19. Capital Gains Taxes & Wealth Building",
        subtitle: "Keep more of your hard-earned profits with tax-advantaged account strategies.",
        icon: "🏛️",
        xp: 100,
        trilliums: 25,
        slides: [
          {
            title: "Short-Term vs Long-Term Capital Gains",
            content: "Holding a stock less than 1 year results in Short-Term tax rates (up to 37%). Holding 1+ year qualifies for lower Long-Term rates (0%-20%).",
            keyTakeaway: "Holding investments for over 1 year saves huge amounts in capital gains taxes."
          }
        ],
        toolType: "tax_calc",
        quiz: [
          {
            question: "How long must you hold an asset to qualify for lower Long-Term Capital Gains tax rates?",
            options: ["More than 1 year (365+ days)", "At least 30 days", "Exactly 5 years"],
            correctIndex: 0,
            explanation: "Assets held longer than 1 year receive favorable long-term tax treatment."
          }
        ]
      },
      {
        id: 20,
        unitId: 4,
        title: "20. Dollar-Cost Averaging & Financial Freedom",
        subtitle: "Build generational wealth with automated investing and emotional discipline.",
        icon: "👑",
        xp: 120,
        trilliums: 30,
        slides: [
          {
            title: "Dollar-Cost Averaging (DCA)",
            content: "DCA means investing a fixed dollar amount on a regular schedule (e.g. $200 every month), regardless of market ups and downs.",
            keyTakeaway: "DCA removes emotion, buys more shares when prices are low, and builds massive wealth over time!"
          }
        ],
        toolType: "dca_vs_lump",
        quiz: [
          {
            question: "What is the primary advantage of Dollar-Cost Averaging (DCA)?",
            options: [
              "It removes emotional timing guesswork and builds discipline by buying regularly over time.",
              "It guarantees you never experience a red day.",
              "It eliminates stock transaction fees permanently."
            ],
            correctIndex: 0,
            explanation: "DCA ensures you consistently buy shares during both market rallies and dips automatically."
          }
        ]
      }
    ]
  }
];

// ----------------------------------------------------
// Main Component
// ----------------------------------------------------
export default function LessonsPage() {
  const { textFont, numberFont, trilliums, setTrilliums } = useSettings();
  const { fetchAchievementsAndStreak, streakCount } = usePortfolioStore();

  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Lesson Runner State
  const [currentStep, setCurrentStep] = useState(0); // 0: slides, 1: tool, 2..N: quiz questions
  const [slideIndex, setSlideIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchAchievementsAndStreak();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('trillium_completed_lessons');
      if (saved) {
        try {
          setCompletedLessonIds(JSON.parse(saved));
        } catch (e) {
          setCompletedLessonIds([1]); // default fallback
        }
      } else {
        // default mark lesson 1 as completed if previously completed
        const legacy = localStorage.getItem('lesson_1_completed_at');
        if (legacy) {
          setCompletedLessonIds([1]);
        }
      }
    }
  }, [fetchAchievementsAndStreak]);

  const markLessonComplete = (lesson: Lesson) => {
    if (!completedLessonIds.includes(lesson.id)) {
      const updated = [...completedLessonIds, lesson.id];
      setCompletedLessonIds(updated);
      if (typeof window !== 'undefined') {
        localStorage.setItem('trillium_completed_lessons', JSON.stringify(updated));
        localStorage.setItem(`lesson_${lesson.id}_completed_at`, Date.now().toString());
      }
      setTrilliums(trilliums + lesson.trilliums);
    }
    setIsCompleted(true);
  };

  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setCurrentStep(0);
    setSlideIndex(0);
    setSelectedAnswers({});
    setQuizSubmitted({});
    setIsCompleted(false);
  };

  const totalLessons = 20;
  const completedCount = completedLessonIds.length;
  const courseProgressPct = Math.round((completedCount / totalLessons) * 100);

  return (
    <div className={`space-y-8 max-w-5xl mx-auto font-txt-${textFont} pb-16`}>
      {/* Top Duolingo-Style Header Dashboard Stats */}
      <div className="rounded-3xl bg-white dark:bg-[#121622]/90 border border-slate-200 dark:border-slate-800/80 p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shrink-0">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Financial Education Path 🎓
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Master 20 interactive lessons to build real-world investing skill
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end overflow-x-auto pb-1 md:pb-0">
            {/* Streak */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 shadow-sm shrink-0">
              <Flame className="h-5 w-5 text-amber-500 animate-bounce" />
              <div>
                <div className="text-[9px] font-black uppercase text-amber-600 dark:text-amber-400">Streak</div>
                <div className={`text-xs font-black text-slate-800 dark:text-slate-100 font-num-${numberFont}`}>
                  {streakCount || 1} Days
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 shadow-sm shrink-0">
              <Trophy className="h-5 w-5 text-emerald-500" />
              <div>
                <div className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Completed</div>
                <div className={`text-xs font-black text-slate-800 dark:text-slate-100 font-num-${numberFont}`}>
                  {completedCount} / {totalLessons}
                </div>
              </div>
            </div>

            {/* Level XP */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50 shadow-sm shrink-0">
              <Star className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-[9px] font-black uppercase text-blue-600 dark:text-blue-400">Total XP</div>
                <div className={`text-xs font-black text-slate-800 dark:text-slate-100 font-num-${numberFont}`}>
                  {completedCount * 65} XP
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/60">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Overall Course Progress</span>
            <span className="text-blue-600 dark:text-blue-400 font-extrabold">{courseProgressPct}% Complete</span>
          </div>
          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-slate-800">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-600 via-teal-400 to-emerald-500 rounded-full shadow-[0_0_12px_rgba(59,130,246,0.6)]"
              initial={{ width: 0 }}
              animate={{ width: `${courseProgressPct}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      {/* Duolingo Style Skill Tree Path */}
      <div className="space-y-12">
        {UNITS.map((unit) => {
          const unitCompletedCount = unit.lessons.filter(l => completedLessonIds.includes(l.id)).length;
          const isUnitUnlocked = unit.id === 1 || completedLessonIds.some(id => unit.lessons.some(l => l.id === id || l.id === id + 1));

          return (
            <div key={unit.id} className="space-y-8 relative">
              {/* Unit Banner Header */}
              <div className={`rounded-3xl p-6 shadow-xl border backdrop-blur-md ${
                unit.color === 'emerald'
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white border-emerald-500/30'
                  : unit.color === 'blue'
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-blue-500/30'
                  : unit.color === 'purple'
                  ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700 text-white border-purple-500/30'
                  : 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white border-amber-500/30'
              }`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <span className="text-3xl p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-inner">
                      {unit.badgeIcon}
                    </span>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80 bg-white/10 px-2.5 py-0.5 rounded-full">
                        {unit.title.split(':')[0]}
                      </span>
                      <h2 className="text-lg md:text-xl font-black text-white tracking-wide mt-0.5">
                        {unit.title.split(':')[1]}
                      </h2>
                      <p className="text-xs text-white/80 font-medium mt-1 max-w-xl">
                        {unit.subtitle}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end md:self-center bg-black/20 px-3.5 py-1.5 rounded-2xl border border-white/10 text-xs font-extrabold whitespace-nowrap">
                    <span>{unitCompletedCount} / {unit.lessons.length} Completed</span>
                  </div>
                </div>
              </div>

              {/* Lesson Path Nodes (Duolingo Staggered Layout) */}
              <div className="relative flex flex-col items-center py-4 space-y-10">
                {/* Curved connecting line behind nodes */}
                <div className="absolute top-8 bottom-8 left-1/2 -translate-x-1/2 w-1.5 bg-slate-200 dark:bg-slate-800/80 rounded-full -z-0 border-t border-b border-dotted" />

                {unit.lessons.map((lesson, idx) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  // Unlocked if previous lesson is done or if it's the very first lesson
                  const isUnlocked = lesson.id === 1 || completedLessonIds.includes(lesson.id - 1) || isDone;

                  // Horizontal offset for Duolingo staggered path: center, left, center, right, center
                  const offsets = ['translate-x-0', '-translate-x-12 sm:-translate-x-20', 'translate-x-0', 'translate-x-12 sm:translate-x-20'];
                  const offsetClass = offsets[idx % offsets.length];

                  return (
                    <div 
                      key={lesson.id} 
                      className={`relative z-10 flex flex-col items-center group transition-all duration-300 ${offsetClass}`}
                    >
                      {/* Node Button */}
                      <button
                        onClick={() => isUnlocked && handleStartLesson(lesson)}
                        disabled={!isUnlocked}
                        className={`relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full transition-all duration-300 transform active:scale-95 ${
                          isDone
                            ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-white shadow-[0_6px_0_0_#047857] hover:brightness-110'
                            : isUnlocked
                            ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0_6px_0_0_#1d4ed8] hover:scale-105 animate-pulse hover:animate-none ring-4 ring-blue-400/40'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 shadow-[0_6px_0_0_#94a3b8] dark:shadow-[0_6px_0_0_#1e293b] cursor-not-allowed'
                        }`}
                      >
                        {/* Status Icon */}
                        <div className="flex flex-col items-center justify-center space-y-0.5">
                          {isDone ? (
                            <>
                              <CheckCircle className="h-8 w-8 text-white drop-shadow-md" />
                              <div className="flex gap-0.5 text-amber-300 text-[10px]">
                                ★★★
                              </div>
                            </>
                          ) : isUnlocked ? (
                            <>
                              <span className="text-2xl sm:text-3xl">{lesson.icon}</span>
                              <span className="text-[9px] font-black uppercase tracking-wider bg-white/20 px-1.5 rounded-full">
                                START
                              </span>
                            </>
                          ) : (
                            <Lock className="h-7 w-7 text-slate-400 dark:text-slate-600" />
                          )}
                        </div>
                      </button>

                      {/* Lesson Label Badge */}
                      <div className={`mt-3 max-w-[220px] text-center p-2.5 rounded-2xl border shadow-lg backdrop-blur-md transition-all ${
                        isDone 
                          ? 'bg-white/95 dark:bg-[#1a2133]/95 border-emerald-200 dark:border-emerald-800/40 text-slate-800 dark:text-slate-200' 
                          : isUnlocked 
                          ? 'bg-white dark:bg-[#1a2133] border-blue-300 dark:border-blue-800 text-slate-900 dark:text-white font-bold' 
                          : 'bg-slate-100/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                      }`}>
                        <div className="text-[11px] font-black line-clamp-1">
                          {lesson.title}
                        </div>
                        <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1 mt-0.5">
                          +{lesson.xp} XP • +{lesson.trilliums} 💎
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Duolingo Lesson Modal */}
      <AnimatePresence>
        {activeLesson && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[#161c2e] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl relative my-auto space-y-6"
            >
              {/* Header: Lesson Title & Progress Bar */}
              <div className="space-y-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeLesson.icon}</span>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">{activeLesson.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{activeLesson.subtitle}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Step Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                      style={{ 
                        width: `${((currentStep + 1) / (1 + 1 + activeLesson.quiz.length)) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest whitespace-nowrap">
                    Step {currentStep + 1} of {1 + 1 + activeLesson.quiz.length}
                  </span>
                </div>
              </div>

              {/* Completion Screen */}
              {isCompleted ? (
                <div className="py-8 text-center space-y-6">
                  <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 animate-bounce">
                    <Trophy className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Lesson Completed! 🎉</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium">
                      Great job! You have mastered {activeLesson.title} and unlocked your rewards.
                    </p>
                  </div>

                  {/* Reward Card */}
                  <div className="flex items-center justify-center gap-6 max-w-xs mx-auto p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-amber-500" />
                      <span className="text-sm font-black text-slate-800 dark:text-white">+{activeLesson.xp} XP</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">💎</span>
                      <span className="text-sm font-black text-slate-800 dark:text-white">+{activeLesson.trilliums} Trilliums</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveLesson(null)}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-2xl shadow-[0_4px_0_0_#047857] active:translate-y-[2px] transition-all text-sm uppercase tracking-wider"
                  >
                    Continue Path →
                  </button>
                </div>
              ) : (
                /* Step Content (Slides -> Tool -> Quiz Questions) */
                <div className="space-y-6">
                  {/* Step 0: Slide Content */}
                  {currentStep === 0 && (
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 space-y-3">
                        <h4 className="text-sm font-extrabold text-blue-600 dark:text-blue-400">
                          {activeLesson.slides[slideIndex]?.title || "Key Concept"}
                        </h4>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {activeLesson.slides[slideIndex]?.content}
                        </p>
                      </div>

                      {/* Key Takeaway Callout */}
                      <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-3">
                        <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-extrabold block text-[10px] uppercase tracking-wider mb-0.5">Key Takeaway</span>
                          {activeLesson.slides[slideIndex]?.keyTakeaway}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2">
                        {slideIndex > 0 ? (
                          <button
                            onClick={() => setSlideIndex(slideIndex - 1)}
                            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                          >
                            ← Back
                          </button>
                        ) : <div />}

                        {slideIndex < activeLesson.slides.length - 1 ? (
                          <button
                            onClick={() => setSlideIndex(slideIndex + 1)}
                            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-md hover:bg-blue-500"
                          >
                            Next Slide →
                          </button>
                        ) : (
                          <button
                            onClick={() => setCurrentStep(1)}
                            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-md hover:bg-emerald-500"
                          >
                            Try Interactive Tool →
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 1: Interactive Tool Simulator */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold uppercase text-blue-500 tracking-wider">Interactive Hands-On Tool</span>
                        {activeLesson.externalLink && (
                          <Link 
                            href={activeLesson.externalLink}
                            className="text-xs text-blue-600 dark:text-blue-400 font-bold underline flex items-center gap-1 hover:text-blue-500"
                          >
                            Open Full Simulator <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </div>

                      <LessonInteractiveTool toolType={activeLesson.toolType} />

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={() => setCurrentStep(0)}
                          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                        >
                          ← Review Slides
                        </button>
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-md hover:bg-blue-500"
                        >
                          Start Knowledge Quiz →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2+: Quiz Question Step */}
                  {currentStep >= 2 && (
                    <div className="space-y-6">
                      {(() => {
                        const qIndex = currentStep - 2;
                        const q = activeLesson.quiz[qIndex];
                        if (!q) return null;

                        const isSubmitted = quizSubmitted[qIndex] || false;
                        const selected = selectedAnswers[qIndex];
                        const isCorrect = selected === q.correctIndex;

                        return (
                          <div className="space-y-5">
                            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-purple-500 tracking-wider">
                              <HelpCircle className="h-4 w-4" />
                              <span>Question {qIndex + 1} of {activeLesson.quiz.length}</span>
                            </div>

                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                              {q.question}
                            </h4>

                            <div className="space-y-2.5">
                              {q.options.map((opt, optIdx) => {
                                let btnStyle = "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800";
                                if (isSubmitted) {
                                  if (optIdx === q.correctIndex) {
                                    btnStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500";
                                  } else if (optIdx === selected) {
                                    btnStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
                                  }
                                } else if (selected === optIdx) {
                                  btnStyle = "bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 font-bold ring-2 ring-blue-500";
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    disabled={isSubmitted}
                                    onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIndex]: optIdx })}
                                    className={`w-full p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all duration-200 flex items-center justify-between ${btnStyle}`}
                                  >
                                    <span>{opt}</span>
                                    {isSubmitted && optIdx === q.correctIndex && (
                                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 ml-2" />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {/* Instant Feedback Explanation Box */}
                            {isSubmitted && (
                              <div className={`p-4 rounded-2xl border text-xs font-medium space-y-1 ${
                                isCorrect 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300' 
                                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/40 text-rose-800 dark:text-rose-300'
                              }`}>
                                <div className="font-extrabold text-xs uppercase tracking-wider">
                                  {isCorrect ? 'Correct! 🎉' : 'Incorrect 💡'}
                                </div>
                                <p>{q.explanation}</p>
                              </div>
                            )}

                            {/* Bottom Action Controls */}
                            <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-800">
                              <button
                                onClick={() => setCurrentStep(currentStep - 1)}
                                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                              >
                                ← Back
                              </button>

                              {!isSubmitted ? (
                                <button
                                  disabled={selected === undefined}
                                  onClick={() => setQuizSubmitted({ ...quizSubmitted, [qIndex]: true })}
                                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold shadow-md hover:bg-blue-500 disabled:opacity-50"
                                >
                                  Submit Answer
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    if (qIndex < activeLesson.quiz.length - 1) {
                                      setCurrentStep(currentStep + 1);
                                    } else {
                                      markLessonComplete(activeLesson);
                                    }
                                  }}
                                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-md hover:bg-emerald-500"
                                >
                                  {qIndex < activeLesson.quiz.length - 1 ? 'Next Question →' : 'Complete Lesson 🎉'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ----------------------------------------------------
// Helper Interactive Tool Component
// ----------------------------------------------------
function LessonInteractiveTool({ toolType }: { toolType: string }) {
  const [val1, setVal1] = useState(5);
  const [val2, setVal2] = useState(100);

  if (toolType === 'inflation_calc') {
    const years = val1;
    const rate = 3.5;
    const futureValue = Math.round(100 / Math.pow(1 + rate / 100, years));
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-4">
        <div className="text-xs font-extrabold uppercase text-slate-400">Inflation Purchasing Power Simulator</div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Time Horizon: {years} Years</span>
          <span className="text-xs font-extrabold text-rose-500">$100 today buys ${futureValue} of goods in {years} yrs</span>
        </div>
        <input 
          type="range" min="1" max="30" value={years} onChange={(e) => setVal1(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
        />
      </div>
    );
  }

  if (toolType === 'compound_calc') {
    const years = val1;
    const monthly = 200;
    const rate = 0.08;
    const months = years * 12;
    const totalInvested = monthly * months;
    const futureWealth = Math.round(monthly * ((Math.pow(1 + rate / 12, months) - 1) / (rate / 12)));
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-4">
        <div className="text-xs font-extrabold uppercase text-slate-400">Compound Growth Calculator ($200/mo @ 8%)</div>
        <div className="flex items-center justify-between text-xs font-bold">
          <span>Investment Duration: {years} Years</span>
          <span className="text-emerald-500 font-black text-sm">${futureWealth.toLocaleString()} Total Portfolio</span>
        </div>
        <input 
          type="range" min="1" max="40" value={years} onChange={(e) => setVal1(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="text-[10px] text-slate-500 flex justify-between">
          <span>Total Cash Saved: ${totalInvested.toLocaleString()}</span>
          <span>Compound Interest Profit: ${(futureWealth - totalInvested).toLocaleString()}</span>
        </div>
      </div>
    );
  }

  if (toolType === 'pe_eval') {
    const price = val2;
    const eps = 5;
    const pe = (price / eps).toFixed(1);
    const valuation = Number(pe) > 25 ? 'Overvalued / High Growth' : Number(pe) < 15 ? 'Bargain / Undervalued' : 'Fair Valuation';
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-4">
        <div className="text-xs font-extrabold uppercase text-slate-400">P/E Ratio Valuation Scanner</div>
        <div className="flex justify-between items-center text-xs font-bold">
          <span>Stock Price: ${price} | EPS: ${eps}</span>
          <span className="text-blue-500 font-black text-sm">P/E Ratio: {pe} ({valuation})</span>
        </div>
        <input 
          type="range" min="20" max="250" step="5" value={price} onChange={(e) => setVal2(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    );
  }

  // Default interactive preview widget for all other tools
  return (
    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 space-y-3 text-center">
      <div className="text-xs font-extrabold uppercase text-blue-500">Interactive Concept Evaluator</div>
      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
        Adjust parameters to simulate live financial scenarios in real time.
      </p>
      <div className="flex justify-center items-center gap-4 pt-2">
        <span className="px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-extrabold text-xs">
          Simulated Yield: +8.4%
        </span>
        <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
          Risk Grade: Low (A+)
        </span>
      </div>
    </div>
  );
}
