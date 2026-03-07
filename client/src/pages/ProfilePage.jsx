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

  const handleRequestInstructor = async () => {
    setIsRequestingInstructor(true);
    try {
      await userApi.requestInstructor();
      toast.success("Gửi yêu cầu thành công!", {
        description:
          "Yêu cầu trở thành giảng viên của bạn đã được gửi. Vui lòng chờ xét duyệt.",
      });
      setInstructorRequestStatus("pending");
      if (refreshUser) {
        await refreshUser();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra!", {
        description: error.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setIsRequestingInstructor(false);
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
                <p className="text-red-700 text-sm mb-3 leading-relaxed">
                  Rất tiếc, yêu cầu trở thành giảng viên của bạn đã bị từ chối.
                  Bạn có thể gửi lại yêu cầu sau.
                </p>
                <Button
                  onClick={handleRequestInstructor}
                  disabled={isRequestingInstructor}
                  className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6 shadow-lg shadow-red-500/25"
                >
                  {isRequestingInstructor ? "Đang gửi..." : "Gửi lại yêu cầu"}
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
                disabled={isRequestingInstructor}
                className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-full px-6 shadow-lg shadow-purple-500/25 w-full sm:w-auto"
              >
                <GraduationCap className="w-4 h-4 mr-2" />
                {isRequestingInstructor ? "Đang gửi..." : "Đăng ký ngay"}
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-orange-50/30 to-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingShape
          className="top-32 left-[5%] w-20 h-20 rounded-full bg-yellow-200/40"
          delay={0}
        />
        <FloatingShape
          className="top-48 right-[8%] w-16 h-16 rounded-full bg-pink-200/40"
          delay={1}
        />
        <FloatingShape
          className="top-[60%] left-[3%] w-12 h-12 rounded-full bg-sky-200/40"
          delay={2}
        />
        <FloatingShape
          className="top-[70%] right-[5%] w-14 h-14 rounded-full bg-green-200/40"
          delay={1.5}
        />
        <div className="absolute top-20 left-[15%] text-5xl opacity-[0.06] rotate-12">
          🎨
        </div>
        <div className="absolute top-40 right-[12%] text-5xl opacity-[0.06] -rotate-12">
          🖌️
        </div>
        <div className="absolute bottom-40 left-[10%] text-5xl opacity-[0.06] rotate-6">
          ⭐
        </div>
        <div className="absolute bottom-20 right-[15%] text-5xl opacity-[0.06] -rotate-6">
          🌈
        </div>
      </div>

      <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <Header onNavigate={navigate} />

        <main className="py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Hero Profile Banner */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              {/* Colorful banner */}
              <div className="relative h-44 sm:h-52 rounded-t-[2rem] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400" />
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-4 left-8 text-white/40 text-5xl">
                    ✨
                  </div>
                  <div className="absolute top-8 right-12 text-white/40 text-4xl">
                    🎨
                  </div>
                  <div className="absolute bottom-6 left-[30%] text-white/40 text-3xl">
                    ⭐
                  </div>
                  <div className="absolute top-6 left-[50%] text-white/40 text-3xl">
                    🖌️
                  </div>
                  <div className="absolute bottom-4 right-[25%] text-white/40 text-4xl">
                    🌟
                  </div>
                </div>
                <svg
                  className="absolute bottom-0 w-full"
                  viewBox="0 0 1440 60"
                  fill="none"
                >
                  <path
                    d="M0,60 L0,30 Q360,0 720,30 Q1080,60 1440,30 L1440,60 Z"
                    fill="white"
                  />
                </svg>
              </div>

              {/* Profile info card overlapping the banner */}
              <div className="relative bg-white rounded-b-[2rem] shadow-xl shadow-sky-100/50 px-6 sm:px-10 pb-8 pt-0">
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-20">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="absolute -inset-1.5 bg-gradient-to-br from-yellow-300 via-pink-300 to-sky-300 rounded-full opacity-75 group-hover:opacity-100 transition-opacity blur-sm" />
                    <Avatar className="relative w-32 h-32 sm:w-36 sm:h-36 border-4 border-white shadow-xl ring-4 ring-sky-100">
                      <AvatarImage src={user?.avatar} alt={user?.fullname} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 text-white text-3xl sm:text-4xl font-bold">
                        {getInitials(user?.fullname || user?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploadingAvatar}
                      className="absolute bottom-1 right-1 p-2.5 rounded-full bg-white shadow-lg border-2 border-sky-100 text-sky-500 hover:bg-sky-50 hover:scale-110 hover:border-sky-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUploadingAvatar ? (
                        <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* User info */}
                  <div className="flex-1 text-center sm:text-left pb-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                        {user?.fullname || user?.username}
                      </h1>
                      <span className="inline-flex items-center gap-1 self-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-sky-100 to-cyan-100 text-sky-700 border border-sky-200">
                        <Star className="w-3 h-3 fill-sky-400 text-sky-400" />
                        {user?.role === "customer"
                          ? "Học viên"
                          : user?.role === "instructor"
                            ? "Giảng viên"
                            : user?.role === "admin"
                              ? "Quản trị viên"
                              : user?.role === "staff"
                                ? "Nhân viên"
                                : "Thành viên"}
                      </span>
                    </div>
                    <p className="text-slate-500 mt-1 flex items-center justify-center sm:justify-start gap-1.5">
                      <Mail className="w-4 h-4" />
                      {user?.email}
                    </p>
                    <p className="text-sm text-slate-400 mt-0.5 flex items-center justify-center sm:justify-start gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      Tham gia từ {formatDate(user?.createdAt)}
                    </p>
                  </div>

                  {/* Edit button */}
                  {!isEditing && (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold px-7 h-12 shadow-lg shadow-sky-500/25 transition-all hover:shadow-xl hover:shadow-sky-500/30 hover:-translate-y-0.5"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Content */}
            {isEditing ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Personal Info - Edit Mode */}
                    <div className="bg-white rounded-3xl shadow-lg shadow-sky-100/30 border border-sky-100/50 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-400/20">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">
                          Thông tin cá nhân
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="fullname"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-600 font-semibold text-sm">
                                Họ và tên
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập họ và tên"
                                  className="h-12 rounded-2xl border-sky-200 focus:border-sky-400 focus:ring-sky-400/20 bg-sky-50/30"
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
                              <FormLabel className="text-slate-600 font-semibold text-sm">
                                Số điện thoại
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0123 456 789"
                                  className="h-12 rounded-2xl border-sky-200 focus:border-sky-400 focus:ring-sky-400/20 bg-sky-50/30"
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
                              <FormLabel className="text-slate-600 font-semibold text-sm">
                                Ngày sinh
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="date"
                                  className="h-12 rounded-2xl border-sky-200 focus:border-sky-400 focus:ring-sky-400/20 bg-sky-50/30"
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
                            <FormItem>
                              <FormLabel className="text-slate-600 font-semibold text-sm">
                                Địa chỉ
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập địa chỉ"
                                  className="h-12 rounded-2xl border-sky-200 focus:border-sky-400 focus:ring-sky-400/20 bg-sky-50/30"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Parent Info - Edit Mode */}
                    <div className="bg-white rounded-3xl shadow-lg shadow-amber-100/30 border border-amber-100/50 p-6 sm:p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md shadow-amber-400/20">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">
                          Thông tin phụ huynh
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField
                          control={form.control}
                          name="parentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-slate-600 font-semibold text-sm">
                                Tên phụ huynh
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Nhập tên phụ huynh"
                                  className="h-12 rounded-2xl border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-amber-50/30"
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
                              <FormLabel className="text-slate-600 font-semibold text-sm">
                                SĐT phụ huynh
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="0123 456 789"
                                  className="h-12 rounded-2xl border-amber-200 focus:border-amber-400 focus:ring-amber-400/20 bg-amber-50/30"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Save/Cancel buttons */}
                    <div className="flex gap-4 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1 h-13 rounded-full font-semibold border-2 border-slate-200 hover:bg-slate-50 text-slate-600 text-base"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Hủy bỏ
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 h-13 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold shadow-lg shadow-sky-500/25 text-base"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {/* Personal Info - View Mode */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="bg-white rounded-3xl shadow-lg shadow-sky-100/30 border border-sky-100/50 p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center shadow-md shadow-sky-400/20">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Thông tin cá nhân
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<User className="w-4.5 h-4.5" />}
                      label="Họ và tên"
                      value={user?.fullname}
                      color="sky"
                    />
                    <InfoCard
                      icon={<Mail className="w-4.5 h-4.5" />}
                      label="Email"
                      value={user?.email}
                      color="sky"
                    />
                    <InfoCard
                      icon={<Phone className="w-4.5 h-4.5" />}
                      label="Số điện thoại"
                      value={user?.phone}
                      color="sky"
                    />
                    <InfoCard
                      icon={<Calendar className="w-4.5 h-4.5" />}
                      label="Ngày sinh"
                      value={formatDate(user?.birthday)}
                      color="sky"
                    />
                    <div className="sm:col-span-2">
                      <InfoCard
                        icon={<MapPin className="w-4.5 h-4.5" />}
                        label="Địa chỉ"
                        value={user?.address}
                        color="sky"
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Parent Info - View Mode */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="bg-white rounded-3xl shadow-lg shadow-amber-100/30 border border-amber-100/50 p-6 sm:p-8"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center shadow-md shadow-amber-400/20">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">
                      Thông tin phụ huynh
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard
                      icon={<User className="w-4.5 h-4.5" />}
                      label="Tên phụ huynh"
                      value={user?.parentName}
                      color="amber"
                    />
                    <InfoCard
                      icon={<Phone className="w-4.5 h-4.5" />}
                      label="SĐT phụ huynh"
                      value={user?.parentPhone}
                      color="amber"
                    />
                  </div>
                </motion.div>

                {/* Instructor Request */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  {getInstructorRequestUI()}
                </motion.div>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
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
