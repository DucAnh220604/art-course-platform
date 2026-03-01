const mongoose = require('mongoose');
const slugify = require('slugify');

const courseSchema = new mongoose.Schema({
  // --- THÔNG TIN HIỂN THỊ ---
  title: { type: String, required: true, index: true },
  slug: { type: String, unique: true },
  description: { type: String },
  thumbnail: { type: String, required: true },
  
  // --- GIÁ ---
  price: { type: Number, required: true, min: 0 },
  oldPrice: { type: Number }, // Giá gốc (để gạch ngang)
  
  // --- QUAN HỆ ---
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // --- NỘI DUNG ---
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],

  // --- PHÂN LOẠI (FILTER) ---
  category: { type: String, required: true, index: true }, // Vẽ chì, Màu nước...
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    tags: [String],

  // --- THỐNG KÊ ---
    totalStudents: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },
    
  // --- DUYỆT BÀI (STAFF) ---
  status: { 
    type: String, 
    enum: ['draft', 'pending', 'published', 'rejected'], 
    default: 'draft' 
    }
}, { timestamps: true });

// Pre-save hook để tự động tạo slug
courseSchema.pre('save', async function() {
  if (this.isModified('title')) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    // Kiểm tra nếu slug đã tồn tại
    while (await mongoose.model('Course').findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = uniqueSlug;
  }
});

// Index Text Search
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
