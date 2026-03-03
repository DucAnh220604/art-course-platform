import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import courseApi from "@/api/courseApi";
import { toast } from "sonner";

const lessonSchema = z.object({
  title: z.string().min(3, "Tiêu đề bài học quá ngắn"),
  videoUrl: z.string().min(1, "Vui lòng nhập link YouTube"),
  duration: z.coerce.number().min(0, "Thời lượng không được âm"),
  description: z.string().optional(),
  type: z.enum(["video", "quiz"]),
  isTrial: z.boolean().default(false),
});

export function LessonForm({
  open,
  onOpenChange,
  sectionId,
  initialData,
  onSuccess,
}) {
  const isEdit = !!initialData;
  const form = useForm({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      title: "",
      videoUrl: "",
      duration: 0,
      description: "",
      type: "video",
      isTrial: false,
    },
  });

  useEffect(() => {
    if (initialData) form.reset(initialData);
    else
      form.reset({
        title: "",
        videoUrl: "",
        duration: 0,
        description: "",
        type: "video",
        isTrial: false,
      });
  }, [initialData, form, open]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await courseApi.updateLesson(initialData._id, values);
        toast.success("Cập nhật bài học thành công!");
      } else {
        await courseApi.createLesson({ ...values, sectionId });
        toast.success("Đã thêm bài học!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi lưu bài học");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEdit ? "Sửa bài giảng" : "Thêm bài giảng mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Tiêu đề bài học</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bài 1: Làm quen với cọ vẽ"
                      {...field}
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Loại nội dung</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="video">Video bài giảng</SelectItem>
                        <SelectItem value="quiz">Trắc nghiệm (Quiz)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">
                      Thời lượng (phút)
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="rounded-xl" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">
                    Link Video YouTube
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.youtube.com/watch?v=..."
                      {...field}
                      className="rounded-xl"
                    />
                  </FormControl>
                  <FormDescription className="text-[11px]">
                    Dán link hoặc ID video YouTube để hệ thống xử lý.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Ghi chú bài học</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tóm tắt kiến thức của bài..."
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
              name="isTrial"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-2xl border-2 border-dashed p-3 bg-sky-50/30">
                  <div className="space-y-0.5">
                    <FormLabel className="font-bold text-sky-700">
                      Cho phép học thử?
                    </FormLabel>
                    <div className="text-[11px] text-muted-foreground italic">
                      Mở khóa bài này cho mọi đối tượng.
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter className="pt-2">
              <Button
                type="submit"
                className="w-full bg-sky-500 rounded-full h-11"
              >
                Lưu bài học
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
