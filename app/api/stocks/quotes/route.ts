import { NextRequest, NextResponse } from 'next/server';
import { resolveStockQuote } from '@/lib/stockQuoteResolver';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols') || searchParams.get('symbol') || '';
    
    if (!symbolsParam) {
      return NextResponse.json({ quotes: [] }, { status: 200 });
    }

    const symbols = symbolsParam
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    const quotes = await Promise.all(symbols.map(resolveStockQuote));

    return NextResponse.json(
      { quotes },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
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
