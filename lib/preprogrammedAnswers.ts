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
    keywords: ['start trading', 'paper trade', 'paper trading', 'virtual cash', 'how to trade', 'simulator'],
    answer: "Trillium Finance matches live market feeds with $100,000 in virtual cash so you can learn to invest with absolutely zero financial risk!\n\nTo get started:\n1. Head over to the **Simulator** tab on your dashboard.\n2. Search for any stock symbol (like AAPL or MSFT).\n3. Click **Buy** or **Sell**, enter the amount, and confirm your trade. Your portfolio performance will track live market prices!"
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
    keywords: ['what is inflation', 'inflation work', 'purchasing power'],
    answer: "Inflation is the general increase in prices and fall in the purchasing value of money over time.\n\nFor example, if inflation is at 3% per year, a $100 grocery bill this year will cost $103 next year. This is why investing is so critical: keeping your money in cash under a mattress means it loses purchasing power. To grow wealth, your investments need to outpace the inflation rate."
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
