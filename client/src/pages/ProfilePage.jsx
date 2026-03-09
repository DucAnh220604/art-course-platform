import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Camera,
  Save,
  X,
  Pencil,
  GraduationCap,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Palette,
  Star,
} from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Header, Footer } from "@/components/landing";
import { InstructorRequestForm } from "@/components/instructor/InstructorRequestForm";

import userApi from "@/api/userApi";

const profileSchema = z.object({
  fullname: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
});

// Floating decoration components for kid-friendly vibe
function FloatingShape({ className, delay = 0 }) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{ y: [0, -12, 0], rotate: [0, 5, -5, 0] }}
      transition={{ duration: 4, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRequestingInstructor, setIsRequestingInstructor] = useState(false);
  const [instructorRequestStatus, setInstructorRequestStatus] = useState(null);
  const [showInstructorForm, setShowInstructorForm] = useState(false);

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split("T")[0];
  };

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullname: user?.fullname || "",
      phone: user?.phone || "",
      birthday: formatDateForInput(user?.birthday),
      address: user?.address || "",
      parentName: user?.parentName || "",
      parentPhone: user?.parentPhone || "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        fullname: user.fullname || "",
        phone: user.phone || "",
        birthday: formatDateForInput(user.birthday),
        address: user.address || "",
        parentName: user.parentName || "",
        parentPhone: user.parentPhone || "",
      });
      setInstructorRequestStatus(user.instructorRequestStatus || "none");
    }
  }, [user, form]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleAvatarClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png, image/jpeg, image/jpg";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleAvatarUpload(file);
      }
    };
    input.click();
  };

  const handleAvatarUpload = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn!", {
        description: "Vui lòng chọn ảnh có kích thước nhỏ hơn 5MB.",
      });
      return;
    }

    setIsUploadingAvatar(true);
    try {
      await userApi.uploadAvatar(file);
      toast.success("Cập nhật ảnh đại diện thành công!", {
        description: "Ảnh đại diện của bạn đã được thay đổi.",
      });
      if (refreshUser) {
        await refreshUser();
      } else {
        window.location.reload();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra!", {
        description:
          error.response?.data?.message ||
          "Không thể upload ảnh. Vui lòng thử lại.",
      });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data) => {
    setIsSaving(true);
    try {
      await userApi.updateProfile(data);
      toast.success("Cập nhật thành công!", {
        description: "Thông tin của bé đã được lưu.",
      });
      setIsEditing(false);
      if (refreshUser) {
        await refreshUser();
      } else {
        window.location.reload();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra!", {
        description: error.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    form.reset({
      fullname: user?.fullname || "",
      phone: user?.phone || "",
      birthday: formatDateForInput(user?.birthday),
      address: user?.address || "",
      parentName: user?.parentName || "",
      parentPhone: user?.parentPhone || "",
    });
    setIsEditing(false);
  };

  const handleRequestInstructor = () => {
    setShowInstructorForm(true);
  };

  const handleInstructorRequestSuccess = async () => {
    setInstructorRequestStatus("pending");
    if (refreshUser) {
      await refreshUser();
    }
  };

  const getInstructorRequestUI = () => {
    if (user?.role !== "customer") return null;

    switch (instructorRequestStatus) {
      case "pending":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 border-dashed rounded-3xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-400/30">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-800 mb-1">
                  ⏳ Đang chờ xét duyệt
                </h3>
                <p className="text-amber-700 text-sm leading-relaxed">
                  Yêu cầu trở thành giảng viên của bạn đang được xem xét. Chúng
                  tôi sẽ thông báo kết quả trong thời gian sớm nhất.
                </p>
              </div>
            </div>
          </motion.div>
        );
      case "approved":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 border-dashed rounded-3xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-400/30">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-emerald-800 mb-1">
                  🎉 Yêu cầu đã được duyệt!
                </h3>
                <p className="text-emerald-700 text-sm leading-relaxed">
                  Chúc mừng! Bạn đã trở thành giảng viên. Vui lòng đăng nhập lại
                  để sử dụng các tính năng mới.
                </p>
              </div>
            </div>
          </motion.div>
        );
      case "rejected":
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 border-dashed rounded-3xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-400/30">
                <XCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-800 mb-1">
                  Yêu cầu bị từ chối
                </h3>
                <p className="text-red-700 text-sm mb-2">
                  Rất tiếc, yêu cầu trở thành giảng viên của bạn đã bị từ chối.
                </p>
                {user?.instructorRequestData?.rejectionReason && (
                  <div className="bg-red-100/50 border border-red-200 rounded-xl p-3 mb-3">
                    <p className="text-red-800 text-sm font-medium mb-1">
                      Lý do từ chối:
                    </p>
                    <p className="text-red-700 text-sm">
                      {user.instructorRequestData.rejectionReason}
                    </p>
                  </div>
                )}
                <Button
                  onClick={handleRequestInstructor}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full px-6"
                >
                  Gửi lại yêu cầu
                </Button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 border-2 border-purple-200 border-dashed rounded-3xl p-6"
          >
            <div className="absolute top-2 right-4 text-4xl opacity-20">🎨</div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-purple-800 mb-1">
                  ✨ Trở thành Giảng viên
                </h3>
                <p className="text-purple-700 text-sm leading-relaxed">
                  Bạn muốn chia sẻ kiến thức? Hãy đăng ký trở thành giảng viên
                  và tạo các khóa học của riêng bạn.
                </p>
              </div>
              <Button
                onClick={handleRequestInstructor}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6 shadow-lg shadow-purple-500/25 w-full sm:w-auto"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                Đăng ký ngay
              </Button>
            </div>
          </motion.div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-sky-50 to-white">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Palette className="w-16 h-16 text-sky-400" />
          </motion.div>
          <p className="text-slate-500 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-50/80 via-slate-50 to-white">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <Header onNavigate={navigate} />
      </div>

      <main className="flex-1 py-8 lg:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="overflow-hidden border-none shadow-xl bg-white rounded-3xl">
              <div className="px-6 sm:px-8 pt-8 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <div className="relative">
                    <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-sky-100 shadow-lg">
                      <AvatarImage src={user?.avatar} alt={user?.fullname} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-400 text-white text-3xl sm:text-4xl font-bold">
                        {getInitials(user?.fullname || user?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-1 right-1 p-2 rounded-full bg-white shadow-md border border-slate-200 text-sky-600 hover:bg-sky-50 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingAvatar ? (
                        <div className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex-1">
                    <h2
                      className="text-2xl sm:text-3xl font-bold text-slate-800"
                      style={{ fontFamily: "'Quicksand', sans-serif" }}
                    >
                      {user?.fullname || user?.username}
                    </h2>
                    <p className="text-slate-500">{user?.email}</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Tham gia từ {formatDate(user?.createdAt)}
                    </p>
                  </div>

                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium px-6 h-11 shadow-lg shadow-sky-500/25 sm:ml-auto"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </div>

              <div className="px-6 sm:px-8 pb-8">
                {isEditing ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      <div className="bg-sky-50/50 border border-sky-100 rounded-3xl p-5 sm:p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-sm">
                            👤
                          </span>
                          Thông tin cá nhân
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="fullname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-600 font-medium">
                                  Họ và tên
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nhập họ và tên"
                                    className="h-12 rounded-xl border-sky-200 focus:border-sky-400 bg-white"
                                    {...field}
                                  />
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
                                <FormLabel className="text-slate-600 font-medium">
                                  Số điện thoại
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="0123 456 789"
                                    className="h-12 rounded-xl border-sky-200 focus:border-sky-400 bg-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="birthday"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-600 font-medium">
                                  Ngày sinh
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    className="h-12 rounded-xl border-sky-200 focus:border-sky-400 bg-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem className="sm:col-span-2">
                                <FormLabel className="text-slate-600 font-medium">
                                  Địa chỉ
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nhập địa chỉ"
                                    className="h-12 rounded-xl border-sky-200 focus:border-sky-400 bg-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 sm:p-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                          <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm">
                            👨‍👩‍👧
                          </span>
                          Thông tin phụ huynh
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="parentName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-600 font-medium">
                                  Tên phụ huynh
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nhập tên phụ huynh"
                                    className="h-12 rounded-xl border-amber-200 focus:border-amber-400 bg-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="parentPhone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-slate-600 font-medium">
                                  SĐT phụ huynh
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="0123 456 789"
                                    className="h-12 rounded-xl border-amber-200 focus:border-amber-400 bg-white"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancel}
                          className="flex-1 h-12 rounded-full font-medium border-slate-200 hover:bg-slate-50"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Hủy bỏ
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 h-12 rounded-full bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-lg shadow-sky-500/25"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-sky-50/50 border border-sky-100 rounded-3xl p-5 sm:p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        Thông tin cá nhân
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem label="Họ và tên" value={user?.fullname} />
                        <InfoItem label="Email" value={user?.email} />
                        <InfoItem label="Số điện thoại" value={user?.phone} />
                        <InfoItem
                          label="Ngày sinh"
                          value={formatDate(user?.birthday)}
                        />
                        <InfoItem
                          label="Địa chỉ"
                          value={user?.address}
                          className="sm:col-span-2"
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 rounded-3xl p-5 sm:p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        Thông tin phụ huynh
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoItem
                          label="Tên phụ huynh"
                          value={user?.parentName}
                        />
                        <InfoItem
                          label="SĐT phụ huynh"
                          value={user?.parentPhone}
                        />
                      </div>
                    </div>

                    {getInstructorRequestUI()}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Instructor Request Form Dialog */}
      <InstructorRequestForm
        open={showInstructorForm}
        onOpenChange={setShowInstructorForm}
        onSuccess={handleInstructorRequestSuccess}
        defaultValues={{
          fullName: user?.fullname || "",
          phone: user?.phone || "",
          email: user?.email || "",
        }}
      />
    </div>
  );
}

const colorMap = {
  sky: {
    bg: "bg-sky-50",
    icon: "text-sky-500",
    border: "border-sky-100",
  },
  amber: {
    bg: "bg-amber-50",
    icon: "text-amber-500",
    border: "border-amber-100",
  },
};

function InfoCard({ icon, label, value, color = "sky" }) {
  const colors = colorMap[color] || colorMap.sky;
  return (
    <div
      className={`flex items-start gap-3.5 ${colors.bg} rounded-2xl p-4 border ${colors.border} hover:shadow-md transition-shadow`}
    >
      <div
        className={`w-9 h-9 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0 ${colors.icon}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="font-semibold text-slate-700 truncate">
          {value || (
            <span className="text-slate-300 italic font-normal">
              Chưa cập nhật
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
