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
}

// 分類文檔介面
export interface ICategory extends Document {
  _id: string
  name: string
  type: CategoryType
  icon: string
  color: string
  description?: string
  isDefault: boolean
  isActive: boolean
  userId?: string // 如果是 null，表示是系統預設分類
  parentId?: string // 支援子分類
  sortOrder: number
  metadata?: {
    monthlyBudget?: number
    budgetAlert?: boolean
  }
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

  isDefault: {
    type: Boolean,
    required: true,
    default: false,
    index: true,
  },

  isActive: {
    type: Boolean,
    required: true,
    default: true,
    index: true,
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    // null 表示系統預設分類
  },

  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },

  sortOrder: {
    type: Number,
    required: true,
    default: 0,
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

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

// 複合索引 - 確保同一使用者的分類名稱不重複
categorySchema.index({ userId: 1, name: 1, type: 1 }, { unique: true })
categorySchema.index({ type: 1, isActive: 1, sortOrder: 1 })
categorySchema.index({ userId: 1, type: 1, isActive: 1 })

// 虛擬欄位：子分類
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
})

// 靜態方法：取得預設分類
categorySchema.statics.getDefaultCategories = function (type?: CategoryType) {
  const query: Record<string, unknown> = { isDefault: true, isActive: true }
  if (type) query.type = type
  return this.find(query).sort({ sortOrder: 1 })
}

// 靜態方法：取得使用者分類
categorySchema.statics.getUserCategories = function (userId: string, type?: CategoryType) {
  const query: Record<string, unknown> = {
    $or: [
      { isDefault: true },
      { userId: userId },
    ],
    isActive: true,
  }
  if (type) query.type = type

  return this.find(query)
    .sort({ sortOrder: 1, name: 1 })
    .populate('subcategories')
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
      { name: categoryData.name, type: categoryData.type, isDefault: true },
      { ...categoryData, isDefault: true, isActive: true },
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
