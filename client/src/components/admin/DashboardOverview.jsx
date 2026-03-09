import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export function DashboardOverview() {
  const { user } = useAuth();

  const getStatsForRole = () => {
    switch (user?.role) {
      case "admin":
        return [
          {
            label: "Tổng Users",
            value: "0",
            icon: Users,
            change: "+12%",
            color: "blue",
          },
          {
            label: "Tổng Khóa học",
            value: "0",
            icon: BookOpen,
            change: "+8%",
            color: "purple",
          },
          {
            label: "Doanh thu tháng",
            value: "0đ",
            icon: DollarSign,
            change: "+23%",
            color: "green",
          },
          {
            label: "Yêu cầu đang chờ",
            value: "0",
            icon: Clock,
            change: "-5%",
            color: "orange",
          },
        ];
      case "staff":
        return [
          {
            label: "Users hoạt động",
            value: "0",
            icon: Users,
            change: "+10%",
            color: "blue",
          },
          {
            label: "Yêu cầu Instructor",
            value: "0",
            icon: Clock,
            change: "+3",
            color: "orange",
          },
          {
            label: "Bài viết",
            value: "0",
            icon: BookOpen,
            change: "+5%",
            color: "purple",
          },
          {
            label: "Đã xử lý hôm nay",
            value: "0",
            icon: CheckCircle,
            change: "+15%",
            color: "green",
          },
        ];
      case "instructor":
        return [
          {
            label: "Khóa học của tôi",
            value: "0",
            icon: BookOpen,
            change: "+2",
            color: "purple",
          },
          {
            label: "Học viên",
            value: "0",
            icon: Users,
            change: "+18%",
            color: "blue",
          },
          {
            label: "Doanh thu tháng",
            value: "0đ",
            icon: DollarSign,
            change: "+12%",
            color: "green",
          },
          {
            label: "Đánh giá TB",
            value: "0",
            icon: TrendingUp,
            change: "+0.2",
            color: "orange",
          },
        ];
      default:
        return [];
    }
  };

  const stats = getStatsForRole();

  const getWelcomeMessage = () => {
    switch (user?.role) {
      case "admin":
        return "Quản lý toàn bộ hệ thống từ đây";
      case "staff":
        return "Xử lý các yêu cầu và quản lý nội dung";
      case "instructor":
        return "Quản lý khóa học và theo dõi học viên";
      default:
        return "";
    }
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      orange: { bg: "bg-orange-100", text: "text-orange-600" },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Xin chào, {user?.fullname || user?.username}!
        </h1>
        <p className="text-gray-600">{getWelcomeMessage()}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => {
          const colorClasses = getColorClasses(stat.color);
          return (
            <Card key={index} className="rounded-xl border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses.bg}`}
                  >
                    <stat.icon className={`w-6 h-6 ${colorClasses.text}`} />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      stat.change.startsWith("+")
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Chưa có hoạt động nào
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl">
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Dữ liệu sẽ được cập nhật khi có thông tin
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
