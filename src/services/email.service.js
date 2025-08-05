import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Configure the email transporter
    // You can use Gmail, Outlook, or any SMTP service
    this.transporter = nodemailer.createTransporter({
      service: 'gmail', // You can change this to your preferred email service
      auth: {
        user: process.env.EMAIL_USER, // Your email address
        pass: process.env.EMAIL_PASSWORD // Your email password or app password
      }
    });

    // Alternative configuration for custom SMTP
    // this.transporter = nodemailer.createTransporter({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT || 587,
    //   secure: false, // true for 465, false for other ports
    //   auth: {
    //     user: process.env.EMAIL_USER,
    //     pass: process.env.EMAIL_PASSWORD
    //   }
    // });
  }

  async sendAbsenteeNotification(internData, date) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: internData.email || internData.user?.email,
        subject: `Attendance Inquiry - ${new Date(date).toLocaleDateString()}`,
        html: this.generateAbsenteeEmailTemplate(internData, date)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return {
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      };
    } catch (error) {
      console.error('Error sending email:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send email'
      };
    }
  }

  generateAbsenteeEmailTemplate(internData, date) {
    const internName = internData.name || internData.user?.name || 'Team Member';
    const internEmail = internData.email || internData.user?.email || '';
    const internDepartment = internData.department || 'General';
    const internId = internData.id || internData._id || 'N/A';
    
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const currentTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Attendance Inquiry - CheckMate System</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #2d3748;
            background-color: #f7fafc;
            padding: 20px;
          }
          .email-container {
            max-width: 650px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
            position: relative;
          }
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="%23ffffff" opacity="0.1"/><circle cx="80" cy="40" r="1.5" fill="%23ffffff" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="%23ffffff" opacity="0.1"/></svg>');
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            position: relative;
            z-index: 1;
          }
          .header p {
            font-size: 16px;
            opacity: 0.9;
            position: relative;
            z-index: 1;
          }
          .content {
            padding: 40px 30px;
            background-color: #ffffff;
          }
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 20px;
          }
          .intro-text {
            font-size: 16px;
            margin-bottom: 25px;
            color: #4a5568;
          }
          .attendance-card {
            background: linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%);
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            border-left: 5px solid #e53e3e;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          }
          .attendance-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
          }
          .detail-item {
            background-color: rgba(255, 255, 255, 0.8);
            padding: 12px;
            border-radius: 6px;
          }
          .detail-label {
            font-weight: 600;
            color: #2d3748;
            font-size: 14px;
            margin-bottom: 4px;
          }
          .detail-value {
            color: #4a5568;
            font-size: 15px;
          }
          .status-badge {
            display: inline-block;
            background-color: #e53e3e;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .section {
            margin: 30px 0;
          }
          .section-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 15px;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 8px;
          }
          .benefits-list {
            background-color: #f0fff4;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
            margin: 20px 0;
          }
          .benefits-list ul {
            list-style: none;
            padding-left: 0;
          }
          .benefits-list li {
            padding: 8px 0;
            position: relative;
            padding-left: 25px;
          }
          .benefits-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
          }
          .requirements-list {
            background-color: #fffaf0;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ed8936;
            margin: 20px 0;
          }
          .requirements-list ol {
            padding-left: 20px;
          }
          .requirements-list li {
            padding: 6px 0;
            color: #744210;
          }
          .action-section {
            background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
            padding: 25px;
            border-radius: 10px;
            margin: 25px 0;
            text-align: center;
          }
          .action-title {
            font-size: 18px;
            font-weight: 600;
            color: #2b6cb0;
            margin-bottom: 15px;
          }
          .reply-button {
            display: inline-block;
            background: linear-gradient(135deg, #3182ce 0%, #2b6cb0 100%);
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            margin: 15px 0;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            transition: transform 0.2s;
          }
          .reply-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background-color: #f7fafc;
            padding: 30px;
            border-top: 1px solid #e2e8f0;
          }
          .footer-content {
            text-align: center;
          }
          .company-info {
            font-size: 16px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
          }
          .contact-info {
            font-size: 14px;
            color: #718096;
            margin-bottom: 20px;
          }
          .disclaimer {
            font-size: 12px;
            color: #a0aec0;
            font-style: italic;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
          }
          .timestamp {
            font-size: 12px;
            color: #a0aec0;
            text-align: right;
            margin-top: 20px;
          }
          @media (max-width: 600px) {
            .email-container {
              margin: 10px;
              border-radius: 8px;
            }
            .content {
              padding: 25px 20px;
            }
            .header {
              padding: 25px 20px;
            }
            .attendance-details {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h1>🎯 CheckMate Attendance System</h1>
            <p>Professional Attendance Management</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${internName},</div>
            
            <div class="intro-text">
              We hope this message finds you in good health and spirits. Our attendance monitoring system has recorded that you were not present at work today, and we wanted to reach out to ensure everything is alright.
            </div>
            
            <div class="attendance-card">
              <div class="attendance-details">
                <div class="detail-item">
                  <div class="detail-label">Employee Name</div>
                  <div class="detail-value">${internName}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Employee ID</div>
                  <div class="detail-value">${internId}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Department</div>
                  <div class="detail-value">${internDepartment}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Date of Absence</div>
                  <div class="detail-value">${formattedDate}</div>
                </div>
              </div>
              <div style="text-align: center;">
                <span class="status-badge">⚠️ Absent</span>
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">📋 Why We're Reaching Out</div>
              <div class="benefits-list">
                <p style="margin-bottom: 15px; color: #2d3748;">Your attendance is important to us, and we want to ensure:</p>
                <ul>
                  <li>Your well-being and safety</li>
                  <li>Accurate attendance record keeping</li>
                  <li>Proper work assignment planning</li>
                  <li>Availability of support if needed</li>
                  <li>Compliance with company policies</li>
                </ul>
              </div>
            </div>
            
            <div class="action-section">
              <div class="action-title">📧 Please Respond With</div>
              <div class="requirements-list">
                <ol>
                  <li><strong>Reason for absence:</strong> Brief explanation of why you were unable to attend</li>
                  <li><strong>Type of absence:</strong> Was this planned, emergency, or unexpected?</li>
                  <li><strong>Duration:</strong> Is this a single day or will you need additional time?</li>
                  <li><strong>Support needed:</strong> Do you require any assistance from the team?</li>
                  <li><strong>Return date:</strong> When do you expect to return to work?</li>
                </ol>
              </div>
              <a href="mailto:${process.env.EMAIL_USER}?subject=Attendance Response - ${formattedDate} - ${internName}&body=Dear CheckMate Team,%0D%0A%0D%0AReason for absence:%0D%0A%0D%0AType of absence:%0D%0A%0D%0ADuration:%0D%0A%0D%0ASupport needed:%0D%0A%0D%0AExpected return date:%0D%0A%0D%0AThank you." class="reply-button">
                📩 Reply to This Email
              </a>
            </div>
            
            <div class="section">
              <div class="section-title">💡 Important Notes</div>
              <p style="color: #4a5568; margin-bottom: 15px;">
                • If this was a planned absence that you forgot to report, please let us know immediately<br>
                • For medical emergencies, please provide documentation when possible<br>
                • Contact your supervisor directly for urgent matters<br>
                • Our HR team is available to assist with any personal challenges affecting attendance
              </p>
            </div>
            
            <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <p style="color: #2d3748; font-weight: 600; margin-bottom: 10px;">🤝 We're Here to Help</p>
              <p style="color: #4a5568;">Your well-being is our priority. If you're facing any challenges that affect your ability to attend work, please don't hesitate to reach out. We're committed to supporting our team members through difficult times.</p>
            </div>
            
            <div class="timestamp">
              Email sent: ${currentTime}
            </div>
          </div>
          
          <div class="footer">
            <div class="footer-content">
              <div class="company-info">CheckMate Attendance Management Team</div>
              <div class="contact-info">
                📧 ${process.env.EMAIL_USER} | 📱 Contact HR for urgent matters
              </div>
              <div class="disclaimer">
                This is an automated message from the CheckMate Attendance System. Please reply to this email with your response. All attendance inquiries are handled confidentially and in accordance with company privacy policies.
              </div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendBulkAbsenteeNotifications(absentInterns, date) {
    const results = [];
    
    for (const intern of absentInterns) {
      try {
        const result = await this.sendAbsenteeNotification(intern, date);
        results.push({
          intern: intern.name || intern.user?.name,
          email: intern.email || intern.user?.email,
          ...result
        });
        
        // Add a small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          intern: intern.name || intern.user?.name,
          email: intern.email || intern.user?.email,
          success: false,
          error: error.message
        });
      }
    }
    
    return results;
  }

  // Test email configuration
  async sendBulkAbsenteeNotifications(internsData, date) {
    try {
      console.log('Sending bulk absentee notifications to:', internsData.length, 'interns');
      
      const results = [];
      
      // Send emails to all absent interns
      for (const internData of internsData) {
        try {
          const result = await this.sendAbsenteeNotification(internData, date);
          results.push({
            intern: internData.name || internData.user?.name || 'Unknown',
            email: internData.email || internData.user?.email,
            success: result.success,
            messageId: result.messageId,
            error: result.error
          });
          
          // Add a small delay between emails to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Failed to send email to ${internData.name}:`, error);
          results.push({
            intern: internData.name || internData.user?.name || 'Unknown',
            email: internData.email || internData.user?.email,
            success: false,
            error: error.message
          });
        }
      }
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;
      
      console.log(`Bulk email results: ${successCount} sent, ${failureCount} failed`);
      
      return {
        success: successCount > 0,
        results,
        summary: {
          total: results.length,
          sent: successCount,
          failed: failureCount
        },
        message: `Sent ${successCount} of ${results.length} emails successfully`
      };
    } catch (error) {
      console.error('Error in bulk email sending:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to send bulk emails'
      };
    }
  }

  async testEmailConfiguration() {
    try {
      await this.transporter.verify();
      return {
        success: true,
        message: 'Email configuration is valid'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Email configuration is invalid'
      };
    }
  }
}

const emailService = new EmailService();
export default emailService;
