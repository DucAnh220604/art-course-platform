import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  ShoppingCart,
  Package,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import cartApi from "@/api/cartApi";
import paymentApi from "@/api/paymentApi";
import { toast } from "sonner";

export function CartPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [isAuthenticated]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      setCartItems(res.data.data || []);
    } catch {
      toast.error("Không tải được giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId, productModel) => {
    try {
      await cartApi.removeFromCart(productId, productModel);
      setCartItems((prev) =>
        prev.filter(
          (item) =>
            !(
              item.product._id === productId &&
              item.productModel === productModel
            )
        )
      );
      toast.success("Đã xóa khỏi giỏ hàng.");
    } catch {
      toast.error("Không xóa được.");
    }
  };

  const handleClearCart = async () => {
    try {
      await cartApi.clearCart();
      setCartItems([]);
      toast.success("Đã xóa toàn bộ giỏ hàng.");
    } catch {
      toast.error("Không xóa được giỏ hàng.");
    }
  };

  const handleCheckout = async () => {
    try {
      setCheckingOut(true);
      const res = await paymentApi.checkoutCart();
      const data = res.data;

      if (data.flow === "free") {
        await refreshUser();
        setCartItems([]);
        toast.success(data.message || "Đăng ký thành công!");
        return;
      }

      if (data.flow === "vnpay" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      toast.error("Không tạo được phiên thanh toán.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Thanh toán thất bại. Thử lại sau!"
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0),
    0
  );

  const totalOldPrice = cartItems.reduce((sum, item) => {
    const p = item.product;
    if (!p) return sum;
    if (item.productModel === "Combo") return sum + (p.originalPrice || p.price || 0);
    return sum + (p.oldPrice || p.price || 0);
  }, 0);

  const totalSaved = totalOldPrice - totalPrice;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
          <Header onNavigate={navigate} />
        </div>
        <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-full w-1/3 mb-6" />
          <div className="h-40 bg-slate-200 rounded-3xl w-full mb-4" />
          <div className="h-40 bg-slate-200 rounded-3xl w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <Header onNavigate={navigate} />
      </div>

      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-8 h-8 text-sky-500" />
          <h1 className="text-3xl font-bold text-slate-800">Giỏ hàng</h1>
          <Badge className="bg-sky-100 text-sky-700 border-none text-lg px-3">
            {cartItems.length}
          </Badge>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 text-slate-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-slate-500 mb-2">
              Giỏ hàng trống
            </h3>
            <p className="text-slate-400 mb-8">
              Hãy khám phá các khóa học tuyệt vời và thêm vào giỏ hàng nhé!
            </p>
            <Button
              className="rounded-full bg-sky-500 hover:bg-sky-600 px-8 h-12"
              onClick={() => navigate("/courses")}
            >
              Khám phá khóa học <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart items list */}
            <div className="flex-1 space-y-4">
              {cartItems.map((item) => {
                const p = item.product;
                if (!p) return null;
                const isCombo = item.productModel === "Combo";
                const slug = p.slug;
                const oldPrice = isCombo ? p.originalPrice : p.oldPrice;
                const hasDiscount = oldPrice && oldPrice > p.price;

                return (
                  <Card
                    key={item._id}
                    className="p-4 sm:p-6 rounded-2xl border border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-4">
                      <img
                        src={
                          isCombo
                            ? p.courses?.[0]?.thumbnail || p.thumbnail
                            : p.thumbnail
                        }
                        alt={p.title}
                        className="w-28 h-20 sm:w-36 sm:h-24 object-cover rounded-xl shrink-0 cursor-pointer"
                        onClick={() =>
                          navigate(
                            isCombo ? `/combos/${slug}` : `/course/${slug}`
                          )
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isCombo ? (
                                <Badge className="bg-amber-100 text-amber-700 border-none text-xs">
                                  <Package className="w-3 h-3 mr-1" /> COMBO
                                </Badge>
                              ) : (
                                <Badge className="bg-sky-100 text-sky-700 border-none text-xs">
                                  <BookOpen className="w-3 h-3 mr-1" /> Khóa học
                                </Badge>
                              )}
                            </div>
                            <h3
                              className="font-bold text-slate-800 line-clamp-2 cursor-pointer hover:text-sky-500 transition-colors"
                              onClick={() =>
                                navigate(
                                  isCombo
                                    ? `/combos/${slug}`
                                    : `/course/${slug}`
                                )
                              }
                            >
                              {p.title}
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                              {p.instructor?.fullname || "Giảng viên ArtKids"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-red-500 shrink-0"
                            onClick={() =>
                              handleRemove(p._id, item.productModel)
                            }
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-lg font-bold text-sky-600">
                            {p.price === 0
                              ? "MIỄN PHÍ"
                              : `${p.price?.toLocaleString()}đ`}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-slate-400 line-through">
                              {oldPrice?.toLocaleString()}đ
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              <Button
                variant="outline"
                className="text-red-500 border-red-200 hover:bg-red-50 rounded-full"
                onClick={handleClearCart}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Xóa toàn bộ
              </Button>
            </div>

            {/* Order summary */}
            <div className="w-full lg:w-80 shrink-0">
              <Card className="p-6 rounded-3xl border-2 border-sky-100 sticky top-24 bg-gradient-to-br from-white to-sky-50">
                <h3 className="text-xl font-bold text-slate-800 mb-6">
                  Tóm tắt đơn hàng
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-slate-600">
                    <span>Số lượng</span>
                    <span className="font-bold">{cartItems.length} sản phẩm</span>
                  </div>
                  {totalSaved > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Giá gốc</span>
                      <span className="line-through">
                        {totalOldPrice.toLocaleString()}đ
                      </span>
                    </div>
                  )}
                  {totalSaved > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-4 h-4" /> Tiết kiệm
                      </span>
                      <span className="font-bold">
                        -{totalSaved.toLocaleString()}đ
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t-2 border-sky-100 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-slate-800">
                      Tổng cộng
                    </span>
                    <span className="text-2xl font-black text-sky-600">
                      {totalPrice === 0
                        ? "MIỄN PHÍ"
                        : `${totalPrice.toLocaleString()}đ`}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="w-full h-14 text-lg font-bold rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg"
                >
                  {checkingOut ? "Đang xử lý..." : "Thanh toán ngay"}
                </Button>

                <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Thanh toán an toàn qua
                  VNPay
                </p>
              </Card>
            </div>
          </div>
        )}
      </main>

      <div className="w-full bg-white mt-12">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <Footer />
        </div>
      </div>
    </div>
  );
}
