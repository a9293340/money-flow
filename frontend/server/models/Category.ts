import mongoose, { Schema, Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  type: 'expense' | 'income'
  icon: string
  color: string
  userId: mongoose.Types.ObjectId
  parentId?: mongoose.Types.ObjectId
  isSystem: boolean
  isActive: boolean
  sortOrder: number
  usageCount: number
  lastUsedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const categorySchema = new Schema<ICategory>({
  // 基本資訊
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income']
  },
  
  // 顯示設定
  icon: {
    type: String,
    default: 'other'
  },
  color: {
    type: String,
    default: '#6B7280',
    validate: [/^#[0-9A-Fa-f]{6}$/, 'Invalid color format']
  },
  
  // 分類關聯
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 層級結構 (P1 - 子分類支援)
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  // 系統設定
  isSystem: {
    type: Boolean,
    default: false // true 為系統預設分類
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // 統計快取 (為效能優化預留)
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: Date,
  
  // 時間戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

// 索引
categorySchema.index({ userId: 1, type: 1 })
categorySchema.index({ userId: 1, isActive: 1, sortOrder: 1 })
categorySchema.index({ parentId: 1 })

// 複合唯一索引 (同使用者下分類名稱不重複)
categorySchema.index(
  { userId: 1, name: 1, type: 1 }, 
  { unique: true }
)

// 中介軟體
categorySchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

export default mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema)