/**
 * 郵件發送服務
 * 處理各種類型的郵件發送，包括密碼重置、電子郵件驗證等
 */

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

// 郵件配置介面
interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

// 郵件內容介面
interface EmailContent {
  to: string
  subject: string
  html: string
  text?: string
}

// 密碼重置郵件參數
interface PasswordResetEmailParams {
  to: string
  name: string
  resetToken: string
  resetUrl: string
}

// 電子郵件驗證參數
interface EmailVerificationParams {
  to: string
  name: string
  verificationToken: string
  verificationUrl: string
}

// 建立郵件傳輸器
function createTransporter(): Transporter | null {
  try {
    // 直接從 process.env 取得配置（適用於 server-side）
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number.parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    }

    // 檢查必要的環境變數
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.warn('❌ 郵件服務未配置：缺少 SMTP_USER 或 SMTP_PASS')
      return null
    }

    return nodemailer.createTransport(emailConfig)
  }
  catch (error) {
    console.error('❌ 郵件傳輸器建立失敗:', error)
    return null
  }
}

// 發送郵件的通用函數
async function sendEmail(emailContent: EmailContent): Promise<boolean> {
  const transporter = createTransporter()
  if (!transporter) {
    console.error('❌ 郵件服務不可用')
    return false
  }

  try {
    const info = await transporter.sendMail({
      from: `"${process.env.APP_NAME || 'Money Flow'}" <${process.env.SMTP_USER}>`,
      ...emailContent,
    })

    console.log(`✅ 郵件發送成功: ${info.messageId}`)
    return true
  }
  catch (error) {
    console.error('❌ 郵件發送失敗:', error)
    return false
  }
}

// 生成密碼重置郵件 HTML 內容
function generatePasswordResetEmailHTML(params: PasswordResetEmailParams): string {
  const { name, resetUrl } = params
  const appName = process.env.APP_NAME || 'Money Flow'

  return `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>密碼重置 - ${appName}</title>
        <style>
            body {
                font-family: 'Arial', 'Microsoft JhengHei', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .email-container {
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                width: 60px;
                height: 60px;
                border-radius: 12px;
                line-height: 60px;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                margin: 0 0 10px 0;
            }
            .content {
                margin-bottom: 30px;
                color: #4b5563;
                font-size: 16px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
            }
            .warning {
                background-color: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
                color: #92400e;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">💰</div>
                <h1 class="title">密碼重置請求</h1>
            </div>
            
            <div class="content">
                <p>親愛的 <strong>${name}</strong>，您好！</p>
                
                <p>我們收到了您的密碼重置請求。請點擊下方按鈕來重置您的密碼：</p>
                
                <div style="text-align: center;">
                    <a href="${resetUrl}" class="button">重置密碼</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ 重要提醒：</strong>
                    <ul>
                        <li>此重置連結將在 <strong>10 分鐘後</strong> 過期</li>
                        <li>如果您沒有請求重置密碼，請忽略此郵件</li>
                        <li>請勿將此連結分享給他人</li>
                    </ul>
                </div>
                
                <p>如果按鈕無法正常使用，請複製以下連結並在瀏覽器中開啟：</p>
                <p style="word-break: break-all; color: #3b82f6;">${resetUrl}</p>
            </div>
            
            <div class="footer">
                <p>此郵件由 ${appName} 系統自動發送，請勿直接回覆。</p>
                <p>如有疑問，請聯繫我們的客服團隊。</p>
            </div>
        </div>
    </body>
    </html>
  `
}

// 生成密碼重置郵件純文字內容
function generatePasswordResetEmailText(params: PasswordResetEmailParams): string {
  const { name, resetUrl } = params
  const appName = process.env.APP_NAME || 'Money Flow'

  return `
親愛的 ${name}，您好！

我們收到了您的密碼重置請求。請點擊以下連結來重置您的密碼：

${resetUrl}

重要提醒：
- 此重置連結將在 10 分鐘後過期
- 如果您沒有請求重置密碼，請忽略此郵件
- 請勿將此連結分享給他人

此郵件由 ${appName} 系統自動發送，請勿直接回覆。
如有疑問，請聯繫我們的客服團隊。
  `
}

