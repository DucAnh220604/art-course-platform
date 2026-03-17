import { useEffect, useState } from "react";
import { Users, BookOpen, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import adminApi from "@/api/adminApi";

const defaultStats = {
  totalUsers: 0,
  activeUsers: 0,
  dashboard: {
    admin: {
      totalUsers: 0,
      totalCourses: 0,
      monthlyRevenue: 0,
      pendingInstructorRequests: 0,
    },
    staff: {
      activeUsers: 0,
      pendingInstructorRequests: 0,
      totalPosts: 0,
      processedToday: 0,
    },
  },
};

export default function AdminStaffDashboardStats({ role }) {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getUserStats();
        setStats(response.data?.data?.stats || defaultStats);
      } catch {
        setStats(defaultStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount || 0);

  const adminCards = [
    {
      label: "Tổng người dùng",
      value: stats.dashboard?.admin?.totalUsers ?? stats.totalUsers ?? 0,
      icon: Users,
      color: "blue",
    },
    {
      label: "Tổng Khóa học",
      value: stats.dashboard?.admin?.totalCourses ?? 0,
      icon: BookOpen,
      color: "purple",
    },
    {
      label: "Doanh thu tháng",
      value: formatCurrency(stats.dashboard?.admin?.monthlyRevenue ?? 0),
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Yêu cầu đang chờ",
      value: stats.dashboard?.admin?.pendingInstructorRequests ?? 0,
      icon: Clock,
      color: "orange",
    },
  ];

  const staffCards = [
    {
      label: "Người dùng đang hoạt động",
      value: stats.dashboard?.staff?.activeUsers ?? stats.activeUsers ?? 0,
      icon: Users,
      color: "blue",
    },
    {
      label: "Yêu cầu giảng viên",
      value: stats.dashboard?.staff?.pendingInstructorRequests ?? 0,
      icon: Clock,
      color: "orange",
    },
    {
      label: "Bài viết",
      value: stats.dashboard?.staff?.totalPosts ?? 0,
      icon: BookOpen,
      color: "purple",
    },
    {
      label: "Đã xử lý hôm nay",
      value: stats.dashboard?.staff?.processedToday ?? 0,
      icon: CheckCircle,
      color: "green",
    },
  ];

  const cards = role === "admin" ? adminCards : staffCards;

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      orange: { bg: "bg-orange-100", text: "text-orange-600" },
    };
    return colors[color] || colors.blue;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-xl border shadow-sm">
            <CardContent className="p-6">
              <div className="h-24 animate-pulse bg-slate-100 rounded-lg" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card) => {
        const colorClasses = getColorClasses(card.color);
        return (
          <Card key={card.label} className="rounded-xl border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses.bg}`}
                >
                  <card.icon className={`w-6 h-6 ${colorClasses.text}`} />
                </div>
              </div>
              <div className="text-2xl font-bold mb-1">{card.value}</div>
              <div className="text-sm text-gray-600">{card.label}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
