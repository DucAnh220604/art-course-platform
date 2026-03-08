import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Clock,
  BarChart3,
  Receipt,
  CheckCircle2,
  XCircle,
  Loader2,
  Package,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import userApi from "@/api/userApi";
import paymentApi from "@/api/paymentApi";
import { toast } from "sonner";

const statusConfig = {
  paid: {
    label: "Thành công",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700",
  },
  pending: {
    label: "Đang xử lý",
    icon: Loader2,
    className: "bg-amber-100 text-amber-700",
  },
  failed: {
    label: "Thất bại",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
  cancelled: {
    label: "Đã hủy",
    icon: XCircle,
    className: "bg-slate-100 text-slate-500",
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
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
          <Header onNavigate={navigate} />
        </div>
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-full w-1/3 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-[32px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <Header onNavigate={navigate} />
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-12">
        {/* ===== ENROLLED COURSES ===== */}
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-8 h-8 text-sky-500" />
          <h1 className="text-3xl font-bold text-slate-800">
            Khóa học của tôi
          </h1>
          <Badge variant="secondary" className="ml-2 text-sm">
            {enrolledCourses.length} khóa học
          </Badge>
        </div>

        {enrolledCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-500 mb-2">
              Bạn chưa đăng ký khóa học nào
            </h2>
            <p className="text-slate-400 mb-6">
              Hãy khám phá các khóa học vẽ thú vị!
            </p>
            <Button
              onClick={() => navigate("/courses")}
              className="rounded-full"
            >
              Khám phá khóa học
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((item) => {
              const course = item.course;
              if (!course) return null;

              const instructorName =
                course.instructor?.fullname || "Giảng viên ArtKids";

              return (
                <Card
                  key={course._id}
                  className="group rounded-[32px] border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white cursor-pointer hover:-translate-y-1"
                  onClick={() => navigate(`/course/${course.slug}`)}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/20">
                      <div
                        className="h-full bg-emerald-400 transition-all"
                        style={{ width: `${item.progress || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="w-6 h-6 border border-sky-100">
                        <AvatarImage src={course.instructor?.avatar} />
                        <AvatarFallback className="bg-sky-50 text-sky-600 text-[10px] font-bold">
                          {instructorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {instructorName}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 line-clamp-2 mb-3 leading-tight">
                      {course.title}
                    </h3>

                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold">
                          {item.progress || 0}% hoàn thành
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>
                          {new Date(item.enrolledAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* ===== PAYMENT HISTORY ===== */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-8">
            <Receipt className="w-8 h-8 text-violet-500" />
            <h2 className="text-2xl font-bold text-slate-800">
              Lịch sử mua hàng
            </h2>
            <Badge variant="secondary" className="ml-2 text-sm">
              {payments.length} giao dịch
            </Badge>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-16">
              <Receipt className="w-14 h-14 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400">Chưa có giao dịch nào.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => {
                const status =
                  statusConfig[payment.status] || statusConfig.pending;
                const StatusIcon = status.icon;

                return (
                  <Card
                    key={payment._id}
                    className="rounded-2xl border-none shadow-sm p-5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Thumbnail */}
                      {payment.item?.thumbnail && (
                        <img
                          src={payment.item.thumbnail}
                          alt={payment.item.title}
                          className="w-20 h-14 object-cover rounded-xl flex-shrink-0"
                        />
                      )}
                      {payment.itemType === "cart" && (
                        <div className="w-20 h-14 bg-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Package className="w-7 h-7 text-violet-500" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[11px]">
                            {itemTypeLabel[payment.itemType] ||
                              payment.itemType}
                          </Badge>
                          <Badge
                            className={`text-[11px] ${status.className} border-none`}
                          >
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>

                        {/* Title */}
                        {payment.item ? (
                          <p className="font-semibold text-slate-800 truncate">
                            {payment.item.title}
                          </p>
                        ) : payment.cartItems?.length > 0 ? (
                          <p className="font-semibold text-slate-800 truncate">
                            {payment.cartItems.map((ci) => ci.title).join(", ")}
                          </p>
                        ) : (
                          <p className="font-semibold text-slate-500">
                            Giao dịch #{payment.txnRef}
                          </p>
                        )}

                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(payment.createdAt).toLocaleString("vi-VN")}
                          {" · "}Mã GD: {payment.txnRef}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-slate-800">
                          {payment.amount.toLocaleString()}đ
                        </p>
                        {payment.paidAt && (
                          <p className="text-xs text-emerald-500">
                            Thanh toán:{" "}
                            {new Date(payment.paidAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
