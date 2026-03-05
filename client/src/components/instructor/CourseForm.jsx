import React, { useEffect } from "react";
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
import { toast } from "sonner";
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

export function CourseForm({ open, onOpenChange, initialData, onSuccess }) {
  const isEdit = !!initialData;
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
    }
  }, [initialData, form, open]);

  const onSubmit = async (values) => {
    try {
      const finalData = {
        ...values,
        tags: values.tags ? values.tags.split(",").map((t) => t.trim()) : [],
      };

      if (isEdit) {
        await courseApi.updateCourse(initialData._id, finalData);
        toast.success("Cập nhật khóa học thành công!");
      } else {
        await courseApi.createCourse(finalData);
        toast.success("Tạo khóa học thành công!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Thêm class "hide-scrollbar" và thẻ style nội bộ */}
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh] rounded-3xl hide-scrollbar">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `,
          }}
        />

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isEdit ? "Chỉnh sửa khóa học" : "Tạo khóa học mới"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tiêu đề khóa học</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Học vẽ màu nước cơ bản"
                      {...field}
                      className="rounded-xl"
                    />
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
                    <FormLabel className="font-bold">
                      Giá bán hiện tại (đ)
                    </FormLabel>
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
                    <FormLabel className="font-bold text-slate-400">
                      Giá gốc (để gạch ngang)
                    </FormLabel>
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
                      <Input
                        placeholder="Vẽ chì, Màu nước..."
                        {...field}
                        className="rounded-xl"
                      />
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
                  <FormLabel className="font-bold">
                    Tags (Cách nhau bằng dấu phẩy)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="mầm non, vẽ tay, nghệ thuật"
                      {...field}
                      className="rounded-xl"
                    />
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
                    <Input
                      placeholder="https://..."
                      {...field}
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-sky-500 hover:bg-sky-600 rounded-full px-8 shadow-lg shadow-sky-100"
              >
                Lưu khóa học
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