// 發送密碼重置郵件
export async function sendPasswordResetEmail(params: PasswordResetEmailParams): Promise<boolean> {
  const emailContent: EmailContent = {
    to: params.to,
    subject: `${process.env.APP_NAME || 'Money Flow'} - 密碼重置請求`,
    html: generatePasswordResetEmailHTML(params),
    text: generatePasswordResetEmailText(params),
  }

  console.log(`📧 正在發送密碼重置郵件至: ${params.to}`)
  return await sendEmail(emailContent)
}

// 生成電子郵件驗證郵件 HTML 內容
function generateEmailVerificationHTML(params: EmailVerificationParams): string {
  const { name, verificationUrl } = params
  const appName = process.env.APP_NAME || 'Money Flow'

  return `
    <!DOCTYPE html>
    <html lang="zh-TW">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>電子郵件驗證 - ${appName}</title>
        <style>
            body {
                font-family: 'Arial', 'Microsoft JhengHei', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .email-container {
                background-color: white;
                border-radius: 8px;
                padding: 40px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                width: 60px;
                height: 60px;
                border-radius: 12px;
                line-height: 60px;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 20px;
            }
            .title {
                color: #1f2937;
                font-size: 24px;
                margin: 0 0 10px 0;
            }
            .content {
                margin-bottom: 30px;
                color: #4b5563;
                font-size: 16px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                color: white;
                padding: 14px 28px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
            }
            .info {
                background-color: #dbeafe;
                border: 1px solid #3b82f6;
                border-radius: 6px;
                padding: 16px;
                margin: 20px 0;
                color: #1e40af;
            }
            .footer {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo">✉️</div>
                <h1 class="title">電子郵件驗證</h1>
            </div>
            
            <div class="content">
                <p>親愛的 <strong>${name}</strong>，歡迎加入 ${appName}！</p>
                
                <p>請點擊下方按鈕來驗證您的電子郵件地址：</p>
                
                <div style="text-align: center;">
                    <a href="${verificationUrl}" class="button">驗證電子郵件</a>
                </div>
                
                <div class="info">
                    <strong>ℹ️ 提醒：</strong>
                    <p>完成電子郵件驗證後，您就可以享受 ${appName} 的完整功能，包括：</p>
                    <ul>
                        <li>安全的帳戶保護</li>
                        <li>重要通知和提醒</li>
                        <li>密碼重置功能</li>
                    </ul>
                </div>
                
                <p>如果按鈕無法正常使用，請複製以下連結並在瀏覽器中開啟：</p>
                <p style="word-break: break-all; color: #10b981;">${verificationUrl}</p>
            </div>
            
            <div class="footer">
                <p>此郵件由 ${appName} 系統自動發送，請勿直接回覆。</p>
                <p>如有疑問，請聯繫我們的客服團隊。</p>
            </div>
        </div>
    </body>
    </html>
  `
}

// 發送電子郵件驗證郵件
export async function sendEmailVerification(params: EmailVerificationParams): Promise<boolean> {
  const emailContent: EmailContent = {
    to: params.to,
    subject: `${process.env.APP_NAME || 'Money Flow'} - 電子郵件驗證`,
    html: generateEmailVerificationHTML(params),
    text: `歡迎加入 ${process.env.APP_NAME || 'Money Flow'}！\n\n請點擊以下連結驗證您的電子郵件地址：\n${params.verificationUrl}`,
  }

  console.log(`📧 正在發送電子郵件驗證郵件至: ${params.to}`)
  return await sendEmail(emailContent)
}

// 測試郵件服務連接
export async function testEmailService(): Promise<boolean> {
  const transporter = createTransporter()
  if (!transporter) {
    return false
  }

  try {
    await transporter.verify()
    console.log('✅ 郵件服務連接測試成功')
    return true
  }
  catch (error) {
    console.error('❌ 郵件服務連接測試失敗:', error)
    return false
  }
}
