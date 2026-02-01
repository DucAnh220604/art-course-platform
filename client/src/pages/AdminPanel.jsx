import { useState } from "react";
import { Users, BookOpen, FileText, CreditCard, Settings } from "lucide-react";

import {
  AdminSidebar,
  UserManagement,
  PlaceholderTab,
  SettingsTab,
} from "@/components/admin";

export function AdminPanel({ onNavigate }) {
  const [activeTab, setActiveTab] = useState("users");

  const icons = {
    users: Users,
    courses: BookOpen,
    posts: FileText,
    payments: CreditCard,
    settings: Settings,
  };

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />;
      case "courses":
        return (
          <PlaceholderTab
            title="Quản lý Khóa học"
            description="Duyệt và quản lý các khóa học"
            message="Chức năng quản lý khóa học đang được phát triển..."
          />
        );
      case "posts":
        return (
          <PlaceholderTab
            title="Quản lý Blog"
            description="Quản lý các bài viết blog"
            message="Chức năng quản lý blog đang được phát triển..."
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
      case "settings":
        return <SettingsTab />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNavigate={onNavigate}
        icons={icons}
      />

      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Admin Panel</span>
          </div>
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {Object.entries(icons).map(([id, Icon]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap text-sm ${
                activeTab === id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="capitalize">{id}</span>
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
