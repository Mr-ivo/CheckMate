import { NextResponse } from 'next/server';
import emailService from '@/services/email.service';

export async function POST(request) {
  try {
    const body = await request.json();
    const { internId, internData, date, type = 'single' } = body;

    // Validate required fields
    if (!internData || !date) {
      return NextResponse.json(
        { error: 'Missing required fields: internData and date' },
        { status: 400 }
      );
    }

    // Validate email address
    const email = internData.email || internData.user?.email;
    if (!email) {
      return NextResponse.json(
        { error: 'No email address found for this intern' },
        { status: 400 }
      );
    }

    let result;

    if (type === 'bulk' && Array.isArray(internData)) {
      // Handle bulk email sending for multiple absent interns
      result = await emailService.sendBulkAbsenteeNotifications(internData, date);
    } else {
      // Handle single email sending
      result = await emailService.sendAbsenteeNotification(internData, date);
    }

    if (result.success || (Array.isArray(result) && result.some(r => r.success))) {
      return NextResponse.json({
        success: true,
        message: type === 'bulk' ? 'Bulk emails processed' : 'Email sent successfully',
        data: result
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Failed to send email', 
          details: result.error || result 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// Test email configuration endpoint
export async function GET() {
  try {
    const result = await emailService.testEmailConfiguration();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      error: result.error || null
    });
  } catch (error) {
    console.error('Email configuration test error:', error);
    return NextResponse.json(
      { error: 'Failed to test email configuration', details: error.message },
      { status: 500 }
    );
  }
}
