import nodemailer from "nodemailer";
import { SubscriptionPlanId } from "@/types/subscription.types";
import { baseurl, smtpConfig } from "@/config/env";

interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: smtpConfig.host,
    port: smtpConfig.port || 587,
    secure: smtpConfig.secure === true, // true for 465, false for other ports
    auth: {
      user: smtpConfig.user, // For SendGrid, this should be "apikey"
      pass: smtpConfig.password, // For SendGrid, this is your actual API key
    },
  });

  /**
   * Verify SMTP connection (optional - for debugging)
   */
  static async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("✅ SMTP connection verified successfully");
      return true;
    } catch (error) {
      console.error("❌ SMTP connection failed:", error);
      return false;
    }
  }

  /**
   * Send email using configured SMTP
   */
  private static async sendEmail(config: EmailConfig): Promise<EmailResponse> {
    try {
      // Validate input
      if (!config.to || !config.subject || !config.html) {
        throw new Error(
          "Email configuration is incomplete: missing required fields.",
        );
      }
      // Validate SMTP configuration
      if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASSWORD
      ) {
        throw new Error(
          "SMTP configuration is incomplete. Check your .env file.",
        );
      }

      const info = await this.transporter.sendMail({
        from:
          smtpConfig.fromEmail ||
          smtpConfig.fromEmail ||
          "noreply@briefly60.online",
        to: config.to,
        subject: config.subject,
        html: config.html,
      });

      console.log("✅ Email sent successfully:", info.messageId);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("❌ Email sending failed:", error);

      // Provide helpful error messages
      if (error instanceof Error) {
        if (error.message.includes("Invalid login")) {
          console.error("💡 Check SMTP_USER and SMTP_PASSWORD in .env file");
          console.error(
            "💡 For SendGrid: SMTP_USER must be 'apikey' (literal text)",
          );
        } else if (error.message.includes("ECONNREFUSED")) {
          console.error("💡 Check SMTP_HOST and SMTP_PORT in .env file");
        }
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email",
      };
    }
  }

  /**
   * Send password reset email
   */
  static async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    userName: string,
  ): Promise<EmailResponse> {
    const resetUrl = `${baseurl || "https://briefly60.online"}/auth/reset-password?token=${resetToken}`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Briefly60</h1>
                            <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">Your News Companion</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Reset Your Password</h2>
                            
                            <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Hello ${userName},
                            </p>
                            
                            <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                We received a password reset request for your Briefly60 account. Click the button below to reset your password:
                            </p>
                            
                            <!-- Button -->
                            <table role="presentation" style="margin: 0 0 24px;">
                                <tr>
                                    <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 0 0 16px; color: #4a5568; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            
                            <div style="margin: 0 0 24px; padding: 16px; background-color: #f7fafc; border-radius: 6px; border-left: 4px solid #667eea;">
                                <p style="margin: 0; color: #4a5568; font-size: 14px; word-break: break-all; font-family: monospace;">
                                    ${resetUrl}
                                </p>
                            </div>
                            
                            <div style="padding: 16px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;">
                                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                    <strong>⚠️ Important:</strong> This link is valid for <strong>1 hour</strong> only.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer Note -->
                    <tr>
                        <td style="padding: 0 40px 40px;">
                            <div style="padding: 20px; background-color: #fef2f2; border-radius: 6px; border-left: 4px solid #dc2626;">
                                <p style="margin: 0; color: #7f1d1d; font-size: 14px; line-height: 1.6;">
                                    <strong>📌 Note:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px; color: #718096; font-size: 14px;">
                                Thank you,<br>
                                <strong>Briefly60 Team</strong>
                            </p>
                            <p style="margin: 12px 0 0; color: #a0aec0; font-size: 12px;">
                                © ${new Date().getFullYear()} Briefly60. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return this.sendEmail({
      from: smtpConfig.fromEmail || "noreply@briefly60.online",
      to: email,
      subject: "🔐 Reset Your Password - Briefly60",
      html,
    });
  }

  /**
   * Send subscription confirmation email
   */
  static async sendSubscriptionConfirmationEmail(
    email: string,
    userName: string,
    planName: string,
    planId: SubscriptionPlanId,
    amount: number,
    startDate: Date,
    endDate: Date,
    transactionId?: string,
  ): Promise<EmailResponse> {
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    };

    const getPlanFeatures = (planId: SubscriptionPlanId) => {
      const features: Record<SubscriptionPlanId, string[]> = {
        free: ["Limited News Access", "Basic Features"],
        monthly: [
          "Unlimited News Access",
          "Ad-Free Experience",
          "Bookmark Feature",
          "Offline Reading",
        ],
        half_yearly: [
          "Unlimited News Access",
          "Ad-Free Experience",
          "Bookmark Feature",
          "Offline Reading",
          "6 Months Access",
        ],
        yearly: [
          "Unlimited News Access",
          "Ad-Free Experience",
          "Bookmark Feature",
          "Offline Reading",
          "1 Year Access",
          "Best Value",
        ],
        premium: [
          "Unlimited News Access",
          "Ad-Free Experience",
          "Bookmark Feature",
          "Offline Reading",
        ],
        pro: [
          "All Premium Features",
          "Private Content Access",
          "Priority Support",
          "Custom Reports",
          "Early Access",
        ],
      };

      return features[planId] || features.free;
    };

    const features = getPlanFeatures(planId);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
                            <div style="margin: 0 0 16px;">
                                <span style="font-size: 64px;">🎉</span>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Subscription Successful!</h1>
                            <p style="margin: 10px 0 0; color: #d1fae5; font-size: 14px;">Welcome to Briefly60</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #1a202c; font-size: 24px; font-weight: 600;">Payment Confirmed</h2>
                            
                            <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Dear ${userName},
                            </p>
                            
                            <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Your <strong>${planName}</strong> subscription has been successfully activated. You can now enjoy all premium features of Briefly60!
                            </p>
                            
                            <!-- Subscription Details Box -->
                            <div style="margin: 0 0 32px; padding: 24px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 8px; border: 2px solid #10b981;">
                                <h3 style="margin: 0 0 16px; color: #065f46; font-size: 18px; font-weight: 600;">📋 Subscription Details</h3>
                                
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">Plan:</td>
                                        <td style="padding: 8px 0; color: #047857; font-size: 14px; text-align: right;">${planName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">Amount:</td>
                                        <td style="padding: 8px 0; color: #047857; font-size: 14px; text-align: right;">৳${amount}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">Start Date:</td>
                                        <td style="padding: 8px 0; color: #047857; font-size: 14px; text-align: right;">${formatDate(startDate)}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">Expires:</td>
                                        <td style="padding: 8px 0; color: #047857; font-size: 14px; text-align: right;">${formatDate(endDate)}</td>
                                    </tr>
                                    ${
                                      transactionId
                                        ? `
                                    <tr>
                                        <td style="padding: 8px 0; color: #065f46; font-size: 14px; font-weight: 600;">Transaction ID:</td>
                                        <td style="padding: 8px 0; color: #047857; font-size: 14px; text-align: right; font-family: monospace;">${transactionId}</td>
                                    </tr>
                                    `
                                        : ""
                                    }
                                </table>
                            </div>
                            
                            <!-- Features -->
                            <div style="margin: 0 0 32px;">
                                <h3 style="margin: 0 0 16px; color: #1a202c; font-size: 18px; font-weight: 600;">🌟 Your Benefits:</h3>
                                
                                ${features
                                  .map(
                                    (feature) => `
                                <div style="margin: 0 0 12px; padding: 12px 16px; background-color: #f7fafc; border-radius: 6px; border-left: 4px solid #10b981;">
                                    <p style="margin: 0; color: #2d3748; font-size: 14px;">
                                        <span style="color: #10b981; font-weight: 600;">✓</span> ${feature}
                                    </p>
                                </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                            
                            <!-- Call to Action -->
                            <table role="presentation" style="margin: 0 0 24px;">
                                <tr>
                                    <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${baseurl || "http://localhost:3000"}/dashboard" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <div style="padding: 16px; background-color: #eff6ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
                                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                                    <strong>💡 Tip:</strong> You can manage your subscription anytime from your dashboard.
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px; color: #718096; font-size: 14px;">
                                Need help? Contact us:<br>
                                <a href="mailto:support@briefly60.online" style="color: #667eea; text-decoration: none;">support@briefly60.online</a>
                            </p>
                            <p style="margin: 12px 0 0; color: #a0aec0; font-size: 12px;">
                                © ${new Date().getFullYear()} Briefly60. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return this.sendEmail({
      from: smtpConfig.fromEmail || "noreply@briefly60.online",
      to: email,
      subject: `🎉 ${planName} Subscription Successful - Briefly60`,
      html,
    });
  }

  /**
   * Send welcome email to new users
   */
  static async sendWelcomeEmail(
    email: string,
    userName: string,
  ): Promise<EmailResponse> {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Briefly60</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; max-width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                            <div style="margin: 0 0 16px;">
                                <span style="font-size: 64px;">👋</span>
                            </div>
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">Welcome to Briefly60!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 16px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Dear ${userName},
                            </p>
                            
                            <p style="margin: 0 0 24px; color: #4a5568; font-size: 16px; line-height: 1.6;">
                                Thank you for joining Briefly60! You can now read Bangladesh and international news in just 60 seconds.
                            </p>
                            
                            <table role="presentation" style="margin: 0 0 24px;">
                                <tr>
                                    <td style="border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                                        <a href="${baseurl || "http://localhost:3000"}/discover" target="_blank" style="display: inline-block; padding: 16px 32px; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
                                            Start Browsing News
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; text-align: center; background-color: #f7fafc; border-radius: 0 0 12px 12px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px; color: #718096; font-size: 14px;">
                                Thank you,<br>
                                <strong>Briefly60 Team</strong>
                            </p>
                            <p style="margin: 12px 0 0; color: #a0aec0; font-size: 12px;">
                                © ${new Date().getFullYear()} Briefly60. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    return this.sendEmail({
      from: smtpConfig.fromEmail || "noreply@briefly60.online",
      to: email,
      subject: "👋 Welcome to Briefly60 - Your News Companion",
      html,
    });
  }
}
