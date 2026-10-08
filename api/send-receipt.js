export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { order, apiKey, fromEmail } = req.body || {};
    const resendKey = apiKey || process.env.RESEND_API_KEY;

    if (!resendKey) {
      return res.status(400).json({ 
        error: 'Missing Resend API Key. กรุณาระบุ Resend API Key ในหน้าตั้งค่า หรือใส่ใน Environment Variable (RESEND_API_KEY)' 
      });
    }

    if (!order || !order.customerEmail) {
      return res.status(400).json({ error: 'Missing order details or customer email' });
    }

    const sender = fromEmail || process.env.RESEND_FROM_EMAIL || 'E-Book Store <onboarding@resend.dev>';
    const emailHtml = generateReceiptHtml(order);

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey.trim()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: sender,
        to: [order.customerEmail.trim()],
        subject: `✅ ยืนยันคำสั่งซื้อ #${order.id} - ใบเสร็จรับเงิน E-Book Shop`,
        html: emailHtml
      })
    });

    const resendData = await resendRes.json();
    if (!resendRes.ok) {
      return res.status(resendRes.status).json({ 
        error: resendData.message || 'Resend API returned an error', 
        details: resendData 
      });
    }

    return res.status(200).json({ 
      success: true, 
      id: resendData.id, 
      message: 'Email sent successfully via Resend' 
    });
  } catch (err) {
    console.error("Resend send receipt error:", err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}

function generateReceiptHtml(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const itemsRows = items.map(item => `
    <tr>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; font-size: 14px; color: #1e293b;">
        <strong>${item.title || 'Digital Product'}</strong>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">
          รูปแบบ: ${item.fileType || 'PDF'} | จำนวน: ${item.quantity || 1}
        </div>
      </td>
      <td style="padding: 12px 16px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">
        ฿${Number(item.price || 0).toLocaleString()}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="utf-8">
      <title>ใบเสร็จคำสั่งซื้อ #${order.id}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .content { padding: 32px 24px; }
        .badge { display: inline-block; background-color: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; }
        .info-box { background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; margin-top: 24px; text-align: center; }
        .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">E-Book Shop</h1>
          <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">ยืนยันคำสั่งซื้อและการชำระเงินเสร็จสมบูรณ์</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; color: #1e293b; margin-top: 0;">เรียนคุณ <strong>${order.customerName || 'ลูกค้าคนสำคัญ'}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            ขอบคุณสำหรับการสั่งซื้อ Digital Product จากทางร้านเรา ระบบได้รับการชำระเงินผ่าน <strong>Stripe</strong> เรียบร้อยแล้ว ด้านล่างนี้คือรายละเอียดและใบเสร็จของคุณ:
          </p>

          <div class="info-box">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #64748b; padding-bottom: 8px;">หมายเลขคำสั่งซื้อ:</td>
                <td style="text-align: right; font-weight: 700; color: #0f172a; padding-bottom: 8px;">#${order.id}</td>
              </tr>
              <tr>
                <td style="color: #64748b; padding-bottom: 8px;">สถานะการชำระเงิน:</td>
                <td style="text-align: right; padding-bottom: 8px;"><span class="badge">ชำระเงินแล้ว (PAID)</span></td>
              </tr>
              <tr>
                <td style="color: #64748b; padding-bottom: 8px;">ช่องทางชำระเงิน:</td>
                <td style="text-align: right; font-weight: 600; color: #0f172a; padding-bottom: 8px;">Stripe (Card)</td>
              </tr>
              <tr>
                <td style="color: #64748b;">รหัสธุรกรรม (Stripe ID):</td>
                <td style="text-align: right; font-family: monospace; font-size: 11px; color: #475569;">${order.stripeChargeId || '-'}</td>
              </tr>
            </table>
          </div>

          <h3 style="font-size: 16px; color: #0f172a; margin: 24px 0 12px 0;">รายการสินค้าที่สั่งซื้อ</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 10px 16px; text-align: left; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">สินค้า</th>
                <th style="padding: 10px 16px; text-align: right; font-size: 12px; color: #64748b; border-bottom: 1px solid #e2e8f0;">ราคา</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 16px; font-weight: 700; font-size: 16px; color: #0f172a;">ยอดชำระสุทธิ (Total)</td>
                <td style="padding: 16px; text-align: right; font-weight: 800; font-size: 18px; color: #2563eb;">฿${Number(order.totalAmount || 0).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin: 32px 0 16px 0;">
            <a href="https://selecttoppic-git-main-new-32c2.vercel.app/#track?order=${order.id}&email=${encodeURIComponent(order.customerEmail)}" class="button">
              📥 เข้าสู่ระบบเพื่อดาวน์โหลด E-Book
            </a>
            <p style="font-size: 12px; color: #94a3b8; margin-top: 12px;">
              คุณสามารถเข้าสู่หน้าร้านค้าและไปที่เมนู <strong>"ติดตามคำสั่งซื้อ"</strong> เพื่อดาวน์โหลดไฟล์ได้ตลอด 24 ชั่วโมง
            </p>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 0;">E-Book Shop Digital Product Store © 2026. All rights reserved.</p>
          <p style="margin: 4px 0 0 0;">หากมีข้อสงสัยหรือต้องการความช่วยเหลือ กรุณาติดต่อ support@ebookshop.dev</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
