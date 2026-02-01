import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtKidsLogo } from "@/components/icons/ArtKidsLogo";

export function DashboardSidebar({
  activeTab,
  setActiveTab,
  navigationItems,
  icons,
  userRole,
  title = "Dashboard",
}) {
  const navigate = useNavigate();

  const getRoleLabel = () => {
    switch (userRole) {
      case "admin":
        return "Administrator";
      case "staff":
        return "Staff Panel";
      case "instructor":
        return "Instructor Panel";
      default:
        return "Dashboard";
    }
  };

  return (
    <aside className="w-64 bg-white border-r min-h-screen sticky top-0 hidden md:block">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <ArtKidsLogo className="w-10 h-10" />
          <div>
            <div className="text-xl font-bold text-gray-900">{title}</div>
            <div className="text-xs text-gray-500">{getRoleLabel()}</div>
          </div>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = icons[item.id];
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id
                    ? "bg-sky-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {Icon && <Icon className="w-5 h-5" />}
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
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
  );
}
