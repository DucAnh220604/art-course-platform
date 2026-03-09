import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Upload,
  X,
  FileImage,
  User,
  Phone,
  Mail,
  Briefcase,
  BookOpen,
  FileText,
  File,
} from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import userApi from "@/api/userApi";

const instructorRequestSchema = z.object({
  fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  phone: z.string().min(10, "Số điện thoại không hợp lệ"),
  email: z.string().email("Email không hợp lệ"),
  experience: z.string().min(1, "Vui lòng chọn kinh nghiệm"),
  specialization: z.string().min(1, "Vui lòng chọn chuyên môn"),
  introduction: z.string().optional(),
});

const experienceOptions = [
  { value: "0-1", label: "Dưới 1 năm" },
  { value: "1-3", label: "1-3 năm" },
  { value: "3-5", label: "3-5 năm" },
  { value: "5+", label: "Trên 5 năm" },
];

const specializationOptions = [
  { value: "drawing", label: "Vẽ tranh" },
  { value: "painting", label: "Hội họa" },
  { value: "digital-art", label: "Nghệ thuật số" },
  { value: "sculpture", label: "Điêu khắc" },
  { value: "craft", label: "Thủ công" },
  { value: "other", label: "Khác" },
];

export function InstructorRequestForm({
  open,
  onOpenChange,
  onSuccess,
  defaultValues = {},
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvImage, setCvImage] = useState(null);
  const [cvPreview, setCvPreview] = useState(null);
  const [cvFileType, setCvFileType] = useState(null); // 'image' or 'pdf'
  const fileInputRef = useRef(null);

  const form = useForm({
    resolver: zodResolver(instructorRequestSchema),
    defaultValues: {
      fullName: defaultValues.fullName || "",
      phone: defaultValues.phone || "",
      email: defaultValues.email || "",
      experience: "",
      specialization: "",
      introduction: "",
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File quá lớn", {
          description: "Vui lòng chọn file dưới 5MB",
        });
        return;
      }

      // Check file type - accept images and PDFs
      const isImage = file.type.startsWith("image/");
      const isPdf = file.type === "application/pdf";
      
      if (!isImage && !isPdf) {
        toast.error("File không hợp lệ", {
          description: "Vui lòng chọn file ảnh (JPG, PNG) hoặc PDF",
        });
        return;
      }

      setCvImage(file);
      setCvFileType(isPdf ? "pdf" : "image");
      
      if (isImage) {
        setCvPreview(URL.createObjectURL(file));
      } else {
        setCvPreview(null); // PDF doesn't have image preview
      }
    }
  };

  const handleRemoveCv = () => {
    setCvImage(null);
    setCvPreview(null);
    setCvFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data) => {
    if (!cvImage) {
      toast.error("Thiếu CV", {
        description: "Vui lòng tải lên CV của bạn (ảnh hoặc PDF)",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await userApi.requestInstructor({
        ...data,
        cvImage,
      });

      toast.success("Gửi yêu cầu thành công!", {
        description:
          "Yêu cầu trở thành giảng viên của bạn đã được gửi. Vui lòng chờ xét duyệt.",
      });

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra!", {
        description: error.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800">
            Đăng ký trở thành Giảng viên
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Vui lòng điền đầy đủ thông tin và tải lên CV của bạn (ảnh hoặc PDF)
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Info */}
            <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-sky-500" />
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600">
                        Họ và tên <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="Nguyễn Văn A"
                            className="pl-10 h-11 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600">
                        Số điện thoại <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            placeholder="0901234567"
                            className="pl-10 h-11 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-slate-600">
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                          <Input
                            type="email"
                            placeholder="email@example.com"
                            className="pl-10 h-11 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Professional Info */}
            <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-purple-500" />
                Thông tin chuyên môn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600">
                        Kinh nghiệm giảng dạy{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Chọn kinh nghiệm" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {experienceOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-600">
                        Chuyên môn <span className="text-red-500">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="Chọn chuyên môn" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {specializationOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="introduction"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-slate-600">
                        Giới thiệu bản thân
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Hãy giới thiệu về bản thân, kinh nghiệm và lý do bạn muốn trở thành giảng viên..."
                          className="min-h-[100px] rounded-xl resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* CV Upload */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-5">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" />
                CV / Hồ sơ <span className="text-red-500">*</span>
              </h3>

              {!cvImage ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-amber-300 rounded-xl p-8 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors"
                >
                  <Upload className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-600 font-medium">
                    Nhấn để tải lên CV
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Hỗ trợ: JPG, PNG, PDF (tối đa 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative">
                  {cvFileType === "image" && cvPreview ? (
                    <img
                      src={cvPreview}
                      alt="CV Preview"
                      className="w-full max-h-[300px] object-contain rounded-xl border border-amber-200"
                    />
                  ) : (
                    <div className="flex items-center justify-center p-8 bg-amber-100/50 rounded-xl border border-amber-200">
                      <div className="text-center">
                        <File className="w-16 h-16 text-red-500 mx-auto mb-3" />
                        <p className="text-slate-700 font-medium">File PDF</p>
                        <p className="text-slate-500 text-sm">{cvImage?.name}</p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRemoveCv}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {cvFileType === "image" && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                      <FileImage className="w-4 h-4" />
                      <span>{cvImage?.name}</span>
                    </div>
                  )}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="rounded-full px-6"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full px-8 bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
