import nodemailer from 'nodemailer';
import { logger } from '../utils/logger.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initialize();
  }

  initialize() {
    try {
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        this.isConfigured = true;
        logger.info('Email service initialized successfully');
      } else {
        logger.warn('Email service not configured - SMTP settings missing');
      }
    } catch (error) {
      logger.error('Failed to initialize email service:', error);
    }
  }

  // Send donation receipt
  async sendDonationReceipt(donation, user, nft) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured, skipping receipt email');
      return;
    }

    try {
      const subject = `Thank you for your donation! Receipt #${donation.receipt.receiptNumber}`;
      
      const htmlContent = this.generateReceiptHTML(donation, user, nft);
      const textContent = this.generateReceiptText(donation, user, nft);

      const mailOptions = {
        from: `"EduFund" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // Update donation receipt status
      donation.receipt.sent = true;
      await donation.save();

      logger.info(`Receipt email sent successfully: ${info.messageId}`);
      return info;

    } catch (error) {
      logger.error('Failed to send receipt email:', error);
      throw error;
    }
  }

  // Generate HTML receipt
  generateReceiptHTML(donation, user, nft) {
    const amount = (donation.amount / 1000000).toFixed(6);
    const date = donation.createdAt.toLocaleDateString();
    const time = donation.createdAt.toLocaleTimeString();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Donation Receipt</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .receipt { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .amount { font-size: 24px; font-weight: bold; color: #2563eb; }
          .details { margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
          .nft-section { background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 EduFund</h1>
            <p>Thank you for your generous donation!</p>
          </div>
          
          <div class="content">
            <div class="receipt">
              <h2>Donation Receipt</h2>
              <div class="amount">${amount} ADA</div>
              
              <div class="details">
                <div class="detail-row">
                  <strong>Receipt Number:</strong>
                  <span>${donation.receipt.receiptNumber}</span>
                </div>
                <div class="detail-row">
                  <strong>Date:</strong>
                  <span>${date} at ${time}</span>
                </div>
                <div class="detail-row">
                  <strong>Category:</strong>
                  <span>${donation.category}</span>
                </div>
                <div class="detail-row">
                  <strong>Transaction Hash:</strong>
                  <span>${donation.blockchainTransaction.txHash}</span>
                </div>
                ${donation.message ? `
                <div class="detail-row">
                  <strong>Message:</strong>
                  <span>${donation.message}</span>
                </div>
                ` : ''}
              </div>
            </div>

            ${nft ? `
            <div class="nft-section">
              <h3>🎨 Your NFT Certificate</h3>
              <p>As a token of our appreciation, we've minted a unique NFT for your donation:</p>
              <div class="details">
                <div class="detail-row">
                  <strong>NFT Name:</strong>
                  <span>${nft.metadata.name}</span>
                </div>
                <div class="detail-row">
                  <strong>Asset ID:</strong>
                  <span>${nft.assetId}</span>
                </div>
                <div class="detail-row">
                  <strong>View on CardanoScan:</strong>
                  <a href="${nft.cardanoScanUrl}" target="_blank">View NFT</a>
                </div>
              </div>
            </div>
            ` : ''}

            <div class="footer">
              <p>Thank you for supporting education through blockchain technology!</p>
              <p>This receipt serves as proof of your charitable contribution.</p>
              <p>For questions, please contact us at support@edufund.io</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate text receipt
  generateReceiptText(donation, user, nft) {
    const amount = (donation.amount / 1000000).toFixed(6);
    const date = donation.createdAt.toLocaleDateString();
    const time = donation.createdAt.toLocaleTimeString();

    let text = `
EduFund - Donation Receipt

Thank you for your generous donation!

Receipt Number: ${donation.receipt.receiptNumber}
Amount: ${amount} ADA
Date: ${date} at ${time}
Category: ${donation.category}
Transaction Hash: ${donation.blockchainTransaction.txHash}
`;

    if (donation.message) {
      text += `Message: ${donation.message}\n`;
    }

    if (nft) {
      text += `
Your NFT Certificate:
NFT Name: ${nft.metadata.name}
Asset ID: ${nft.assetId}
View on CardanoScan: ${nft.cardanoScanUrl}
`;
    }

    text += `
Thank you for supporting education through blockchain technology!
This receipt serves as proof of your charitable contribution.

For questions, please contact us at support@edufund.io
`;

    return text;
  }

  // Send welcome email
  async sendWelcomeEmail(user) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured, skipping welcome email');
      return;
    }

    try {
      const subject = 'Welcome to EduFund!';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to EduFund</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Welcome to EduFund!</h1>
            </div>
            
            <div class="content">
              <h2>Hello ${user.name}!</h2>
              <p>Welcome to EduFund, where blockchain technology meets education philanthropy.</p>
              
              <h3>What you can do:</h3>
              <ul>
                <li>Make secure donations using Cardano</li>
                <li>Receive unique NFT certificates for your contributions</li>
                <li>Track your donation history</li>
                <li>Support various educational initiatives</li>
              </ul>
              
              <p>Your wallet address: ${user.formattedWalletAddress}</p>
              
              <p>Ready to make your first donation? Visit our platform and start making a difference!</p>
            </div>
            
            <div class="footer">
              <p>Thank you for joining EduFund!</p>
              <p>For support, contact us at support@edufund.io</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"EduFund" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: subject,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Welcome email sent successfully: ${info.messageId}`);
      return info;

    } catch (error) {
      logger.error('Failed to send welcome email:', error);
      throw error;
    }
  }

  // Send admin notification
  async sendAdminNotification(subject, message, data = {}) {
    if (!this.isConfigured) {
      logger.warn('Email service not configured, skipping admin notification');
      return;
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Admin Notification</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .data { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Admin Notification</h1>
            </div>
            
            <div class="content">
              <h2>${subject}</h2>
              <p>${message}</p>
              
              ${Object.keys(data).length > 0 ? `
              <div class="data">
                <h3>Additional Data:</h3>
                <pre>${JSON.stringify(data, null, 2)}</pre>
              </div>
              ` : ''}
            </div>
          </div>
        </body>
        </html>
      `;

      const mailOptions = {
        from: `"EduFund Admin" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER,
        subject: `[EduFund Admin] ${subject}`,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Admin notification sent successfully: ${info.messageId}`);
      return info;

    } catch (error) {
      logger.error('Failed to send admin notification:', error);
      throw error;
    }
  }

  // Test email configuration
  async testConnection() {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      logger.error('Email connection test failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export { emailService };

// Export individual functions for convenience
export const sendDonationReceipt = (donation, user, nft) => {
  return emailService.sendDonationReceipt(donation, user, nft);
};

export const sendWelcomeEmail = (user) => {
  return emailService.sendWelcomeEmail(user);
};

export const sendAdminNotification = (subject, message, data) => {
  return emailService.sendAdminNotification(subject, message, data);
}; 
 