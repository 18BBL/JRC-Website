import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// FROM: verified domain in Resend (jrcfoods.com must be verified in your Resend dashboard)
const FROM_ADDRESS  = 'JRC Culinary Group <contact@jrcfoods.com>';
// TO: your inbox
const OWNER_EMAIL   = 'jrcculinarygroup@gmail.com';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { company, contact, email, phone, location, volume, message } = req.body;

  // Validation
  if (!contact || !email) {
    return res.status(400).json({ error: 'Contact name and email are required.' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }

  const submittedAt = new Date().toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  try {
    // ── 1. Inbound notification to JRC team ──────────────────────────────────
    await resend.emails.send({
      from:     FROM_ADDRESS,
      to:       OWNER_EMAIL,
      reply_to: email,                          // Reply goes directly to customer
      subject:  'New Website Inquiry – JRC Culinary Group',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1E1E1E;">
          <div style="background: #C0392B; padding: 28px 36px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; font-size: 22px; color: #fff; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              JRC Culinary Group
            </h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 13px; margin: 6px 0 0; letter-spacing: 1px;">
              New Website Inquiry
            </p>
          </div>

          <div style="padding: 36px; background: #F7F4F0; border: 1px solid #e8e3db;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999; width: 150px;">Name</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px; color: #1E1E1E;">${contact}</td>
              </tr>
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999;">Email</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px;">
                  <a href="mailto:${email}" style="color: #C0392B; text-decoration: none;">${email}</a>
                </td>
              </tr>
              ${company ? `
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999;">Company</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px; color: #1E1E1E;">${company}</td>
              </tr>` : ''}
              ${phone ? `
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999;">Phone</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px; color: #1E1E1E;">${phone}</td>
              </tr>` : ''}
              ${location ? `
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999;">Location</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px; color: #1E1E1E;">${location}</td>
              </tr>` : ''}
              ${volume ? `
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999;">Volume</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #e0dbd3; font-size: 16px; color: #1E1E1E;">${volume}</td>
              </tr>` : ''}
              <tr>
                <td style="padding: 11px 0; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999;">Submitted</td>
                <td style="padding: 11px 0; font-size: 15px; color: #555;">${submittedAt} (PT)</td>
              </tr>
            </table>

            ${message ? `
            <div style="margin-top: 28px;">
              <p style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: #999; margin: 0 0 10px;">Message</p>
              <p style="font-size: 16px; line-height: 1.8; color: #3A3A3A; background: #fff; padding: 20px 24px; border-left: 3px solid #C0392B; margin: 0;">${message}</p>
            </div>` : ''}
          </div>

          <div style="padding: 18px 36px; background: #1E1E1E; text-align: center;">
            <p style="font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin: 0;">
              JRC Culinary Group · 566 Monterey Pass Rd, Monterey Park, CA
            </p>
          </div>
        </div>
      `,
    });

    // ── 2. Confirmation email to the customer ────────────────────────────────
    await resend.emails.send({
      from:     FROM_ADDRESS,
      to:       email,
      reply_to: OWNER_EMAIL,                    // Customer replies go to your inbox
      subject:  'Thank you for contacting JRC Culinary Group',
      html: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1E1E1E;">
          <div style="background: #C0392B; padding: 28px 36px;">
            <h1 style="font-family: Arial, sans-serif; font-weight: 900; font-size: 22px; color: #fff; margin: 0; letter-spacing: 2px; text-transform: uppercase;">
              JRC Culinary Group
            </h1>
          </div>

          <div style="padding: 40px 36px; background: #F7F4F0; border: 1px solid #e8e3db;">
            <p style="font-size: 17px; line-height: 1.85; color: #555; margin: 0 0 20px;">Hi ${contact},</p>
            <p style="font-size: 17px; line-height: 1.85; color: #555; margin: 0 0 20px;">
              Thank you for reaching out to JRC Culinary Group.
            </p>
            <p style="font-size: 17px; line-height: 1.85; color: #555; margin: 0 0 20px;">
              We've received your message and someone from our team will review it shortly. If your inquiry is regarding product distribution, wholesale partnerships, or restaurant supply, we typically respond within 1 business day.
            </p>
            <p style="font-size: 17px; line-height: 1.85; color: #555; margin: 0 0 28px;">
              You can learn more about our company here:<br>
              <a href="https://jrcfoods.com" style="color: #C0392B; text-decoration: none;">https://jrcfoods.com</a>
            </p>
            <p style="font-size: 17px; line-height: 1.85; color: #555; margin: 0 0 28px;">
              We appreciate your interest and look forward to connecting.
            </p>
            <p style="font-size: 16px; line-height: 1.85; color: #1E1E1E; margin: 0;">
              — <br>
              <strong>JRC Culinary Group</strong><br>
              <span style="color: #888; font-size: 14px;">Food Manufacturing &amp; Distribution</span><br>
              <span style="color: #888; font-size: 14px;">Los Angeles, California</span>
            </p>
          </div>

          <div style="padding: 18px 36px; background: #1E1E1E; text-align: center;">
            <p style="font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 1px; margin: 0;">
              JRC Culinary Group · 566 Monterey Pass Rd, Monterey Park, CA
            </p>
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
