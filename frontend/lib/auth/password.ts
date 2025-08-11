/**
 * 密碼處理工具模組
 * 處理密碼雜湊、驗證和安全檢查
 */

import bcrypt from 'bcrypt'

// 密碼雜湊配置
const SALT_ROUNDS = 12

/**
 * 密碼強度要求
 */
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

/**
 * 雜湊密碼
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS)
  }
  catch {
    throw new Error('密碼雜湊失敗')
  }
}

/**
 * 驗證密碼
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  }
  catch {
    return false
  }
}

/**
 * 驗證密碼強度
 */
export function validatePasswordStrength(password: string): { isValid: boolean, errors: string[] } {
  const errors: string[] = []

  // 檢查最小長度
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`密碼長度至少需要 ${PASSWORD_REQUIREMENTS.minLength} 個字元`)
  }

  // 檢查大寫字母
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密碼必須包含至少一個大寫字母')
  }

  // 檢查小寫字母
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密碼必須包含至少一個小寫字母')
  }

  // 檢查數字
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('密碼必須包含至少一個數字')
  }

  // 檢查特殊字元
  if (PASSWORD_REQUIREMENTS.requireSpecialChars) {
    const specialCharsRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`)
    if (!specialCharsRegex.test(password)) {
      errors.push('密碼必須包含至少一個特殊字元')
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

/**
 * 產生安全的隨機密碼
 */
export function generateSecurePassword(length = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const specialChars = PASSWORD_REQUIREMENTS.specialChars

  const allChars = uppercase + lowercase + numbers + specialChars
  let password = ''

  // 確保至少包含每種類型的字元
  password += uppercase[Math.floor(Math.random() * uppercase.length)]
  password += lowercase[Math.floor(Math.random() * lowercase.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += specialChars[Math.floor(Math.random() * specialChars.length)]

  // 填充剩餘長度
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // 隨機打亂字元順序
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

/**
 * 密碼工具集合
 */
export const passwordUtils = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateSecurePassword,
  requirements: PASSWORD_REQUIREMENTS,
}

export default passwordUtils
