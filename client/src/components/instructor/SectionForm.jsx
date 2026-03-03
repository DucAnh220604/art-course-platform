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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import courseApi from "@/api/courseApi";
import { toast } from "sonner";

const sectionSchema = z.object({
  title: z.string().min(2, "Tên chương quá ngắn"),
});

export function SectionForm({
  open,
  onOpenChange,
  courseId,
  initialData,
  onSuccess,
}) {
  const isEdit = !!initialData;
  const form = useForm({
    resolver: zodResolver(sectionSchema),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    if (initialData) form.reset(initialData);
    else form.reset({ title: "" });
  }, [initialData, form, open]);

  const onSubmit = async (values) => {
    try {
      if (isEdit) {
        await courseApi.updateSection(initialData._id, values);
        toast.success("Đã cập nhật chương!");
      } else {
        await courseApi.createSection({ ...values, courseId });
        toast.success("Đã thêm chương mới!");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast.error("Lỗi xử lý chương");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa tên chương" : "Thêm chương mới"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chương</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Chương 1: Giới thiệu"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" className="w-full bg-sky-500">
                Xác nhận
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
