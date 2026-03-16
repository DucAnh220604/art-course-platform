import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "@/components/landing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import userApi from "@/api/userApi";
import paymentApi from "@/api/paymentApi";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const statusConfig = {
  paid: {
    label: "Thành công",
    icon: "check_circle",
    className: "bg-primary-container text-on-primary-fixed",
  },
  pending: {
    label: "Đang xử lý",
    icon: "schedule",
    className: "bg-secondary-container text-on-secondary-container",
  },
  failed: {
    label: "Thất bại",
    icon: "error",
    className: "bg-error/10 text-error",
  },
  cancelled: {
    label: "Đã hủy",
    icon: "cancel",
    className: "bg-surface-container-highest text-on-surface-variant",
  },
};

const itemTypeLabel = {
  course: "Khóa học",
  combo: "Combo",
  cart: "Giỏ hàng",
};

export function MyCoursesPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [coursesRes, paymentsRes] = await Promise.all([
        userApi.getEnrolledCourses(),
        paymentApi.getMyPayments(),
      ]);
      setEnrolledCourses(coursesRes.data.data || []);
      setPayments(paymentsRes.data.data || []);
    } catch {
      toast.error("Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface scrapbook-bg">
        <Header onNavigate={navigate} />
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-white/50 rounded-[2.5rem] animate-pulse border-2 border-outline-variant/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface scrapbook-bg font-body text-on-surface">
      <Header onNavigate={navigate} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* ===== ENROLLED COURSES SECTION ===== */}
        <div className="mb-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="relative">
              <div className="absolute -top-10 -left-6 text-primary/10 select-none pointer-events-none">
                <span className="material-symbols-outlined text-8xl">menu_book</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-headline font-black text-on-surface tracking-tight relative z-10">
                Bài học <span className="text-primary italic">Của Bé</span>
              </h1>
              <p className="text-on-surface-variant font-bold text-lg mt-2 flex items-center gap-2">
                <span className="w-8 h-1 bg-primary rounded-full"></span>
                Bé đang có {enrolledCourses.length} hành trình sáng tạo
              </p>
            </div>
          </div>

          {enrolledCourses.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-white/40 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-outline-variant/20"
            >
              <div className="w-24 h-24 rounded-3xl bg-surface-container flex items-center justify-center mx-auto mb-6 rotate-12">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/30">auto_stories</span>
              </div>
              <h3 className="text-2xl font-headline font-black text-on-surface mb-3">
                Chưa có bài học nào hôm nay...
              </h3>
              <p className="text-on-surface-variant font-medium mb-8 max-w-md mx-auto">
                Hãy cùng Artie bắt đầu những nét vẽ đầu tiên nhé! Rất nhiều điều thú vị đang chờ bé khám phá.
              </p>
              <button
                onClick={() => navigate("/courses")}
                className="gummy-button bg-primary text-on-primary px-8 py-3 rounded-xl font-black text-sm"
              >
                KHÁM PHÁ KHÓA HỌC
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {enrolledCourses.map((item, idx) => {
                const course = item.course;
                if (!course) return null;
                const instructorName = course.instructor?.fullname || "Họa sĩ ArtKids";

                return (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="group"
                    onClick={() => navigate(`/learning/${course.slug}`)}
                  >
                    <Card className={cn(
                      "relative bg-white rounded-[2.5rem] overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-500 h-full flex flex-col scrapbook-card cursor-pointer",
                      idx % 3 === 0 ? "rotate-[-0.5deg]" : idx % 3 === 1 ? "rotate-[0.5deg]" : "rotate-[-1deg]"
                    )}>
                      {/* Thumbnail & Progress */}
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        {/* Progress Bar Label */}
                        <div className="absolute bottom-4 right-4 z-20">
                          <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg border border-primary/10">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                              {item.progress || 0}% HOÀN THÀNH
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar Track */}
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-surface-container/30 backdrop-blur-sm z-10">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress || 0}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-primary shadow-[0_0_10px_rgba(253,192,3,0.5)]"
                          />
                        </div>
                      </div>

                      <div className="p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <Avatar className="w-7 h-7 ring-2 ring-primary/10">
                            <AvatarImage src={course.instructor?.avatar} />
                            <AvatarFallback className="bg-primary-container text-primary font-black text-[9px]">
                              {instructorName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em]">
                            {instructorName}
                          </span>
                        </div>

                        <h3 className="text-xl font-headline font-black text-on-surface line-clamp-2 mb-6 leading-tight h-14 group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>

                        <div className="mt-auto flex items-center justify-between border-t border-dashed border-outline-variant/10 pt-6">
                          <div className="flex items-center gap-2 text-on-surface-variant font-bold text-xs uppercase tracking-widest">
                            <span className="material-symbols-outlined text-lg text-primary">equalizer</span>
                            <span>Đang học</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-on-surface-variant/40 uppercase">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {new Date(item.enrolledAt).toLocaleDateString("vi-VN")}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== PURCHASE HISTORY SECTION ===== */}
        <div className="mt-32 relative">
          <div className="absolute -top-12 -left-4 text-secondary/10 select-none pointer-events-none">
            <span className="material-symbols-outlined text-7xl">receipt_long</span>
          </div>
          <div className="flex items-end gap-4 mb-12 relative z-10">
            <h2 className="text-4xl font-headline font-black text-on-surface tracking-tight">
              Lịch sử <span className="text-secondary italic">Mua hàng</span>
            </h2>
            <div className="h-0.5 flex-1 bg-outline-variant/5 mb-3 hidden sm:block"></div>
            <Badge className="bg-secondary-container text-on-secondary-container px-4 py-1.5 rounded-full font-black text-[10px] mb-2 uppercase tracking-widest flex items-center gap-1.5">
              <span className="material-symbols-outlined text-xs">local_activity</span>
              {payments.length} Giao dịch
            </Badge>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-20 bg-white/30 rounded-[2.5rem] border-2 border-dashed border-outline-variant/10">
              <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 font-light">receipt</span>
              <p className="text-on-surface-variant font-bold">Chưa có giao dịch nào được ghi lại.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {payments.map((payment, idx) => {
                const status = statusConfig[payment.status] || statusConfig.pending;
                
                return (
                  <motion.div
                    key={payment._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="rounded-3xl border-none shadow-premium hover:shadow-xl transition-all p-6 bg-white flex flex-col lg:flex-row lg:items-center gap-6 group overflow-hidden relative">
                      {/* Status indicator strip */}
                      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", status.className.split(" ")[1].replace("text-", "bg-"))}></div>

                      {/* Thumbnail / Icon */}
                      <div className="relative shrink-0 flex items-center justify-center">
                        {payment.item?.thumbnail ? (
                          <div className="w-24 h-16 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                            <img src={payment.item.thumbnail} alt="" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-24 h-16 bg-surface-container rounded-xl flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                            <span className="material-symbols-outlined text-3xl text-on-surface-variant/30">
                              {payment.itemType === "cart" ? "shopping_basket" : "package_2"}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge className="bg-surface-container-highest text-on-surface-variant text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none">
                            {itemTypeLabel[payment.itemType] || payment.itemType}
                          </Badge>
                          <Badge className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border-none flex items-center gap-1", status.className)}>
                            <span className="material-symbols-outlined text-xs leading-none">{status.icon}</span>
                            {status.label}
                          </Badge>
                          <span className="text-[10px] font-black text-on-surface-variant/20 tracking-tighter ml-auto order-last lg:order-none uppercase">
                            Mã: #{payment.txnRef}
                          </span>
                        </div>

                        <h4 className="text-lg font-headline font-bold text-on-surface line-clamp-1 leading-tight mb-1">
                          {payment.item ? payment.item.title : payment.cartItems?.map(ci => ci.title).join(", ") || "Đơn hàng hệ thống"}
                        </h4>
                        
                        <div className="flex items-center gap-1 text-[11px] font-bold text-on-surface-variant/50">
                          <span className="material-symbols-outlined text-xs">event</span>
                          {new Date(payment.createdAt).toLocaleString("vi-VN")}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="lg:text-right px-4 py-3 lg:py-0 border-t lg:border-t-0 lg:border-l-2 border-dashed border-outline-variant/10 shrink-0">
                        <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-[0.2em] mb-0.5 leading-none">Tổng cộng</p>
                        <p className="text-2xl font-black text-on-surface tracking-tighter">
                          {payment.amount?.toLocaleString()}đ
                        </p>
                        {payment.paidAt && (
                          <div className="flex lg:justify-end items-center gap-1 text-[10px] font-black text-primary uppercase mt-1">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            Đã nhận bài
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
