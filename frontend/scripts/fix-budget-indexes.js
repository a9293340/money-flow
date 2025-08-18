/**
 * 修復預算索引腳本
 * 移除舊的唯一索引約束，確保新的預算模型能正常工作
 */

import mongoose from 'mongoose';

async function fixBudgetIndexes() {
  try {
    console.log('🔗 連接到 MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    
    const db = mongoose.connection.db;
    const budgetsCollection = db.collection('budgets');
    
    // 檢查現有索引
    console.log('📋 檢查現有索引...');
    const existingIndexes = await budgetsCollection.indexes();
    console.log('現有索引:');
    existingIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      if (index.unique) {
        console.log(`    ⚠️  唯一索引: ${index.unique}`);
      }
    });
    
    // 移除舊的唯一索引
    const problematicIndexes = [
      'userId_1_categoryId_1_startDate_1_endDate_1'
    ];
    
    for (const indexName of problematicIndexes) {
      try {
        console.log(`🗑️  嘗試移除索引: ${indexName}`);
        await budgetsCollection.dropIndex(indexName);
        console.log(`✅ 成功移除索引: ${indexName}`);
      } catch (error) {
        if (error.codeName === 'IndexNotFound') {
          console.log(`ℹ️  索引不存在，跳過: ${indexName}`);
        } else {
          console.error(`❌ 移除索引失敗 ${indexName}:`, error.message);
        }
      }
    }
    
    // 創建新的合適索引（非唯一）
    console.log('🔧 創建新的索引...');
    
    // 用於查詢效能的索引
    await budgetsCollection.createIndex(
      { userId: 1, isDeleted: 1, periodType: 1 },
      { name: 'userId_isDeleted_periodType' }
    );
    
    await budgetsCollection.createIndex(
      { userId: 1, startDate: 1, endDate: 1 },
      { name: 'userId_dateRange' }
    );
    
    await budgetsCollection.createIndex(
      { userId: 1, status: 1 },
      { name: 'userId_status' }
    );
    
    console.log('✅ 新索引創建完成');
    
    // 檢查是否有軟刪除記錄影響
    console.log('🔍 檢查軟刪除記錄...');
    const softDeletedCount = await budgetsCollection.countDocuments({
      userId: '689f36ca5d85b4217fb85d66',
      isDeleted: true
    });
    console.log(`找到 ${softDeletedCount} 個軟刪除的預算記錄`);
    
    if (softDeletedCount > 0) {
      console.log('📝 軟刪除記錄詳情:');
      const softDeleted = await budgetsCollection.find({
        userId: '689f36ca5d85b4217fb85d66',
        isDeleted: true
      }).toArray();
      
      softDeleted.forEach(budget => {
        console.log(`  - ${budget.name}: ${budget.startDate.toISOString().slice(0,10)} 到 ${budget.endDate.toISOString().slice(0,10)}`);
      });
    }
    
    // 最終索引檢查
    console.log('📋 索引修復後的狀態:');
    const finalIndexes = await budgetsCollection.indexes();
    finalIndexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      if (index.unique) {
        console.log(`    🔒 唯一索引: ${index.unique}`);
      }
    });
    
    console.log('🎉 預算索引修復完成！');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ 修復過程發生錯誤:', error);
    process.exit(1);
  }
}

// 確保有 MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('❌ 請設置 MONGODB_URI 環境變數');
  process.exit(1);
}

fixBudgetIndexes();