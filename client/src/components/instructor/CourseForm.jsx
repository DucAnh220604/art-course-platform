import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, ChevronDown, ChevronRight, BookOpen, Video } from "lucide-react";
import courseApi from "@/api/courseApi";

const courseSchema = z.object({
  title: z.string().min(5, "Tiêu đề phải ít nhất 5 ký tự"),
  description: z.string().min(10, "Mô tả phải ít nhất 10 ký tự"),
  price: z.coerce.number().min(0, "Giá không được âm"),
  oldPrice: z.coerce.number().min(0, "Giá cũ không được âm").optional(),
  thumbnail: z.string().url("Vui lòng nhập link ảnh hợp lệ"),
  category: z.string().min(1, "Vui lòng chọn danh mục"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  tags: z.string().optional(),
});

const defaultLesson = () => ({ title: "", videoUrl: "", duration: 0, description: "", type: "video", isTrial: false });
const defaultSection = () => ({ title: "", lessons: [defaultLesson()] });

export function CourseForm({ open, onOpenChange, initialData, onSuccess }) {
  const isEdit = !!initialData;
  const [sections, setSections] = useState([defaultSection()]);
  const [expandedSections, setExpandedSections] = useState(new Set([0]));
  const [submitting, setSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      oldPrice: 0,
      thumbnail: "",
      category: "",
      level: "beginner",
      tags: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        ...initialData,
        tags: initialData.tags?.join(", ") || "",
      });
    } else {
      form.reset({
        title: "",
        description: "",
        price: 0,
        oldPrice: 0,
        thumbnail: "",
        category: "",
        level: "beginner",
        tags: "",
      });
      setSections([defaultSection()]);
      setExpandedSections(new Set([0]));
    }
  }, [initialData, form, open]);

  // --- Section helpers ---
  const addSection = () => {
    const newIndex = sections.length;
    setSections((prev) => [...prev, defaultSection()]);
    setExpandedSections((prev) => new Set([...prev, newIndex]));
  };

  const removeSection = (si) => {
    setSections((prev) => prev.filter((_, i) => i !== si));
    setExpandedSections((prev) => {
      const next = new Set();
      prev.forEach((idx) => { if (idx < si) next.add(idx); else if (idx > si) next.add(idx - 1); });
      return next;
    });
  };

  const toggleSection = (si) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      next.has(si) ? next.delete(si) : next.add(si);
      return next;
    });
  };

  const updateSectionTitle = (si, value) => {
    setSections((prev) => prev.map((s, i) => i === si ? { ...s, title: value } : s));
  };

  // --- Lesson helpers ---
  const addLesson = (si) => {
    setSections((prev) => prev.map((s, i) =>
      i === si ? { ...s, lessons: [...s.lessons, defaultLesson()] } : s
    ));
  };

  const removeLesson = (si, li) => {
    setSections((prev) => prev.map((s, i) =>
      i === si ? { ...s, lessons: s.lessons.filter((_, j) => j !== li) } : s
    ));
  };

  const updateLesson = (si, li, field, value) => {
    setSections((prev) => prev.map((s, i) =>
      i === si
        ? { ...s, lessons: s.lessons.map((l, j) => j === li ? { ...l, [field]: value } : l) }
        : s
    ));
  };

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const finalData = {
        ...values,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()) : [],
      };

      if (isEdit) {
        await courseApi.updateCourse(initialData._id, finalData);
        toast.success("Cập nhật khóa học thành công!");
        onSuccess();
        onOpenChange(false);
        return;
      }

      // Tạo khóa học
      const courseRes = await courseApi.createCourse(finalData);
      const courseId = courseRes.data.course._id;

      // Tạo sections + lessons
      const validSections = sections.filter((s) => s.title.trim());
      for (const sec of validSections) {
        const secRes = await courseApi.createSection({ courseId, title: sec.title });
        const sectionId = secRes.data.data._id;

        const validLessons = sec.lessons.filter(
          (l) => l.title.trim() && l.videoUrl.trim()
        );
        for (const les of validLessons) {
          await courseApi.createLesson({
            sectionId,
            title: les.title,
            videoUrl: les.videoUrl,
            duration: les.duration || 0,
            description: les.description || "",
            type: les.type || "video",
            isTrial: les.isTrial,
          });
        }
      }

      const sectionCount = validSections.length;
      const lessonCount = validSections.reduce(
        (acc, s) => acc + s.lessons.filter((l) => l.title.trim() && l.videoUrl.trim()).length,
        0
      );
      toast.success(
        `Tạo khóa học thành công!${
          sectionCount > 0 ? ` Đã tạo ${sectionCount} chương, ${lessonCount} bài học.` : ""
        }`
      );
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] rounded-3xl hide-scrollbar">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `,
          }}
        />

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
            {/* --- THÔNG TIN CƠ BẢN --- */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tiêu đề khóa học</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Học vẽ màu nước cơ bản" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Mô tả khóa học</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Giới thiệu chi tiết về khóa học..."
                      {...field}
                      className="rounded-xl min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Giá bán hiện tại (đ)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="oldPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-400">Giá gốc (để gạch ngang)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Danh mục</FormLabel>
                    <FormControl>
                      <Input placeholder="Vẽ chì, Màu nước..." {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Cấp độ</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Chọn cấp độ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="beginner">Cơ bản</SelectItem>
                        <SelectItem value="intermediate">Trung cấp</SelectItem>
                        <SelectItem value="advanced">Nâng cao</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tags (Cách nhau bằng dấu phẩy)</FormLabel>
                  <FormControl>
                    <Input placeholder="mầm non, vẽ tay, nghệ thuật" {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="thumbnail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Link ảnh bìa</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} className="rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* --- NỘI DUNG KHÓA HỎc (chỉ khi tạo mới) --- */}
            {!isEdit && (
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-5 h-5 text-sky-500" />
                  <h3 className="font-bold text-slate-800">Nội dung khóa học</h3>
                  <span className="text-xs text-slate-400">(tùy chọn, có thể thêm sau)</span>
                </div>

                <div className="space-y-3">
                  {sections.map((section, si) => (
                    <div
                      key={si}
                      className="border border-slate-200 rounded-2xl overflow-hidden"
                    >
                      {/* Section header */}
                      <div className="flex items-center gap-2 p-3 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => toggleSection(si)}
                          className="shrink-0 text-slate-400 hover:text-sky-500 transition-colors"
                        >
                          {expandedSections.has(si) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <Input
                          placeholder={`Tên chương ${si + 1}... (VD: Giới thiệu cơ bản)`}
                          value={section.title}
                          onChange={(e) => updateSectionTitle(si, e.target.value)}
                          className="rounded-xl h-9 text-sm flex-1"
                        />
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {section.lessons.filter((l) => l.title.trim()).length} bài
                        </Badge>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeSection(si)}
                            className="shrink-0 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Lessons */}
                      {expandedSections.has(si) && (
                        <div className="p-3 space-y-2">
                          {section.lessons.map((lesson, li) => (
                            <div
                              key={li}
                              className="flex items-start gap-2 p-2 bg-white border border-slate-100 rounded-xl"
                            >
                              <Video className="w-4 h-4 text-sky-400 mt-2 shrink-0" />
                              <div className="flex-1 space-y-1.5">
                                <Input
                                  placeholder={`Tên bài học ${li + 1}...`}
                                  value={lesson.title}
                                  onChange={(e) => updateLesson(si, li, "title", e.target.value)}
                                  className="rounded-lg h-8 text-sm"
                                />
                                <div className="grid grid-cols-2 gap-1.5">
                                  <select
                                    value={lesson.type}
                                    onChange={(e) => updateLesson(si, li, "type", e.target.value)}
                                    className="rounded-lg h-8 text-sm border border-input bg-background px-2"
                                  >
                                    <option value="video">Video bài giảng</option>
                                    <option value="quiz">Quiz</option>
                                  </select>
                                  <Input
                                    type="number"
                                    placeholder="Thời lượng (phút)"
                                    value={lesson.duration}
                                    onChange={(e) => updateLesson(si, li, "duration", Number(e.target.value))}
                                    className="rounded-lg h-8 text-sm"
                                    min={0}
                                  />
                                </div>
                                <Input
                                  placeholder="YouTube URL hoặc video ID..."
                                  value={lesson.videoUrl}
                                  onChange={(e) => updateLesson(si, li, "videoUrl", e.target.value)}
                                  className="rounded-lg h-8 text-sm"
                                />
                                <Input
                                  placeholder="Ghi chú bài học (tùy chọn)..."
                                  value={lesson.description}
                                  onChange={(e) => updateLesson(si, li, "description", e.target.value)}
                                  className="rounded-lg h-8 text-sm"
                                />
                                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={lesson.isTrial}
                                    onChange={(e) => updateLesson(si, li, "isTrial", e.target.checked)}
                                    className="rounded"
                                  />
                                  Cho học thử miễn phí
                                </label>
                              </div>
                              {section.lessons.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeLesson(si, li)}
                                  className="text-slate-300 hover:text-rose-500 transition-colors mt-1 shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addLesson(si)}
                            className="flex items-center gap-1.5 text-xs text-sky-500 hover:text-sky-600 font-medium mt-1 px-2 py-1 rounded-lg hover:bg-sky-50 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Thêm bài học
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addSection}
                    className="flex items-center gap-2 w-full justify-center border-2 border-dashed border-sky-200 text-sky-500 hover:border-sky-400 hover:bg-sky-50 rounded-2xl py-3 text-sm font-medium transition-all"
                  >
                    <Plus className="w-4 h-4" /> Thêm chương mới
                  </button>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-sky-500 hover:bg-sky-600 rounded-full px-8 shadow-lg shadow-sky-100"
              >
                {submitting ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Tạo khóa học"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
