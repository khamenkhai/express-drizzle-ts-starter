export const verificationEmailTemplate = (
  code: string,
  name: string,
): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #4f46e5; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 32px; }
    .code-box { background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .code { font-size: 36px; font-weight: 700; color: #4f46e5; letter-spacing: 8px; }
    .text { color: #475569; font-size: 16px; line-height: 1.6; }
    .footer { padding: 24px 32px; background-color: #f8fafc; text-align: center; }
    .footer p { color: #94a3b8; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Verify Your Email</h1>
    </div>
    <div class="content">
      <p class="text">Hi ${name},</p>
      <p class="text">Thanks for signing up! Please use the verification code below to complete your registration:</p>
      <div class="code-box">
        <div class="code">${code}</div>
      </div>
      <p class="text">This code will expire in <strong>15 minutes</strong>.</p>
      <p class="text">If you didn't create an account, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const passwordResetEmailTemplate = (
  resetUrl: string,
  name: string,
): string => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background-color: #dc2626; padding: 32px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 32px; }
    .text { color: #475569; font-size: 16px; line-height: 1.6; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background-color: #dc2626; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; }
    .note { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; }
    .note p { color: #991b1b; font-size: 14px; margin: 0; }
    .footer { padding: 24px 32px; background-color: #f8fafc; text-align: center; }
    .footer p { color: #94a3b8; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p class="text">Hi ${name},</p>
      <p class="text">We received a request to reset your password. Click the button below to set a new password:</p>
      <div class="button-container">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      <div class="note">
        <p>This link will expire in <strong>15 minutes</strong>.</p>
      </div>
      <p class="text">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your App. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
