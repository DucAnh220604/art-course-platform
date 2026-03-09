import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  GraduationCap,
  Info,
  Phone,
} from "lucide-react";
import { Button } from "../ui/button";
import { ArtKidsLogo } from "../icons/ArtKidsLogo";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import cartApi from "@/api/cartApi";
import wishlistApi from "@/api/wishlistApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function Header({ onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }
    cartApi.getCart().then((res) => setCartCount(res.data.data?.length || 0)).catch(() => {});
    wishlistApi.getWishlist().then((res) => setWishlistCount(res.data.data?.length || 0)).catch(() => {});
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    onNavigate("/");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2 lg:gap-3 cursor-pointer"
            onClick={() => onNavigate("/")}
          >
            <ArtKidsLogo className="w-10 h-10" />
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              ArtKids
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <Button
              variant="ghost"
              className="rounded-full text-slate-600 hover:text-sky-600 hover:bg-sky-50 h-10 lg:h-11 px-4 lg:px-5 text-sm lg:text-base font-medium"
              onClick={() => onNavigate("/courses")}
            >
              <GraduationCap className="w-5 h-5 mr-2" />
              Khóa học
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 h-10 lg:h-11 px-4 lg:px-5 text-sm lg:text-base font-medium"
              onClick={() => onNavigate("/about")}
            >
              <Info className="w-5 h-5 mr-2" />
              Giới thiệu
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-slate-600 hover:text-amber-600 hover:bg-amber-50 h-10 lg:h-11 px-4 lg:px-5 text-sm lg:text-base font-medium"
              onClick={() => onNavigate("/contact")}
            >
              <Phone className="w-5 h-5 mr-2" />
              Liên hệ
            </Button>
          </nav>

          <div className="flex items-center gap-2 lg:gap-4">
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full h-9 w-9 lg:h-11 lg:w-11 hover:bg-rose-50"
                  onClick={() => onNavigate("/wishlist")}
                >
                  <Heart className="w-5 h-5 text-rose-400" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full h-9 w-9 lg:h-11 lg:w-11 hover:bg-sky-50"
                  onClick={() => onNavigate("/cart")}
                >
                  <ShoppingCart className="w-5 h-5 text-sky-500" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 rounded-full px-2 lg:px-3 h-9 lg:h-11 hover:bg-sky-50"
                    >
                      <Avatar className="w-8 h-8 lg:w-9 lg:h-9 border-2 border-sky-200">
                        <AvatarImage src={user?.avatar} alt={user?.fullname} />
                        <AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-400 text-white text-sm font-bold">
                          {getInitials(user?.fullname || user?.username)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden lg:block text-sm font-medium text-slate-700 max-w-[120px] truncate">
                        {user?.fullname || user?.username}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.fullname || user?.username}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onNavigate("/profile")}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Trang cá nhân</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onNavigate("/my-courses")}
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Khóa học của tôi</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onNavigate("/cart")}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Giỏ hàng {cartCount > 0 && `(${cartCount})`}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => onNavigate("/wishlist")}
                    >
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Yêu thích {wishlistCount > 0 && `(${wishlistCount})`}</span>
                    </DropdownMenuItem>
                    {["admin", "staff", "instructor"].includes(user?.role) && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="cursor-pointer text-sky-600 focus:text-sky-600 focus:bg-sky-50"
                          onClick={() => onNavigate("/dashboard")}
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          <span>
                            {user?.role === "admin" && "Quản lý hệ thống"}
                            {user?.role === "staff" && "Quản lý nhân viên"}
                            {user?.role === "instructor" &&
                              "Quản lý giảng viên"}
                          </span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="rounded-full hidden sm:flex border-sky-300 text-sky-600 hover:bg-sky-50 h-9 lg:h-11 px-4 lg:px-6 text-sm lg:text-base"
                  onClick={() => onNavigate("/login")}
                >
                  Đăng nhập
                </Button>
                <Button
                  className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 h-9 lg:h-11 px-4 lg:px-6 text-sm lg:text-base"
                  onClick={() => onNavigate("/register")}
                >
                  Đăng ký
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
