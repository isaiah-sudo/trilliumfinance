import { Lesson, Unit } from './page';

export const UNITS_DATA: Unit[] = [
  {
    id: 1,
    title: "Unit 1: Fundamentals of Money & Markets",
    subtitle: "Master core financial concepts, purchasing power, real returns, and stock market mechanics.",
    color: "emerald",
    badgeIcon: "💵",
    lessons: [
      {
        id: 1, unitId: 1, title: "1. Money & Purchasing Power", subtitle: "Understand fiat money, inflation, real vs nominal returns, and currency debasement.", icon: "💵", xp: 50, trilliums: 10,
        slides: [
          { 
            title: "What is Purchasing Power?", 
            content: "Purchasing power is the amount of real goods or services that one unit of currency can buy. Over time, inflation raises the general price level of goods, which means each dollar buys a smaller percentage of a good or service. If inflation averages 3% annually, prices double roughly every 24 years (Rule of 72).", 
            keyTakeaway: "Holding pure cash long-term causes guaranteed loss of real purchasing power. Real Return = Nominal Return - Inflation Rate." 
          },
          { 
            title: "Fiat Currency vs Productive Assets", 
            content: "Fiat currency (like the US Dollar or Euro) is backed by government decree rather than a physical commodity like gold. Central banks can expand the monetary supply (money printing), which dilutes currency value over time. In contrast, productive assets like equities (stocks) and real estate generate cash flows and pricing power that adjust upward with inflation.", 
            keyTakeaway: "To build and preserve wealth, capital must be allocated into productive assets that outpace monetary inflation." 
          }
        ],
        toolType: "inflation_calc",
        quiz: [
          { 
            question: "If your savings account pays a 2% nominal annual interest rate, but CPI inflation is running at 5%, what is your real rate of return?", 
            options: [
              "Positive 7% due to compounding interest",
              "Negative 3% loss in real purchasing power",
              "Positive 3% net gain after adjustments",
              "Zero change because prices and interest cancel out"
            ], 
            correctIndex: 1, 
            explanation: "Real Return = Nominal Rate (2%) - Inflation Rate (5%) = -3%. You lose 3% of your real purchasing power per year." 
          },
          { 
            question: "Why do productive assets like common stocks generally protect against long-term fiat inflation better than paper cash?", 
            options: [
              "Banks are legally obligated to double stock dividends during inflationary periods",
              "Companies can raise prices on their products to match inflation, preserving corporate profit margins",
              "Central banks issue fresh paper cash directly to stock owners every month",
              "Stock prices are pegged to the physical gold standard by government mandate"
            ], 
            correctIndex: 1, 
            explanation: "Productive businesses possess pricing power, allowing them to increase revenues and earnings in tandem with rising consumer prices." 
          }
        ]
      },
      {
        id: 2, unitId: 1, title: "2. How Stock Exchanges Work", subtitle: "Discover how buyers and sellers trade fractional ownership via order books.", icon: "🏛️", xp: 50, trilliums: 10,
        slides: [
          { 
            title: "What is Stock Ownership?", 
            content: "A stock (or share) represents fractional equity ownership in a corporation. If a corporation has issued 10,000,000 total shares outstanding and you acquire 100,000 shares, you own exactly 1.0% of the entire company, including entitlement to 1.0% of all future dividend distributions and net assets upon liquidation.", 
            keyTakeaway: "Stock certificates are not casino tickets; they represent legal claims on real corporate profits and assets." 
          },
          { 
            title: "Order Books, Bids, Asks & Spreads", 
            content: "Exchanges like NYSE and NASDAQ run electronic Limit Order Books matching buyers and sellers. The 'Bid' is the highest price any buyer is currently willing to pay. The 'Ask' (or Offer) is the lowest price any seller is willing to accept. The difference between Bid and Ask is the 'Spread'. Liquidity providers and Market Makers earn revenue on this spread.", 
            keyTakeaway: "Market transactions execute when a buyer hits the seller's Ask price or a seller hits the buyer's Bid price." 
          }
        ],
        toolType: "order_sim",
        quiz: [
          { 
            question: "Company X has 2,500,000 total shares outstanding. You purchase 250,000 shares on NASDAQ. What fraction of the company do you own?", 
            options: [
              "0.1% ownership stake",
              "25.0% ownership stake",
              "10.0% ownership stake",
              "1.0% ownership stake"
            ], 
            correctIndex: 2, 
            explanation: "250,000 / 2,500,000 = 0.10, which represents a 10.0% equity stake in the company." 
          },
          { 
            question: "In a stock order book, if the current highest Bid is $150.10 and the lowest Ask is $150.15, what is the Bid-Ask spread?", 
            options: [
              "$0.05 spread per share",
              "$150.25 combined spread",
              "$0.10 spread per share",
              "$1.50 percent spread"
            ], 
            correctIndex: 0, 
            explanation: "Bid-Ask Spread = Ask ($150.15) - Bid ($150.10) = $0.05." 
          }
        ]
      },
      {
        id: 3, unitId: 1, title: "3. Reading Stock Quotes", subtitle: "Decode tickers, market capitalization, volume, and 52-week trading ranges.", icon: "📊", xp: 50, trilliums: 10,
        slides: [
          { 
            title: "Deconstructing a Live Stock Quote", 
            content: "A standard financial ticker quote includes critical metrics: Ticker Symbol (1-5 character identifier), Current Market Price, Daily Dollar/Percentage Change, Trading Volume (total shares exchanged today), Average Volume, 52-Week High/Low (the price boundary over the past year), and Market Capitalization.", 
            keyTakeaway: "Analyzing trading volume alongside price changes indicates institutional accumulation or distribution." 
          }
        ],
        toolType: "quote_scanner",
        quiz: [
          { 
            question: "What does it indicate when a stock breaks out to a new 52-Week High on 3x its Average Daily Volume?", 
            options: [
              "The stock has been delisted by the exchange compliance committee",
              "Strong institutional buying demand and strong upward price momentum",
              "The company is undergoing forced liquidation and asset bankruptcy",
              "Short sellers have completely bought out all company shares"
            ], 
            correctIndex: 1, 
            explanation: "Heavy volume accompanying a 52-week high signals institutional buying pressure and strong momentum." 
          }
        ]
      },
      {
        id: 4, unitId: 1, title: "4. Cash Flow & Compounding", subtitle: "Learn how compound interest and time horizon generate exponential wealth growth.", icon: "📈", xp: 60, trilliums: 12,
        slides: [
          { 
            title: "The Mechanics of Exponential Compounding", 
            content: "Compound interest is interest calculated on the initial principal AND on the accumulated interest of previous periods. The Future Value formula is FV = P * (1 + r)^t. Because 't' (time in years) is an exponent, compounding growth curve accelerates over long horizons.", 
            keyTakeaway: "Starting to invest 10 years earlier can more than double your final retirement balance due to exponential growth." 
          }
        ],
        toolType: "compound_calc",
        quiz: [
          { 
            question: "According to the Rule of 72, approximately how many years will it take for an investment to double at an 8% annual return?", 
            options: [
              "12.0 years",
              "9.0 years",
              "6.5 years",
              "15.0 years"
            ], 
            correctIndex: 1, 
            explanation: "72 / Annual Interest Rate = 72 / 8 = 9.0 years to double your initial capital." 
          }
        ]
      },
      {
        id: 5, unitId: 1, title: "5. Risk vs Reward & Volatility", subtitle: "Balance portfolio risk, standard deviation, and risk-adjusted returns.", icon: "⚖️", xp: 60, trilliums: 12,
        slides: [
          { 
            title: "Defining Financial Risk & Volatility", 
            content: "Volatility is the statistical measure of price dispersion around its mean, commonly measured by Standard Deviation. Higher volatility indicates wider price swings in short timeframes. In efficient financial markets, higher prospective returns require taking higher potential risk.", 
            keyTakeaway: "Risk is not just losing money; risk is also the probability that returns deviate negatively from expectations." 
          }
        ],
        toolType: "risk_matrix",
        quiz: [
          { 
            question: "Asset A has an expected annual return of 12% with a standard deviation of 25%. Asset B has an expected annual return of 10% with a standard deviation of 8%. Which statement is correct?", 
            options: [
              "Asset A is strictly safer because its expected return is 2% higher",
              "Asset B offers significantly higher risk-adjusted stability with lower price volatility",
              "Asset A guarantees zero chance of capital loss over a 1-year period",
              "Asset B has a negative Sharpe ratio compared to treasury bonds"
            ], 
            correctIndex: 1, 
            explanation: "Asset B offers 10% return for only 8% volatility, presenting much smoother risk-adjusted performance than Asset A's 25% volatility." 
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Unit 2: Stock Valuation & Fundamental Analysis",
    subtitle: "Analyze corporate financial statements, earnings power, valuation multiples, and market cap.",
    color: "blue",
    badgeIcon: "🔍",
    lessons: [
      {
        id: 6, unitId: 2, title: "6. Company Fundamentals & EPS", subtitle: "Analyze income statements, net profit margins, and Earnings Per Share.", icon: "📑", xp: 65, trilliums: 15,
        slides: [
          { 
            title: "Revenue, Operating Income & Net Income", 
            content: "Top-line Revenue represents total sales generated by a business. Operating Income (EBIT) subtracts Cost of Goods Sold (COGS) and Operating Expenses (OpEx). Net Income (the 'Bottom Line') subtracts interest and taxes. Earnings Per Share (EPS) = (Net Income - Preferred Dividends) / Weighted Average Shares Outstanding.", 
            keyTakeaway: "Diluted EPS accounts for potential share conversion from stock options, warrants, and convertible bonds." 
          }
        ],
        toolType: "financial_stmt",
        quiz: [
          { 
            question: "A company reports $500 Million in Revenue, $300 Million in total costs/taxes (Net Income of $200 Million), and has 50 Million shares outstanding. What is its EPS?", 
            options: [
              "$10.00 per share",
              "$4.00 per share",
              "$2.50 per share",
              "$6.00 per share"
            ], 
            correctIndex: 1, 
            explanation: "EPS = Net Income ($200M) / Shares Outstanding (50M) = $4.00 per share." 
          }
        ]
      },
      {
        id: 7, unitId: 2, title: "7. Valuation Multiples & P/E Ratio", subtitle: "Compare Price-to-Earnings, Trailing vs Forward P/E, and relative valuation.", icon: "🏷️", xp: 65, trilliums: 15,
        slides: [
          { 
            title: "The Price-to-Earnings (P/E) Multiple", 
            content: "P/E Ratio = Current Stock Price / Earnings Per Share (EPS). Trailing P/E uses net profits from the past 12 months (TTM). Forward P/E uses analyst projected earnings for the next 12 months. A high P/E implies investors expect rapid future earnings growth or high moat quality.", 
            keyTakeaway: "Comparing a stock's P/E to its historical average and industry peers determines relative valuation." 
          }
        ],
        toolType: "pe_eval",
        quiz: [
          { 
            question: "Stock A trades at $120 with an EPS of $6.00 (P/E = 20). Stock B trades at $40 with an EPS of $1.00 (P/E = 40). Which stock is cheaper relative to its current annual earnings?", 
            options: [
              "Stock B, because its share price is only $40",
              "Stock A, because investors pay $20 per $1 of earnings versus $40 for Stock B",
              "Both stocks are valued identically because price does not matter",
              "Stock B, because its EPS is lower than Stock A's EPS"
            ], 
            correctIndex: 1, 
            explanation: "Stock A has a P/E of 20 ($120/$6), meaning you pay $20 per dollar of profit. Stock B has a P/E of 40 ($40/$1), making Stock A earnings-cheaper." 
          }
        ]
      },
      {
        id: 8, unitId: 2, title: "8. Dividends & Passive Income", subtitle: "Master Dividend Yield, Payout Ratios, DRIP compounding, and Ex-Dates.", icon: "💸", xp: 70, trilliums: 15,
        slides: [
          { 
            title: "Dividend Yield & Coverage Ratios", 
            content: "Dividend Yield = (Annual Dividend Per Share / Stock Price) * 100%. The Payout Ratio = (Annual Dividend Per Share / EPS) * 100%. A Payout Ratio over 80% in cyclical industries indicates the dividend may be unsustainable during economic downturns.", 
            keyTakeaway: "To receive an upcoming dividend, an investor must buy the stock BEFORE the Ex-Dividend Date." 
          }
        ],
        toolType: "dividend_calc",
        quiz: [
          { 
            question: "A company pays a quarterly dividend of $0.50 per share ($2.00 annually). The stock trades at $50.00 per share, and its EPS is $2.50. What are its Dividend Yield and Payout Ratio?", 
            options: [
              "Yield = 4.0%, Payout Ratio = 80.0%",
              "Yield = 1.0%, Payout Ratio = 20.0%",
              "Yield = 8.0%, Payout Ratio = 50.0%",
              "Yield = 5.0%, Payout Ratio = 100.0%"
            ], 
            correctIndex: 0, 
            explanation: "Yield = ($2.00 / $50.00) * 100 = 4.0%. Payout Ratio = ($2.00 / $2.50) * 100 = 80.0%." 
          }
        ]
      },
      {
        id: 9, unitId: 2, title: "9. Market Capitalization Classes", subtitle: "Categorize equities into Mega, Large, Mid, Small, and Micro-Cap tiers.", icon: "🏢", xp: 70, trilliums: 15,
        slides: [
          { 
            title: "Market Cap Tiers & Risk Profiles", 
            content: "Market Cap = Share Price * Total Shares Outstanding. Classifications: Mega-Cap ($200B+), Large-Cap ($10B-$200B), Mid-Cap ($2B-$10B), Small-Cap ($300M-$2B), Micro-Cap (<$300M). Large-caps offer earnings stability and dividends; small-caps present higher growth upside but higher bankruptcy risk.", 
            keyTakeaway: "Market Cap determines index weighting in benchmark indices like the S&P 500." 
          }
        ],
        toolType: "market_cap",
        quiz: [
          { 
            question: "Company Z has 500 Million shares outstanding trading at a market price of $30.00 per share. What is its Market Cap classification?", 
            options: [
              "Small-Cap ($1.5 Billion)",
              "Mid-Cap ($15.0 Billion)",
              "Large-Cap ($15.0 Billion)",
              "Mega-Cap ($150 Billion)"
            ], 
            correctIndex: 2, 
            explanation: "Market Cap = 500M * $30 = $15.0 Billion. Companies between $10B and $200B are classified as Large-Cap." 
          }
        ]
      },
      {
        id: 10, unitId: 2, title: "10. Bull vs Bear Market Cycles", subtitle: "Differentiate market pullbacks, corrections, bear markets, and secular trends.", icon: "🐂", xp: 75, trilliums: 18,
        slides: [
          { 
            title: "Quantifying Market Cycle Thresholds", 
            content: "Pullback: A short drop of 5% to 9.9%. Correction: A drop of 10% to 19.9% from recent peak highs. Bear Market: A sustained decline of 20% or more accompanied by widespread economic pessimism. Bull Market: A rise of 20%+ from bear market lows.", 
            keyTakeaway: "Corrections occur on average once every 1.5 years; bear markets create historic long-term buying opportunities." 
          }
        ],
        toolType: "bull_bear",
        quiz: [
          { 
            question: "The S&P 500 index drops from an all-time peak of 5,000 points down to 4,200 points. How is this market movement classified?", 
            options: [
              "A minor intraday pullback of 5%",
              "A formal Market Correction of 16%",
              "An official Bear Market of 25%",
              "A total economic market crash"
            ], 
            correctIndex: 1, 
            explanation: "Percentage Drop = (5,000 - 4,200) / 5,000 = 800 / 5,000 = 16%. A drop between 10% and 19.9% is a Correction." 
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Unit 3: Portfolio Strategy & Execution Mechanics",
    subtitle: "Master order execution types, sector rotation, index funds, margin debt, and short selling.",
    color: "purple",
    badgeIcon: "💼",
    lessons: [
      {
        id: 11, unitId: 3, title: "11. Order Types: Market, Limit, Stop", subtitle: "Master price control using Market, Limit, Stop-Loss, and Stop-Limit orders.", icon: "🎯", xp: 80, trilliums: 18,
        slides: [
          { 
            title: "Market vs Limit vs Stop Orders", 
            content: "Market Order: Guarantees immediate execution but DOES NOT guarantee price (vulnerable to slippage). Limit Order: Guarantees price (executes at limit price or better) but DOES NOT guarantee execution. Stop-Loss Order: Triggers a market order once price reaches the activation threshold.", 
            keyTakeaway: "Use Limit orders during fast-moving markets to avoid unexpected fill prices." 
          }
        ],
        toolType: "order_type_sim",
        quiz: [
          { 
            question: "You want to buy stock ABC currently trading around $52, but you are only willing to buy if it drops to $48 or lower. Which order type should you place?", 
            options: [
              "Market Buy Order",
              "Stop-Loss Sell Order",
              "Buy Limit Order at $48.00",
              "Trailing Stop Buy Order"
            ], 
            correctIndex: 2, 
            explanation: "A Buy Limit order guarantees you will only buy at your designated target price ($48) or lower." 
          }
        ]
      },
      {
        id: 12, unitId: 3, title: "12. Asset Allocation & Sectors", subtitle: "Diversify capital across 11 GICS sectors and uncorrelated asset classes.", icon: "🍕", xp: 80, trilliums: 18,
        slides: [
          { 
            title: "Sector Diversification & Correlation", 
            content: "The market is divided into 11 GICS sectors (Technology, Financials, Healthcare, Energy, Consumer Staples, etc.). Cyclical sectors (Tech, Industrials) thrive during expansions, while Defensive sectors (Utilities, Healthcare) hold up during recessions. Combining non-correlated assets lowers overall portfolio variance.", 
            keyTakeaway: "True diversification means holding assets that do not move in lockstep during market shocks." 
          }
        ],
        toolType: "sector_pie",
        quiz: [
          { 
            question: "An investor owns 10 different technology growth stocks. What is the main structural weakness of this portfolio?", 
            options: [
              "Excessive diversification across asset classes",
              "High concentration risk in a single market sector vulnerable to tech sector downturns",
              "Low correlation between holdings",
              "Inability to purchase index funds"
            ], 
            correctIndex: 1, 
            explanation: "Owning 10 stocks in the same sector provides false diversification; a single sector shock will depress the entire portfolio." 
          }
        ]
      },
      {
        id: 13, unitId: 3, title: "13. Index Funds & Expense Ratios", subtitle: "Outperform active fund managers using low-cost index ETFs and fee analysis.", icon: "📦", xp: 85, trilliums: 20,
        slides: [
          { 
            title: "Active Management vs Passive Indexing", 
            content: "Index funds track broad market benchmarks (e.g. S&P 500). Active funds employ managers stock-picking to beat the market. Over 15-year periods, >90% of active mutual funds fail to beat passive index benchmarks after accounting for management fees (Expense Ratio).", 
            keyTakeaway: "A 1.0% annual expense ratio can reduce lifetime compounding wealth by over 25% due to lost interest." 
          }
        ],
        toolType: "etf_fee",
        quiz: [
          { 
            question: "Fund A charges an Expense Ratio of 1.25% annually. Fund B charges an Expense Ratio of 0.03% annually. If both hold identical S&P 500 stocks, what is the impact over 30 years?", 
            options: [
              "Fund A will produce higher net returns because higher fees mean better stock picking",
              "Fund B will preserve tens of thousands of dollars more in compounding wealth due to low fees",
              "Both funds will deliver identical net account balances",
              "Fund B will incur higher capital gains tax penalties"
            ], 
            correctIndex: 1, 
            explanation: "Fund B's 0.03% fee lets almost 100% of returns compound, whereas Fund A's 1.25% fee severely erodes long-term gains." 
          }
        ]
      },
      {
        id: 14, unitId: 3, title: "14. Debt, Borrowing & Leverage", subtitle: "Understand margin interest, margin calls, maintenance requirements, and leverage risk.", icon: "💳", xp: 90, trilliums: 20, externalLink: "/dashboard/lesson/debt-leverage",
        slides: [
          { 
            title: "Margin Trading Mechanics & Liquidation", 
            content: "Trading on margin means borrowing cash from your broker using existing securities as collateral. If your equity falls below the broker's Maintenance Margin threshold (e.g. 30%), the broker issues a Margin Call demanding additional cash or forcibly liquidating your stocks at market bottoms.", 
            keyTakeaway: "Leverage multiplies potential percentage gains but equally magnifies percentage losses and default risk." 
          }
        ],
        toolType: "debt_calc",
        quiz: [
          { 
            question: "You have $10,000 cash and use 2:1 margin leverage to buy $20,000 worth of stock. If the stock drops 25%, what is your remaining equity percentage change?", 
            options: [
              "Loss of 25% ($7,500 remaining)",
              "Loss of 50% ($5,000 remaining)",
              "Loss of 100% ($0 remaining)",
              "Gain of 10% after margin interest"
            ], 
            correctIndex: 1, 
            explanation: "20,000 * -25% = -$5,000 portfolio drop. Your equity drops from $10,000 to $5,000, representing a 50% loss on your initial capital." 
          }
        ]
      },
      {
        id: 15, unitId: 3, title: "15. Short Selling & Bearish Bets", subtitle: "Analyze share borrowing, short squeezes, and asymmetric downside risk.", icon: "📉", xp: 90, trilliums: 20,
        slides: [
          { 
            title: "Shorting Mechanics & Short Squeezes", 
            content: "Short selling involves borrowing shares from a lender, selling them immediately at price X, and hoping to buy them back later at a lower price Y to pocket the difference. If the stock surges upward instead, short sellers face forced buying (Short Squeeze) to cover positions.", 
            keyTakeaway: "Long stock positions have capped loss (-100%) and infinite upside. Short positions have capped upside (+100%) and UNLIMITED potential loss." 
          }
        ],
        toolType: "short_sim",
        quiz: [
          { 
            question: "Why is short selling a stock considered structurally riskier than buying a long stock position?", 
            options: [
              "Short positions do not allow placing stop-loss orders",
              "A stock's price can rise infinitely, creating unlimited potential dollar losses for short sellers",
              "Short selling is only permitted during official bear markets",
              "Brokers charge 50% commission fees on all short trades"
            ], 
            correctIndex: 1, 
            explanation: "Because there is no upper limit to a stock's price, short sellers face theoretically infinite upside risk exposure." 
          }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Unit 4: Advanced Trading & Macroeconomics",
    subtitle: "Master options derivatives, technical chart indicators, tax strategies, and DCA discipline.",
    color: "amber",
    badgeIcon: "🎓",
    lessons: [
      {
        id: 16, unitId: 4, title: "16. Options Mechanics: Calls & Puts", subtitle: "Understand strike prices, expirations, option premiums, and intrinsic value.", icon: "⚡", xp: 95, trilliums: 25,
        slides: [
          { 
            title: "Call Options vs Put Options", 
            content: "Call Option: Gives buyer the RIGHT (not obligation) to BUY 100 shares at Strike Price before expiration. Put Option: Gives buyer the RIGHT to SELL 100 shares at Strike Price. Option Premium = Intrinsic Value + Time Value (Extrinsic). Options decay over time (Theta).", 
            keyTakeaway: "Buying options controls 100 shares per contract with limited capital, but options can expire completely worthless." 
          }
        ],
        toolType: "options_payoff",
        quiz: [
          { 
            question: "You buy a Call Option with a Strike Price of $100 for a $5 premium. At expiration, the stock price is $115. What is your net profit per share?", 
            options: [
              "$15.00 net profit per share",
              "$10.00 net profit per share ($1,000 total per contract)",
              "$5.00 net loss per share",
              "$0.00 break-even"
            ], 
            correctIndex: 1, 
            explanation: "Intrinsic Value = Market Price ($115) - Strike ($100) = $15. Net Profit = Intrinsic Value ($15) - Premium Paid ($5) = $10 per share ($1,000 per 100-share contract)." 
          }
        ]
      },
      {
        id: 17, unitId: 4, title: "17. Technical Analysis & Chart Patterns", subtitle: "Analyze OHLC candlesticks, trendlines, volume confirmation, and price action.", icon: "🕯️", xp: 95, trilliums: 25,
        slides: [
          { 
            title: "Reading Candlesticks & Technical Signals", 
            content: "Candlestick charts plot Open, High, Low, Close (OHLC). The body represents distance between Open and Close; wicks show extreme intraday high and low prices. Green candle = Close > Open; Red candle = Close < Open.", 
            keyTakeaway: "Technical indicators reflect human psychology and market supply/demand balances." 
          }
        ],
        toolType: "chart_pattern",
        quiz: [
          { 
            question: "A stock opens at $50, reaches an intraday high of $58, drops to a low of $49, and closes at $57. What does the candlestick look like?", 
            options: [
              "A long red body with no lower wick",
              "A long green body with a short lower wick and an upper wick extending to $58",
              "A Doji candle with zero real body width",
              "A shooting star reversal candle closing at $49"
            ], 
            correctIndex: 1, 
            explanation: "Since Close ($57) is higher than Open ($50), it is a green candle with a $7 body, a $1 lower wick (49 to 50), and a $1 upper wick (57 to 58)." 
          }
        ]
      },
      {
        id: 18, unitId: 4, title: "18. Macroeconomics & The Federal Reserve", subtitle: "Understand Fed Funds Rate, inflation controls, and monetary policy impacts on equity values.", icon: "🌐", xp: 100, trilliums: 25,
        slides: [
          { 
            title: "Federal Reserve Rates & Discount Rates", 
            content: "The Federal Reserve controls the Federal Funds Rate. When inflation rises, the Fed raises benchmark interest rates to increase corporate borrowing costs, slowing economic expansion. Higher risk-free yields discount future earnings, lowering stock valuation multiples (P/E ratios).", 
            keyTakeaway: "'Don't fight the Fed' is a classic rule: rising interest rates create headwinds for high-growth tech stocks." 
          }
        ],
        toolType: "fed_rate",
        quiz: [
          { 
            question: "Why do aggressive Federal Reserve interest rate hikes typically depress high-growth technology stock prices?", 
            options: [
              "Higher discount rates lower the present value of future cash flows, and higher debt costs shrink profit margins",
              "Technology companies are legally prohibited from holding cash during rate hike cycles",
              "Rate hikes force commercial banks to shut down retail trading accounts",
              "Higher rates instantly convert corporate stocks into Treasury bonds"
            ], 
            correctIndex: 0, 
            explanation: "Higher interest rates increase the discount rate (WACC) used in valuation models, making distant future tech earnings worth less in present value terms." 
          }
        ]
      },
      {
        id: 19, unitId: 4, title: "19. Capital Gains Taxes & Wealth Building", subtitle: "Distinguish Short-Term vs Long-Term tax brackets, Wash Sale rules, and tax efficiency.", icon: "🏛️", xp: 100, trilliums: 25,
        slides: [
          { 
            title: "Capital Gains Tax Rates & Wash Sales", 
            content: "Assets held for 365 days or less incur Short-Term Capital Gains taxed at ordinary income rates (up to 37%). Holding an asset for over 1 year qualifies for preferential Long-Term Capital Gains rates (0%, 15%, or 20%). The Wash Sale Rule disallows tax deductions if you buy a 'substantially identical' stock within 30 days of selling at a loss.", 
            keyTakeaway: "Patience pays: holding assets for over 1 year saves up to 17%+ in federal tax rates." 
          }
        ],
        toolType: "tax_calc",
        quiz: [
          { 
            question: "You buy a stock for $10,000 and sell it 14 months later for $25,000. Assuming your taxable income puts you in the 15% long-term tax bracket versus 24% ordinary bracket, how much tax do you pay?", 
            options: [
              "$3,600 short-term tax",
              "$2,250 long-term capital gains tax",
              "$3,750 total income tax",
              "$1,500 state excise tax"
            ], 
            correctIndex: 1, 
            explanation: "Capital Gain = $25,000 - $10,000 = $15,000. Because holding period > 1 year, Long-Term Tax = $15,000 * 15% = $2,250." 
          }
        ]
      },
      {
        id: 20, unitId: 4, title: "20. Dollar-Cost Averaging & Financial Freedom", subtitle: "Execute automated DCA, eliminate market timing emotions, and build generational wealth.", icon: "👑", xp: 120, trilliums: 30,
        slides: [
          { 
            title: "Dollar-Cost Averaging (DCA) Strategy", 
            content: "Dollar-Cost Averaging involves investing a fixed dollar amount into a security on a regular schedule (e.g. $500 on the 1st of every month), regardless of market volatility. When prices drop, your fixed dollars purchase MORE shares. When prices rise, your fixed dollars purchase FEWER shares.", 
            keyTakeaway: "DCA automates investment discipline and eliminates the dangerous impulse to time market tops and bottoms." 
          }
        ],
        toolType: "dca_vs_lump",
        quiz: [
          { 
            question: "What is the primary psychological and structural advantage of Dollar-Cost Averaging (DCA)?", 
            options: [
              "It guarantees you will never buy a stock during a market correction",
              "It enforces disciplined accumulation and automatically buys more shares when prices drop without emotional guessing",
              "It removes all market risk and guarantees positive monthly returns",
              "It waives all broker transaction fees and dividend tax duties"
            ], 
            correctIndex: 1, 
            explanation: "DCA builds automated investing discipline, ensuring you acquire more shares at bargain prices without trying to time market swings." 
          }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Unit 5: Macroeconomics & Global Markets",
    subtitle: "Navigate inflation metrics, GDP cycles, central bank liquidity, and foreign currency risk.",
    color: "emerald",
    badgeIcon: "🌍",
    lessons: [
      {
        id: 21, unitId: 5, title: "21. CPI & Inflation Indicators", subtitle: "Analyze Headline vs Core CPI, PCE inflation metrics, and purchasing power erosion.", icon: "📊", xp: 120, trilliums: 30,
        slides: [
          { 
            title: "Understanding CPI & Core CPI", 
            content: "The Consumer Price Index (CPI) measures the average change over time in prices paid by urban consumers for a market basket of goods and services. 'Core CPI' excludes volatile food and energy prices to reveal underlying sticky inflation trends.", 
            keyTakeaway: "Central banks monitor Core CPI and PCE metrics when setting interest rate policy." 
          }
        ],
        toolType: "inflation_calc",
        quiz: [
          { 
            question: "Why do central bank policymakers focus on Core CPI rather than Headline CPI when making long-term interest rate decisions?", 
            options: [
              "Headline CPI excludes all housing and healthcare expenses",
              "Core CPI strips out volatile food and energy prices, providing a clearer view of underlying structural inflation",
              "Headline CPI is calculated by private commercial banks rather than government agencies",
              "Core CPI automatically includes stock market capital gains metrics"
            ], 
            correctIndex: 1, 
            explanation: "Core CPI excludes food and energy due to short-term price shocks (weather, oil geopolitical spikes), giving a truer measure of systemic inflation." 
          }
        ]
      },
      {
        id: 22, unitId: 5, title: "22. Gross Domestic Product (GDP)", subtitle: "Analyze GDP components, real vs nominal growth, and recession definitions.", icon: "🏗️", xp: 125, trilliums: 30,
        slides: [
          { 
            title: "GDP Components & Recession Criteria", 
            content: "GDP measures total market value of goods/services produced: GDP = C (Consumption) + I (Investment) + G (Government Spending) + Net Exports (X - M). Real GDP adjusts nominal output for inflation. A Technical Recession is defined as two consecutive quarters of negative Real GDP growth.", 
            keyTakeaway: "Corporate revenue growth tracks broader national Nominal GDP expansion over long horizons." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "If a country's Nominal GDP grows by 4.0% in a year, but inflation runs at 5.5% over the same period, what happened to Real GDP?", 
            options: [
              "Real GDP expanded by 9.5%",
              "Real GDP contracted by 1.5%",
              "Real GDP remained perfectly flat at 0%",
              "Real GDP expanded by 1.5%"
            ], 
            correctIndex: 1, 
            explanation: "Real GDP Growth = Nominal GDP Growth (4.0%) - Inflation Rate (5.5%) = -1.5% economic contraction." 
          }
        ]
      },
      {
        id: 23, unitId: 5, title: "23. Bond Yields & Inverted Yield Curves", subtitle: "Analyze Treasury yield curves, term premiums, and recession warning signals.", icon: "📉", xp: 130, trilliums: 35,
        slides: [
          { 
            title: "The Inverted Yield Curve Signal", 
            content: "Normally, long-term bonds (10-Year Treasury) yield higher interest than short-term bonds (2-Year Treasury) to compensate for time risk. An Inverted Yield Curve occurs when 2-Year yields exceed 10-Year yields. Historically, an inverted yield curve has preceded every US recession over the past 50 years.", 
            keyTakeaway: "Inversion signifies that market participants expect central bank rate cuts due to impending economic slump." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "What specific yield relationship constitutes an 'Inverted Yield Curve' in fixed-income markets?", 
            options: [
              "10-Year Treasury bond yields rise higher than corporate junk bond yields",
              "Short-term bond yields (e.g. 2-Year) rise ABOVE long-term bond yields (e.g. 10-Year)",
              "Government bond yields drop to zero percent across all maturities",
              "Municipal bond yields exceed federal dividend tax rates"
            ], 
            correctIndex: 1, 
            explanation: "An inverted yield curve happens when short-term interest rates exceed long-term interest rates, signaling institutional recession expectation." 
          }
        ]
      },
      {
        id: 24, unitId: 5, title: "24. Quantitative Easing vs Tightening", subtitle: "Master central bank balance sheet expansion (QE) and contraction (QT).", icon: "🏦", xp: 135, trilliums: 35,
        slides: [
          { 
            title: "Central Bank Liquidity Cycles", 
            content: "Quantitative Easing (QE): Central bank purchases government bonds to inject cash into financial institutions, expanding M2 money supply and lowering borrowing rates. Quantitative Tightening (QT): Central bank sells assets or allows bonds to mature without reinvestment, shrinking market liquidity.", 
            keyTakeaway: "QE expands asset price valuations; QT drains market liquidity and compresses valuation multiples." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "How does Quantitative Tightening (QT) directly affect commercial market liquidity?", 
            options: [
              "It increases the M2 money supply and inflates stock prices",
              "The central bank reduces its balance sheet by absorbing cash out of the banking system, tightening liquidity",
              "It forces commercial banks to eliminate interest rates on mortgage loans",
              "It requires public corporations to issue fresh stock dividends"
            ], 
            correctIndex: 1, 
            explanation: "QT shrinks the central bank balance sheet, pulling liquidity out of the financial system and tightening monetary conditions." 
          }
        ]
      },
      {
        id: 25, unitId: 5, title: "25. Foreign Exchange & Currency Risk", subtitle: "Analyze US Dollar Index ($DXY), currency translation, and multinational earnings.", icon: "💱", xp: 140, trilliums: 40,
        slides: [
          { 
            title: "US Dollar Strength ($DXY) & International Revenue", 
            content: "When the US Dollar strengthens ($DXY increases), products priced in USD become more expensive for foreign buyers. Additionally, US multinational companies (like Apple or Microsoft) suffer negative currency translation effects when converting foreign sales back into USD.", 
            keyTakeaway: "A surging dollar acts as an earnings headwind for major US exporters." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "A US multinational corporation generates 40% of its revenue in Euros. If the Euro depreciates 15% against the US Dollar, what is the impact on US financial statements?", 
            options: [
              "European sales translate into fewer US Dollars, creating an earnings translation headwind",
              "European sales automatically double in dollar value on income statements",
              "The company receives a 15% tax credit from the IRS",
              "There is zero effect because foreign exchange rates do not affect accounting"
            ], 
            correctIndex: 0, 
            explanation: "A weaker Euro means foreign revenue converts into fewer US dollars, dragging down reported revenue and net income." 
          }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Unit 6: Financial Statement Analysis",
    subtitle: "Master corporate balance sheets, cash flow statements, solvency ratios, and profit margins.",
    color: "blue",
    badgeIcon: "📊",
    lessons: [
      {
        id: 26, unitId: 6, title: "26. Balance Sheet: Assets & Liabilities", subtitle: "Master Assets = Liabilities + Shareholders' Equity and Working Capital.", icon: "⚖️", xp: 140, trilliums: 40,
        slides: [
          { 
            title: "The Fundamental Accounting Equation", 
            content: "Assets = Liabilities + Shareholders' Equity. Assets: Current (cash, accounts receivable, inventory) and Non-Current (property, equipment, patents). Liabilities: Current (short-term debt, payables) and Non-Current (long-term bonds). Working Capital = Current Assets - Current Liabilities.", 
            keyTakeaway: "Working capital measures a firm's operational liquidity and short-term solvency health." 
          }
        ],
        toolType: "financial_stmt",
        quiz: [
          { 
            question: "A corporation has $50M in Total Assets and $30M in Total Liabilities. If Current Assets are $20M and Current Liabilities are $10M, what are its Shareholders' Equity and Working Capital?", 
            options: [
              "Equity = $80M, Working Capital = $30M",
              "Equity = $20M, Working Capital = $10M",
              "Equity = $30M, Working Capital = $20M",
              "Equity = $10M, Working Capital = $5M"
            ], 
            correctIndex: 1, 
            explanation: "Equity = Assets ($50M) - Liabilities ($30M) = $20M. Working Capital = Current Assets ($20M) - Current Liabilities ($10M) = $10M." 
          }
        ]
      },
      {
        id: 27, unitId: 6, title: "27. Cash Flow Statement Mechanics", subtitle: "Analyze Operating, Investing, and Financing Cash Flows and Free Cash Flow (FCF).", icon: "🌊", xp: 145, trilliums: 40,
        slides: [
          { 
            title: "Cash Flow Sections & Free Cash Flow", 
            content: "Operating Cash Flow (OCF): Cash from core business operations. Investing Cash Flow (ICF): Capital expenditures (CapEx) and acquisitions. Financing Cash Flow (FCF): Issuing/repaying debt, dividend payouts, stock buybacks. Free Cash Flow (FCF) = Operating Cash Flow - CapEx.", 
            keyTakeaway: "Accounting profit can be manipulated; Free Cash Flow represents real spendable cash." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "A company reports $100M in Operating Cash Flow, spends $30M on Capital Expenditures (CapEx), and pays $15M in stock dividends. What is its Free Cash Flow (FCF)?", 
            options: [
              "$55 Million",
              "$70 Million",
              "$85 Million",
              "$115 Million"
            ], 
            correctIndex: 1, 
            explanation: "Free Cash Flow = Operating Cash Flow ($100M) - CapEx ($30M) = $70 Million. Dividend payments belong to Financing cash flows." 
          }
        ]
      },
      {
        id: 28, unitId: 6, title: "28. Debt-to-Equity & Solvent Ratios", subtitle: "Evaluate Leverage Ratios, Current Ratio, Quick Ratio, and Interest Coverage.", icon: "🛡️", xp: 150, trilliums: 45,
        slides: [
          { 
            title: "Solvency & Coverage Ratios", 
            content: "Debt-to-Equity (D/E) = Total Debt / Shareholders' Equity. Current Ratio = Current Assets / Current Liabilities. Interest Coverage Ratio = Operating Income (EBIT) / Interest Expense. An Interest Coverage below 1.5 indicates a dangerous default risk if revenue declines.", 
            keyTakeaway: "High debt levels amplify returns during economic booms but trigger insolvency during downturns." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "Company Y has $40M in EBIT (Operating Income) and annual interest payments of $20M on its corporate bonds. What is its Interest Coverage Ratio?", 
            options: [
              "0.5x coverage",
              "2.0x coverage",
              "4.0x coverage",
              "8.0x coverage"
            ], 
            correctIndex: 1, 
            explanation: "Interest Coverage Ratio = EBIT ($40M) / Interest Expense ($20M) = 2.0x." 
          }
        ]
      },
      {
        id: 29, unitId: 6, title: "29. Gross, Operating & Net Margins", subtitle: "Analyze Corporate Profit Margins, Cost Structures, and Pricing Power.", icon: "📐", xp: 150, trilliums: 45,
        slides: [
          { 
            title: "Profitability Margin Breakdown", 
            content: "Gross Margin % = ((Revenue - COGS) / Revenue) * 100. Operating Margin % = (Operating Income / Revenue) * 100. Net Margin % = (Net Income / Revenue) * 100. High gross margins (>60%) signal competitive moats and strong pricing power.", 
            keyTakeaway: "Expanding operating margins demonstrate operational leverage as revenue grows faster than fixed costs." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "A company generates $200M in Revenue, has $80M in COGS, and reports $40M in Net Income. What are its Gross Margin and Net Margin?", 
            options: [
              "Gross Margin = 60.0%, Net Margin = 20.0%",
              "Gross Margin = 40.0%, Net Margin = 20.0%",
              "Gross Margin = 80.0%, Net Margin = 40.0%",
              "Gross Margin = 50.0%, Net Margin = 25.0%"
            ], 
            correctIndex: 0, 
            explanation: "Gross Margin = ($200M - $80M) / $200M = $120M / $200M = 60.0%. Net Margin = $40M / $200M = 20.0%." 
          }
        ]
      },
      {
        id: 30, unitId: 6, title: "30. Return on Equity (ROE) & ROIC", subtitle: "Master DuPont Analysis, Return on Capital, and managerial efficiency.", icon: "🏅", xp: 160, trilliums: 50,
        slides: [
          { 
            title: "Capital Return Metrics: ROE & ROIC", 
            content: "Return on Equity (ROE) = Net Income / Equity. Return on Invested Capital (ROIC) = NOPAT / (Debt + Equity - Cash). ROIC measures how effectively a corporate executive team generates profits using all invested capital. Outstanding companies consistently generate ROIC > 15%.", 
            keyTakeaway: "A high ROIC exceeding the Weighted Average Cost of Capital (WACC) creates genuine economic value." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "Why do financial analysts prefer ROIC over ROE when evaluating capital efficiency across heavily debt-leveraged companies?", 
            options: [
              "ROE can be artificially inflated by taking on dangerous amounts of debt, whereas ROIC measures returns across total invested capital",
              "ROE excludes net income from its calculations",
              "ROIC is mandated by international accounting law while ROE is optional",
              "ROE only applies to non-profit organizations"
            ], 
            correctIndex: 0, 
            explanation: "Because taking on heavy debt shrinks the equity denominator (raising ROE artificially), ROIC provides a truer measure of business profitability across total capital." 
          }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Unit 7: Valuation Models & Equity Research",
    subtitle: "Perform DCF intrinsic valuation, EV/EBITDA multiples, Price-to-Book, and Economic Moat analysis.",
    color: "purple",
    badgeIcon: "💎",
    lessons: [
      {
        id: 31, unitId: 7, title: "31. Intrinsic Value & DCF Modeling", subtitle: "Discount future expected cash flows to determine intrinsic stock fair value.", icon: "🧮", xp: 165, trilliums: 50,
        slides: [
          { 
            title: "Discounted Cash Flow (DCF) Theory", 
            content: "A stock's intrinsic value equals the sum of all its future cash flows discounted back to present value using a discount rate (WACC). PV = CF_t / (1 + WACC)^t. The model adds a Terminal Value to capture cash flow beyond the explicit forecast period.", 
            keyTakeaway: "If Intrinsic Fair Value > Current Stock Price, the stock is trading at a Margin of Safety." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "If a company's calculated DCF Intrinsic Fair Value is $80.00 per share, but the market price is currently trading at $55.00, what does this indicate?", 
            options: [
              "The stock is overvalued by $25 per share",
              "The stock is trading at a $25 per share Margin of Safety (undervalued)",
              "The company is approaching forced bankruptcy",
              "The discount rate used in the model was zero percent"
            ], 
            correctIndex: 1, 
            explanation: "When intrinsic value ($80) is higher than market price ($55), the asset is undervalued, providing a margin of safety for value investors." 
          }
        ]
      },
      {
        id: 32, unitId: 7, title: "32. Enterprise Value & EV/EBITDA", subtitle: "Master Enterprise Value (EV) and capital-structure-neutral valuation multiples.", icon: "🏛️", xp: 170, trilliums: 55,
        slides: [
          { 
            title: "Calculating Enterprise Value", 
            content: "Enterprise Value (EV) = Market Capitalization + Total Debt - Cash & Cash Equivalents. EV represents the true takeover price of a company. EV/EBITDA compares core operating earnings before interest, tax, depreciation, and amortization across firms with different leverage structures.", 
            keyTakeaway: "EV accounts for debt obligations an acquirer must assume and cash they acquire." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "Company A has a Market Cap of $100M, $40M in Total Debt, and $10M in Cash. What is its Enterprise Value (EV)?", 
            options: [
              "$70 Million",
              "$130 Million",
              "$150 Million",
              "$90 Million"
            ], 
            correctIndex: 1, 
            explanation: "EV = Market Cap ($100M) + Debt ($40M) - Cash ($10M) = $130 Million." 
          }
        ]
      },
      {
        id: 33, unitId: 7, title: "33. Price-to-Book (P/B) Ratio", subtitle: "Value asset-heavy financial institutions, banks, and tangible asset firms.", icon: "📚", xp: 175, trilliums: 55,
        slides: [
          { 
            title: "Price-to-Book Valuation Mechanics", 
            content: "P/B Ratio = Stock Price / Book Value Per Share (BVPS), where Book Value = Assets - Liabilities. A P/B below 1.0 means the stock is selling for less than the net liquidation accounting value of its assets.", 
            keyTakeaway: "P/B is the standard valuation metric for banks, real estate (REITs), and capital-heavy industrial companies." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "A bank stock has a Book Value per share of $25.00 and is currently trading at $20.00 per share. What is its P/B Ratio and what does it suggest?", 
            options: [
              "P/B = 1.25, indicating a high growth premium",
              "P/B = 0.80, indicating the stock trades below its net asset value",
              "P/B = 5.00, indicating high corporate leverage",
              "P/B = 2.00, indicating fair market efficiency"
            ], 
            correctIndex: 1, 
            explanation: "P/B = Price ($20) / Book Value ($25) = 0.80. Trading below 1.0 means it trades at a discount to book value." 
          }
        ]
      },
      {
        id: 34, unitId: 7, title: "34. PEG Ratio (Growth-Adjusted P/E)", subtitle: "Adjust valuation multiples for growth rates using GARP investing principles.", icon: "🚀", xp: 180, trilliums: 60,
        slides: [
          { 
            title: "Growth-Adjusted Valuation (PEG)", 
            content: "PEG Ratio = P/E Ratio / Annual EPS Growth Rate (%). A stock with P/E = 30 and 30% growth has PEG = 1.0. Generally, PEG = 1.0 implies fair valuation for high-growth firms; PEG < 1.0 suggests an undervalued Growth at a Reasonable Price (GARP) candidate.", 
            keyTakeaway: "PEG allows fair comparison between high-P/E tech stocks and low-P/E utility stocks." 
          }
        ],
        toolType: "pe_eval",
        quiz: [
          { 
            question: "Tech Company A trades at a P/E of 40 with 50% projected annual growth (PEG = 0.8). Utility Company B trades at a P/E of 15 with 5% annual growth (PEG = 3.0). Which stock offers a better growth-adjusted valuation?", 
            options: [
              "Utility Company B, because its P/E is only 15",
              "Tech Company A, because its lower PEG ratio (0.8) indicates you are paying less per unit of earnings growth",
              "Both companies are equally valued",
              "Utility Company B, because 5% growth is guaranteed"
            ], 
            correctIndex: 1, 
            explanation: "Tech Company A's PEG of 0.8 (< 1.0) shows its high P/E is more than justified by its massive 50% growth rate." 
          }
        ]
      },
      {
        id: 35, unitId: 7, title: "35. Warren Buffett's Economic Moats", subtitle: "Identify Network Effects, Brand Power, Switching Costs, and Cost Advantages.", icon: "🏰", xp: 190, trilliums: 65,
        slides: [
          { 
            title: "Structural Competitive Moats", 
            content: "An Economic Moat is a sustainable competitive advantage that protects corporate profit margins against rivals. 5 Key Moats: 1. Network Effects (Visa), 2. High Switching Costs (Enterprise Software), 3. Intangible Assets/Brands (Apple, Coca-Cola), 4. Cost Advantage (Walmart), 5. Efficient Scale.", 
            keyTakeaway: "Companies with wide moats generate high Return on Capital for decades." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "Which of the following corporate scenarios represents a classic 'Network Effect' economic moat?", 
            options: [
              "A business cuts employee wages by 10% to reduce short-term costs",
              "A payment platform becomes exponentially more valuable to new users as more merchants and consumers adopt it",
              "A company receives a one-time government tax rebate",
              "A retail store relocates to a bigger suburban building"
            ], 
            correctIndex: 1, 
            explanation: "Network Effects occur when each additional user added to a platform increases the value of the network for all existing users." 
          }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Unit 8: Technical Trading & Charting Strategies",
    subtitle: "Master Moving Averages, RSI Oscillators, MACD Crossovers, Support/Resistance, and Candlesticks.",
    color: "amber",
    badgeIcon: "📈",
    lessons: [
      {
        id: 36, unitId: 8, title: "36. Moving Averages & Golden Cross", subtitle: "Master 50-day and 200-day Simple Moving Averages, Golden Crosses, and Death Crosses.", icon: "✝️", xp: 195, trilliums: 65,
        slides: [
          { 
            title: "Golden Cross vs Death Cross Signals", 
            content: "Simple Moving Averages (SMA) smooth price trends. Golden Cross: 50-day SMA crosses ABOVE 200-day SMA -> Major institutional Bullish trend breakout. Death Cross: 50-day SMA crosses BELOW 200-day SMA -> Bearish trend breakdown.", 
            keyTakeaway: "Moving average crossovers lag price action but confirm long-term macro trend direction." 
          }
        ],
        toolType: "chart_pattern",
        quiz: [
          { 
            question: "What technical chart event signals an official 'Golden Cross' momentum breakout?", 
            options: [
              "The 50-day SMA crosses ABOVE the 200-day SMA",
              "The 200-day SMA crosses ABOVE the 50-day SMA",
              "The stock price drops below its 52-week low on zero volume",
              "The RSI indicator drops below 10"
            ], 
            correctIndex: 0, 
            explanation: "A Golden Cross occurs when the faster 50-day moving average crosses above the slower 200-day moving average, signaling long-term bullish trend." 
          }
        ]
      },
      {
        id: 37, unitId: 8, title: "37. Relative Strength Index (RSI)", subtitle: "Spot Overbought (>70) and Oversold (<30) momentum conditions and RSI divergence.", icon: "⚡", xp: 200, trilliums: 70,
        slides: [
          { 
            title: "RSI Ranges & Divergence", 
            content: "RSI is a momentum oscillator bounded between 0 and 100. RSI > 70: Overbought territory (asset is overextended, risk of pullback). RSI < 30: Oversold territory (asset is oversold, potential bounce candidate). Bullish Divergence: Price makes lower low but RSI makes higher low.", 
            keyTakeaway: "Avoid chasing buying breakouts when RSI is above 75." 
          }
        ],
        toolType: "chart_pattern",
        quiz: [
          { 
            question: "A stock price drops to a new 6-month low of $40, but its 14-day RSI makes a higher low of 34 (up from 22 previously). What technical setup is forming?", 
            options: [
              "Bearish Breakdown Confirmation",
              "Bullish RSI Divergence (potential reversal signal)",
              "Death Cross continuation",
              "Overbought momentum extreme"
            ], 
            correctIndex: 1, 
            explanation: "Bullish Divergence occurs when price makes a lower low while RSI makes a higher low, signaling underlying downside exhaustion." 
          }
        ]
      },
      {
        id: 38, unitId: 8, title: "38. MACD Indicator & Convergence", subtitle: "Track Moving Average Convergence Divergence line crossovers and histogram momentum.", icon: "〰️", xp: 205, trilliums: 70,
        slides: [
          { 
            title: "MACD Line, Signal Line & Histogram", 
            content: "MACD Line = 12-period EMA - 26-period EMA. Signal Line = 9-period EMA of MACD Line. MACD Histogram = MACD Line - Signal Line. Bullish Crossover: MACD Line crosses above Signal Line.", 
            keyTakeaway: "Expanding positive histogram bars indicate accelerating buyer momentum." 
          }
        ],
        toolType: "chart_pattern",
        quiz: [
          { 
            question: "What technical buy signal is generated by the MACD indicator?", 
            options: [
              "The MACD Line crosses ABOVE the 9-period Signal Line from below",
              "The MACD Histogram drops below zero",
              "The 26-period EMA exceeds the stock price",
              "The stock trades below its lower Bollinger Band"
            ], 
            correctIndex: 0, 
            explanation: "When the faster MACD line crosses above the slower Signal line, it generates a bullish buying momentum signal." 
          }
        ]
      },
      {
        id: 39, unitId: 8, title: "39. Support, Resistance & Breakouts", subtitle: "Trade key price floors, ceilings, volume breakouts, and role reversal dynamics.", icon: "🧱", xp: 210, trilliums: 75,
        slides: [
          { 
            title: "Support/Resistance Role Reversal", 
            content: "Support: Price floor where buying demand overcomes selling pressure. Resistance: Price ceiling where selling supply overcomes buying demand. Principle of Role Reversal: Once resistance is convincingly broken on high volume, that resistance level becomes future Support.", 
            keyTakeaway: "Never buy resistance without volume breakout confirmation." 
          }
        ],
        toolType: "chart_pattern",
        quiz: [
          { 
            question: "Stock XYZ has struggled to break above a strong Resistance ceiling at $100 for a year. It finally surges to $108 on 4x average volume. According to technical role reversal, what does $100 now represent?", 
            options: [
              "A new Resistance ceiling at $100",
              "A new strong Support floor at $100",
              "A delisting price zone",
              "An invalid technical level"
            ], 
            correctIndex: 1, 
            explanation: "Under the Principle of Role Reversal, once a resistance ceiling is broken, it turns into a new support floor on subsequent pullbacks." 
          }
        ]
      },
      {
        id: 40, unitId: 8, title: "40. Candlestick Patterns: Hammer & Engulfing", subtitle: "Identify Bullish Hammers, Shooting Stars, Dojis, and Bearish Engulfing patterns.", icon: "🕯️", xp: 220, trilliums: 80,
        slides: [
          { 
            title: "Reversal Candlestick Formations", 
            content: "Bullish Hammer: Small upper body with a long lower wick (2-3x body length) at the end of a downtrend, showing aggressive buyer rejection of lower prices. Bullish Engulfing: Large green body completely engulfs prior red body. Doji: Open and Close are identical, signaling market indecision.", 
            keyTakeaway: "Long lower wicks indicate strong price rejection by buyers at low price levels." 
          }
        ],
        toolType: "chart_pattern",
        quiz: [
          { 
            question: "A stock experiences a 5-day selloff down to $50, where it forms a candlestick with a tiny real body at $54 and a long lower wick extending down to $48. What pattern is this?", 
            options: [
              "Bearish Shooting Star",
              "Bullish Hammer Reversal Signal",
              "Head and Shoulders breakdown",
              "Bearish Engulfing candle"
            ], 
            correctIndex: 1, 
            explanation: "A small body near the high of the day with a long lower shadow after a downtrend defines a Bullish Hammer reversal." 
          }
        ]
      }
    ]
  },
  {
    id: 9,
    title: "Unit 9: Risk Management & Derivatives",
    subtitle: "Master Portfolio Beta, Covered Calls, Cash-Secured Puts, Protective Puts, and 2% Position Sizing.",
    color: "emerald",
    badgeIcon: "🛡️",
    lessons: [
      {
        id: 41, unitId: 9, title: "41. Portfolio Beta & Sharpe Ratio", subtitle: "Quantify market volatility sensitivity (Beta) and risk-adjusted excess returns (Sharpe Ratio).", icon: "📐", xp: 225, trilliums: 80,
        slides: [
          { 
            title: "Beta Coefficient & Sharpe Ratio", 
            content: "Beta measures sensitivity to broad market swings (S&P 500 Beta = 1.0). Beta = 1.5 means the stock moves 1.5x as wildly as the market. Sharpe Ratio = (Portfolio Return - Risk-Free Rate) / Portfolio Standard Deviation.", 
            keyTakeaway: "Sharpe Ratio measures how much excess return you generate per unit of total risk taken." 
          }
        ],
        toolType: "risk_matrix",
        quiz: [
          { 
            question: "A portfolio has a Beta of 1.6 relative to the S&P 500. If the S&P 500 experiences a 15% market crash, what is the expected performance of this portfolio?", 
            options: [
              "Drop of 15%",
              "Drop of 24%",
              "Drop of 9.375%",
              "Gain of 24%"
            ], 
            correctIndex: 1, 
            explanation: "Expected Change = Market Change (-15%) * Beta (1.6) = -24% portfolio drop." 
          }
        ]
      },
      {
        id: 42, unitId: 9, title: "42. Covered Calls Income Strategy", subtitle: "Generate passive options income by writing call options against 100 shares.", icon: "💵", xp: 230, trilliums: 85,
        slides: [
          { 
            title: "Covered Call Options Mechanics", 
            content: "Selling a Covered Call involves selling 1 Call option contract for every 100 shares of stock you own. You collect upfront cash premium. If stock stays below Strike price, you keep premium and shares. If stock rises above Strike, your stock is sold at the Strike price.", 
            keyTakeaway: "Covered calls monetize stock holdings but cap your maximum upside potential at the strike price." 
          }
        ],
        toolType: "options_payoff",
        quiz: [
          { 
            question: "You own 100 shares of XYZ purchased at $50. You sell a 30-day Covered Call with a $55 Strike Price for a $2.00 premium ($200 total). If XYZ rises to $65 at expiration, what is your total profit?", 
            options: [
              "$200 total profit",
              "$700 total profit ($500 stock gain + $200 premium)",
              "$1,500 total profit",
              "$500 total profit"
            ], 
            correctIndex: 1, 
            explanation: "Stock profit is capped at Strike ($55 - $50 = $5 per share = $500). Plus option premium kept ($2.00 per share = $200). Total Profit = $700." 
          }
        ]
      },
      {
        id: 43, unitId: 9, title: "43. Cash-Secured Puts Strategy", subtitle: "Earn options premium while bidding to acquire target stocks at discounted prices.", icon: "🎯", xp: 235, trilliums: 85,
        slides: [
          { 
            title: "Selling Cash-Secured Puts", 
            content: "Selling a Cash-Secured Put involves reserving cash collateral in your account (Strike Price * 100) and selling a Put option. You collect cash premium upfront. If stock stays above Strike, keep premium. If stock falls below Strike, you are assigned to buy 100 shares at the Strike price.", 
            keyTakeaway: "Cash-Secured Puts lower your effective cost basis when acquiring target growth stocks." 
          }
        ],
        toolType: "options_payoff",
        quiz: [
          { 
            question: "You sell a Cash-Secured Put on stock ABC with a $40 Strike Price for a $3.00 premium. What is your net effective cost basis per share if the stock drops to $35 and you are assigned?", 
            options: [
              "$40.00 cost basis",
              "$37.00 net cost basis per share",
              "$35.00 cost basis",
              "$43.00 cost basis"
            ], 
            correctIndex: 1, 
            explanation: "Effective Cost Basis = Strike Price ($40.00) - Option Premium Kept ($3.00) = $37.00 per share." 
          }
        ]
      },
      {
        id: 44, unitId: 9, title: "44. Hedging & Protective Puts", subtitle: "Insure portfolio capital against market panics using protective married puts.", icon: "☂️", xp: 240, trilliums: 90,
        slides: [
          { 
            title: "Portfolio Insurance (Married Puts)", 
            content: "Buying a Protective Put for a stock you own creates a guaranteed price floor. If market crashes 40%, the Put option increases in dollar value by an equal amount, allowing you to exercise and sell shares at the strike price.", 
            keyTakeaway: "Protective puts cap maximum downside loss while leaving 100% of upside open." 
          }
        ],
        toolType: "options_payoff",
        quiz: [
          { 
            question: "You buy 100 shares of Stock ABC at $100 and buy a 6-month Protective Put with an $85 Strike Price for a $4.00 premium. What is your maximum potential percentage loss?", 
            options: [
              "Loss of 100% of capital",
              "Loss of 19.0% maximum ($19 per share)",
              "Loss of 15.0% maximum",
              "Loss of 4.0% maximum"
            ], 
            correctIndex: 1, 
            explanation: "Worst case: Stock drops to $0. Put allows selling at $85 (loss of $15). Plus $4 premium paid = $19 total max loss per share ($19 / $100 = 19.0%)." 
          }
        ]
      },
      {
        id: 45, unitId: 9, title: "45. Position Sizing & The 2% Risk Rule", subtitle: "Calculate position sizing, stop-loss distance, and trade risk management.", icon: "🧮", xp: 250, trilliums: 100,
        slides: [
          { 
            title: "The 2% Portfolio Risk Rule Formula", 
            content: "Never risk losing more than 2.0% of total portfolio equity on a single trade. Formula: Position Size (Shares) = (Total Portfolio Equity * 0.02) / (Entry Price - Stop-Loss Price).", 
            keyTakeaway: "Proper position sizing ensures a string of 5 consecutive bad trades only reduces portfolio equity by ~10%." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "You have a $50,000 portfolio and wish to adhere to the 2% Risk Rule on a trade in Stock XYZ. Entry price is $100 and Stop-Loss is set at $90 ($10 risk per share). How many shares should you buy?", 
            options: [
              "500 shares ($50,000 position)",
              "100 shares ($10,000 position)",
              "250 shares ($25,000 position)",
              "1,000 shares ($100,000 position)"
            ], 
            correctIndex: 1, 
            explanation: "Max Dollar Risk = $50,000 * 0.02 = $1,000. Risk per share = $100 - $90 = $10. Position Size = $1,000 / $10 = 100 shares." 
          }
        ]
      }
    ]
  },
  {
    id: 10,
    title: "Unit 10: Quantitative Trading & Financial Freedom",
    subtitle: "Master algorithmic trading logic, tax-loss harvesting, asset location, and FIRE milestone rules.",
    color: "purple",
    badgeIcon: "👑",
    lessons: [
      {
        id: 46, unitId: 10, title: "46. Algorithmic Trading Fundamentals", subtitle: "Automate trade execution using rules-based programming, backtesting, and API mechanics.", icon: "🤖", xp: 260, trilliums: 100,
        slides: [
          { 
            title: "Rules-Based Algorithmic Trading", 
            content: "Algorithmic trading uses automated code execution to trigger buys/sells based on quantitative rules (e.g. SMA crossovers, order book imbalances) at millisecond speeds. Backtesting evaluates strategy performance on historical data, accounting for slippage and commissions.", 
            keyTakeaway: "Algorithms eliminate human emotional bias (greed/fear) and execute systematic risk rules." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "What is 'Slippage' in quantitative algorithmic trading backtesting models?", 
            options: [
              "The difference between expected trade execution price and actual filled execution price during live execution",
              "A software bug that causes servers to crash",
              "The interest fee charged on overnight cash balances",
              "The decline in stock price due to dividend payouts"
            ], 
            correctIndex: 0, 
            explanation: "Slippage occurs when market volatility or illiquidity causes an order to fill at a slightly worse price than expected when the signal fired." 
          }
        ]
      },
      {
        id: 47, unitId: 10, title: "47. Tax-Loss Harvesting Strategies", subtitle: "Harvest capital losses to offset taxable capital gains and ordinary income.", icon: "🧾", xp: 270, trilliums: 110,
        slides: [
          { 
            title: "Harvesting Capital Losses", 
            content: "Tax-loss harvesting involves strategically selling investments at a loss to offset realized capital gains from winning investments. Excess losses up to $3,000 per year can offset regular ordinary income taxes, carrying remaining losses forward into future tax years.", 
            keyTakeaway: "Beware the 30-day Wash Sale Rule: purchasing the same stock within 30 days disallows tax deduction." 
          }
        ],
        toolType: "tax_calc",
        quiz: [
          { 
            question: "You realize $15,000 in capital gains from Stock A. You sell Stock B for a $20,000 realized loss. How much net capital gain tax do you owe, and how much loss offsets ordinary income?", 
            options: [
              "$0 capital gains tax, and $3,000 offsets ordinary income ($2,000 carried forward)",
              "$5,000 taxable capital gain",
              "$15,000 capital gain tax plus $5,000 penalty",
              "$0 capital gain tax, and $5,000 offsets ordinary income immediately"
            ], 
            correctIndex: 0, 
            explanation: "Net Gain/Loss = $15,000 gain - $20,000 loss = -$5,000 net loss. Capital gain tax is $0. $3,000 offsets ordinary income this year, and $2,000 carries forward." 
          }
        ]
      },
      {
        id: 48, unitId: 10, title: "48. Asset Location: 401(k), IRA & Roth", subtitle: "Optimize tax efficiency across Taxable, Tax-Deferred (Traditional IRA/401k), and Tax-Free (Roth) accounts.", icon: "🏦", xp: 280, trilliums: 110,
        slides: [
          { 
            title: "Account Types: Roth vs Traditional IRA", 
            content: "Traditional 401(k)/IRA: Contributions are tax-deductible today; growth is tax-deferred; withdrawals in retirement are taxed as ordinary income. Roth 401(k)/IRA: Contributions are made after-tax; growth AND qualified withdrawals in retirement are 100% TAX-FREE.", 
            keyTakeaway: "Place high-growth assets and dividend stocks in Roth accounts for tax-free compounding." 
          }
        ],
        toolType: "generic",
        quiz: [
          { 
            question: "What is the structural wealth-building advantage of holding high-growth dividend stocks inside a Roth IRA account?", 
            options: [
              "Contributions can be deducted from current income tax returns",
              "All capital gains, compound growth, and dividend payouts can be withdrawn 100% TAX-FREE in retirement",
              "The government matches 50% of all stock purchases",
              "Roth accounts are exempt from stock market crashes"
            ], 
            correctIndex: 1, 
            explanation: "Roth IRAs provide 100% tax-free growth and tax-free qualified withdrawals in retirement, saving massive tax expenses over decades." 
          }
        ]
      },
      {
        id: 49, unitId: 49, title: "49. Annual Portfolio Rebalancing", subtitle: "Maintain asset allocation targets, trim overperforming winners, and buy underperforming bargains.", icon: "⚖️", xp: 290, trilliums: 120,
        slides: [
          { 
            title: "Portfolio Rebalancing Discipline", 
            content: "Over time, high-performing assets grow to represent a disproportionate percentage of your portfolio, shifting your risk profile away from target allocations. Annual rebalancing involves selling top-heavy winners back down to target weights and buying undervalued underperformers.", 
            keyTakeaway: "Rebalancing forces you systematically to execute Wall Street's golden rule: Sell High, Buy Low." 
          }
        ],
        toolType: "sector_pie",
        quiz: [
          { 
            question: "Your target allocation is 70% Equities / 30% Bonds. After a massive stock rally, your portfolio shifts to 88% Equities / 12% Bonds. What action does disciplined rebalancing dictate?", 
            options: [
              "Sell all bonds and buy more equities to chase momentum",
              "Trim equities down from 88% to 70% and purchase bonds up to 30% to restore target risk profile",
              "Do nothing and let equities reach 100%",
              "Close the account and convert all capital to cash"
            ], 
            correctIndex: 1, 
            explanation: "Rebalancing requires trimming over-weight assets (equities) and buying under-weight assets (bonds) to maintain risk management control." 
          }
        ]
      },
      {
        id: 50, unitId: 10, title: "50. The Financial Freedom Milestone", subtitle: "Achieve the 4% Safe Withdrawal Rule, 25x expense targets, and FIRE financial independence.", icon: "👑", xp: 350, trilliums: 200,
        slides: [
          { 
            title: "The 4% Safe Withdrawal Rule (FIRE)", 
            content: "Financial Independence, Retire Early (FIRE): The Trinity Study established that a portfolio invested in index funds can safely sustain a 4.0% inflation-adjusted annual withdrawal rate indefinitely without depleting capital. Target Portfolio Number = Annual Living Expenses * 25.", 
            keyTakeaway: "If your annual expenses are $60,000, your Financial Freedom target portfolio is $1,500,000 ($60,000 * 25)." 
          }
        ],
        toolType: "compound_calc",
        quiz: [
          { 
            question: "If an investor requires $80,000 per year in retirement living expenses, what total portfolio net worth is required to achieve Financial Independence under the 4% Rule?", 
            options: [
              "$800,000 portfolio",
              "$2,000,000 portfolio ($80,000 * 25)",
              "$5,000,000 portfolio",
              "$1,000,000 portfolio"
            ], 
            correctIndex: 1, 
            explanation: "Target FIRE Net Worth = Annual Expenses ($80,000) * 25 = $2,000,000. Withdrawing 4% of $2M yields $80,000 per year." 
          }
        ]
      }
    ]
  }
];
