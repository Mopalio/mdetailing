import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

/* Built on first request, not at module scope: constructing it at import
   time threw "Missing API key" while `next build` was only collecting page
   data, which failed the whole build on a machine without the key.

   RESEND_API_KEY is read first because anything prefixed NEXT_PUBLIC_ is
   meant to be readable in the browser, which is not what a mail API key
   should be. The old name is still accepted so existing envs keep working. */
let client: Resend | null = null;

function getResend(): Resend {
  if (!client) {
    const key = process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;
    if (!key) throw new Error('RESEND_API_KEY is not set');
    client = new Resend(key);
  }
  return client;
}

/* The booking details are typed by the customer and dropped straight
   into an HTML email, so they are escaped here: without this a stray
   angle bracket breaks the layout, and a crafted one injects markup
   into the mail the business reads. Newlines are kept with
   white-space: pre-line, since the notes field is multi-line. */
function esc(v: unknown): string {
  return String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, carSize, date, time, message } = body;

    console.log('Sending customer email to:', email);
    
    // Send email to customer
    const customerEmail = await getResend().emails.send({
      from: 'M Detailing <contact@mdetailing.lu>',
      to: [email],
      subject: 'Appointment Confirmation - M Detailing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Appointment Confirmation</h2>
          <p>Dear ${esc(name)},</p>
          <p>Thank you for booking your car wash appointment with M Detailing!</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${esc(date)}</p>
            <p><strong>Time:</strong> ${esc(time)}</p>
            <p><strong>Car Size:</strong> ${esc(carSize)}</p>
            ${message ? `<p style="white-space: pre-line;"><strong>Booking details:</strong><br>${esc(message)}</p>` : ''}
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
    const businessEmail = await getResend().emails.send({
      from: 'M Detailing <contact@mdetailing.lu>',
      to: ["mdetailing2025@gmail.com"],
      subject: 'New Appointment Booking',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Appointment Booking</h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Customer Details:</h3>
            <p><strong>Name:</strong> ${esc(name)}</p>
            <p><strong>Email:</strong> ${esc(email)}</p>
            <p><strong>Phone:</strong> ${esc(phone)}</p>
            <p><strong>Date:</strong> ${esc(date)}</p>
            <p><strong>Time:</strong> ${esc(time)}</p>
            <p><strong>Car Size:</strong> ${esc(carSize)}</p>
            ${message ? `<p style="white-space: pre-line;"><strong>Booking details:</strong><br>${esc(message)}</p>` : ''}
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