import { NextRequest, NextResponse } from 'next/server';
import { resolveStockQuote } from '@/lib/stockQuoteResolver';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols') || searchParams.get('symbol') || '';
    
    if (!symbolsParam) {
      return NextResponse.json({ quotes: [] }, { status: 200 });
    }

    const rawSymbols = symbolsParam
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => /^[A-Z0-9^.-]{1,10}$/.test(s));

    const uniqueSymbols = Array.from(new Set(rawSymbols)).slice(0, 50);

    if (uniqueSymbols.length === 0) {
      return NextResponse.json({ quotes: [] }, { status: 200 });
    }

    const quotes = await Promise.all(uniqueSymbols.map(resolveStockQuote));

    return NextResponse.json(
      { quotes },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch quotes', quotes: [] },
      { status: 200 }
    );
  }
}
