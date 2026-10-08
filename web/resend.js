// ==========================================================
// E-Book Shop - Resend Email Integration Service
// Automated Order Confirmation & Receipt Emails
// ==========================================================

const RESEND_STORAGE_KEY = 'ebook_resend_config';

const DEFAULT_RESEND_CONFIG = {
  apiKey: '', // Resend API Key (starts with 're_...')
  fromEmail: 'E-Book Store <onboarding@resend.dev>',
  enabled: true
};

class ResendEmailService {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem(RESEND_STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_RESEND_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Failed to load Resend config:", e);
    }
    return { ...DEFAULT_RESEND_CONFIG };
  }

  saveConfig(apiKey, fromEmail) {
    this.config = {
      apiKey: (apiKey || '').trim(),
      fromEmail: (fromEmail || 'E-Book Store <onboarding@resend.dev>').trim(),
      enabled: true
    };
    localStorage.setItem(RESEND_STORAGE_KEY, JSON.stringify(this.config));
    console.log("⚡ Resend Email config updated");
  }

  isConfigured() {
    return Boolean(this.config && this.config.apiKey && this.config.apiKey.startsWith('re_'));
  }

  /**
   * Send order confirmation and receipt email to customer
   * @param {Object} order - Order object with id, customerName, customerEmail, items, totalAmount, etc.
   */
  async sendOrderReceipt(order) {
    if (!order || !order.customerEmail) {
      console.warn("Resend: Missing customer email for receipt");
      return { success: false, message: "Missing customer email" };
    }

    console.log(`📧 Preparing to send receipt to ${order.customerEmail} for order #${order.id}...`);

    // 1. Try sending via backend /api/send-receipt (Vercel Serverless Function)
    try {
      const resp = await fetch('/api/send-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: order,
          apiKey: this.config.apiKey || undefined,
          fromEmail: this.config.fromEmail || undefined
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        console.log("✅ Resend receipt sent successfully via /api/send-receipt:", data);
        return { success: true, message: `ส่งใบเสร็จไปยัง ${order.customerEmail} สำเร็จแล้ว`, data };
      }

      // If /api endpoint returns an explicit error or 404/405 (e.g. running on local python server)
      const errData = await resp.json().catch(() => ({}));
      console.warn("/api/send-receipt response:", resp.status, errData);

      // If we got a specific error from Resend through the API route, return it
      if (errData.error && resp.status !== 404) {
        return { success: false, message: errData.error };
      }
    } catch (apiErr) {
      console.log("Notice: /api/send-receipt not reachable, attempting direct Resend API call...", apiErr);
    }

    // 2. Direct client-side call to Resend API if API Key is configured
    if (this.isConfigured()) {
      try {
        const emailHtml = this.generateReceiptHtml(order);
        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: this.config.fromEmail || 'E-Book Store <onboarding@resend.dev>',
            to: [order.customerEmail],
            subject: `✅ ยืนยันคำสั่งซื้อ #${order.id} - ใบเสร็จรับเงิน E-Book Shop`,
            html: emailHtml
          })
        });

        const data = await resendRes.json();
        if (resendRes.ok) {
          console.log("✅ Resend receipt sent directly:", data);
          return { success: true, message: `ส่งอีเมลใบเสร็จไปยัง ${order.customerEmail} สำเร็จ`, data };
        } else {
          console.error("Resend API direct error:", data);
          return { success: false, message: data.message || "Failed to send email via Resend" };
        }
      } catch (directErr) {
        console.error("Resend direct fetch error:", directErr);
        return { success: false, message: directErr.message || "Network error sending email" };
      }
    }

    // 3. Fallback notice if no API key is yet configured
    console.info("ℹ️ Resend API Key is not yet configured. Please configure in Email Settings.");
    return {
      success: false,
      notConfigured: true,
      message: "ยังไม่ได้ระบุ Resend API Key (ไปที่ปุ่ม 📧 Resend Email เพื่อตั้งค่า)"
    };
  }

  /**
   * Send test email to verify credentials
   */
  async sendTestEmail(targetEmail) {
    const dummyOrder = {
      id: `TEST-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'ผู้ทดสอบระบบ',
      customerEmail: targetEmail,
      totalAmount: 199,
      stripeChargeId: 'ch_test_resend_verification',
      items: [
        { title: 'ชีวิตดีขึ้นได้ เริ่มจากตัวเรา (E-Book)', fileType: 'PDF', price: 199, quantity: 1 }
      ]
    };
    return await this.sendOrderReceipt(dummyOrder);
  }

  generateReceiptHtml(order) {
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
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">E-Book Shop</h1>
            <p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 15px;">ยืนยันคำสั่งซื้อและการชำระเงินเสร็จสมบูรณ์</p>
          </div>
          <div style="padding: 32px 24px;">
            <p style="font-size: 16px; color: #1e293b; margin-top: 0;">เรียนคุณ <strong>${order.customerName || 'ลูกค้า'}</strong>,</p>
            <p style="font-size: 14px; color: #475569; line-height: 1.6;">
              ขอบคุณสำหรับการสั่งซื้อ Digital Product จากทางร้านเรา ระบบได้รับการชำระเงินผ่าน <strong>Stripe</strong> เรียบร้อยแล้ว รายละเอียดคำสั่งซื้อมีดังนี้:
            </p>

            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                <tr>
                  <td style="color: #64748b; padding-bottom: 8px;">หมายเลขคำสั่งซื้อ:</td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a; padding-bottom: 8px;">#${order.id}</td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 8px;">สถานะการชำระเงิน:</td>
                  <td style="text-align: right; padding-bottom: 8px;"><span style="background-color: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600;">ชำระเงินแล้ว (PAID)</span></td>
                </tr>
                <tr>
                  <td style="color: #64748b; padding-bottom: 8px;">ช่องทางชำระเงิน:</td>
                  <td style="text-align: right; font-weight: 600; color: #0f172a; padding-bottom: 8px;">Stripe (Card)</td>
                </tr>
                <tr>
                  <td style="color: #64748b;">รหัสธุรกรรม Stripe:</td>
                  <td style="text-align: right; font-family: monospace; font-size: 11px; color: #475569;">${order.stripeChargeId || '-'}</td>
                </tr>
              </table>
            </div>

            <h3 style="font-size: 16px; color: #0f172a; margin: 24px 0 12px 0;">รายการสินค้า</h3>
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
                  <td style="padding: 16px; font-weight: 700; font-size: 16px; color: #0f172a;">ยอดชำระสุทธิ</td>
                  <td style="padding: 16px; text-align: right; font-weight: 800; font-size: 18px; color: #2563eb;">฿${Number(order.totalAmount || 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div style="text-align: center; margin: 32px 0 16px 0;">
              <a href="https://selecttoppic-git-main-new-32c2.vercel.app/#track?order=${order.id}&email=${encodeURIComponent(order.customerEmail)}" style="display: inline-block; background: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 15px;">
                📥 คลิกเพื่อเปิดดูและดาวน์โหลด E-Book
              </a>
            </div>
          </div>
          <div style="background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0;">E-Book Shop Digital Product Store © 2026. Powered by Resend & Stripe.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

// Global Singleton Instance
window.resendService = new ResendEmailService();
