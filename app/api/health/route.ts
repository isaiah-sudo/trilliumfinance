import { NextResponse } from 'next/server';

/**
 * Health check endpoint for GCP Cloud Run.
 * Returns 200 OK with timestamp and status.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'trilliumfinance',
    region: 'us-central1'
  });
}
