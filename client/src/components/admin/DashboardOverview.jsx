import { useAuth } from "@/context/AuthContext";
import InstructorDashboardStats from "@/components/instructor/InstructorDashboardStats";
import AdminStaffDashboardStats from "./AdminStaffDashboardStats";
import RoleDashboardInsights from "./RoleDashboardInsights";

export function DashboardOverview() {
  const { user } = useAuth();

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Xin chào, {user?.fullname || user?.username}!
        </h1>
        <p className="text-gray-600">{getWelcomeMessage()}</p>
      </div>

      {user?.role === "instructor" ? (
        <InstructorDashboardStats />
      ) : (
        <AdminStaffDashboardStats role={user?.role} />
      )}

      <RoleDashboardInsights role={user?.role} />
    </div>
  );
}
