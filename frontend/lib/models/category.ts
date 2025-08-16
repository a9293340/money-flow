/**
 * Category 資料模型
 * 管理收支分類，包含預設分類和使用者自訂分類
 */

import type { Document } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

// 分類類型
export type CategoryType = 'income' | 'expense'

// 靜態方法介面
export interface ICategoryMethods {
  canDelete(): boolean
}

export interface ICategoryStatics {
  createDefaultCategories(): Promise<void>
  getDefaultCategories(type?: CategoryType): Promise<ICategory[]>
  getUserCategories(userId: string, type?: CategoryType): Promise<ICategory[]>
  getPersonalCategories(userId: string, type?: CategoryType): Promise<ICategory[]>
  findByUserAndScope(userId: string, scope: 'personal' | 'group', type?: CategoryType): Promise<ICategory[]>
}

// 分類文檔介面
export interface ICategory extends Document {
  _id: string
  name: string
  type: CategoryType
  icon: string
  color: string
  description?: string

  // === 使用者關聯 ===
  userId: string

  // 父分類 (支援分類層級)
  parentId?: string | null

  // === 🆕 Context 相關欄位 ===
  scope: 'personal' | 'group' | 'system'
  groupId?: string | null
  editableBy: 'owner' | 'admin' | 'all'

  // === 分類設定 ===
  isSystem: boolean
  isActive: boolean
  sortOrder: number

  // === 使用統計 ===
  usageCount: number
  lastUsedAt?: Date

  // 舊欄位保持相容性
  isDefault: boolean
  metadata?: {
    monthlyBudget?: number
    budgetAlert?: boolean
  }

  // === 軟刪除支援 ===
  isDeleted: boolean
  deletedAt?: Date

  createdAt: Date
  updatedAt: Date
}

// Schema 定義
const categorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: [true, '分類名稱為必填欄位'],
    trim: true,
    maxlength: [30, '分類名稱不能超過 30 個字元'],
    minlength: [1, '分類名稱不能為空'],
  },

  type: {
    type: String,
    required: [true, '分類類型為必填欄位'],
    enum: {
      values: ['income', 'expense'],
      message: '分類類型必須是 income 或 expense',
    },
    index: true,
  },

  icon: {
    type: String,
    required: [true, '分類圖示為必填欄位'],
    trim: true,
    maxlength: [50, '圖示名稱不能超過 50 個字元'],
  },

  color: {
    type: String,
    required: [true, '分類顏色為必填欄位'],
    match: [/^#([A-F0-9]{6}|[A-F0-9]{3})$/i, '顏色必須是有效的十六進制格式 (#RRGGBB 或 #RGB)'],
  },

  description: {
    type: String,
    trim: true,
    maxlength: [200, '描述不能超過 200 個字元'],
  },

  // === 使用者關聯 ===
  userId: {
    type: String,
    required: [true, '使用者為必填欄位'],
  },

  // 父分類 (支援分類層級)
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },

  // === 🆕 Context 相關欄位 ===
  scope: {
    type: String,
    enum: ['personal', 'group', 'system'],
    required: true,
    default: 'personal',
  },

  // 群組 ID (個人分類為 null)
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null,
  },

  // 群組分類的編輯權限 (Phase 2)
  editableBy: {
    type: String,
    enum: ['owner', 'admin', 'all'], // all = 所有群組成員
    default: 'all',
  },

  // === 分類設定 ===
  isSystem: {
    type: Boolean,
    default: false,
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  sortOrder: {
    type: Number,
    default: 0,
  },

  // === 使用統計 ===
  usageCount: {
    type: Number,
    default: 0,
  },

  lastUsedAt: Date,

  // === 舊欄位保持相容性 ===
  isDefault: {
    type: Boolean,
    default: false,
  },

  metadata: {
    monthlyBudget: {
      type: Number,
      min: [0, '預算金額不能為負數'],
    },
    budgetAlert: {
      type: Boolean,
      default: true,
    },
  },

  // === 軟刪除支援 ===
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: Date,

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// 索引設定
// 個人分類查詢 (Phase 1)
categorySchema.index({ userId: 1, scope: 1, isActive: 1, isDeleted: 1 })
categorySchema.index({ userId: 1, type: 1, isActive: 1, isDeleted: 1 })
categorySchema.index({ isDeleted: 1, isActive: 1 })

// 群組分類查詢 (Phase 2)
categorySchema.index({ groupId: 1, scope: 1, isActive: 1, isDeleted: 1 })

// 通用查詢
categorySchema.index({ parentId: 1 })
categorySchema.index({ sortOrder: 1 })
categorySchema.index({ lastUsedAt: -1 })

// 確保同一 scope 內的分類名稱不重複
categorySchema.index({ userId: 1, scope: 1, name: 1, type: 1 }, { unique: true })

// 虛擬欄位：子分類
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
})

