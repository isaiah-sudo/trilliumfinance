/**
 * Pre-programmed answers for common financial and Trillium Finance questions.
 * This helps bypass LLM API calls for standard questions, saving costs and providing instant responses.
 */

interface PreprogrammedQA {
  keywords: string[];
  answer: string;
}

const PREPROGRAMMED_QA: PreprogrammedQA[] = [
  {
    keywords: ['short in stocks', 'what is a short', 'short selling', 'shorting stocks', 'short position', 'how does shorting work', 'short stock', 'sell short', 'shorting'],
    answer: `# Short Selling (Short Position) Explained\n\n**Short selling** (or "shorting") is a trading strategy where an investor borrows shares of a stock they believe will decrease in price, sells them at current market value, and aims to buy them back later at a lower price to return to the lender, profiting from the price drop.\n\n### ⚙️ Step-by-Step Breakdown\n1. **Borrow**: You borrow 100 shares of a stock trading at **$100** from your broker.\n2. **Sell**: You immediately sell those 100 shares on the market for **$10,000** in cash.\n3. **Cover (Buy Back)**: If the stock price drops to **$70**, you buy back 100 shares for **$7,000**.\n4. **Profit**: You return the 100 shares to the lender and keep the **$3,000 profit** (minus borrowing fees).\n\n### ⚠️ Critical Risks of Shorting\n- **Unlimited Downside Risk**: When you buy a stock (long), your maximum loss is capped at 100% of your investment. When you short a stock, there is theoretically **no upper limit** to how high the price can rise, meaning your potential loss is unlimited.\n- **Short Squeeze**: If a heavily shorted stock rapidly surges in price, short sellers rush to buy back shares to limit their losses. This wave of panic buying drives the price up even higher.`
  },
  {
    keywords: ['call option', 'put option', 'options trading', 'what are options', 'how do options work', 'options vs stocks', 'strike price', 'option premium'],
    answer: `# Understanding Options Contracts (Calls & Puts)\n\nAn **option** is a financial contract that gives the buyer the right—but not the obligation—to buy or sell an underlying stock at a fixed price (**Strike Price**) within a specific timeframe (**Expiration Date**).\n\n### 📈 Call Options (Bullish)\n- Gives you the right to **BUY** a stock at the strike price.\n- **Best Used When:** You expect the underlying stock price to rise.\n- **Example:** Buying a $150 Call on $AAPL when it trades at $140.\n\n### 📉 Put Options (Bearish & Hedging)\n- Gives you the right to **SELL** a stock at the strike price.\n- **Best Used When:** You expect the stock to fall or want to hedge an existing portfolio.\n\n### 🔑 Key Terminology\n- **Premium**: The price paid to purchase an option contract.\n- **Strike Price**: The pre-agreed price at which the option can be exercised.\n- **Expiration Date**: The final day the contract remains valid.`
  },
  {
    keywords: ['p/e ratio', 'pe ratio', 'price to earnings', 'what is pe ratio', 'valuation ratio'],
    answer: `# Price-to-Earnings (P/E) Ratio Explained\n\nThe **Price-to-Earnings (P/E) Ratio** is a key valuation metric measuring a company's current share price relative to its per-share earnings (EPS).\n\n- **Formula:** P/E Ratio = Current Share Price ÷ Earnings Per Share (EPS)\n- **High P/E (e.g. 30x - 70x+)**: Investors expect rapid future earnings growth (common in Tech/Growth stocks like $NVDA).\n- **Low P/E (e.g. 8x - 15x)**: Suggests a mature company, value stock, or one facing growth headwinds.\n- **Trailing vs Forward P/E**: Trailing P/E uses past 12-month earnings, while Forward P/E uses projected future 12-month earnings.`
  },
  {
    keywords: ['market cap', 'market capitalization', 'mega cap', 'small cap', 'large cap', 'what is market cap'],
    answer: `# Market Capitalization (Market Cap)\n\n**Market Capitalization** is the total dollar value of a publicly traded company's outstanding shares.\n\n- **Formula:** Market Cap = Total Shares Outstanding × Current Share Price\n\n### 🏢 Market Cap Tiers\n- **Mega-Cap ($200B+)**: Industry giants like $NVDA, $AAPL, $MSFT, and $GOOGL.\n- **Large-Cap ($10B - $200B)**: Stable, established blue-chip corporations.\n- **Mid-Cap ($2B - $10B)**: High growth potential with moderate market volatility.\n- **Small-Cap ($300M - $2B)**: Emerging growth companies with high upside potential and higher risk.`
  },
  {
    keywords: ['bull vs bear', 'bull market', 'bear market', 'what is a bull market', 'what is a bear market', 'bullish vs bearish'],
    answer: `# Bull Market vs. Bear Market\n\nStock market cycles alternate between bull and bear market regimes based on economic conditions and investor sentiment.\n\n### 🐂 Bull Market (Optimism & Growth)\n- Characterized by sustained price increases (typically **+20% or more** from recent lows).\n- Driven by strong economic expansion, low unemployment, robust enterprise earnings, and high investor confidence.\n\n### 🐻 Bear Market (Decline & Caution)\n- Characterized by prolonged price declines (typically **-20% or more** from recent peak highs).\n- Triggered by economic recessions, rising interest rates, inflation shocks, or market panic.`
  },
  {
    keywords: ['margin trading', 'margin call', 'what is margin', 'trading leverage', 'leverage in trading'],
    answer: `# Margin Trading & Financial Leverage\n\n**Margin trading** allows an investor to borrow capital from their broker to purchase a larger position in stocks than their cash balance alone would allow.\n\n### ⚡ How Leverage Works\n- If you have $5,000 cash and use **2x margin**, you can buy $10,000 worth of stock.\n- **Amplified Profit**: A 10% stock rise yields a 20% return on your cash.\n- **Amplified Risk**: A 10% stock drop results in a 20% loss on your cash.\n\n### 🚨 Margin Calls\nIf your account equity falls below your broker's maintenance requirement, you receive a **Margin Call**, forcing you to immediately deposit cash or have positions automatically liquidated at a loss.`
  },
  {
    keywords: ['stop loss', 'limit order', 'market order', 'stop-loss', 'order types'],
    answer: `# Stock Order Types & Risk Controls\n\nUsing the right order types is essential for disciplined trading:\n\n1. **Market Order**: Executes immediately at the best available current market price.\n2. **Limit Order**: Executes only at your specified target price or better.\n3. **Stop-Loss Order**: Automatically triggers a market order to sell once a stock drops to your specified price, protecting your capital against severe loss.`
  },
  {
    keywords: ['federal reserve', 'fed rate', 'interest rates', 'rate hikes', 'rate cuts', 'yield curve'],
    answer: `# Federal Reserve Interest Rate Policy & Market Impact\n\nThe Federal Reserve adjusts benchmark interest rates to manage inflation and economic growth cycles.\n\n### 📉 Rate Hikes (Cooling Inflation)\n- **Higher Borrowing Costs**: Corporate and consumer borrowing costs rise.\n- **Stock Valuation Impact**: Higher discount rates compress stock valuation multiples, especially for growth equities ($NVDA, $QQQ).\n\n### 📈 Rate Cuts (Stimulating Growth)\n- **Cheaper Credit**: Lower borrowing costs stimulate business investment and spending.\n- **Equity Impact**: Falling bond yields drive capital into equity markets seeking higher returns.`
  },
  {
    keywords: ['etf', 'etfs', 'exchange traded fund', 'spy vs stock', 'mutual fund vs etf'],
    answer: `# Exchange-Traded Funds (ETFs) vs. Individual Stocks\n\n### 📦 Exchange-Traded Funds (ETFs)\n- **Concept**: A single security holding a diversified basket of stocks, bonds, or commodities.\n- **Instant Diversification**: Buying one share of $SPY gives you fractional ownership in all 500 S&P 500 companies.\n- **Risk**: Lower single-stock volatility; tracks overall index market performance.\n\n### 🏢 Individual Stocks\n- **Concept**: Direct ownership in a single corporation (e.g. $NVDA, $AAPL).\n- **Risk & Reward**: Higher volatility with potential for outsized single-stock returns.`
  },
  {
    keywords: ['start trading', 'paper trade', 'paper trading', 'virtual cash', 'how to trade', 'simulator'],
    answer: "Trillium Finance matches live market feeds with $10,000 in virtual cash so you can learn to invest with absolutely zero financial risk!\n\nTo get started:\n1. Head over to the **Simulator** tab on your dashboard.\n2. Search for any stock symbol (like AAPL or MSFT).\n3. Click **Buy** or **Sell**, enter the amount, and confirm your trade. Your portfolio performance will track live market prices!"
  },
  {
    keywords: ['compounding', 'compound interest', 'compounding interest', 'how does compounding work'],
    answer: "Compounding interest is the process where your investment's earnings (from interest or capital gains) are reinvested to generate their own earnings over time.\n\nImagine investing $1,000 at a 10% annual return. After Year 1, you have $1,100. In Year 2, you earn 10% on $1,100 (which is $110), bringing your total to $1,210. Over long horizons, this exponential growth turns small, consistent savings into substantial wealth!"
  },
  {
    keywords: ['diversification', 'diversify', 'portfolio risk', 'eggs in one basket'],
    answer: "Diversification is the strategy of spreading your investments across different assets, industries, and sectors to reduce risk.\n\nIf you invest all your money in a single technology company and its stock drops 30%, your entire portfolio loses 30%. However, if you spread that money across technology, healthcare, energy, and bonds, a drop in one sector is offset by stability or gains in others."
  },
  {
    keywords: ['get xp', 'streaks work', 'leaderboard', 'rankings', 'streak', 'level up', 'check-in'],
    answer: "Building your Streak and climbing the Leaderboard is simple:\n- **Daily Check-ins**: Log in every day to keep your streak alive and earn daily XP bonuses.\n- **Learning Quests**: Complete financial literacy quests and quizzes to earn large XP rewards.\n- **Trading Simulator**: Active trading practice and maintaining a positive portfolio return will unlock bonus XP and achievements."
  },
  {
    keywords: ['index vs stock', 'what is an index', 'difference between stock and index', 'stock market index', 'what is a stock'],
    answer: "Here is the difference:\n- **Stock**: Represents a share of ownership in a single corporation (e.g., Apple, Microsoft, Tesla). If the company does well, your stock value goes up.\n- **Index**: Tracks the combined performance of a group of stocks (e.g., S&P 500, Dow Jones, Nasdaq). Buying an index-based asset allows you to invest in hundreds of companies at once, offering instant diversification."
  },
  {
    keywords: ['risk management', 'avoid losing money', 'stop loss', 'trading risk', 'managing risk'],
    answer: "Managing risk is the key to long-term investing success. Here are the core rules:\n1. **Use the 1% Rule**: Never risk more than 1% to 2% of your capital on a single trade.\n2. **Set Stop-Losses**: Determine a price point at which you will sell a stock to limit your loss.\n3. **Diversify**: Balance your portfolio with ETFs or stocks in different sectors.\n4. **Keep Emotion Out**: Stick to a clear plan rather than trading on panic or hype."
  },
  {
    keywords: ['inflation affect', 'inflation impact', 'how does inflation', 'what is inflation', 'inflation work', 'purchasing power', 'corporate profit margins', 'inflation statistics'],
    answer: `# How Inflation Impacts Markets, Corporate Margins & Valuations

Inflation—the rate at which prices for goods and services rise—is one of the most powerful macroeconomic forces dictating stock market returns.

### 🏭 1. Corporate Margin Compression vs. Pricing Power
- **Input Cost Pressures**: When raw material, energy, and labor costs surge, companies face immediate gross margin compression.
- **Pricing Power Moats**: Industry leaders with pricing power (e.g. $AAPL, $MSFT) pass higher costs onto customers without sacrificing volume. Companies in competitive commodity sectors see net earnings collapse.

### 🏦 2. Central Bank Policy & Interest Rates
- Persistent inflation forces the Federal Reserve to raise benchmark interest rates.
- Higher borrowing costs make debt financing more expensive for capital-intensive companies, slowing corporate expansion and share buyback programs.

### 📉 3. Valuation Multiple Contraction
- Future corporate earnings are discounted using the risk-free rate (Treasury yields).
- When yields rise alongside inflation, the present value of future earnings decreases, triggering severe multiple contraction in high-growth, high-P/E equities.

> **Trader Takeaway:** During high inflation regimes, focus on cash-generative businesses with robust pricing power, low debt-to-equity ratios, and defensive or commodity-backed balance sheets.`
  },
  {
    keywords: ['institutional capital', 'liquidity influence', 'financial markets', 'capital flow and liquidity', 'institutional order flow', 'market liquidity'],
    answer: `# Institutional Capital Flow & Market Liquidity Explained

Over 80% of daily equity trading volume originates from institutional investors—including sovereign wealth funds, pension systems, hedge funds, and market makers.

### 🌊 1. Liquidity & Price Discovery
- **Systemic Liquidity**: Plentiful cash reserves in the banking system lower market volatility and encourage risk-taking, driving equities higher.
- **Illiquidity Shocks**: When liquidity dries up, market depth thins. Even modest selling volume can cause violent downward gap-downs across equities.

### 🐋 2. Institutional Order Flow Dynamics
- **Block Trades & Dark Pools**: Institutions execute multi-million dollar positions algorithmically over days or weeks to minimize price slippage.
- **Passive Rebalancing**: Monthly and quarterly rebalancing by index giants (like Vanguard and BlackRock) creates massive predictable volume surges into re-weighted equities.

### 🎯 3. Bid-Ask Spreads & Market Makers
- High liquidity narrows the bid-ask spread to pennies, reducing transaction drag.
- Low liquidity widens spreads, increasing trading costs and heightening slippage on entries and exits.

> **Trader Takeaway:** Follow volume profiles ($SPY, $QQQ) and watch institutional accumulation/distribution patterns rather than retail headlines to time market momentum.`
  },
  {
    keywords: ['market trends', 'sustainable stock market trends', 'identify market trends', 'trend indicators', 'technical indicators'],
    answer: `# How Traders Identify Sustainable Market Trends

Spotting whether a market move is an enduring secular trend or a temporary fakeout requires synthesizing price action, technical structure, and macro breadth.

### 📈 1. Key Technical Trend Indicators
- **200-Day Simple Moving Average (SMA)**: The institutional dividing line between bull and bear regimes. Above the 200 SMA indicates secular accumulation.
- **Moving Average Confluence**: Golden Cross (50-day crossing above 200-day) and Death Cross (50-day crossing below 200-day) signal major multi-month directional shifts.
- **Relative Strength (RS)**: Stocks making new 52-week highs while the broad index consolidates demonstrate institutional leadership.

### 🧭 2. Market Breadth & Sector Rotation
- A healthy rally requires wide participation—advance/decline lines should rise alongside the S&P 500.
- Healthy bull markets rotate capital into cyclical sectors (Tech, Industrials, Consumer Discretionary), while defensive rotations (Utilities, Healthcare) signal caution.

> **Trader Takeaway:** Never trade counter to the primary 200-day trend. Look for pullback entries to key exponential moving averages (21-day or 50-day EMA) during confirmed uptrends.`
  },
  {
    keywords: ['treasury yield', 'treasury yields', 'bond yields', '10-year treasury', 'why do rising treasury'],
    answer: `# Treasury Yields & Their Direct Impact on Equities

The 10-Year U.S. Treasury yield serves as the global benchmark "risk-free rate" upon which all risk assets are priced.

### ⚖️ 1. Competition for Equity Capital
- When Treasury yields rise (e.g. above 4.5%), guaranteed government bonds become compelling alternatives to volatile equities, pulling institutional capital out of stocks.

### 📉 2. Discount Rate Pressure on Growth Stocks
- Valuations of tech and growth stocks rely heavily on projected earnings 5 to 10 years in the future.
- Higher discount rates drastically shrink the present value of distant cash flows, causing growth multiples ($NVDA, $TSLA) to compress quickly.

### 🔄 3. Yield Curve Signals
- **Normal Curve**: Long-term yields exceed short-term yields, reflecting economic expansion.
- **Inverted Curve**: 2-year yields exceed 10-year yields, historically a reliable leading indicator of economic slowdowns or recessions.`
  },
  {
    keywords: ['what is a dividend', 'how do dividends work', 'dividend yield'],
    answer: "A dividend is a portion of a company's earnings distributed directly to its shareholders, usually quarterly.\n\nFor example, if a stock trading at $100 pays a $4 annual dividend, its **dividend yield** is 4%. Many investors build portfolios focused on dividend-paying stocks to generate a steady stream of passive income, which can also be automatically reinvested to trigger compounding growth."
  }
];

export function getPreprogrammedAnswer(messageText: string): string | null {
  const normalizedText = messageText.toLowerCase().trim();
  
  // Find a QA entry where the normalized query contains all/most keywords or matches a specific one
  for (const qa of PREPROGRAMMED_QA) {
    for (const keyword of qa.keywords) {
      // Check if the user message contains the keyword phrase
      if (normalizedText.includes(keyword)) {
        return qa.answer;
      }
    }
  }
  
  return null;
}
