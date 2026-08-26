/**
 * Finance Topic Safety & Anti-Cheat Validation
 * Ensures questions pertain to finance, economics, markets, or trading,
 * while stripping cheat prefixes like "Finance: ..." or "In finance, ...".
 */

// List of non-financial domain intent patterns
const NON_FINANCE_PATTERNS = [
  /\b(recipe|bake|cook|flour|sugar|cake|pizza|burger|pasta|dish|ingredient)\b/i,
  /\b(story|fiction|fairy\s*tale|dragon|wizard|novel|poem|script|movie|film|actor)\b/i,
  /\b(game|gaming|minecraft|fortnite|playstation|xbox|nintendo|cheat\s*code|pokemon)\b/i,
  /\b(code|python|java|javascript|c\+\+|discord\s*bot|html|css|bug|function|array)\b(?!\s*(?:financial|stock|trading|calc|black\s*scholes|option))/i,
  /\b(dating|relationship|girlfriend|boyfriend|love|breakup|marry)\b/i,
  /\b(joke|riddle|knock\s*knock|funny|prank)\b/i,
  /\b(car|engine|mechanic|repair|plumbing|paint|fix\s*my)\b(?!\s*(?:auto|tsla|ford|gm|stock))/i,
  /\b(soccer|football|basketball|nba|nfl|world\s*cup|player|stadium)\b(?!\s*(?:stock|shares|business|revenue|club\s*valuation))/i,
];

// Keywords indicating genuine financial intent
const GENUINE_FINANCE_KEYWORDS = [
  'stock', 'stocks', 'share', 'shares', 'equity', 'equities', 'market', 'markets',
  'option', 'options', 'call', 'put', 'strike', 'premium', 'bull', 'bear', 'bullish', 'bearish',
  'portfolio', 'trade', 'trader', 'trading', 'dividend', 'yield', 'bond', 'bonds',
  'etf', 'index', 'spy', 'qqq', 's&p', 'nasdaq', 'dow', 'fed', 'federal reserve',
  'interest rate', 'inflation', 'cpi', 'ppi', 'gdp', 'economy', 'economic', 'macro',
  'earnings', 'revenue', 'profit', 'margin', 'valuation', 'pe ratio', 'p/e', 'market cap',
  'cash flow', 'balance sheet', 'asset', 'liability', 'short', 'long', 'leverage',
  'margin call', 'liquidity', 'volatility', 'vix', 'trillium', 'leaderboard', 'streak',
  'debt', 'loan', 'interest', 'compound', 'compounding', 'invest', 'investing', 'investor',
  'crypto', 'bitcoin', 'ethereum', 'sec', 'finra', 'fund', 'hedge fund', 'wall street'
];

/**
 * Strips fake prefixes used by users attempting to bypass prompt constraints.
 * E.g., "Finance: how do I bake a cake" -> "how do I bake a cake"
 */
export function stripCheatPrefixes(text: string): string {
  let cleaned = text.trim();
  
  // Repeatedly remove leading cheat prefixes
  const cheatPrefixRegex = /^(?:finance|financial|in\s+terms?\s+of\s+finance|in\s+financial\s+terms?|regarding\s+finance|for\s+finance|finance\s+topic|topic\s*:\s*finance|ignore\s+previous\s+instructions.*?)[:\s,\-–=]+/i;
  
  while (cheatPrefixRegex.test(cleaned)) {
    cleaned = cleaned.replace(cheatPrefixRegex, '').trim();
  }

  // Remove trailing "finance" pads e.g. "tell me a story finance"
  cleaned = cleaned.replace(/[\s,.-]+finance\s*$/i, '').trim();

  return cleaned;
}

/**
 * Validates whether the user's message is genuinely finance-related.
 * Returns true if valid, false if non-financial or cheatable.
 */
export function isFinanceTopic(userMessage: string, hasAttachedNews: boolean = false): { isValid: boolean; reason?: string } {
  // If a news article is attached, it's inherently a financial market topic
  if (hasAttachedNews) {
    return { isValid: true };
  }

  const cleanedText = stripCheatPrefixes(userMessage);

  // If the user's message is empty or too short to have real intent after stripping
  if (cleanedText.length < 2) {
    return { 
      isValid: false, 
      reason: "Please enter a specific financial, market, or investment question." 
    };
  }

  const lowerCleaned = cleanedText.toLowerCase();

  // Check if non-finance pattern is triggered in the cleaned text
  const matchedNonFinance = NON_FINANCE_PATTERNS.some(pattern => pattern.test(lowerCleaned));
  
  // Check if genuine finance keyword exists in the cleaned text
  const hasFinanceKeyword = GENUINE_FINANCE_KEYWORDS.some(kw => lowerCleaned.includes(kw));

  // If it matched a non-finance domain (e.g. baking, fiction, gaming) AND doesn't have a strong finance context
  if (matchedNonFinance && !hasFinanceKeyword) {
    return {
      isValid: false,
      reason: "I specialize strictly in financial markets, stock analysis, economics, and portfolio strategy. Please ask a market or investing question!"
    };
  }

  // If it matched a non-finance domain even WITH a keyword (e.g. "how to write python code for stock" vs "write python code for game")
  if (matchedNonFinance) {
    if (/\b(recipe|bake|cake|pizza|fiction|dragon|fairy|game\s*cheat)\b/i.test(lowerCleaned)) {
      return {
        isValid: false,
        reason: "I can only assist with financial analysis, stock market topics, economic trends, and investing strategy."
      };
    }
  }

  // General check: if query has > 4 words and contains zero finance keywords or context
  const wordCount = lowerCleaned.split(/\s+/).length;
  if (wordCount >= 4 && !hasFinanceKeyword) {
    const isGreeting = /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening)|help|what\s+can\s+you\s+do)\b/i.test(lowerCleaned);
    if (!isGreeting) {
      return {
        isValid: false,
        reason: "I focus strictly on stock trading, market analysis, financial literacy, and portfolio management. What financial topic would you like to explore?"
      };
    }
  }

  return { isValid: true };
}
