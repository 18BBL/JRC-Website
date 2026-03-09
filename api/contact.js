import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// FROM must be a Resend-verified domain (jrcfoods.com)
// All notifications and replies go TO jrcculinarygroup@gmail.com
const FROM_ADDRESS = 'JRC Culinary Group <noreply@jrcfoods.com>';
const OWNER_EMAIL  = 'jrcculinarygroup@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, contact, email, phone, location, volume, message } = req.body;

  // Basic validation
  if (!company || !contact || !email) {
    return res.status(400).json({ error: 'Company name, contact name, and email are required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  try {
    // 1. Internal notification to JRC team
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: OWNER_EMAIL,
      reply_to: email,
      subject: `New Wholesale Inquiry — ${company}`,
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1E1E1E;">
          <div style="background: #C0392B; padding: 28px 36px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; font-size: 24px; color: #fff; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              JRC Culinary Group
            </h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 6px 0 0; letter-spacing: 1px;">
              New Wholesale Inquiry
            </p>
          </div>
          <div style="padding: 36px; background: #F7F4F0; border: 1px solid #e8e3db;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #888; width: 160px;">Company</td><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px;">${company}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #888;">Contact</td><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px;">${contact}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #888;">Email</td><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px;"><a href="mailto:${email}" style="color: #C0392B;">${email}</a></td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #888;">Phone</td><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px;">${phone || '—'}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #888;">Location</td><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px;">${location || '—'}</td></tr>
              <tr><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #888;">Volume</td><td style="padding: 10px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px;">${volume || '—'}</td></tr>
            </table>
            ${message ? `
            <div style="margin-top: 28px;">
              <p style="font-size: 12px; letter-spacing: 2px; text-transform: uppercase; color: #888; margin-bottom: 10px;">Message</p>
              <p style="font-size: 16px; line-height: 1.8; color: #3A3A3A; background: #fff; padding: 20px 24px; border-left: 3px solid #C0392B;">${message}</p>
            </div>` : ''}
          </div>
          <div style="padding: 20px 36px; background: #1E1E1E; text-align: center;">
            <p style="font-size: 12px; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin: 0;">JRC Culinary Group · 566 Monterey Pass Rd, Monterey Park, CA</p>
          </div>
        </div>
      `,
    });

    // 2. Confirmation email to the customer
    await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: 'We Received Your Inquiry – JRC Culinary Group',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1E1E1E;">
          <div style="background: #C0392B; padding: 28px 36px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; font-size: 24px; color: #fff; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              JRC Culinary Group
            </h1>
          </div>
          <div style="padding: 40px 36px; background: #F7F4F0; border: 1px solid #e8e3db;">
            <p style="font-size: 17px; line-height: 1.85; color: #1E1E1E; margin: 0 0 20px;">Hello ${contact},</p>
            <p style="font-size: 17px; line-height: 1.85; color: #555; margin: 0 0 20px;">
              Thank you for contacting JRC Culinary Group. We've received your message and will review the details shortly.
            </p>
            <p style="font-size: 17px; line-height: 1.85; color: #555; margin: 0 0 20px;">
              Our team will follow up with you as soon as possible regarding products, wholesale inquiries, or partnerships.
            </p>
            <p style="font-size: 17px; line-height: 1.85; color: #555; margin: 0 0 32px;">
              If there's anything else you'd like us to know in the meantime, feel free to reply to this email.
            </p>
            <p style="font-size: 17px; line-height: 1.85; color: #1E1E1E; margin: 0;">
              Best regards,<br>
              <strong>JRC Culinary Group</strong>
            </p>
          </div>
          <div style="padding: 20px 36px; background: #1E1E1E; text-align: center;">
            <p style="font-size: 12px; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin: 0;">JRC Culinary Group · 566 Monterey Pass Rd, Monterey Park, CA</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Failed to send email. Please try again or contact us directly.' });
  }
}
