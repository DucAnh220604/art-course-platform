import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Trash2,
  ShoppingCart,
  Package,
  BookOpen,
  ArrowRight,
  Star,
  Users,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import wishlistApi from "@/api/wishlistApi";
import { toast } from "sonner";

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist();
      setWishlistItems(res.data.data || []);
    } catch {
      toast.error("Không tải được danh sách yêu thích.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId, productModel) => {
    try {
      await wishlistApi.removeFromWishlist(productId, productModel);
      setWishlistItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product._id === productId &&
              item.productModel === productModel
            ),
        ),
      );
      toast.success("Đã xóa khỏi danh sách yêu thích.");
    } catch {
      toast.error("Không xóa được.");
    }
  };

  const handleMoveToCart = async (productId, productModel) => {
    try {
      await wishlistApi.moveToCart(productId, productModel);
      setWishlistItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product._id === productId &&
              item.productModel === productModel
            ),
        ),
      );
      toast.success("Đã chuyển sang giỏ hàng!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không chuyển được sang giỏ hàng.",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
          <Header onNavigate={navigate} />
        </div>
        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-12 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-full w-1/3 mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-slate-200 rounded-[32px]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <Header onNavigate={navigate} />
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">
                Yêu thích của tôi
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                {wishlistItems.length} khóa học đã lưu
              </p>
            </div>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-28 h-28 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-8">
              <Heart className="w-14 h-14 text-rose-200" />
            </div>
            <h3 className="text-2xl font-bold text-slate-600 mb-3">
              Chưa có khóa học yêu thích
            </h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">
              Nhấn vào biểu tượng trái tim ở các khóa học để lưu vào danh sách
              yêu thích nhé!
            </p>
            <Button
              className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 px-8 h-12 text-base font-bold shadow-lg"
              onClick={() => navigate("/courses")}
            >
              Khám phá khóa học <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const p = item.product;
              if (!p) return null;
              const isCombo = item.productModel === "Combo";
              const slug = p.slug;
              const oldPrice = isCombo ? p.originalPrice : p.oldPrice;
              const hasDiscount = oldPrice && oldPrice > p.price;
              const rating = p.averageRating || 0;
              const instructorName =
                p.instructor?.fullname || "Giảng viên ArtKids";

              return (
                <Card
                  key={item._id}
                  className="group rounded-[32px] border-none shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden bg-white flex flex-col h-full hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div
                    className="relative aspect-[16/10] overflow-hidden cursor-pointer"
                    onClick={() =>
                      navigate(isCombo ? `/combos/${slug}` : `/course/${slug}`)
                    }
                  >
                    <img
                      src={
                        isCombo
                          ? p.courses?.[0]?.thumbnail || p.thumbnail
                          : p.thumbnail
                      }
                      alt={p.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

                    {/* Type Badge */}
                    {isCombo ? (
                      <Badge className="absolute top-4 left-4 bg-amber-400 text-amber-900 border-none px-3 py-1 rounded-full font-bold text-[10px] shadow-lg">
                        <Package className="w-3 h-3 mr-1" /> COMBO
                      </Badge>
                    ) : (
                      p.category && (
                        <Badge className="absolute top-4 left-4 bg-sky-100/90 text-sky-700 border-none px-3 py-1 rounded-full font-bold text-[10px] shadow-sm backdrop-blur-sm">
                          {p.category}
                        </Badge>
                      )
                    )}

                    {/* Discount ribbon */}
                    {hasDiscount && (
                      <div className="absolute top-0 right-0 overflow-hidden w-20 h-20 pointer-events-none">
                        <div className="absolute top-[14px] right-[-24px] w-[100px] bg-rose-500 text-white text-[10px] font-black text-center py-1 rotate-45 shadow-md">
                          -
                          {isCombo
                            ? p.discountPercentage
                            : p.discountPercentage}
                          %
                        </div>
                      </div>
                    )}

                    {/* Remove button (top right, always visible on hover) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(p._id, item.productModel);
                      }}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-rose-500 text-rose-400 hover:text-white flex items-center justify-center shadow-md transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-1">
                    {/* Instructor */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <Avatar className="w-7 h-7 border-2 border-sky-100 shadow-sm">
                        <AvatarImage src={p.instructor?.avatar} />
                        <AvatarFallback className="bg-sky-50 text-sky-600 text-[10px] font-bold">
                          {instructorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">
                        {instructorName}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      className="text-base font-bold text-slate-800 line-clamp-2 mb-3 hover:text-sky-500 transition-colors cursor-pointer leading-snug"
                      onClick={() =>
                        navigate(
                          isCombo ? `/combos/${slug}` : `/course/${slug}`,
                        )
                      }
                    >
                      {p.title}
                    </h3>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                      {rating > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="font-bold text-slate-600">
                            {rating.toFixed ? rating.toFixed(1) : rating}
                          </span>
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {p.totalStudents || 0} học viên
                      </span>
                      {isCombo && (
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5" />
                          {p.courses?.length || 0} khóa
                        </span>
                      )}
                    </div>

                    {/* Price + Actions */}
                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          {hasDiscount && (
                            <p className="text-xs font-bold text-slate-400 line-through leading-none mb-0.5">
                              {oldPrice?.toLocaleString()}đ
                            </p>
                          )}
                          <p
                            className={`text-xl font-black ${isCombo ? "text-amber-600" : "text-sky-600"}`}
                          >
                            {p.price === 0
                              ? "MIỄN PHÍ"
                              : `${p.price?.toLocaleString()}đ`}
                          </p>
                        </div>
                        <Heart className="w-5 h-5 text-rose-400 fill-rose-400" />
                      </div>

                      <Button
                        className={`w-full rounded-full font-bold h-11 shadow-md transition-all ${
                          isCombo
                            ? "bg-amber-500 hover:bg-amber-600"
                            : "bg-sky-500 hover:bg-sky-600"
                        } text-white`}
                        onClick={() =>
                          handleMoveToCart(p._id, item.productModel)
                        }
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Thêm vào giỏ hàng
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
