import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải ít nhất 5 ký tự"),
  description: z.string().min(20, "Mô tả phải ít nhất 20 ký tự"),
  thumbnail: z.string().url("Vui lòng nhập URL ảnh hợp lệ"),
  price: z.coerce.number().min(0, "Giá không được âm"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
});

export const sectionSchema = z.object({
  title: z.string().min(2, "Tiêu đề chương ít nhất 2 ký tự"),
});

export const lessonSchema = z.object({
  title: z.string().min(2, "Tiêu đề bài học ít nhất 2 ký tự"),
  videoUrl: z.string().url("Vui lòng nhập link YouTube hợp lệ"),
  description: z.string().optional(),
  isTrial: z.boolean().default(false),
});
