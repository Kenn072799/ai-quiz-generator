using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace backend.Services;

public class SmtpEmailService(IConfiguration config) : IEmailService
{
    public async Task SendPasswordResetEmailAsync(string toEmail, string resetLink)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(
            config["Smtp:FromName"] ?? "AI Quiz Generator",
            config["Smtp:FromEmail"]!));
        message.To.Add(MailboxAddress.Parse(toEmail));
        message.Subject = "Reset Your Password - AI Quiz Generator";

        var bodyBuilder = new BodyBuilder
        {
            HtmlBody = $"""
                <!DOCTYPE html>
                <html>
                <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #F9FAFB; margin: 0; padding: 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                    <tr>
                      <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08);">
                          <!-- Header -->
                          <tr>
                            <td style="background-color: #4F46E5; padding: 32px; text-align: center;">
                              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                                AI Quiz Generator
                              </h1>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding: 40px 32px;">
                              <h2 style="margin: 0 0 16px; color: #111827; font-size: 20px;">Reset Your Password</h2>
                              <p style="margin: 0 0 24px; color: #6B7280; font-size: 15px; line-height: 1.6;">
                                We received a request to reset your password. Click the button below to create a new password.
                                This link will expire in <strong>60 minutes</strong>.
                              </p>
                              <table cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                  <td align="center" style="padding: 8px 0 32px;">
                                    <a href="{resetLink}"
                                       style="display: inline-block; background-color: #4F46E5; color: #ffffff;
                                              text-decoration: none; font-size: 16px; font-weight: 600;
                                              padding: 14px 36px; border-radius: 8px;">
                                      Reset Password
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin: 0 0 8px; color: #6B7280; font-size: 13px;">
                                If the button doesn't work, copy and paste this link into your browser:
                              </p>
                              <p style="margin: 0; font-size: 13px; word-break: break-all;">
                                <a href="{resetLink}" style="color: #4F46E5;">{resetLink}</a>
                              </p>
                              <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
                              <p style="margin: 0; color: #9CA3AF; font-size: 13px;">
                                If you did not request a password reset, you can safely ignore this email.
                              </p>
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background-color: #F9FAFB; padding: 20px 32px; text-align: center;">
                              <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                &copy; 2026 AI Quiz Generator. All rights reserved.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """,
            TextBody = $"Reset your AI Quiz Generator password by visiting this link:\n\n{resetLink}\n\nThis link expires in 60 minutes. If you did not request this, ignore this email."
        };

        message.Body = bodyBuilder.ToMessageBody();

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(
            config["Smtp:Host"]!,
            int.Parse(config["Smtp:Port"] ?? "587"),
            SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(config["Smtp:Username"]!, config["Smtp:Password"]!);
        await smtp.SendAsync(message);
        await smtp.DisconnectAsync(true);
    }
}
