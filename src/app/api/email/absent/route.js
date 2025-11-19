import { NextResponse } from 'next/server';

/**
 * Email sending is now handled by the backend API only.
 * This frontend API route is disabled for Vercel deployment.
 * Use the backend endpoint: POST /api/email/absent
 */

export async function POST(request) {
  return NextResponse.json({
    status: 'error',
    message: 'Email sending is handled by backend API. Please use the backend /api/email/absent endpoint.'
  }, { status: 400 });
}

export async function GET() {
  return NextResponse.json({
    status: 'error',
    message: 'Email configuration is handled by backend API.'
  }, { status: 400 });
}
