import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const DEFAULT_MODEL = 'google/gemini-2.5-flash:free';

const SYSTEM_PROMPT = `You are the Trillium Finance AI Assistant, an expert virtual trading mentor and financial literacy coach.
Your primary role is to guide users in learning how to invest, practice paper trading, manage virtual portfolios, earn rankings XP, and understand key financial concepts like compounding interest, diversification, and market analysis.

CRITICAL RULES:
1. You are strictly a financial, stock market, and Trillium Finance platform assistant.
2. You MUST ONLY answer questions, provide advice, or give guidance related to:
   - Stocks, indices, exchange-traded funds (ETFs), mutual funds, bonds, and other asset classes.
   - Financial analysis, market trends, portfolio strategies, and investing.
   - Core financial literacy pillars, virtual cash, paper trading, and compounding interest.
   - Trillium Finance features, dashboard usage, streak tracking, and leaderboard rankings.
3. If a user asks you ANY question or makes a request that is NOT directly related to finance, investing, stock market, or Trillium Finance (such as writing general code, cooking recipes, creative writing, non-financial history, general science, math equations not related to finance, personal/relationship advice, etc.), you MUST politely refuse to answer. Redirect them back to stock market learning, trading simulator, or financial literacy topics.
   Example refusal: "I'm sorry, but I can only answer questions related to the stock market, investing, financial literacy, and the Trillium Finance platform. Let's get back to mastering your virtual paper trading portfolio! How can I help you with that?"
4. Keep your answers clear, educational, engaging, and professional.`;

export async function POST(request: Request) {
  try {
    // 1. Authenticate the request using the Authorization header or Firebase session cookie
    const authHeader = request.headers.get('Authorization');
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get('__session')?.value || '';
    }

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
    }

    try {
      const adminAuth = getAdminAuth();
      await adminAuth.verifyIdToken(token);
    } catch (authError) {
      console.error('[Chat API] Token verification failed:', authError);
      
      // In development mode, bypass the verification error to accommodate local developer flows
      // (e.g. running the Next.js dev server without local Firebase auth emulators running).
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Chat API] Bypassing token verification failure in development mode.');
      } else {
        return NextResponse.json({ error: 'Invalid authentication session' }, { status: 401 });
      }
    }

    // 2. Parse the request body
    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    // 3. Retrieve OpenRouter API Key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
      console.error('[Chat API] OPENROUTER_API_KEY is not configured.');
      return NextResponse.json(
        { error: 'AI service is temporarily unavailable. Please configure OPENROUTER_API_KEY.' },
        { status: 503 }
      );
    }

    // 4. Format the conversation history for OpenRouter
    const formattedMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text || '',
      })),
    ];

    // 5. Call OpenRouter API
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://trillium.finance', // fallback referer
        'X-Title': 'Trillium Finance',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: formattedMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Chat API] OpenRouter API error response:', errorText);
      return NextResponse.json(
        { error: 'Failed to retrieve response from AI service.' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const aiResponseText = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ text: aiResponseText });
  } catch (error) {
    console.error('[Chat API] Internal error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
