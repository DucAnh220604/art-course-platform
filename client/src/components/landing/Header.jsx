import {
  ShoppingCart,
  Heart,
  User,
  LogOut,
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
import { cn } from "@/lib/utils";

import { useCart } from "@/context/CartContext";

export function Header({ onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, wishlistCount } = useCart();

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
    <nav className="sticky top-0 z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onClick={() => onNavigate("/")}
      >
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
          <ArtKidsLogo className="w-7 h-7" />
        </div>
        <span className="font-headline font-bold text-2xl text-primary tracking-tighter">
          ArtKids
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8">
        {!isAuthenticated ? (
          <button
            onClick={() => onNavigate("/")}
            className="font-label font-bold text-on-surface hover:text-primary transition-colors text-sm uppercase tracking-widest"
          >
            Giới thiệu
          </button>
        ) : (
          <button
            onClick={() => onNavigate("/")}
            className="font-label font-bold text-on-surface hover:text-primary transition-colors text-sm uppercase tracking-widest"
          >
            Trang chủ
          </button>
        )}

        <button
          onClick={() => onNavigate("/courses")}
          className="font-label font-bold text-on-surface hover:text-primary transition-colors text-sm uppercase tracking-widest"
        >
          Khóa học
        </button>

        <button
          onClick={() => onNavigate("/reviews")}
          className="font-label font-bold text-on-surface hover:text-primary transition-colors text-sm uppercase tracking-widest"
        >
          Đánh giá
        </button>

        <button
          onClick={() => onNavigate("/contact")}
          className="font-label font-bold text-on-surface hover:text-primary transition-colors text-sm uppercase tracking-widest"
        >
          Liên hệ
        </button>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate("/cart")}
              className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-primary-container/20 transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface">
                shopping_basket
              </span>
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-on-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface">
                  {cartCount}
                </span>
              )}
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container transition-colors ring-2 ring-transparent active:ring-primary/20">
                  <Avatar className="w-9 h-9 border-2 border-primary-container">
                    <AvatarImage src={user?.avatar} alt={user?.fullname} />
                    <AvatarFallback className="bg-primary text-on-primary text-xs font-black">
                      {getInitials(user?.fullname || user?.username)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 rounded-2xl border-outline-variant/10 shadow-2xl bg-white"
              >
                <DropdownMenuLabel className="font-headline p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black leading-none text-on-surface">
                      {user?.fullname || user?.username}
                    </p>
                    <p className="text-xs font-medium text-on-surface-variant/60">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-outline-variant/5" />
                <div className="p-1 space-y-1">
                  <DropdownMenuItem
                    className="rounded-lg h-10 px-3 cursor-pointer group"
                    onClick={() => onNavigate("/profile")}
                  >
                    <User className="mr-2 h-4 w-4 text-on-surface-variant group-hover:text-primary" />
                    <span className="text-sm font-bold">Hồ sơ họa sĩ</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg h-10 px-3 cursor-pointer group"
                    onClick={() => onNavigate("/my-courses")}
                  >
                    <GraduationCap className="mr-2 h-4 w-4 text-on-surface-variant group-hover:text-secondary" />
                    <span className="text-sm font-bold">Bài học của con</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-lg h-10 px-3 cursor-pointer group"
                    onClick={() => onNavigate("/wishlist")}
                  >
                    <Heart className="mr-2 h-4 w-4 text-on-surface-variant group-hover:text-error" />
                    <span className="text-sm font-bold">
                      Yêu thích ({wishlistCount})
                    </span>
                  </DropdownMenuItem>

                  {["admin", "staff", "instructor"].includes(user?.role) && (
                    <DropdownMenuItem
                      className="rounded-lg h-10 px-3 cursor-pointer group text-primary"
                      onClick={() => onNavigate("/dashboard")}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span className="text-sm font-black">Bảng quản trị</span>
                    </DropdownMenuItem>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-outline-variant/5" />
                <div className="p-1">
                  <DropdownMenuItem
                    className="rounded-lg h-10 px-3 cursor-pointer text-error font-black hover:bg-error/5"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span className="text-sm">Tạm biệt ArtKids</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <button
            onClick={() => onNavigate("/login")}
            className="bg-primary-container text-on-primary-fixed font-headline font-black px-8 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-premium border-b-4 border-primary/20"
          >
            VÀO HỌC NGAY
          </button>
        )}
      </div>
    </nav>
  );
}