// 靜態方法：取得系統分類
categorySchema.statics.getDefaultCategories = function (type?: CategoryType) {
  const query: Record<string, unknown> = { scope: 'system', isActive: true }
  if (type) query.type = type
  return this.find(query).sort({ sortOrder: 1 })
}

// 靜態方法：取得使用者分類 (舊方法，保持相容性)
categorySchema.statics.getUserCategories = function (userId: string, type?: CategoryType) {
  const query: Record<string, unknown> = {
    $or: [
      { scope: 'system' },
      { userId, scope: 'personal' },
    ],
    isActive: true,
  }
  if (type) query.type = type

  return this.find(query)
    .sort({ sortOrder: 1, name: 1 })
    .populate('subcategories')
}

// 靜態方法：取得個人分類 (Phase 1)
categorySchema.statics.getPersonalCategories = function (userId: string, type?: CategoryType) {
  const query: Record<string, unknown> = {
    $or: [
      { scope: 'system' },
      { userId, scope: 'personal' },
    ],
    isActive: true,
  }
  if (type) query.type = type

  return this.find(query)
    .sort({ sortOrder: 1, name: 1 })
    .populate('subcategories')
}

// 靜態方法：根據使用者和 Scope 查找分類
categorySchema.statics.findByUserAndScope = function (userId: string, scope: 'personal' | 'group', type?: CategoryType) {
  const baseQuery = {
    isActive: true,
  }

  if (scope === 'personal') {
    const query: Record<string, unknown> = {
      ...baseQuery,
      $or: [
        { scope: 'system' },
        { userId, scope: 'personal' },
      ],
    }
    if (type) query.type = type
    return this.find(query).sort({ sortOrder: 1, name: 1 })
  }

  // Phase 2: 群組查詢將在此實作
  throw new Error('Group scope not implemented in Phase 1')
}

// 靜態方法：建立預設分類
categorySchema.statics.createDefaultCategories = async function () {
  const defaultCategories = [
    // 支出分類
    { name: '飲食', type: 'expense', icon: 'utensils', color: '#FF6B6B', sortOrder: 1 },
    { name: '交通', type: 'expense', icon: 'car', color: '#4ECDC4', sortOrder: 2 },
    { name: '購物', type: 'expense', icon: 'shopping-bag', color: '#45B7D1', sortOrder: 3 },
    { name: '娛樂', type: 'expense', icon: 'gamepad', color: '#96CEB4', sortOrder: 4 },
    { name: '醫療', type: 'expense', icon: 'heart', color: '#FFEAA7', sortOrder: 5 },
    { name: '教育', type: 'expense', icon: 'book', color: '#DDA0DD', sortOrder: 6 },
    { name: '居家', type: 'expense', icon: 'home', color: '#FFD93D', sortOrder: 7 },
    { name: '其他支出', type: 'expense', icon: 'more-horizontal', color: '#A0A0A0', sortOrder: 99 },

    // 收入分類
    { name: '薪資', type: 'income', icon: 'briefcase', color: '#00B894', sortOrder: 1 },
    { name: '獎金', type: 'income', icon: 'award', color: '#FDCB6E', sortOrder: 2 },
    { name: '投資', type: 'income', icon: 'trending-up', color: '#6C5CE7', sortOrder: 3 },
    { name: '兼職', type: 'income', icon: 'clock', color: '#FD79A8', sortOrder: 4 },
    { name: '禮金', type: 'income', icon: 'gift', color: '#E17055', sortOrder: 5 },
    { name: '其他收入', type: 'income', icon: 'plus-circle', color: '#81ECEC', sortOrder: 99 },
  ]

  for (const categoryData of defaultCategories) {
    await this.findOneAndUpdate(
      { name: categoryData.name, type: categoryData.type, scope: 'system' },
      {
        ...categoryData,
        scope: 'system',
        isSystem: true,
        isActive: true,
        isDefault: true, // 保持舊欄位相容性
        userId: 'system', // 系統分類的特殊 userId
        usageCount: 0,
      },
      { upsert: true, new: true },
    )
  }
}

// 實例方法：檢查是否可以刪除
categorySchema.methods.canDelete = function (): boolean {
  // 預設分類不能刪除
  if (this.isDefault) return false

  // 有子分類的分類不能刪除
  // 這裡會在實際使用時檢查是否有相關的 Record
  return true
}

// 建立並匯出模型
export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema)
