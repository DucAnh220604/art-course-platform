import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CreditCard,
  BarChart3,
  UserCheck,
  ShoppingBag,
  Home,
  Package,
  LogOut,
  Mail,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ArtKidsLogo } from "@/components/icons/ArtKidsLogo";
import { Button } from "@/components/ui/button";
import {
  DashboardOverview,
  UserManagement,
  PlaceholderTab,
  InstructorRequests,
  AdminCourseManagement,
  ContactManagement,
} from "@/components/admin";
import { AdminComboManagement } from "@/components/admin/AdminComboManagement";
import { CourseManagement } from "@/components/instructor/CourseManagement";
import { ComboManagement } from "@/components/instructor/ComboManagement";
import OrderHistory from "@/components/instructor/OrderHistory";
import PaymentManager from "@/components/admin/PaymentManager";
import ReportsPanel from "@/components/admin/ReportsPanel";

const getNavigationByRole = (role) => {
  switch (role) {
    case "admin":
      return [
        { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
        { id: "users", label: "Quản lý người dùng", icon: Users },
        {
          id: "instructor-requests",
          label: "Yêu cầu giảng viên",
          icon: UserCheck,
        },
        { id: "courses", label: "Quản lý khóa học", icon: BookOpen },
        { id: "combos", label: "Quản lý gói học", icon: Package },
        { id: "contact", label: "Tin nhắn liên hệ", icon: Mail },
        { id: "payments", label: "Giao dịch", icon: CreditCard },
        { id: "reports", label: "Báo cáo", icon: BarChart3 },
      ];
    case "staff":
      return [
        { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
        { id: "users", label: "Quản lý tài khoản", icon: Users },
        {
          id: "instructor-requests",
          label: "Yêu cầu giảng viên",
          icon: UserCheck,
        },
        { id: "contact", label: "Tin nhắn liên hệ", icon: Mail },
        { id: "reports", label: "Báo cáo", icon: BarChart3 },
      ];
    case "instructor":
      return [
        { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
        { id: "my-courses", label: "Khóa học của tôi", icon: BookOpen },
        { id: "my-combos", label: "Gói học của tôi", icon: Package },
        { id: "orders", label: "Lịch sử đơn hàng", icon: ShoppingBag },
        { id: "reports", label: "Báo cáo", icon: BarChart3 },
      ];
    default:
      return [];
  }
};

const getRoleTitle = (role) => {
  switch (role) {
    case "admin":
      return { title: "Bảng quản trị", subtitle: "Quản trị viên" };
    case "staff":
      return { title: "Bảng quản trị", subtitle: "Nhân viên" };
    case "instructor":
      return { title: "Bảng giảng viên", subtitle: "Giảng viên" };
    default:
      return { title: "Tổng quan", subtitle: "" };
  }
};

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const rawRole = user?.role || "customer";
  const userRole = String(rawRole).toLowerCase().trim();
  const navigationItems = getNavigationByRole(userRole);
  const { title, subtitle } = getRoleTitle(userRole);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "instructor-requests":
        return <InstructorRequests />;
      case "courses":
        return <AdminCourseManagement />;
      case "combos":
        return <AdminComboManagement />;
      case "contact":
        return <ContactManagement />;
      case "my-courses":
        return <CourseManagement />;
      case "my-combos":
        return <ComboManagement />;
      case "posts":
        return (
          <PlaceholderTab
            title="Quản lý Bài viết"
            description="Quản lý các bài viết blog"
            message="Chức năng quản lý bài viết đang được phát triển..."
          />
        );
      case "payments":
        return <PaymentManager />;
      case "orders":
        return <OrderHistory />;
      case "reports":
        return <ReportsPanel role={userRole} />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-72 bg-white border-r min-h-screen sticky top-0 hidden md:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <ArtKidsLogo className="w-10 h-10" />
            <div>
              <div className="text-xl font-bold text-gray-900">{title}</div>
              <div className="text-xs text-gray-500">{subtitle}</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-sky-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t">
            {userRole === "admin" || userRole === "staff" ? (
              <Button
                variant="outline"
                className="w-full rounded-lg bg-red-500 text-white hover:bg-red-600 hover:text-white border-transparent"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full rounded-lg"
                onClick={handleGoHome}
              >
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            )}
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArtKidsLogo className="w-8 h-8" />
            <span className="font-bold text-gray-900">{title}</span>
          </div>
          {userRole === "admin" || userRole === "staff" ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 hover:text-white border-transparent"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Về trang chủ</span>
            </Button>
          )}
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm ${
                activeTab === item.id
                  ? "bg-sky-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-x-auto md:mt-0 mt-28">
        {renderContent()}
      </main>
    </div>
  );
}
