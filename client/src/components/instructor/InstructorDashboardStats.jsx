import { useEffect, useState } from "react";
import { BookOpen, DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import userApi from "@/api/userApi";

const defaultStats = {
  totalCourses: 0,
  totalStudents: 0,
  monthlyRevenue: 0,
  averageRating: 0,
};

export default function InstructorDashboardStats() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await userApi.getInstructorDashboardStats();
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

  const cards = [
    {
      label: "Khóa học của tôi",
      value: stats.totalCourses,
      icon: BookOpen,
      color: "purple",
    },
    {
      label: "Học viên",
      value: stats.totalStudents,
      icon: Users,
      color: "blue",
    },
    {
      label: "Doanh thu tháng",
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Đánh giá TB",
      value: stats.averageRating,
      icon: TrendingUp,
      color: "orange",
    },
  ];

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
