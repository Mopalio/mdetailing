import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.NEXT_PUBLIC_RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, carSize, date, time, message } = body;

    console.log('Sending customer email to:', email);
    
    // Send email to customer
    const customerEmail = await resend.emails.send({
      from: 'M Detailing <onboarding@resend.dev>',
      to: [email],
      subject: 'Appointment Confirmation - M Detailing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Appointment Confirmation</h2>
          <p>Dear ${name},</p>
          <p>Thank you for booking your car wash appointment with M Detailing!</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Car Size:</strong> ${carSize}</p>
            ${message ? `<p><strong>Special Notes:</strong> ${message}</p>` : ''}
          </div>
          
          <p>We'll contact you shortly to confirm your appointment. If you need to make any changes, please contact us:</p>
          <ul>
            <li>Instagram: <a href="https://www.instagram.com/m_detailing2025/">@m_detailing2025</a></li>
            <li>Email: <a href="mailto:mdetailing2025@gmail.com">mdetailing2025@gmail.com</a></li>
          </ul>
          
          <p>Best regards,<br>The M Detailing Team</p>
        </div>
      `,
    });

    console.log('Customer email sent successfully:', customerEmail);

    console.log('Sending business email to: mdetailing2025@gmail.com');
    
    // Send notification email to business
    const businessEmail = await resend.emails.send({
      from: 'M Detailing <onboarding@resend.dev>',
      to: [email],
      subject: 'New Appointment Booking',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Appointment Booking</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Details:</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Car Size:</strong> ${carSize}</p>
            ${message ? `<p><strong>Special Notes:</strong> ${message}</p>` : ''}
          </div>
        </div>
      `,
    });

    console.log('Business email sent successfully:', businessEmail);

    return NextResponse.json({ 
      success: true, 
      message: 'Appointment booked successfully! Check your email for confirmation. Check your spam folder if you don\'t see it.' 
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send email. Please try again.' },
      { status: 500 }
    );
  }
} 