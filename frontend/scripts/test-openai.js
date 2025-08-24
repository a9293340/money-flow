#!/usr/bin/env node

/**
 * OpenAI API 連接測試腳本
 * 用途：驗證 OpenAI API Token 是否正確配置
 */

import 'dotenv/config'

const OPENAI_API_KEY = process.env.OPEN_AI_KEY

if (!OPENAI_API_KEY) {
  console.error('❌ 錯誤: OPEN_AI_KEY 環境變數未設定')
  console.log('請在 .env 文件中設定: OPEN_AI_KEY=sk-proj-your-key-here')
  process.exit(1)
}

console.log('🔄 正在測試 OpenAI API 連接...')
console.log(`🔑 API Key: ${OPENAI_API_KEY.slice(0, 20)}...${OPENAI_API_KEY.slice(-8)}`)

async function testOpenAI() {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一位專業的財務顧問助手。',
          },
          {
            role: 'user',
            content: '請用一句話介紹財務健康的重要性。',
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`API 調用失敗 (${response.status}): ${errorData.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()

    console.log('✅ OpenAI API 連接成功!')
    console.log('📊 使用統計:')
    console.log(`   - 輸入 tokens: ${data.usage.prompt_tokens}`)
    console.log(`   - 輸出 tokens: ${data.usage.completion_tokens}`)
    console.log(`   - 總計 tokens: ${data.usage.total_tokens}`)
    console.log(`   - 預估成本: ~$${(data.usage.total_tokens * 0.002 / 1000).toFixed(6)} USD`)
    console.log()
    console.log('🤖 AI 回應範例:')
    console.log(`"${data.choices[0].message.content}"`)
    console.log()
    console.log('🎉 OpenAI 整合準備就緒!')

    return true
  }
  catch (error) {
    console.error('❌ OpenAI API 測試失敗:')
    console.error('   錯誤詳情:', error.message)

    if (error.message.includes('401')) {
      console.log('💡 可能的解決方案:')
      console.log('   1. 檢查 API Key 是否正確')
      console.log('   2. 確認 API Key 有足夠的額度')
      console.log('   3. 檢查 OpenAI 帳戶狀態')
    }

    return false
  }
}

// 執行測試
testOpenAI().then((success) => {
  process.exit(success ? 0 : 1)
})
