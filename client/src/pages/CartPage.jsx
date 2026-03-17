import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "@/components/landing";
import { useAuth } from "@/context/AuthContext";
import cartApi from "@/api/cartApi";
import paymentApi from "@/api/paymentApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function CartPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { refreshCart } = useCart();
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
            ),
        ),
      );
      await refreshCart();
      toast.success("Đã xóa khỏi giỏ hàng.");
    } catch {
      toast.error("Không xóa được.");
    }
  };

  const handleClearCart = async () => {
    try {
      await cartApi.clearCart();
      setCartItems([]);
      await refreshCart();
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
        await refreshCart();
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
        error?.response?.data?.message || "Thanh toán thất bại. Thử lại sau!",
      );
    } finally {
      setCheckingOut(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0),
    0,
  );

  const totalOldPrice = cartItems.reduce((sum, item) => {
    const p = item.product;
    if (!p) return sum;
    if (item.productModel === "Combo")
      return sum + (p.originalPrice || p.price || 0);
    return sum + (p.oldPrice || p.price || 0);
  }, 0);

  const totalSaved = totalOldPrice - totalPrice;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface scrapbook-bg">
        <Header onNavigate={navigate} />
        <div className="max-w-7xl mx-auto px-6 py-12 animate-pulse">
          <div className="h-20 bg-surface-container rounded-xl w-1/3 mb-10" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-40 bg-surface-container rounded-xl" />
              <div className="h-40 bg-surface-container rounded-xl" />
            </div>
            <div className="lg:col-span-4">
              <div className="h-80 bg-surface-container rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface scrapbook-bg min-h-screen font-body flex flex-col">
      <Header onNavigate={navigate} />

      <main className="max-w-7xl mx-auto px-6 py-12 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Side: Cart Items */}
          <div className="lg:col-span-8 space-y-10">
            <header className="relative inline-block mb-4">
              <h1 className="font-headline text-5xl font-extrabold text-on-background relative z-10">
                Giỏ hàng của bạn
              </h1>
              <div className="absolute -bottom-2 -left-2 w-full h-4 bg-tertiary-container/40 -rotate-1 -z-0 rounded-full"></div>
            </header>

            {cartItems.length === 0 ? (
              <div className="text-center py-24 bg-surface-container-lowest rounded-[2rem] border-4 border-dashed border-outline-variant/20">
                <span className="material-symbols-outlined text-8xl text-outline-variant/30 mb-6">
                  shopping_basket
                </span>
                <h3 className="text-3xl font-headline font-bold text-on-surface-variant mb-4">
                  Hộp bút màu đang trống!
                </h3>
                <p className="text-on-surface-variant mb-10">
                  Hãy rủ Artie đi tìm những bài học vẽ thú vị ngay nào!
                </p>
                <button
                  onClick={() => navigate("/courses")}
                  className="gummy-button px-10 py-4 rounded-full font-headline font-bold text-lg text-on-primary-fixed"
                >
                  Khám phá khóa học ngay
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => {
                  const p = item.product;
                  if (!p) return null;
                  const isCombo = item.productModel === "Combo";
                  const slug = p.slug;
                  const oldPrice = isCombo ? p.originalPrice : p.oldPrice;
                  const hasDiscount = oldPrice && oldPrice > p.price;

                  return (
                    <div
                      key={item._id}
                      className="group relative bg-surface-container-lowest rounded-xl p-6 flex flex-col md:flex-row gap-6 transition-all hover:shadow-xl hover:shadow-on-surface/5 border border-outline-variant/10 scrapbook-card"
                    >
                      <div
                        className={cn(
                          "w-full md:w-48 h-32 md:h-40 rounded-lg overflow-hidden shrink-0 cursor-pointer group-hover:scale-[1.02] transition-transform",
                          isCombo ? "bg-amber-100" : "bg-secondary-container",
                        )}
                        onClick={() =>
                          navigate(
                            isCombo ? `/combo/${slug}` : `/course/${slug}`,
                          )
                        }
                      >
                        <img
                          src={
                            isCombo
                              ? p.courses?.[0]?.thumbnail || p.thumbnail
                              : p.thumbnail
                          }
                          alt={p.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-grow flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="min-w-0">
                            <span
                              className={cn(
                                "inline-block px-3 py-1 text-[10px] font-black rounded-full mb-2",
                                isCombo
                                  ? "bg-amber-100 text-amber-900"
                                  : "bg-secondary-container text-on-secondary-container",
                              )}
                            >
                              {isCombo ? "COMBO" : "KHÓA HỌC"}
                            </span>
                            <h3
                              className="font-headline text-2xl font-bold line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                              onClick={() =>
                                navigate(
                                  isCombo
                                    ? `/combo/${slug}`
                                    : `/course/${slug}`,
                                )
                              }
                            >
                              {p.title}
                            </h3>
                            <p className="text-on-surface-variant text-sm mt-1 font-medium">
                              Bé học cùng:{" "}
                              {p.instructor?.fullname || "Ms. Sarah"}
                            </p>
                          </div>
                          <div className="text-right shrink-0 ml-4">
                            <div className="font-headline text-2xl font-black text-primary">
                              {p.price === 0
                                ? "MIỄN PHÍ"
                                : `${p.price?.toLocaleString()}đ`}
                            </div>
                            {hasDiscount && (
                              <div className="text-on-surface-variant/40 line-through text-xs font-bold">
                                {oldPrice.toLocaleString()}đ
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-6 pt-4 border-t border-outline-variant/5">
                          <div className="flex items-center gap-2 text-tertiary">
                            <span className="material-symbols-outlined text-sm">
                              verified_user
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-on-tertiary-container">
                              Truy cập trọn đời
                            </span>
                          </div>
                          <button
                            onClick={() =>
                              handleRemove(p._id, item.productModel)
                            }
                            className="flex items-center gap-2 text-error hover:text-error-dim transition-colors font-black text-[10px] uppercase tracking-wider"
                          >
                            <span className="material-symbols-outlined text-lg">
                              delete
                            </span>
                            Xóa khỏi hộp
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-between items-center py-4 px-2">
                  <button
                    onClick={() => navigate("/courses")}
                    className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-bold text-sm"
                  >
                    <span className="material-symbols-outlined">
                      arrow_back
                    </span>
                    Tiếp tục thêm bài học
                  </button>
                  <button
                    onClick={handleClearCart}
                    className="flex items-center gap-2 text-on-surface-variant/50 hover:text-error transition-colors font-bold text-xs"
                  >
                    Dọn dẹp hộp bút màu
                  </button>
                </div>
              </div>
            )}

            {/* Gift Message Area */}
            {cartItems.length > 0 && (
              <div className="bg-surface-container-low rounded-xl p-8 border-2 border-dashed border-outline-variant/30">
                <div className="flex items-center gap-3 mb-4">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    featured_seasonal_and_gifts
                  </span>
                  <h2 className="font-headline text-2xl font-bold">
                    Quà tặng đặc biệt?
                  </h2>
                </div>
                <p className="text-on-surface-variant mb-4 font-medium text-sm">
                  Gửi gắm lời chúc yêu thương cho bé! Artie sẽ chuẩn bị một tấm
                  thiệp điện tử thật xinh xắn cho bài học này nhé.
                </p>
                <textarea
                  className="w-full h-32 rounded-lg border-2 border-outline-variant/10 bg-surface-container-lowest focus:ring-4 focus:ring-primary/10 text-on-surface p-4 placeholder:text-on-surface-variant/30 transition-all outline-none"
                  placeholder="Viết lời động viên dành cho họa sĩ nhí ở đây..."
                ></textarea>
              </div>
            )}
          </div>

          {/* Right Side: Order Summary */}
          {cartItems.length > 0 && (
            <div className="lg:col-span-4">
              <div className="sticky top-28 bg-surface-container-high rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
                <h2 className="font-headline text-2xl font-bold mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">
                    receipt_long
                  </span>
                  Đơn hàng nè
                </h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-on-surface-variant font-medium">
                    <span>Sản phẩm ({cartItems.length})</span>
                    <span>{totalOldPrice.toLocaleString()}đ</span>
                  </div>
                  {totalSaved > 0 && (
                    <div className="flex justify-between text-tertiary font-bold">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          auto_awesome
                        </span>
                        Artie giảm cho bé
                      </span>
                      <span>-{totalSaved.toLocaleString()}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-on-surface-variant font-medium">
                    <span>Phí "màu vẽ"</span>
                    <span className="text-tertiary">FREE</span>
                  </div>

                  <div className="pt-6 border-t border-outline-variant/20 flex justify-between items-baseline">
                    <span className="font-headline text-xl font-bold">
                      Tổng cộng
                    </span>
                    <span className="font-headline text-3xl font-black text-primary">
                      {totalPrice === 0
                        ? "MIỄN PHÍ"
                        : `${totalPrice.toLocaleString()}đ`}
                    </span>
                  </div>
                </div>

                {/* Crayon Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="crayon-button w-full py-6 flex items-center justify-center group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-on-primary-fixed font-headline font-black text-xl mr-8">
                    {checkingOut ? "Đang xử lý..." : "Thanh Toán Ngay"}
                  </span>
                  <span className="material-symbols-outlined text-on-primary-fixed group-hover:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </button>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-sm">
                      verified
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Thanh toán an toàn 100%
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant/70">
                    <span className="material-symbols-outlined text-sm">
                      history
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Đổi trả niềm vui trong 7 ngày
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
