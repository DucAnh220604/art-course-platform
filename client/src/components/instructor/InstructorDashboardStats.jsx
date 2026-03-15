import { useEffect, useState } from "react";
import { BookOpen, DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import userApi from "@/api/userApi";

const defaultStats = {
  totalCourses: 0,
  totalStudents: 0,
  monthlyRevenue: 0,
  averageRating: 0,
};

// Framer motion variants cho hiệu ứng xuất hiện mượt mà
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

export default function InstructorDashboardStats() {
  const [stats, setStats] = useState(defaultStats);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOGIC GIỮ NGUYÊN 100%
  // ==========================================
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
      color: "purple", // Sẽ map qua màu indigo cho hiện đại
    },
    {
      label: "Học viên",
      value: stats.totalStudents,
      icon: Users,
      color: "blue", // Sẽ map qua màu sky
    },
    {
      label: "Doanh thu tháng",
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: "green", // Sẽ map qua màu emerald
    },
    {
      label: "Đánh giá TB",
      value: stats.averageRating,
      icon: TrendingUp,
      color: "orange", // Sẽ map qua màu amber
    },
  ];

  // Đã tinh chỉnh lại bộ màu cho tươi sáng và hiện đại hơn
  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: "bg-sky-100", text: "text-sky-600" },
      purple: { bg: "bg-indigo-100", text: "text-indigo-600" },
      green: { bg: "bg-emerald-100", text: "text-emerald-600" },
      orange: { bg: "bg-amber-100", text: "text-amber-600" },
    };
    return colors[color] || colors.blue;
  };

  // ==========================================
  // GIAO DIỆN MỚI
  // ==========================================
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card
            key={index}
            className="rounded-2xl border-none shadow-sm bg-white"
          >
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 animate-pulse" />
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-8 w-1/2 rounded-lg bg-slate-100 animate-pulse" />
                <div className="h-4 w-3/4 rounded-lg bg-slate-100 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
    >
      {cards.map((card) => {
        const colorClasses = getColorClasses(card.color);
        return (
          <motion.div key={card.label} variants={itemVariants}>
            <Card className="rounded-2xl border-none shadow-sm hover:shadow-md transition-all duration-300 bg-white group overflow-hidden relative">
              {/* Hiệu ứng mảng nền mờ góc phải dưới */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-white/0 to-slate-50/50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${colorClasses.bg}`}
                  >
                    <card.icon className={`w-6 h-6 ${colorClasses.text}`} />
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-800 tracking-tight mb-1">
                    {card.value}
                  </div>
                  <div className="text-sm font-medium text-slate-500">
                    {card.label}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
