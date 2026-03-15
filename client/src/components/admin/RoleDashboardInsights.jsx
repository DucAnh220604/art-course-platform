import { useEffect, useMemo, useState } from "react";
import { Activity, Clock3, Mail, ShoppingCart, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function RoleDashboardInsights({ role }) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
  const [topSellingItems, setTopSellingItems] = useState([]);

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
            description: `${formatCurrency(payment.amount)} • ${payment.itemType === "course" ? "Khóa học" : payment.itemType === "combo" ? "Combo" : "Giỏ hàng"}`,
            time: payment.paidAt || payment.createdAt,
          }));

          setActivities(paymentActivities);
          setQuickStats([
            {
              label: "Tổng instructor",
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
            description: `Trạng thái: ${message.status}`,
            time: message.createdAt,
          }));

          setActivities(contactActivities);
          setQuickStats([
            {
              label: "Users hoạt động",
              value: stats.activeUsers || 0,
              icon: Activity,
            },
            {
              label: "Yêu cầu instructor pending",
              value: pendingRequests,
              icon: UserCheck,
            },
            {
              label: "Liên hệ pending",
              value: pendingContacts,
              icon: Mail,
            },
            {
              label: "Tổng yêu cầu instructor",
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-10 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : displayActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có hoạt động nào
            </div>
          ) : (
            <div className="space-y-3">
              {displayActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 p-3"
                >
                  <div className="w-9 h-9 rounded-full bg-sky-50 flex items-center justify-center shrink-0">
                    <activity.icon className="w-4 h-4 text-sky-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 line-clamp-1">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {formatDateTime(activity.time)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader>
          <CardTitle>Thống kê nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="h-10 rounded-lg bg-slate-100 animate-pulse"
                />
              ))}
            </div>
          ) : quickStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Dữ liệu sẽ được cập nhật khi có thông tin
            </div>
          ) : role === "admin" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-slate-100 p-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Khóa học / Combo bán chạy nhất
                </p>

                {topSellingItems.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Chưa có dữ liệu bán hàng
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topSellingItems.map((item, index) => (
                      <div
                        key={`${item.itemType}-${item.itemId}`}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">
                            {index + 1}. {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.itemType === "course" ? "Khóa học" : "Combo"}{" "}
                            • {item.orderCount} đơn
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-green-600 whitespace-nowrap">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : role === "instructor" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickStats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-slate-100 p-3 flex items-center gap-3"
                  >
                    <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                      <item.icon className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">{item.label}</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-lg border border-slate-100 p-3">
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Khóa học bán chạy
                </p>

                {topSellingItems.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Chưa có dữ liệu bán khóa học
                  </p>
                ) : (
                  <div className="space-y-2">
                    {topSellingItems.map((item, index) => (
                      <div
                        key={item.itemId}
                        className="flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 line-clamp-1">
                            {index + 1}. {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.orderCount} đơn
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-green-600 whitespace-nowrap">
                          {formatCurrency(item.revenue)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickStats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-100 p-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
