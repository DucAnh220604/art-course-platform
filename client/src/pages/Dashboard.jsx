import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  CreditCard,
  BarChart3,
  UserCheck,
  ShoppingBag,
  Home,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { ArtKidsLogo } from "@/components/icons/ArtKidsLogo";
import { Button } from "@/components/ui/button";
import {
  DashboardOverview,
  UserManagement,
  PlaceholderTab,
  InstructorRequests,
} from "@/components/admin";

const getNavigationByRole = (role) => {
  switch (role) {
    case "admin":
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "users", label: "Quản lý Users", icon: Users },
        {
          id: "instructor-requests",
          label: "Yêu cầu Instructor",
          icon: UserCheck,
        },
        { id: "courses", label: "Quản lý Khóa học", icon: BookOpen },
        { id: "posts", label: "Quản lý Bài viết", icon: FileText },
        { id: "payments", label: "Giao dịch", icon: CreditCard },
        { id: "reports", label: "Báo cáo", icon: BarChart3 },
      ];
    case "staff":
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "users", label: "Quản lý Tài khoản", icon: Users },
        {
          id: "instructor-requests",
          label: "Yêu cầu Instructor",
          icon: UserCheck,
        },
        { id: "posts", label: "Quản lý Bài viết", icon: FileText },
        { id: "reports", label: "Báo cáo", icon: BarChart3 },
      ];
    case "instructor":
      return [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "my-courses", label: "Khóa học của tôi", icon: BookOpen },
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
      return { title: "Admin Panel", subtitle: "Quản trị viên" };
    case "staff":
      return { title: "Staff Panel", subtitle: "Nhân viên" };
    case "instructor":
      return { title: "Instructor Panel", subtitle: "Giảng viên" };
    default:
      return { title: "Dashboard", subtitle: "" };
  }
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const userRole = user?.role || "customer";
  const navigationItems = getNavigationByRole(userRole);
  const { title, subtitle } = getRoleTitle(userRole);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />;
      case "users":
        return <UserManagement />;
      case "instructor-requests":
        return <InstructorRequests />;
      case "courses":
        return (
          <PlaceholderTab
            title="Quản lý Khóa học"
            description="Duyệt và quản lý các khóa học"
            message="Chức năng quản lý khóa học đang được phát triển..."
          />
        );
      case "my-courses":
        return (
          <PlaceholderTab
            title="Khóa học của tôi"
            description="Quản lý các khóa học bạn đã tạo"
            message="Chức năng quản lý khóa học đang được phát triển..."
          />
        );
      case "posts":
        return (
          <PlaceholderTab
            title="Quản lý Bài viết"
            description="Quản lý các bài viết blog"
            message="Chức năng quản lý bài viết đang được phát triển..."
          />
        );
      case "payments":
        return (
          <PlaceholderTab
            title="Giao dịch"
            description="Lịch sử thanh toán"
            message="Chức năng quản lý thanh toán đang được phát triển..."
          />
        );
      case "orders":
        return (
          <PlaceholderTab
            title="Lịch sử đơn hàng"
            description="Xem các đơn hàng khóa học của bạn"
            message="Chức năng lịch sử đơn hàng đang được phát triển..."
          />
        );
      case "reports":
        return (
          <PlaceholderTab
            title="Báo cáo & Thống kê"
            description="Xem các báo cáo và thống kê"
            message="Chức năng báo cáo đang được phát triển..."
          />
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r min-h-screen sticky top-0 hidden md:block">
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
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-8 pt-8 border-t">
            <Button
              variant="outline"
              className="w-full rounded-lg"
              onClick={() => navigate("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArtKidsLogo className="w-8 h-8" />
            <span className="font-bold text-gray-900">{title}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <Home className="w-4 h-4" />
          </Button>
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
