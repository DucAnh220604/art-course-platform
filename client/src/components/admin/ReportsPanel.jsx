import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Clock3,
  Mail,
  ShoppingCart,
  UserCheck,
  Users,
  TrendingUp,
  Package,
  Activity,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import adminApi from "@/api/adminApi";
import paymentApi from "@/api/paymentApi";
import contactApi from "@/api/contactApi";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const daysDiff = (date) => {
  if (!date) return Infinity;
  const now = new Date();
  const target = new Date(date);
  return Math.floor(Math.abs(now - target) / (1000 * 60 * 60 * 24));
};

// Hàm phụ trợ tạo màu badge cho status
const getStatusBadge = (status) => {
  const normalized = (status || "").toLowerCase();
  if (["paid", "success", "approved", "completed"].includes(normalized)) {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (["pending", "processing", "waiting"].includes(normalized)) {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  if (["failed", "cancelled", "rejected", "error"].includes(normalized)) {
    return "bg-rose-100 text-rose-700 border-rose-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-200";
};

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

export default function ReportsPanel({ role }) {
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState([]);
  const [topSelling, setTopSelling] = useState([]);
  const [secondaryList, setSecondaryList] = useState([]);

  // ==========================================
  // LOGIC GIỮ NGUYÊN 100%
  // ==========================================
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);

        if (role === "admin") {
          const [statsRes, paymentsRes] = await Promise.all([
            adminApi.getUserStats(),
            paymentApi.getAllPayments({ page: 1, limit: 20 }),
          ]);

          const stats = statsRes.data?.data?.stats || {};
          const paymentSummary = paymentsRes.data?.data?.summary || {};
          const paidCount = paymentSummary.statusCount?.paid || 0;
          const totalOrders = paymentSummary.totalOrders || 0;
          const paidRate =
            totalOrders > 0
              ? `${Math.round((paidCount / totalOrders) * 100)}%`
              : "0%";

          setKpis([
            {
              label: "Tổng doanh thu",
              value: formatCurrency(paymentSummary.totalRevenue || 0),
              icon: ShoppingCart,
              color: "text-emerald-600",
              bg: "bg-emerald-100",
            },
            {
              label: "Tổng đơn hàng",
              value: totalOrders,
              icon: BarChart3,
              color: "text-sky-600",
              bg: "bg-sky-100",
            },
            {
              label: "Tỷ lệ thanh toán",
              value: paidRate,
              icon: Clock3,
              color: "text-indigo-600",
              bg: "bg-indigo-100",
            },
            {
              label: "Tổng giảng viên",
              value: stats.roleCount?.instructor || 0,
              icon: UserCheck,
              color: "text-amber-600",
              bg: "bg-amber-100",
            },
          ]);

          setTopSelling(paymentSummary.topSelling || []);

          const statusEntries = Object.entries(paymentSummary.statusCount || {})
            .map(([status, count]) => ({ status, count }))
            .sort((a, b) => b.count - a.count);
          setSecondaryList(statusEntries);
        } else if (role === "staff") {
          const [
            statsRes,
            pendingReqRes,
            allReqRes,
            pendingContactRes,
            contactsRes,
          ] = await Promise.all([
            adminApi.getUserStats(),
            adminApi.getInstructorRequests({
              status: "pending",
              page: 1,
              limit: 1,
            }),
            adminApi.getInstructorRequests({
              status: "all",
              page: 1,
              limit: 8,
            }),
            contactApi.getAllMessages({ status: "pending", page: 1, limit: 1 }),
            contactApi.getAllMessages({ status: "all", page: 1, limit: 8 }),
          ]);

          const stats = statsRes.data?.data?.stats || {};
          const pendingReq = pendingReqRes.data?.data?.pagination?.total || 0;
          const pendingContact =
            pendingContactRes.data?.data?.pagination?.total || 0;
          const allRequests = allReqRes.data?.data?.requests || [];
          const contacts = contactsRes.data?.data?.messages || [];

          setKpis([
            {
              label: "Users hoạt động",
              value: stats.activeUsers || 0,
              icon: Users,
              color: "text-sky-600",
              bg: "bg-sky-100",
            },
            {
              label: "Yêu cầu pending",
              value: pendingReq,
              icon: UserCheck,
              color: "text-amber-600",
              bg: "bg-amber-100",
            },
            {
              label: "Liên hệ pending",
              value: pendingContact,
              icon: Mail,
              color: "text-rose-600",
              bg: "bg-rose-100",
            },
            {
              label: "Đã xử lý hôm nay",
              value: stats.dashboard?.staff?.processedToday || 0,
              icon: Activity,
              color: "text-emerald-600",
              bg: "bg-emerald-100",
            },
          ]);

          setTopSelling(
            allRequests.slice(0, 5).map((request) => ({
              id: request._id,
              title:
                request.instructorRequestData?.fullName ||
                request.fullname ||
                request.username ||
                "N/A",
              subtitle: request.instructorRequestStatus || "none",
              meta: formatDate(
                request.instructorRequestData?.requestedAt || request.createdAt,
              ),
            })),
          );

          setSecondaryList(
            contacts.slice(0, 5).map((message) => ({
              id: message._id,
              title: message.name,
              subtitle: message.status,
              meta: formatDate(message.createdAt),
            })),
          );
        } else {
          const ordersRes = await paymentApi.getInstructorOrders();
          const orders = ordersRes.data?.data?.orders || [];
          const summary = ordersRes.data?.data?.summary || {
            totalRevenue: 0,
            totalOrders: 0,
          };

          const averageOrderValue =
            summary.totalOrders > 0
              ? summary.totalRevenue / summary.totalOrders
              : 0;
          const thisMonthOrders = orders.filter(
            (order) => daysDiff(order.paidAt || order.createdAt) <= 31,
          ).length;

          setKpis([
            {
              label: "Tổng doanh thu",
              value: formatCurrency(summary.totalRevenue),
              icon: ShoppingCart,
              color: "text-emerald-600",
              bg: "bg-emerald-100",
            },
            {
              label: "Tổng đơn hàng",
              value: summary.totalOrders,
              icon: Package,
              color: "text-indigo-600",
              bg: "bg-indigo-100",
            },
            {
              label: "Giá trị đơn TB",
              value: formatCurrency(averageOrderValue),
              icon: TrendingUp,
              color: "text-sky-600",
              bg: "bg-sky-100",
            },
            {
              label: "Đơn (31 ngày qua)",
              value: thisMonthOrders,
              icon: Clock3,
              color: "text-amber-600",
              bg: "bg-amber-100",
            },
          ]);

          const salesMap = new Map();
          orders.forEach((order) => {
            const key = `${order.itemType}-${order.item?._id || "unknown"}`;
            const prev = salesMap.get(key) || {
              key,
              title: order.item?.title || "Sản phẩm",
              itemType: order.itemType,
              count: 0,
              revenue: 0,
            };
            prev.count += 1;
            prev.revenue += order.amount || 0;
            salesMap.set(key, prev);
          });

          const topItems = Array.from(salesMap.values())
            .sort((a, b) => {
              if (b.count !== a.count) return b.count - a.count;
              return b.revenue - a.revenue;
            })
            .slice(0, 5);

          setTopSelling(topItems);

          setSecondaryList(
            orders.slice(0, 5).map((order) => ({
              id: order._id,
              title: order.item?.title || "Sản phẩm",
              subtitle: `${order.itemType === "course" ? "Khóa học" : "Combo"} • ${formatCurrency(order.amount)}`,
              meta: formatDate(order.paidAt || order.createdAt),
            })),
          );
        }
      } catch {
        setKpis([]);
        setTopSelling([]);
        setSecondaryList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [role]);

  const topListTitle = useMemo(() => {
    if (role === "admin") return "Sản phẩm bán chạy nhất";
    if (role === "staff") return "Yêu cầu Instructor gần đây";
    return "Top sản phẩm bán chạy";
  }, [role]);

  const secondaryTitle = useMemo(() => {
    if (role === "admin") return "Phân bố trạng thái thanh toán";
    if (role === "staff") return "Liên hệ gần đây";
    return "Giao dịch gần đây";
  }, [role]);

  // ==========================================
  // GIAO DIỆN (UI) ĐÃ ĐƯỢC LÀM MỚI
  // ==========================================
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card
              key={index}
              className="rounded-2xl border-none shadow-sm bg-white"
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 animate-pulse" />
                  <div className="w-16 h-6 rounded-md bg-slate-100 animate-pulse" />
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-8 w-1/2 rounded-lg bg-slate-100 animate-pulse" />
                  <div className="h-4 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[...Array(2)].map((_, index) => (
            <Card
              key={index}
              className="rounded-2xl border-none shadow-sm bg-white min-h-[400px]"
            >
              <CardHeader className="border-b border-slate-50 pb-4">
                <div className="h-6 w-1/3 rounded-lg bg-slate-100 animate-pulse" />
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-14 rounded-xl bg-slate-50 animate-pulse"
                  />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* KHU VỰC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((item) => (
          <motion.div key={item.label} variants={itemVariants}>
            <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-slate-50/50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${item.bg || "bg-slate-100"} flex items-center justify-center transition-transform group-hover:scale-110 duration-300`}
                  >
                    <item.icon
                      className={`w-6 h-6 ${item.color || "text-slate-600"}`}
                    />
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-800 tracking-tight">
                    {item.value}
                  </p>
                  <p className="text-sm font-medium text-slate-500 mt-1">
                    {item.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* KHU VỰC LISTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* CỘT TRÁI: TOP SELLING / REQUESTS */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader className="border-b border-slate-50/80 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-sky-500" />
                {topListTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {topSelling.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Package className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Chưa có dữ liệu thống kê</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {topSelling.map((item, index) => {
                    const isStaff = role === "staff";
                    // Tách logic render riêng để không bị rối
                    return (
                      <div
                        key={
                          item.id ||
                          item.key ||
                          `${item.itemType}-${item.itemId}-${index}`
                        }
                        className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${index < 3 ? "bg-sky-100 text-sky-600" : "bg-slate-100 text-slate-500"}`}
                          >
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-sky-600 transition-colors">
                              {item.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                              {isStaff ? (
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusBadge(item.subtitle)} uppercase tracking-wider`}
                                >
                                  {item.subtitle}
                                </span>
                              ) : (
                                <span>
                                  {item.itemType === "course"
                                    ? "Khóa học"
                                    : "Combo"}{" "}
                                  •{" "}
                                  <span className="font-medium text-slate-600">
                                    {item.orderCount || item.count} đơn
                                  </span>
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p
                            className={`text-sm font-semibold whitespace-nowrap ${!isStaff ? "text-emerald-600" : "text-slate-600"}`}
                          >
                            {isStaff ? item.meta : formatCurrency(item.revenue)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* CỘT PHẢI: STATUS PHÂN BỐ / TRANSACTIONS */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
            <CardHeader className="border-b border-slate-50/80 pb-4">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                {secondaryTitle}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {secondaryList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                  <Activity className="w-12 h-12 mb-3 opacity-20" />
                  <p className="text-sm">Chưa có dữ liệu</p>
                </div>
              ) : role === "admin" ? (
                // Layout riêng cho Admin Status
                <div className="p-4 space-y-4">
                  {secondaryList.map((item) => (
                    <div
                      key={item.status}
                      className="flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2 h-2 rounded-full ${["paid", "success"].includes(item.status) ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        <p className="text-sm font-medium capitalize text-slate-700">
                          {item.status}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                          {/* Fake progress bar purely for visual metric aesthetics */}
                          <div
                            className={`h-full rounded-full ${["paid", "success"].includes(item.status) ? "bg-emerald-400" : "bg-slate-300"}`}
                            style={{ width: "100%" }}
                          />
                        </div>
                        <span className="text-sm font-bold text-slate-800 w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Layout cho Staff & Instructor
                <div className="divide-y divide-slate-50">
                  {secondaryList.map((item, index) => (
                    <div
                      key={item.id || index}
                      className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors group cursor-default"
                    >
                      <div className="min-w-0 pr-4">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                      <div className="flex flex-col items-end flex-shrink-0">
                        <p className="text-xs font-medium text-slate-400 flex items-center gap-1">
                          <Clock3 className="w-3 h-3" />
                          {item.meta}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
