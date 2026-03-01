const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema con: Bài học
const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true }, // Tự động sinh từ title
  videoUrl: { type: String, required: true }, // YouTube video ID
  thumbnail: { type: String }, // Tự động lấy từ YouTube
  duration: { type: Number, default: 0 }, // Giây
  description: { type: String }, // Mô tả bài học
  isTrial: { type: Boolean, default: false }, // TRUE = Cho khách học thử
  type: { type: String, enum: ['video', 'quiz'], default: 'video' },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true }
}, {
  timestamps: true
});

// Pre-save hook để tự động tạo slug
lessonSchema.pre('save', async function() {
  if (this.isModified('title')) {
    let baseSlug = slugify(this.title, { lower: true, strict: true });
    let uniqueSlug = baseSlug;
    let counter = 1;
    
    // Kiểm tra nếu slug đã tồn tại
    while (await mongoose.model('Lesson').findOne({ slug: uniqueSlug, _id: { $ne: this._id } })) {
      uniqueSlug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    this.slug = uniqueSlug;
  }
});

module.exports = mongoose.model('Lesson', lessonSchema);