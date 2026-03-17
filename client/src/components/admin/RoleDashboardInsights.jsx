import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  Mail,
  ShoppingCart,
  UserCheck,
  Zap,
  BarChart2,
  Trophy,
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

const formatDateTime = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDaysDiff = (date) => {
  if (!date) return Infinity;
  const current = new Date();
  const target = new Date(date);
  const diffMs = Math.abs(current - target);
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

const getItemTypeLabel = (itemType) => {
  switch (itemType) {
    case "course":
      return "Khóa học";
    case "combo":
      return "Gói học";
    default:
      return "Giỏ hàng";
  }
};

const getContactStatusLabel = (status) => {
  switch (status) {
    case "pending":
      return "Chờ xử lý";
    case "replied":
      return "Đã phản hồi";
    case "closed":
      return "Đã đóng";
    default:
      return status;
  }
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

export default function RoleDashboardInsights({ role }) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);

  // ==========================================
  // LOGIC GIỮ NGUYÊN 100%
  // ==========================================
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);

        if (role === "admin") {
          const [statsRes, paymentsRes] = await Promise.all([
            adminApi.getUserStats(),
            paymentApi.getAllPayments({ status: "paid", page: 1, limit: 10 }),
          ]);

          const stats = statsRes.data?.data?.stats || {};
          const payments = paymentsRes.data?.data?.payments || [];
          const paymentSummary = paymentsRes.data?.data?.summary || {};

          const paymentActivities = payments.map((payment) => ({
            id: `payment-${payment._id}`,
            icon: ShoppingCart,
            title: `${payment.user?.fullname || payment.user?.username || "Khách hàng"} mua ${payment.item?.title || "sản phẩm"}`,
            description: `${formatCurrency(payment.amount)} • ${getItemTypeLabel(payment.itemType)}`,
            time: payment.paidAt || payment.createdAt,
          }));

          setActivities(paymentActivities);
          setQuickStats([
            {
              label: "Tổng giảng viên",
              value: stats.roleCount?.instructor || 0,
              icon: UserCheck,
            },
            {
              label: "Tổng doanh thu",
              value: formatCurrency(paymentSummary.totalRevenue || 0),
              icon: ShoppingCart,
            },
          ]);
          setTopSellingItems(paymentSummary.topSelling || []);
        } else if (role === "staff") {
          const [
            statsRes,
            reqPendingRes,
            reqAllRes,
            contactPendingRes,
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
              limit: 1,
            }),
            contactApi.getAllMessages({ status: "pending", page: 1, limit: 1 }),
            contactApi.getAllMessages({ status: "all", page: 1, limit: 5 }),
          ]);

          const stats = statsRes.data?.data?.stats || {};
          const pendingRequests =
            reqPendingRes.data?.data?.pagination?.total || 0;
          const totalRequests = reqAllRes.data?.data?.pagination?.total || 0;
          const pendingContacts =
            contactPendingRes.data?.data?.pagination?.total || 0;
          const contacts = contactsRes.data?.data?.messages || [];

          const contactActivities = contacts.map((message) => ({
            id: `contact-${message._id}`,
            icon: Mail,
            title: `${message.name} gửi liên hệ mới`,
            description: `Trạng thái: ${getContactStatusLabel(message.status)}`,
            time: message.createdAt,
          }));

          setActivities(contactActivities);
          setQuickStats([
            {
              label: "Người dùng đang hoạt động",
              value: stats.activeUsers || 0,
              icon: Activity,
            },
            {
              label: "Yêu cầu giảng viên chờ duyệt",
              value: pendingRequests,
              icon: UserCheck,
            },
            {
              label: "Liên hệ chờ xử lý",
              value: pendingContacts,
              icon: Mail,
            },
            {
              label: "Tổng yêu cầu giảng viên",
              value: totalRequests,
              icon: Clock3,
            },
          ]);
          setTopSellingItems([]);
        } else {
          const ordersRes = await paymentApi.getInstructorOrders();
          const orders = ordersRes.data?.data?.orders || [];
          const summary = ordersRes.data?.data?.summary || {
            totalRevenue: 0,
            totalOrders: 0,
          };

          const orderActivities = orders.slice(0, 5).map((order) => ({
            id: `order-${order._id}`,
            icon: ShoppingCart,
            title: `${order.user?.fullname || order.user?.username || "Học viên"} mua ${order.item?.title || "sản phẩm"}`,
            description: formatCurrency(order.amount),
            time: order.paidAt || order.createdAt,
          }));

          const thisMonthOrders = orders.filter(
            (order) => getDaysDiff(order.paidAt || order.createdAt) <= 31,
          ).length;

          const courseSalesMap = new Map();
          orders
            .filter((order) => order.itemType === "course" && order.item?._id)
            .forEach((order) => {
              const key = order.item._id;
              const existing = courseSalesMap.get(key) || {
                itemId: key,
                title: order.item.title || "Khóa học",
                orderCount: 0,
                revenue: 0,
              };
              existing.orderCount += 1;
              existing.revenue += order.amount || 0;
              courseSalesMap.set(key, existing);
            });

          const topCourses = Array.from(courseSalesMap.values())
            .sort((first, second) => {
              if (second.orderCount !== first.orderCount) {
                return second.orderCount - first.orderCount;
              }
              return second.revenue - first.revenue;
            })
            .slice(0, 5);

          setActivities(orderActivities);
          setQuickStats([
            {
              label: "Tổng đơn hàng",
              value: summary.totalOrders || 0,
              icon: ShoppingCart,
            },
            {
              label: "Tổng doanh thu",
              value: formatCurrency(summary.totalRevenue || 0),
              icon: Activity,
            },
            {
              label: "Giá trị đơn trung bình",
              value:
                summary.totalOrders > 0
                  ? formatCurrency(summary.totalRevenue / summary.totalOrders)
                  : formatCurrency(0),
              icon: Clock3,
            },
            {
              label: "Giao dịch 31 ngày gần đây",
              value: thisMonthOrders,
              icon: UserCheck,
            },
          ]);
          setTopSellingItems(topCourses);
        }
      } catch {
        setActivities([]);
        setQuickStats([]);
        setTopSellingItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, [role]);

  const displayActivities = useMemo(() => {
    return activities
      .slice()
      .sort((first, second) => new Date(second.time) - new Date(first.time))
      .slice(0, 5);
  }, [activities]);

  // ==========================================
  // GIAO DIỆN MỚI TỐI ƯU
  // ==========================================
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
    >
      {/* CỘT TRÁI: HOẠT ĐỘNG GẦN ĐÂY */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl border-none shadow-sm bg-white h-full">
          <CardHeader className="border-b border-slate-50/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500 fill-amber-100" />
              Hoạt động gần đây
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-5">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 animate-pulse shrink-0" />
                    <div className="space-y-2 flex-1 pt-1">
                      <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
                      <div className="h-3 w-1/2 rounded bg-slate-50 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : displayActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Activity className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">Chưa có hoạt động nào</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {displayActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 hover:bg-slate-50/80 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-300">
                      <activity.icon className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 line-clamp-1 group-hover:text-sky-600 transition-colors">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {activity.description}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                        {formatDateTime(activity.time).split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-slate-400 whitespace-nowrap">
                        {formatDateTime(activity.time).split(" ")[1]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* CỘT PHẢI: THỐNG KÊ NHANH & BÁN CHẠY */}
      <motion.div variants={itemVariants}>
        <Card className="rounded-2xl border-none shadow-sm bg-white h-full flex flex-col">
          <CardHeader className="border-b border-slate-50/80 pb-4">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-500" />
              Thống kê nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 flex-1 flex flex-col">
            {loading ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="h-16 rounded-xl bg-slate-50 animate-pulse"
                    />
                  ))}
                </div>
                <div className="h-40 rounded-xl bg-slate-50 animate-pulse mt-4" />
              </div>
            ) : quickStats.length === 0 ? (
              <div className="flex flex-col items-center justify-center flex-1 text-slate-400 min-h-[200px]">
                <BarChart2 className="w-12 h-12 mb-3 opacity-20" />
                <p className="text-sm">
                  Dữ liệu sẽ được cập nhật khi có thông tin
                </p>
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                {/* GRID THỐNG KÊ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-100 p-4 flex items-center gap-4 hover:border-indigo-100 hover:shadow-md transition-all group bg-white"
                    >
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <item.icon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-0.5 truncate">
                          {item.label}
                        </p>
                        <p className="text-base font-bold text-slate-800 truncate">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* KHU VỰC TOP SELLING (Chỉ hiển thị cho admin/instructor) */}
                {(role === "admin" || role === "instructor") && (
                  <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-5 mt-auto">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <p className="text-sm font-bold text-slate-800">
                        {role === "admin"
                          ? "Khóa học / Combo bán chạy nhất"
                          : "Khóa học bán chạy"}
                      </p>
                    </div>

                    {topSellingItems.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-slate-500">
                          Chưa có dữ liệu bán hàng
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {topSellingItems.map((item, index) => (
                          <div
                            key={
                              item.itemId || `${item.itemType}-${item.itemId}`
                            }
                            className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-slate-100/50 shadow-sm"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${index < 3 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}
                              >
                                {index + 1}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                  {item.title}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {item.itemType
                                    ? getItemTypeLabel(item.itemType) + " • "
                                    : ""}
                                  {item.orderCount} đơn
                                </p>
                              </div>
                            </div>
                            <div className="shrink-0 text-right pl-2">
                              <p className="text-sm font-bold text-emerald-600 whitespace-nowrap">
                                {formatCurrency(item.revenue)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
