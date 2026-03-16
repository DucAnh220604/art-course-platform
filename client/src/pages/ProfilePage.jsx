import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
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
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  fullname: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  address: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-tertiary-container/20 border-2 border-tertiary/20 rounded-3xl p-6 rotate-1 scrapbook-card"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="material-symbols-outlined text-3xl">schedule</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-headline font-bold text-on-tertiary-container mb-1">
                  ⏳ Đang chờ xét duyệt
                </h3>
                <p className="text-on-tertiary-container text-sm font-medium leading-relaxed">
                  Yêu cầu trở thành giảng viên của bạn đang được xem xét. Artie sẽ thông báo kết quả cho bé sớm nha!
                </p>
              </div>
            </div>
          </motion.div>
        );
      case "approved":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary-container/20 border-2 border-primary/20 rounded-3xl p-6 -rotate-1 scrapbook-card"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-headline font-bold text-on-primary-container mb-1">
                  🎉 Yêu cầu đã được duyệt!
                </h3>
                <p className="text-on-primary-container text-sm font-medium leading-relaxed">
                  Chúc mừng! Bạn đã trở thành giảng viên. Hãy bắt đầu chia sẻ những bài học vẽ tuyệt vời nhé!
                </p>
              </div>
            </div>
          </motion.div>
        );
      case "rejected":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-error/5 border-2 border-error/20 rounded-3xl p-6 rotate-1 scrapbook-card"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-error text-on-error flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="material-symbols-outlined text-3xl">error</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-headline font-bold text-error mb-1">
                  Yêu cầu bị từ chối
                </h3>
                {user?.instructorRequestData?.rejectionReason && (
                  <div className="bg-white/50 border border-error/10 rounded-xl p-3 mb-4">
                    <p className="text-error text-xs font-black uppercase mb-1">Lý do từ chối:</p>
                    <p className="text-on-surface text-sm font-medium italic">
                      "{user.instructorRequestData.rejectionReason}"
                    </p>
                  </div>
                )}
                <button
                  onClick={handleRequestInstructor}
                  className="gummy-button bg-error px-6 py-2 rounded-full text-white font-bold text-xs"
                >
                  GỬI LẠI YÊU CẦU
                </button>
              </div>
            </div>
          </motion.div>
        );
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-secondary-container/20 border-2 border-secondary/20 border-dashed rounded-3xl p-8 scrapbook-card"
          >
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-secondary text-on-secondary flex items-center justify-center flex-shrink-0 shadow-xl rotate-3">
                <span className="material-symbols-outlined text-5xl">school</span>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-headline font-black text-on-secondary-container mb-2">
                  ✨ Bé muốn làm Giảng viên?
                </h3>
                <p className="text-on-secondary-container text-sm font-medium leading-relaxed max-w-md">
                  Bạn có tài năng vẽ tuyệt đẹp? Hãy tham gia cùng gia đình ArtKids để truyền cảm hứng cho hàng ngàn bạn nhỏ khác nhé!
                </p>
              </div>
              <button
                onClick={handleRequestInstructor}
                className="gummy-button bg-secondary px-8 py-3 rounded-xl text-on-secondary font-black text-sm shadow-lg whitespace-nowrap"
              >
                ĐĂNG KÝ NGAY
              </button>
            </div>
          </motion.div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface scrapbook-bg">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-6 text-primary"
          >
            <span className="material-symbols-outlined text-6xl">palette</span>
          </motion.div>
          <p className="text-on-surface-variant font-bold text-xl font-headline animate-pulse">Artie đang chuẩn bị chút xíu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface scrapbook-bg font-body text-on-surface">
      <Header onNavigate={navigate} />

      <main className="flex-1 py-12 lg:py-20 flex items-center justify-center">
        <div className="max-w-4xl w-full px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            {/* Decorative stickers */}
            <div className="absolute -top-10 -left-10 w-24 h-24 rotate-[-15deg] hidden lg:block select-none pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-primary/20">brush</span>
            </div>
            <div className="absolute -bottom-10 -right-10 w-24 h-24 rotate-[20deg] hidden lg:block select-none pointer-events-none">
              <span className="material-symbols-outlined text-8xl text-secondary/20">auto_awesome</span>
            </div>

            <Card className="overflow-hidden border-none shadow-premium bg-white rounded-[2.5rem] relative z-10 transition-all hover:shadow-2xl">
              {/* Profile Header Block */}
              <div className="bg-surface-container px-8 sm:px-12 pt-12 pb-10 border-b border-outline-variant/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex flex-col sm:flex-row items-center gap-8 relative z-10">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-primary-container rounded-[2rem] rotate-6 scale-105 group-hover:rotate-12 transition-transform"></div>
                    <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-xl relative z-10 rounded-[2rem]">
                      <AvatarImage src={user?.avatar} alt={user?.fullname} />
                      <AvatarFallback className="bg-primary text-on-primary text-4xl font-black">
                        {getInitials(user?.fullname || user?.username)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={handleAvatarClick}
                      disabled={isUploadingAvatar}
                      className="absolute -bottom-2 -right-2 p-3 rounded-full bg-white shadow-2xl border border-outline-variant/20 text-primary hover:scale-110 active:scale-95 transition-all z-20 disabled:opacity-50"
                    >
                      {isUploadingAvatar ? (
                        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span className="material-symbols-outlined text-xl">photo_camera</span>
                      )}
                    </button>
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h2 className="text-4xl sm:text-5xl font-headline font-black text-on-surface mb-2 tracking-tight">
                      {user?.fullname || user?.username}
                    </h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-on-surface-variant font-bold text-sm">
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">mail</span>
                        {user?.email}
                      </div>
                      <div className="flex items-center justify-center sm:justify-start gap-1">
                        <span className="material-symbols-outlined text-sm text-secondary">calendar_today</span>
                        Gia nhập: {formatDate(user?.createdAt)}
                      </div>
                    </div>
                  </div>

                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="gummy-button bg-primary px-8 py-3 rounded-xl text-on-primary text-sm font-black shadow-lg"
                    >
                      CHỈNH SỬA
                    </button>
                  )}
                </div>
              </div>

              {/* Profile Details Block */}
              <div className="px-8 sm:px-12 py-12">
                {isEditing ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-10"
                    >
                      <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="h-8 w-1.5 bg-primary rounded-full"></div>
                          <h3 className="text-2xl font-headline font-bold">Hồ sơ của bé</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="fullname"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-on-surface font-black text-xs uppercase tracking-widest pl-1">Họ và tên</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Vẽ tên bé ở đây..."
                                    className="h-14 rounded-xl border-2 border-outline-variant/10 bg-surface focus:border-primary/30 font-bold px-6 outline-none transition-all shadow-sm"
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
                                <FormLabel className="text-on-surface font-black text-xs uppercase tracking-widest pl-1">Số điện thoại</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Điện thoại của bé..."
                                    className="h-14 rounded-xl border-2 border-outline-variant/10 bg-surface focus:border-primary/30 font-bold px-6 shadow-sm"
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
                                <FormLabel className="text-on-surface font-black text-xs uppercase tracking-widest pl-1">Ngày sinh nhật</FormLabel>
                                <FormControl>
                                  <Input
                                    type="date"
                                    className="h-14 rounded-xl border-2 border-outline-variant/10 bg-surface focus:border-primary/30 font-bold px-6 shadow-sm"
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
                                <FormLabel className="text-on-surface font-black text-xs uppercase tracking-widest pl-1">Nhà của bé ở...</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Nhập địa chỉ nhà bé nha..."
                                    className="h-14 rounded-xl border-2 border-outline-variant/10 bg-surface focus:border-primary/30 font-bold px-6 shadow-sm"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-6 pt-4">
                        <div className="flex items-center gap-3 mb-8">
                          <div className="h-8 w-1.5 bg-secondary rounded-full"></div>
                          <h3 className="text-2xl font-headline font-bold text-secondary">Thông tin phụ huynh</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="parentName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-on-surface font-black text-xs uppercase tracking-widest pl-1">Tên Ba/Mẹ</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Tên Ba/Mẹ bé đó..."
                                    className="h-14 rounded-xl border-2 border-outline-variant/10 bg-surface focus:border-secondary/30 font-bold px-6 shadow-sm"
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
                                <FormLabel className="text-on-surface font-black text-xs uppercase tracking-widest pl-1">SĐT liên lạc</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Ba mẹ số mấy nè..."
                                    className="h-14 rounded-xl border-2 border-outline-variant/10 bg-surface focus:border-secondary/30 font-bold px-6 shadow-sm"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="flex-1 h-16 rounded-2xl font-headline font-black text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors uppercase tracking-widest"
                        >
                          HỦY BỎ
                        </button>
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="flex-1 h-16 rounded-2xl gummy-button bg-primary text-on-primary font-headline font-black uppercase tracking-widest disabled:opacity-50"
                        >
                          {isSaving ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
                        </button>
                      </div>
                    </form>
                  </Form>
                ) : (
                  <div className="space-y-12">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 bg-primary rounded-full"></div>
                        <h3 className="text-2xl font-headline font-bold">Hồ sơ họa sĩ</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoItemUI label="Họ và tên" value={user?.fullname} icon="person" />
                        <InfoItemUI label="Email bé" value={user?.email} icon="mail" />
                        <InfoItemUI label="Số điện thoại" value={user?.phone} icon="call" />
                        <InfoItemUI label="Sinh nhật" value={formatDate(user?.birthday)} icon="cake" />
                        <InfoItemUI label="Địa chỉ nhà" value={user?.address} icon="location_on" className="sm:col-span-2" />
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-1.5 bg-secondary rounded-full"></div>
                        <h3 className="text-2xl font-headline font-bold text-secondary">Ba Mẹ yêu thương</h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoItemUI label="Tên Ba/Mẹ" value={user?.parentName} icon="family_history" color="secondary" />
                        <InfoItemUI label="SĐT Ba/Mẹ" value={user?.parentPhone} icon="contact_phone" color="secondary" />
                      </div>
                    </div>

                    <div className="pt-6">
                      {getInstructorRequestUI()}
                    </div>
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

function InfoItemUI({ label, value, icon, className = "", color = "primary" }) {
  const colorClass = color === "primary" ? "bg-primary-container text-primary" : "bg-secondary-container text-secondary";
  
  return (
    <div className={cn(
      "relative bg-white p-6 rounded-[1.5rem] border border-outline-variant/10 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px]",
      className
    )}>
      <div className="flex items-start gap-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", colorClass)}>
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-on-surface-variant/40 mb-1 leading-none">{label}</p>
          <p className="font-headline font-bold text-lg text-on-surface leading-snug">
            {value || <span className="text-on-surface-variant/20 italic font-normal">Chưa cập nhật</span>}
          </p>
        </div>
      </div>
    </div>
  );
}
