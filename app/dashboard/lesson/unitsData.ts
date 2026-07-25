import { Lesson, Unit } from './page';

export const UNITS_DATA: Unit[] = [
  {
    id: 1,
    title: "Unit 1: Fundamentals of Money & Markets",
    subtitle: "Master core financial concepts, purchasing power, and stock market basics.",
    color: "emerald",
    badgeIcon: "💵",
    lessons: [
      {
        id: 1, unitId: 1, title: "1. Money & Purchasing Power", subtitle: "Understand fiat money, inflation, and why $100 today isn't $100 tomorrow.", icon: "💵", xp: 50, trilliums: 10,
        slides: [
          { title: "What is Purchasing Power?", content: "Purchasing power is the amount of real goods or services that one unit of money can buy. Over time, inflation causes prices to rise, which reduces your purchasing power.", keyTakeaway: "Inflation erodes cash value over time. Investing helps your money grow faster than inflation." },
          { title: "Fiat Currency vs Assets", content: "Paper money (fiat currency) is backed by government trust. Unlike gold or real estate, governments can print more fiat currency, decreasing its relative value.", keyTakeaway: "Holding pure cash long-term leads to a loss of purchasing power." }
        ],
        toolType: "inflation_calc",
        quiz: [
          { question: "What happens to your purchasing power when inflation occurs?", options: ["It increases because prices drop.", "It decreases because goods become more expensive.", "It stays exactly the same forever."], correctIndex: 1, explanation: "Inflation raises prices, which means each dollar buys fewer goods and services." },
          { question: "Why do investors buy productive assets like stocks?", options: ["To keep money hidden under a mattress.", "To outpace inflation and build long-term real wealth.", "Because cash never loses value."], correctIndex: 1, explanation: "Stocks and productive assets tend to grow faster than the rate of inflation." }
        ]
      },
      {
        id: 2, unitId: 1, title: "2. How Stock Exchanges Work", subtitle: "Discover how buyers and sellers trade fractional ownership of real companies.", icon: "🏛️", xp: 50, trilliums: 10,
        slides: [
          { title: "What is a Stock?", content: "A stock (or share) represents partial ownership of a public company. If a company has 1,000,000 shares and you buy 10,000, you own 1% of that business!", keyTakeaway: "Stocks make you a real business owner with rights to future profits." },
          { title: "Stock Exchanges & Order Matching", content: "Exchanges like NYSE and NASDAQ bring buyers (Bid) and sellers (Ask) together. When the highest bid meets the lowest ask, a trade executes instantly.", keyTakeaway: "Stock prices move based on supply (sellers) and demand (buyers)." }
        ],
        toolType: "order_sim",
        quiz: [
          { question: "If a company has 1,000 shares total and you own 100 shares, how much of the company do you own?", options: ["1%", "10%", "50%"], correctIndex: 1, explanation: "100 divided by 1,000 equals 10% ownership of the company." }
        ]
      },
      {
        id: 3, unitId: 1, title: "3. Reading Stock Quotes", subtitle: "Decode tickers, bid/ask spreads, volume, and 52-week price ranges.", icon: "📊", xp: 50, trilliums: 10,
        slides: [{ title: "Elements of a Stock Quote", content: "Every stock quote shows a Ticker Symbol (e.g. AAPL), current Market Price, Net Change ($ and %), Volume (shares traded today), and 52-Week High/Low.", keyTakeaway: "Stock quotes give you a real-time snapshot of market sentiment." }],
        toolType: "quote_scanner",
        quiz: [{ question: "What does a stock's 'Ticker Symbol' represent?", options: ["A unique 1 to 5 letter code identifying a company (e.g. MSFT).", "The phone number of the company CEO.", "The tax ID of the stock broker."], correctIndex: 0, explanation: "Ticker symbols provide quick identification for trading stocks on exchanges." }]
      },
      {
        id: 4, unitId: 1, title: "4. Cash Flow & Compounding", subtitle: "Learn how compound interest turns small monthly savings into vast fortunes.", icon: "📈", xp: 60, trilliums: 12,
        slides: [{ title: "The Magic of Compound Interest", content: "Albert Einstein called compound interest the 8th wonder of the world. You earn interest not just on your initial money, but on previous interest as well!", keyTakeaway: "Time is your greatest asset. Starting early doubles and triples returns." }],
        toolType: "compound_calc",
        quiz: [{ question: "Why is starting to invest in your 20s better than starting in your 40s?", options: ["Because compound interest has decades more time to multiply gains.", "Because stocks only go up in your 20s.", "Because banks don't allow 40-year-olds to invest."], correctIndex: 0, explanation: "More years allow interest to compound exponentially on top of prior gains." }]
      },
      {
        id: 5, unitId: 1, title: "5. Risk vs Reward & Volatility", subtitle: "Balance risk tolerance and portfolio volatility to avoid panic selling.", icon: "⚖️", xp: 60, trilliums: 12,
        slides: [{ title: "Understanding Volatility", content: "Volatility measures how wildly a stock's price fluctuates. High volatility can yield big gains or sharp drops. Low volatility provides stability.", keyTakeaway: "Higher prospective returns always come with higher potential risk." }],
        toolType: "risk_matrix",
        quiz: [{ question: "What is the relationship between financial risk and potential return?", options: ["Higher potential returns generally require taking higher potential risk.", "High risk guarantees high profits every single day.", "Low risk investments always produce maximum wealth."], correctIndex: 0, explanation: "Risk and return are directly correlated in financial markets." }]
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
        id: 6, unitId: 2, title: "6. Company Fundamentals & EPS", subtitle: "Read income statements, revenue growth, and Earnings Per Share.", icon: "📑", xp: 65, trilliums: 15,
        slides: [{ title: "Revenue vs Net Income", content: "Revenue is total sales. Net Income is what remains after paying all expenses, taxes, and wages. Earnings Per Share (EPS) = Net Income / Total Shares.", keyTakeaway: "EPS tells you how much profit the company makes for every share you hold." }],
        toolType: "financial_stmt",
        quiz: [{ question: "How is Earnings Per Share (EPS) calculated?", options: ["Net Income divided by Total Shares Outstanding.", "Total Sales divided by Stock Price.", "Company Cash minus Liabilities."], correctIndex: 0, explanation: "EPS distributes total net profits across every existing share of stock." }]
      },
      {
        id: 7, unitId: 2, title: "7. Valuation Multiples & P/E Ratio", subtitle: "Determine whether a stock is bargains-cheap or dangerously overvalued.", icon: "🏷️", xp: 65, trilliums: 15,
        slides: [{ title: "Price-to-Earnings (P/E) Ratio", content: "P/E = Stock Price / EPS. If a stock trades at $50 and EPS is $5, P/E is 10. It shows how many dollars investors pay for $1 of company profit.", keyTakeaway: "High P/E means high expected growth; low P/E may mean a bargain or a struggling company." }],
        toolType: "pe_eval",
        quiz: [{ question: "If a stock costs $100 and earns $10 per share per year, what is its P/E ratio?", options: ["10", "100", "5"], correctIndex: 0, explanation: "$100 price divided by $10 earnings = P/E of 10." }]
      },
      {
        id: 8, unitId: 2, title: "8. Dividends & Passive Income", subtitle: "Earn quarterly cash payouts from profitable dividend-paying stocks.", icon: "💸", xp: 70, trilliums: 15,
        slides: [{ title: "What is a Dividend?", content: "A dividend is cash paid out directly to shareholders from company profits. Dividend Yield = (Annual Dividend per Share / Stock Price) * 100.", keyTakeaway: "Reinvesting dividends (DRIP) compounds your total returns rapidly." }],
        toolType: "dividend_calc",
        quiz: [{ question: "What is Dividend Yield?", options: ["The percentage of stock price paid out as cash to shareholders annually.", "The interest rate charged by a bank on a car loan.", "The fee you pay to sell stock."], correctIndex: 0, explanation: "Dividend yield measures annual cash income relative to the stock's purchase price." }]
      },
      {
        id: 9, unitId: 2, title: "9. Market Capitalization Classes", subtitle: "Navigate Mega-Caps, Large-Caps, Mid-Caps, and Small-Cap growth stocks.", icon: "🏢", xp: 70, trilliums: 15,
        slides: [{ title: "Calculating Market Cap", content: "Market Cap = Stock Price * Total Shares. Mega-cap ($200B+), Large-cap ($10B-$200B), Mid-cap ($2B-$10B), Small-cap ($300M-$2B).", keyTakeaway: "Large caps offer stability; small caps offer higher growth potential and volatility." }],
        toolType: "market_cap",
        quiz: [{ question: "If Company A has 1 Billion shares at $200 per share, what is its Market Cap?", options: ["$200 Billion (Mega-Cap)", "$2 Billion (Mid-Cap)", "$20 Million (Micro-Cap)"], correctIndex: 0, explanation: "1 Billion * $200 = $200 Billion total market valuation." }]
      },
      {
        id: 10, unitId: 2, title: "10. Bull vs Bear Market Cycles", subtitle: "Survive market crashes, market corrections, and booming bull rallies.", icon: "🐂", xp: 75, trilliums: 18,
        slides: [{ title: "Bull vs Bear Markets", content: "A Bull Market is a sustained rise (+20% or more). A Bear Market is a drop of 20% or more from recent peaks due to economic fear.", keyTakeaway: "Bear markets create historic buying opportunities for disciplined investors." }],
        toolType: "bull_bear",
        quiz: [{ question: "What officially defines a Bear Market?", options: ["A market decline of 20% or more from recent high prices.", "A sunny day on Wall Street.", "A 2% drop in one afternoon."], correctIndex: 0, explanation: "A 20% drop across broad market indices signifies a bear market." }]
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
        id: 11, unitId: 3, title: "11. Order Types: Market, Limit, Stop", subtitle: "Control your exact entry and exit prices with precision limit & stop orders.", icon: "🎯", xp: 80, trilliums: 18,
        slides: [{ title: "Market vs Limit vs Stop Orders", content: "Market Order: Fills immediately at best available price. Limit Order: Fills ONLY at your target price or better. Stop-Loss: Sells automatically if price drops to protect against loss.", keyTakeaway: "Use Limit orders to avoid slippage and Stop-Loss orders to cap downside." }],
        toolType: "order_type_sim",
        quiz: [{ question: "Which order type guarantees execution speed over exact price?", options: ["Market Order", "Limit Order", "Stop-Loss Order"], correctIndex: 0, explanation: "Market orders execute immediately at whatever current price sellers demand." }]
      },
      {
        id: 12, unitId: 3, title: "12. Asset Allocation & Sectors", subtitle: "Protect capital across Technology, Healthcare, Financials, and Energy.", icon: "🍕", xp: 80, trilliums: 18,
        slides: [{ title: "Don't Put All Eggs in One Basket", content: "Spread your capital across different sectors (Tech, Finance, Energy, Consumer Goods). If one sector suffers, others insulate your portfolio.", keyTakeaway: "Diversification reduces portfolio volatility without sacrificing overall return." }],
        toolType: "sector_pie",
        quiz: [{ question: "Why should an investor diversify across multiple market sectors?", options: ["To prevent a crash in one sector from wiping out their entire portfolio.", "To pay double transaction fees.", "Because owning 1 stock is illegal."], correctIndex: 0, explanation: "Diversification lowers overall risk exposure." }]
      },
      {
        id: 13, unitId: 3, title: "13. Index Funds & Expense Ratios", subtitle: "Outperform 90% of active fund managers with low-cost index ETFs.", icon: "📦", xp: 85, trilliums: 20,
        slides: [{ title: "ETFs & Mutual Funds", content: "An Exchange Traded Fund (ETF) holds hundreds of stocks in 1 ticker (e.g. S&P 500 ETF). Pay attention to Expense Ratios (annual management fee %).", keyTakeaway: "A 1.5% fee can eat over 30% of your lifetime investment wealth!" }],
        toolType: "etf_fee",
        quiz: [{ question: "Why are low expense ratios (e.g. 0.03%) crucial for long-term investors?", options: ["High fees compound exponentially over time and strip away massive investment returns.", "Low fee funds pay zero taxes.", "High fee funds always win."], correctIndex: 0, explanation: "Fees compound over decades." }]
      },
      {
        id: 14, unitId: 3, title: "14. Debt, Borrowing & Leverage", subtitle: "Understand margin interest, debt leverage, and simulator cash borrowing.", icon: "💳", xp: 90, trilliums: 20, externalLink: "/dashboard/lesson/debt-leverage",
        slides: [{ title: "Leverage is a Double-Edged Sword", content: "Borrowing money (margin/leverage) amplifies both gains and losses. If a leveraged trade goes wrong, you can lose more than your initial deposit!", keyTakeaway: "Always calculate interest rates and safety buffers when using margin." }],
        toolType: "debt_calc",
        quiz: [{ question: "What is a major risk of trading with borrowed leverage?", options: ["You can lose more money than you initially deposited.", "The stock market instantly closes.", "Interest rates automatically become 0%."], correctIndex: 0, explanation: "Leverage magnifies losses." }]
      },
      {
        id: 15, unitId: 3, title: "15. Short Selling & Bearish Bets", subtitle: "Profit when stock prices fall by borrowing and selling shares back.", icon: "📉", xp: 90, trilliums: 20,
        slides: [{ title: "How Short Selling Works", content: "To Short: Borrow stock from broker -> Sell at $100 -> Stock drops to $60 -> Buy back at $60 -> Return shares to broker. Profit = $40 per share!", keyTakeaway: "Shorting has UNLIMITED downside risk because a stock price can rise infinitely!" }],
        toolType: "short_sim",
        quiz: [{ question: "Why is short selling considered higher risk than buying regular stock?", options: ["Because a stock's price can rise infinitely, leading to unlimited potential losses.", "Because you cannot make money when stocks drop.", "Because short selling is illegal."], correctIndex: 0, explanation: "Stock prices have no ceiling." }]
      }
    ]
  },
  {
    id: 4,
    title: "Unit 4: Advanced Trading & Macroeconomics",
    subtitle: "Master options payoff curves, technical chart analysis, taxes, and discipline.",
    color: "amber",
    badgeIcon: "🎓",
    lessons: [
      {
        id: 16, unitId: 4, title: "16. Options Mechanics: Calls & Puts", subtitle: "Understand strike prices, expirations, leverage, and option contracts.", icon: "⚡", xp: 95, trilliums: 25,
        slides: [{ title: "Calls vs Puts", content: "Call Option: Right to BUY stock at Strike Price. Put Option: Right to SELL stock at Strike Price. Contracts expire on a set date.", keyTakeaway: "Options provide powerful leverage but can expire completely worthless." }],
        toolType: "options_payoff",
        quiz: [{ question: "If you expect a stock's price to surge dramatically upward, which option contract do you buy?", options: ["Call Option", "Put Option", "Short Option"], correctIndex: 0, explanation: "Buying a Call option gives you the right to buy stock at a lower strike price." }]
      },
      {
        id: 17, unitId: 4, title: "17. Technical Analysis & Chart Patterns", subtitle: "Spot trends with Candlesticks, Moving Averages (SMA), and Support levels.", icon: "🕯️", xp: 95, trilliums: 25,
        slides: [{ title: "Candlestick Anatomy", content: "Each candle shows Open, High, Low, Close (OHLC). Green candle: Closed higher than opened. Red candle: Closed lower than opened.", keyTakeaway: "Technical patterns reveal buyer/seller momentum and key support zones." }],
        toolType: "chart_pattern",
        quiz: [{ question: "What does a Green Candlestick indicate on a price chart?", options: ["The closing price was higher than the opening price.", "The stock was delisted.", "The company lost revenue."], correctIndex: 0, explanation: "Green candles signal price appreciation." }]
      },
      {
        id: 18, unitId: 4, title: "18. Macroeconomics & The Federal Reserve", subtitle: "Discover how Fed interest rate hikes impact stock markets and inflation.", icon: "🌐", xp: 100, trilliums: 25,
        slides: [{ title: "Federal Reserve & Interest Rates", content: "When the Fed raises interest rates, borrowing becomes expensive, slowing the economy down to tame inflation. High rates pressure stock valuations.", keyTakeaway: "'Don't fight the Fed' is a classic Wall Street proverb!" }],
        toolType: "fed_rate",
        quiz: [{ question: "How do higher Federal Reserve interest rates usually impact stock valuations?", options: ["They increase borrowing costs for businesses, often cooling stock valuations.", "They instantly double stock prices.", "They eliminate corporate taxes."], correctIndex: 0, explanation: "Higher rates increase borrowing costs." }]
      },
      {
        id: 19, unitId: 4, title: "19. Capital Gains Taxes & Wealth Building", subtitle: "Keep more of your hard-earned profits with tax-advantaged account strategies.", icon: "🏛️", xp: 100, trilliums: 25,
        slides: [{ title: "Short-Term vs Long-Term Capital Gains", content: "Holding a stock less than 1 year results in Short-Term tax rates (up to 37%). Holding 1+ year qualifies for lower Long-Term rates (0%-20%).", keyTakeaway: "Holding investments for over 1 year saves huge amounts in capital gains taxes." }],
        toolType: "tax_calc",
        quiz: [{ question: "How long must you hold an asset to qualify for lower Long-Term Capital Gains tax rates?", options: ["More than 1 year (365+ days)", "At least 30 days", "Exactly 5 years"], correctIndex: 0, explanation: "Assets held over 1 year get long-term tax treatment." }]
      },
      {
        id: 20, unitId: 4, title: "20. Dollar-Cost Averaging & Financial Freedom", subtitle: "Build generational wealth with automated investing and emotional discipline.", icon: "👑", xp: 120, trilliums: 30,
        slides: [{ title: "Dollar-Cost Averaging (DCA)", content: "DCA means investing a fixed dollar amount on a regular schedule (e.g. $200 every month), regardless of market ups and downs.", keyTakeaway: "DCA removes emotion and buys more shares when prices are low!" }],
        toolType: "dca_vs_lump",
        quiz: [{ question: "What is the primary advantage of Dollar-Cost Averaging (DCA)?", options: ["It removes emotional timing guesswork and builds discipline by buying regularly.", "It guarantees zero red days.", "It eliminates stock fees."], correctIndex: 0, explanation: "DCA builds automated investing discipline." }]
      }
    ]
  },
  {
    id: 5,
    title: "Unit 5: Macroeconomics & Global Markets",
    subtitle: "Navigate inflation metrics, GDP cycles, central bank liquidity, and bond yields.",
    color: "emerald",
    badgeIcon: "🌍",
    lessons: [
      {
        id: 21, unitId: 5, title: "21. CPI & Inflation Indicators", subtitle: "Understand how the Consumer Price Index measures cost of living changes.", icon: "📊", xp: 120, trilliums: 30,
        slides: [{ title: "The CPI Basket", content: "The Consumer Price Index (CPI) tracks prices of food, housing, energy, and transportation. High CPI numbers trigger central bank interest rate hikes.", keyTakeaway: "CPI reports are major market-moving volatility events." }],
        toolType: "inflation_calc",
        quiz: [{ question: "What does the Consumer Price Index (CPI) measure?", options: ["The average price changes of consumer goods and services.", "The total stock market volume.", "The price of Bitcoin."], correctIndex: 0, explanation: "CPI is the primary gauge of consumer inflation." }]
      },
      {
        id: 22, unitId: 5, title: "22. Gross Domestic Product (GDP)", subtitle: "Analyze economic expansion, stagnation, and recession definitions.", icon: "🏗️", xp: 125, trilliums: 30,
        slides: [{ title: "Measuring GDP", content: "GDP represents the total monetary value of all goods and services produced in a country. Two consecutive quarters of negative GDP growth defines a Recession.", keyTakeaway: "GDP growth reflects national economic health and corporate earnings growth." }],
        toolType: "generic",
        quiz: [{ question: "What officially indicates an economic recession?", options: ["Two consecutive quarters of negative GDP growth.", "A 1% drop in stock prices.", "An increase in unemployment by 1 person."], correctIndex: 0, explanation: "Two negative quarters of GDP signal a recession." }]
      },
      {
        id: 23, unitId: 5, title: "23. Bond Yields & Inverted Yield Curves", subtitle: "Read 10-Year Treasury bond yields and inverted yield curve recession warnings.", icon: "📉", xp: 130, trilliums: 35,
        slides: [{ title: "The Yield Curve Warning Signal", content: "Normally 10-year bonds pay higher interest than 2-year bonds. When short-term yields exceed long-term yields, the curve is Inverted—a historic recession predictor!", keyTakeaway: "An inverted yield curve has preceded almost every US recession." }],
        toolType: "generic",
        quiz: [{ question: "What does an 'Inverted Yield Curve' mean?", options: ["Short-term bond rates are higher than long-term bond rates.", "Stock market prices are going upside down.", "Gold prices hit zero."], correctIndex: 0, explanation: "An inverted curve occurs when short-term interest rates exceed long-term rates." }]
      },
      {
        id: 24, unitId: 5, title: "24. Quantitative Easing vs Tightening", subtitle: "Understand central bank balance sheet expansion and liquidity cycles.", icon: "🏦", xp: 135, trilliums: 35,
        slides: [{ title: "Fed Money Printing (QE)", content: "Quantitative Easing (QE) happens when the Fed buys government bonds to inject cash into banks, lowering borrowing costs and boosting stock prices.", keyTakeaway: "QE expands liquidity, while Quantitative Tightening (QT) shrinks liquidity." }],
        toolType: "generic",
        quiz: [{ question: "What is Quantitative Easing (QE)?", options: ["Central banks purchasing assets to inject liquidity into financial markets.", "Banning stock trading.", "Raising taxes on corporations."], correctIndex: 0, explanation: "QE increases money supply and market liquidity." }]
      },
      {
        id: 25, unitId: 5, title: "25. Foreign Exchange & Currency Risk", subtitle: "Explore US Dollar strength ($DXY) and multinational corporate revenue.", icon: "💱", xp: 140, trilliums: 40,
        slides: [{ title: "Strong Dollar Impact", content: "When the US Dollar is strong ($DXY rises), US products become expensive overseas, reducing international revenues for companies like Apple and Microsoft.", keyTakeaway: "Currency fluctuations impact international business revenue." }],
        toolType: "generic",
        quiz: [{ question: "How does a very strong US Dollar affect US exporters?", options: ["It makes US exports more expensive abroad, potentially lowering sales.", "It instantly doubles overseas sales.", "It lowers international shipping costs."], correctIndex: 0, explanation: "A strong dollar makes foreign purchases of US goods costlier." }]
      }
    ]
  },
  {
    id: 6,
    title: "Unit 6: Financial Statement Analysis",
    subtitle: "Read Balance Sheets, Income Statements, Cash Flow, and ROE metrics.",
    color: "blue",
    badgeIcon: "📊",
    lessons: [
      {
        id: 26, unitId: 6, title: "26. Balance Sheet: Assets & Liabilities", subtitle: "Master Assets = Liabilities + Shareholders' Equity.", icon: "⚖️", xp: 140, trilliums: 40,
        slides: [{ title: "The Accounting Equation", content: "Assets are what a business owns (Cash, Equipment). Liabilities are what it owes (Debt). Equity is the net value remaining for shareholders.", keyTakeaway: "Assets MUST always equal Liabilities plus Equity!" }],
        toolType: "financial_stmt",
        quiz: [{ question: "What is the core accounting equation?", options: ["Assets = Liabilities + Equity", "Assets = Revenue - Taxes", "Profit = Cash + Debt"], correctIndex: 0, explanation: "Assets equal Liabilities plus Shareholders' Equity." }]
      },
      {
        id: 27, unitId: 6, title: "27. Cash Flow Statement Mechanics", subtitle: "Trace Operating, Investing, and Financing cash flows of a business.", icon: "🌊", xp: 145, trilliums: 40,
        slides: [{ title: "Cash Flow vs Accounting Profit", content: "A company can show positive accounting income but run out of real cash! The Cash Flow Statement tracks actual cash moving in and out of the bank.", keyTakeaway: "Cash flow is the true lifeblood of business survival." }],
        toolType: "generic",
        quiz: [{ question: "Why is the Cash Flow Statement so important?", options: ["It tracks actual cash liquidity moving into and out of the business.", "It calculates CEO bonuses.", "It lists total employee names."], correctIndex: 0, explanation: "Cash flow reveals real dollar solvency." }]
      },
      {
        id: 28, unitId: 6, title: "28. Debt-to-Equity & Solvent Ratios", subtitle: "Evaluate financial solvency, leverage debt burden, and bankruptcy risk.", icon: "🛡️", xp: 150, trilliums: 45,
        slides: [{ title: "Debt-to-Equity (D/E) Ratio", content: "D/E = Total Debt / Total Shareholders' Equity. A D/E higher than 2.0 indicates high debt risk, which can be dangerous during interest rate hikes.", keyTakeaway: "High debt loads increase default risk during economic downturns." }],
        toolType: "generic",
        quiz: [{ question: "What does a high Debt-to-Equity (D/E) ratio suggest?", options: ["The company relies heavily on borrowed debt to finance its operations.", "The company has zero debt.", "The stock pays 100% dividends."], correctIndex: 0, explanation: "High D/E signifies high financial leverage." }]
      },
      {
        id: 29, unitId: 6, title: "29. Gross, Operating & Net Margins", subtitle: "Calculate corporate profitability margins and pricing power.", icon: "📐", xp: 150, trilliums: 45,
        slides: [{ title: "Margin Hierarchy", content: "Gross Margin = (Revenue - COGS)/Revenue. Net Margin = Net Income/Revenue. High net margins (20%+) reveal competitive pricing power.", keyTakeaway: "Expanding margins signal growing efficiency and brand power." }],
        toolType: "generic",
        quiz: [{ question: "What does Net Profit Margin calculate?", options: ["Percentage of revenue remaining as pure profit after all costs.", "Total revenue collected in cash.", "Gross sales before taxes."], correctIndex: 0, explanation: "Net Margin measures net profit relative to total revenue." }]
      },
      {
        id: 30, unitId: 6, title: "30. Return on Equity (ROE) & ROIC", subtitle: "Measure capital allocation efficiency and management performance.", icon: "🏅", xp: 160, trilliums: 50,
        slides: [{ title: "Capital Efficiency", content: "Return on Equity (ROE) = Net Income / Shareholders' Equity. Outstanding CEOs generate 15%+ ROE, creating high value from shareholder capital.", keyTakeaway: "ROE reveals how effectively management turns equity into profit." }],
        toolType: "generic",
        quiz: [{ question: "What does Return on Equity (ROE) measure?", options: ["How efficiently management generates profits from shareholder capital.", "The total stock price return.", "The dividend payment schedule."], correctIndex: 0, explanation: "ROE evaluates profit generation per dollar of equity." }]
      }
    ]
  },
  {
    id: 7,
    title: "Unit 7: Valuation Models & Equity Research",
    subtitle: "Perform DCF intrinsic valuation, EV/EBITDA, P/B ratios, and Economic Moat analysis.",
    color: "purple",
    badgeIcon: "💎",
    lessons: [
      {
        id: 31, unitId: 7, title: "31. Intrinsic Value & DCF Modeling", subtitle: "Discount future expected cash flows to determine a stock's true fair value.", icon: "🧮", xp: 165, trilliums: 50,
        slides: [{ title: "Discounted Cash Flow (DCF)", content: "DCF estimates a business's intrinsic worth by projecting future cash flows and discounting them back to present value using a discount rate (WACC).", keyTakeaway: "A stock is worth the present value of all its future cash flow payouts." }],
        toolType: "generic",
        quiz: [{ question: "What is the primary goal of a Discounted Cash Flow (DCF) model?", options: ["To calculate a stock's true intrinsic value based on future cash flows.", "To predict tomorrow's stock price movement.", "To count total retail customers."], correctIndex: 0, explanation: "DCF estimates fair intrinsic value today." }]
      },
      {
        id: 32, unitId: 7, title: "32. Enterprise Value & EV/EBITDA", subtitle: "Value target companies including net debt obligations.", icon: "🏛️", xp: 170, trilliums: 55,
        slides: [{ title: "Enterprise Value (EV)", content: "EV = Market Cap + Debt - Cash. EV/EBITDA compares total acquisition cost against core operating earnings before tax and interest.", keyTakeaway: "EV/EBITDA is ideal for comparing companies with different debt levels." }],
        toolType: "generic",
        quiz: [{ question: "Why do corporate acquirers use Enterprise Value (EV) instead of Market Cap?", options: ["Because EV accounts for the company's debt obligations and cash reserves.", "Because EV is always 50% lower.", "Because Market Cap is illegal in mergers."], correctIndex: 0, explanation: "EV captures debt and cash in true takeover price." }]
      },
      {
        id: 33, unitId: 7, title: "33. Price-to-Book (P/B) Ratio", subtitle: "Value asset-heavy businesses like banks, real estate, and industrial firms.", icon: "📚", xp: 175, trilliums: 55,
        slides: [{ title: "P/B Ratio Valuation", content: "P/B = Stock Price / Book Value Per Share. A P/B under 1.0 means the stock is trading for less than the net liquidation value of its assets!", keyTakeaway: "P/B is essential for bank and financial institution valuation." }],
        toolType: "generic",
        quiz: [{ question: "What does a Price-to-Book (P/B) ratio under 1.0 signify?", options: ["The stock trades for less than the net book value of its underlying assets.", "The company has gone bankrupt.", "The price has doubled."], correctIndex: 0, explanation: "P/B < 1 means trading below net asset value." }]
      },
      {
        id: 34, unitId: 7, title: "34. PEG Ratio (Growth-Adjusted P/E)", subtitle: "Adjust P/E ratios for expected earnings growth rates.", icon: "🚀", xp: 180, trilliums: 60,
        slides: [{ title: "PEG Ratio Formula", content: "PEG Ratio = P/E Ratio / Annual Earnings Growth Rate %. A PEG of 1.0 means fair value for high-growth tech stocks.", keyTakeaway: "PEG allows fair comparisons between high-growth and slow-growth stocks." }],
        toolType: "pe_eval",
        quiz: [{ question: "How is the PEG Ratio calculated?", options: ["P/E Ratio divided by Earnings Growth Rate.", "P/E Ratio multiplied by Stock Price.", "Dividends divided by EPS."], correctIndex: 0, explanation: "PEG adjusts P/E relative to growth rate." }]
      },
      {
        id: 35, unitId: 7, title: "35. Warren Buffett's Economic Moats", subtitle: "Identify Network Effects, Brand Power, Switching Costs, and Cost Advantages.", icon: "🏰", xp: 190, trilliums: 65,
        slides: [{ title: "Types of Moats", content: "Warren Buffett looks for durable competitive advantages (Moats): 1. Brand (Apple), 2. Network Effects (Visa), 3. High Switching Costs (Microsoft enterprise).", keyTakeaway: "Wide moats protect profit margins against competitors for decades." }],
        toolType: "generic",
        quiz: [{ question: "What is an 'Economic Moat' in business?", options: ["A sustainable competitive advantage that protects corporate profits from competitors.", "A water barrier around corporate headquarters.", "A tax refund from government."], correctIndex: 0, explanation: "Moats protect long-term market share and profits." }]
      }
    ]
  },
  {
    id: 8,
    title: "Unit 8: Technical Trading & Charting Strategies",
    subtitle: "Master Moving Averages, Golden Crosses, RSI, MACD, and Reversal Candlesticks.",
    color: "amber",
    badgeIcon: "📈",
    lessons: [
      {
        id: 36, unitId: 8, title: "36. Moving Averages & Golden Cross", subtitle: "Identify bullish trend changes with 50-day and 200-day Simple Moving Averages.", icon: "✝️", xp: 195, trilliums: 65,
        slides: [{ title: "Golden Cross vs Death Cross", content: "Golden Cross: 50-day SMA crosses ABOVE 200-day SMA -> Major Bullish Rally! Death Cross: 50-day SMA crosses BELOW 200-day SMA -> Bearish Trend.", keyTakeaway: "Moving average crosses confirm long-term institutional trend direction." }],
        toolType: "chart_pattern",
        quiz: [{ question: "What occurs during a 'Golden Cross' signal?", options: ["The 50-day Moving Average crosses above the 200-day Moving Average.", "The stock market closes early.", "Gold prices hit an all-time high."], correctIndex: 0, explanation: "A Golden Cross confirms a strong bullish momentum shift." }]
      },
      {
        id: 37, unitId: 8, title: "37. Relative Strength Index (RSI)", subtitle: "Spot Overbought (70+) and Oversold (30-) momentum reversal conditions.", icon: "⚡", xp: 200, trilliums: 70,
        slides: [{ title: "RSI Ranges", content: "RSI ranges from 0 to 100. RSI > 70: Overbought (due for price pullback). RSI < 30: Oversold (potential bargain bounce entry point).", keyTakeaway: "Use RSI to avoid buying at overextended price peaks." }],
        toolType: "chart_pattern",
        quiz: [{ question: "What does an RSI reading below 30 suggest?", options: ["The stock is oversold and may be due for a price bounce.", "The stock is severely overbought.", "The company has failed audit."], correctIndex: 0, explanation: "RSI < 30 indicates oversold market conditions." }]
      },
      {
        id: 38, unitId: 8, title: "38. MACD Indicator & Convergence", subtitle: "Track Moving Average Convergence Divergence line crossovers.", icon: "〰️", xp: 205, trilliums: 70,
        slides: [{ title: "MACD Line & Signal Line", content: "MACD measures momentum by subtracting 26-period EMA from 12-period EMA. When MACD line crosses above Signal line, it signals buying momentum.", keyTakeaway: "MACD histogram surges reveal accelerating buyer dominance." }],
        toolType: "chart_pattern",
        quiz: [{ question: "What does MACD stand for?", options: ["Moving Average Convergence Divergence", "Market Asset Capital Deposit", "Monetary Annual Cash Dividend"], correctIndex: 0, explanation: "MACD stands for Moving Average Convergence Divergence." }]
      },
      {
        id: 39, unitId: 8, title: "39. Support, Resistance & Breakouts", subtitle: "Trade key price ceilings and floor reversal levels.", icon: "🧱", xp: 210, trilliums: 75,
        slides: [{ title: "Support vs Resistance", content: "Support is a price floor where buyers step in. Resistance is a price ceiling where sellers exit. When price breaks resistance on high volume, a Breakout occurs!", keyTakeaway: "Previous resistance becomes future support once broken." }],
        toolType: "chart_pattern",
        quiz: [{ question: "What happens during a technical 'Breakout'?", options: ["Stock price surges convincingly above a key resistance ceiling.", "The trading exchange platform crashes.", "The company liquidates assets."], correctIndex: 0, explanation: "Breakouts occur when price moves through resistance." }]
      },
      {
        id: 40, unitId: 8, title: "40. Candlestick Patterns: Hammer & Engulfing", subtitle: "Recognize bullish hammers, doji indecision, and bearish engulfing candles.", icon: "🕯️", xp: 220, trilliums: 80,
        slides: [{ title: "Reversal Candlesticks", content: "Bullish Hammer: Long lower wick showing sellers pushed down but buyers surged back. Bullish Engulfing: A large green candle completely engulfs the prior red candle.", keyTakeaway: "Candlestick wicks show price rejection by buyers or sellers." }],
        toolType: "chart_pattern",
        quiz: [{ question: "What does a Bullish Hammer candlestick indicate?", options: ["Buyers aggressively bought up a price dip, signaling a potential upward reversal.", "Sellers took complete control permanently.", "Trading was halted for news."], correctIndex: 0, explanation: "Hammers signal strong price rejection at lows." }]
      }
    ]
  },
  {
    id: 9,
    title: "Unit 9: Risk Management & Derivatives",
    subtitle: "Master Portfolio Beta, Covered Calls, Cash-Secured Puts, and Position Sizing.",
    color: "emerald",
    badgeIcon: "🛡️",
    lessons: [
      {
        id: 41, unitId: 9, title: "41. Portfolio Beta & Sharpe Ratio", subtitle: "Quantify portfolio market sensitivity and risk-adjusted returns.", icon: "📐", xp: 225, trilliums: 80,
        slides: [{ title: "Beta Coefficient", content: "Beta = 1.0 means stock moves in tandem with S&P 500. Beta > 1.5: High volatility. Beta < 0.8: Low volatility defensive stock. Sharpe Ratio measures excess return per unit of total risk.", keyTakeaway: "Aim for a high Sharpe ratio to maximize risk-adjusted gain." }],
        toolType: "risk_matrix",
        quiz: [{ question: "If a stock has a Beta of 2.0 and the market rises 10%, how much is the stock expected to rise?", options: ["20%", "10%", "5%"], correctIndex: 0, explanation: "Beta of 2.0 amplifies market movements by 2x." }]
      },
      {
        id: 42, unitId: 9, title: "42. Covered Calls Income Strategy", subtitle: "Generate passive income by selling call options against 100 shares.", icon: "💵", xp: 230, trilliums: 85,
        slides: [{ title: "Selling Covered Calls", content: "If you own 100 shares of stock, you can sell a Call Option to collect cash premium. If stock stays below strike price, you keep premium and shares!", keyTakeaway: "Covered calls convert stock positions into income generation engines." }],
        toolType: "options_payoff",
        quiz: [{ question: "What requirement must you meet to sell a Covered Call option?", options: ["Own at least 100 shares of the underlying stock.", "Have a 50-day streak.", "Borrow $10,000 margin."], correctIndex: 0, explanation: "A covered call requires owning 100 shares per contract." }]
      },
      {
        id: 43, unitId: 9, title: "43. Cash-Secured Puts Strategy", subtitle: "Get paid premium while waiting to buy stocks at a target discount price.", icon: "🎯", xp: 235, trilliums: 85,
        slides: [{ title: "Selling Cash-Secured Puts", content: "Sell a Put Option with cash reserved in your account. Collect cash premium upfront. If stock drops to strike, you buy at a discount; if not, keep cash!", keyTakeaway: "Cash-secured puts allow you to set your own discounted buy prices." }],
        toolType: "options_payoff",
        quiz: [{ question: "What is the benefit of selling a Cash-Secured Put?", options: ["You earn upfront premium cash while setting a lower price target to buy stock.", "You get free stock without paying.", "You pay zero option fees."], correctIndex: 0, explanation: "Puts generate income while waiting for target prices." }]
      },
      {
        id: 44, unitId: 9, title: "44. Hedging & Protective Puts", subtitle: "Insure your equity portfolio against market crashes.", icon: "☂️", xp: 240, trilliums: 90,
        slides: [{ title: "Portfolio Insurance", content: "Buying a Protective Put acts as insurance for your portfolio. If the market crashes 30%, your Put option increases in value, offsetting portfolio losses!", keyTakeaway: "Protective puts cap maximum potential losses during market panics." }],
        toolType: "options_payoff",
        quiz: [{ question: "How does a Protective Put safeguard your portfolio?", options: ["It gains value as stock prices crash, capping total portfolio losses.", "It prevents stocks from dropping.", "It doubles dividend payouts."], correctIndex: 0, explanation: "Protective puts act as financial insurance against drops." }]
      },
      {
        id: 45, unitId: 9, title: "45. Position Sizing & The 2% Risk Rule", subtitle: "Cap single trade loss risk to protect capital longevity.", icon: "🧮", xp: 250, trilliums: 100,
        slides: [{ title: "The 2% Rule", content: "Never risk losing more than 2% of total portfolio equity on a single trade. If you have $10,000, your max stop-loss loss per trade should be $200.", keyTakeaway: "Proper position sizing prevents a series of bad trades from wiping you out!" }],
        toolType: "generic",
        quiz: [{ question: "According to the 2% Risk Rule, how much equity should you risk on one trade?", options: ["No more than 2% of total account capital.", "At least 50% of capital.", "100% of cash reserves."], correctIndex: 0, explanation: "The 2% rule caps maximum risk per trade." }]
      }
    ]
  },
  {
    id: 10,
    title: "Unit 10: Quantitative Trading & Financial Freedom",
    subtitle: "Master Algo Trading, Tax-Loss Harvesting, Asset Location, and Portfolio Rebalancing.",
    color: "purple",
    badgeIcon: "👑",
    lessons: [
      {
        id: 46, unitId: 10, title: "46. Algorithmic Trading Fundamentals", subtitle: "Automate trade execution using code, APIs, and algorithmic logic.", icon: "🤖", xp: 260, trilliums: 100,
        slides: [{ title: "Rules-Based Algorithmic Trading", content: "Algo trading executes orders automatically based on pre-programmed rules (e.g., Buy AAPL if 50 SMA crosses 200 SMA on 5-min chart) with millisecond speed.", keyTakeaway: "Algorithms eliminate human emotion and execute rules instantly." }],
        toolType: "generic",
        quiz: [{ question: "What is a primary advantage of Algorithmic Trading?", options: ["It executes trade rules with high speed and zero emotional bias.", "It guarantees 100% winning trades.", "It doubles bank interest."], correctIndex: 0, explanation: "Algorithms execute pre-defined rules automatically." }]
      },
      {
        id: 47, unitId: 10, title: "47. Tax-Loss Harvesting Strategies", subtitle: "Offset capital gains taxes by strategically harvesting investment losses.", icon: "🧾", xp: 270, trilliums: 110,
        slides: [{ title: "Harvesting Capital Losses", content: "Sell losing investments to offset taxable capital gains from winning trades. Up to $3,000 of excess losses can offset regular income taxes annually!", keyTakeaway: "Tax-loss harvesting turns investment losses into tax savings." }],
        toolType: "tax_calc",
        quiz: [{ question: "What is Tax-Loss Harvesting?", options: ["Selling losing investments to offset capital gains tax liabilities.", "Filing taxes late without penalties.", "Buying government tax credits."], correctIndex: 0, explanation: "Harvesting losses reduces taxable capital gains." }]
      },
      {
        id: 48, unitId: 10, title: "48. Asset Location: 401(k), IRA & Roth", subtitle: "Optimize asset placement across Tax-Deferred and Tax-Free accounts.", icon: "🏦", xp: 280, trilliums: 110,
        slides: [{ title: "Roth IRA vs Traditional IRA", content: "Roth IRA: Pay tax upfront on contributions -> Withdraw 100% TAX-FREE in retirement! Traditional IRA / 401(k): Tax deduction today, pay tax on withdrawal.", keyTakeaway: "Roth accounts provide tax-free compound growth for lifetime wealth." }],
        toolType: "generic",
        quiz: [{ question: "What is the key advantage of a Roth IRA account?", options: ["Invested money grows and can be withdrawn 100% TAX-FREE in retirement.", "You can withdraw cash penalty-free anytime for vacation.", "It pays double interest."], correctIndex: 0, explanation: "Roth accounts provide completely tax-free growth." }]
      },
      {
        id: 49, unitId: 10, title: "49. Annual Portfolio Rebalancing", subtitle: "Re-align asset allocation target weights to manage risk drift.", icon: "⚖️", xp: 290, trilliums: 120,
        slides: [{ title: "Why Rebalance?", content: "Over time, winning stocks grow to dominate your portfolio, increasing risk. Rebalancing means trimming winners and buying undervalued targets back to target %.", keyTakeaway: "Rebalancing forces you to systematically Sell High and Buy Low!" }],
        toolType: "sector_pie",
        quiz: [{ question: "What does portfolio rebalancing force an investor to do?", options: ["Sell overperforming assets high and buy underperforming assets low.", "Hold 100% cash forever.", "Close all broker accounts."], correctIndex: 0, explanation: "Rebalancing maintains target risk allocations." }]
      },
      {
        id: 50, unitId: 10, title: "50. The Financial Freedom Milestone", subtitle: "Achieve the 4% Safe Withdrawal Rule and lifelong financial independence.", icon: "👑", xp: 350, trilliums: 200,
        slides: [{ title: "The 4% Rule of FIRE", content: "Financial Independence, Retire Early (FIRE): When your invested portfolio reaches 25x your annual expenses, you can safely withdraw 4% each year indefinitely!", keyTakeaway: "Congratulations! You have completed all 50 financial education path lessons!" }],
        toolType: "compound_calc",
        quiz: [{ question: "According to the 4% Safe Withdrawal Rule, when have you reached Financial Independence?", options: ["When your invested portfolio reaches 25x your annual living expenses.", "When you win the lottery.", "When your bank balance reaches $1,000."], correctIndex: 0, explanation: "25x annual expenses allows 4% annual withdrawals indefinitely." }]
      }
    ]
  }
];
