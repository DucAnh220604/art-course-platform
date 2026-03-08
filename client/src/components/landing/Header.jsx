import {
  Search,
  Filter,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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
    <header className="sticky top-0 z-50 bg-white shadow-md -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="py-4 lg:py-5">
        <div className="flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2 lg:gap-3 cursor-pointer"
            onClick={() => onNavigate("/")}
          >
            <ArtKidsLogo className="w-10 h-10 lg:w-12 lg:h-12" />
            <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              ArtKids
            </span>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6" />
              <Input
                placeholder="Tìm kiếm khóa học..."
                className="pl-10 lg:pl-12 pr-12 h-10 lg:h-12 text-base lg:text-lg rounded-full border-2 border-sky-200 focus:border-sky-400"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              >
                <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>
            </div>
          </div>

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
                            {user?.role === "admin" && "Admin Dashboard"}
                            {user?.role === "staff" && "Staff Dashboard"}
                            {user?.role === "instructor" &&
                              "Instructor Dashboard"}
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
