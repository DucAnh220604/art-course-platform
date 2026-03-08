import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Users,
  BookOpen,
  CheckCircle2,
  Package,
  Sparkles,
  ShoppingCart,
  Heart,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import comboApi from "@/api/comboApi";
import userApi from "@/api/userApi";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import paymentApi from "@/api/paymentApi";
import cartApi from "@/api/cartApi";
import wishlistApi from "@/api/wishlistApi";

export function ComboDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const fetchComboDetail = async () => {
      try {
        setLoading(true);
        const response = await comboApi.getComboBySlug(slug);
        setCombo(response.data.data);
      } catch (error) {
        toast.error("Ối, không tìm thấy combo này rồi!", {
          description: "Bé quay lại danh sách chọn combo khác nhé! 🎨",
        });
        navigate("/combos");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchComboDetail();
  }, [slug, navigate]);

  useEffect(() => {
    if (!combo || !isAuthenticated) return;

    userApi
      .checkComboEnrollment(combo._id)
      .then((res) => setIsEnrolled(res.data.isEnrolled))
      .catch(() => {});
  }, [combo, isAuthenticated, user]);

  useEffect(() => {
    if (!combo || !isAuthenticated) return;
    wishlistApi
      .getWishlist()
      .then((res) => {
        const items = res.data.data || [];
        const found = items.some(
          (item) =>
            item.product?._id === combo._id && item.productModel === "Combo"
        );
        setIsInWishlist(found);
      })
      .catch(() => {});
  }, [combo, isAuthenticated]);

  useEffect(() => {
    if (!combo?.courses || combo.courses.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % combo.courses.length,
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [combo?.courses]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập!", {
        description: "Vui lòng đăng nhập để đăng ký combo nhé! 🔐",
      });
      navigate("/login");
      return;
    }

    try {
      setEnrolling(true);

      const res = await paymentApi.createPayment({
        itemType: "combo",
        itemId: combo._id,
      });

      const data = res.data;

      if (data.flow === "free") {
        await refreshUser();
        setIsEnrolled(true);
        toast.success(data.message || "Đăng ký combo thành công!");
        return;
      }

      if (data.flow === "vnpay" && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      toast.error("Không tạo được phiên thanh toán.");
    } catch (error) {
      toast.error("Không đăng ký được!", {
        description: error?.response?.data?.message || "Bé thử lại sau nhé! ❌",
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onNavigate={navigate} />
        <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse">
          <div className="h-10 bg-slate-200 rounded-full w-1/3 mb-6" />
          <div className="h-96 bg-slate-200 rounded-[40px] w-full" />
        </div>
      </div>
    );
  }

  if (!combo) return null;

  const displayPrice =
    combo.price === 0 ? "MIỄN PHÍ" : `${combo.price?.toLocaleString()}đ`;
  const originalPrice = combo.originalPrice?.toLocaleString();
  const discount = combo.discountPercentage;

  return (
    <div className="min-h-screen bg-slate-50/50 overflow-x-hidden">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <Header onNavigate={navigate} />
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* CỘT TRÁI: Nội dung chính */}
          <div className="w-full lg:w-2/3 space-y-10">
            {/* 1. Tiêu đề & Giới thiệu */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-4 py-1 rounded-full font-bold">
                  <Package className="w-4 h-4 mr-1" />
                  COMBO
                </Badge>
                {discount > 0 && (
                  <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-4 py-1 rounded-full font-bold">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Giảm {discount}%
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-6">
                {combo.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {combo.description}
              </p>
            </div>

            {/* Thumbnail Carousel */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src={
                  combo.courses?.[currentImageIndex]?.thumbnail ||
                  combo.thumbnail ||
                  "/placeholder-course.jpg"
                }
                alt={`${combo.title} - Khóa học ${currentImageIndex + 1}`}
                className="w-full h-80 object-cover transition-opacity duration-500"
                key={currentImageIndex}
              />
              {combo.courses && combo.courses.length > 1 && (
                <>
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {combo.courses.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`transition-all ${
                          index === currentImageIndex
                            ? "w-8 h-3 bg-white"
                            : "w-3 h-3 bg-white/50 hover:bg-white/75"
                        } rounded-full`}
                      />
                    ))}
                  </div>
                  <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {combo.courses.length}
                  </div>
                </>
              )}
            </div>

            {/* Thông tin Giảng viên */}
            <Card className="p-6 rounded-3xl border-2 border-sky-100">
              <h3 className="text-xl font-bold mb-4 text-slate-800">
                Giảng viên
              </h3>
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16 border-4 border-sky-200">
                  <AvatarImage
                    src={combo.instructor?.avatar}
                    alt={combo.instructor?.fullname}
                  />
                  <AvatarFallback className="bg-sky-100 text-sky-700 text-xl">
                    {combo.instructor?.fullname?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-bold text-lg">
                    {combo.instructor?.fullname || combo.instructor?.username}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {combo.instructor?.email}
                  </p>
                </div>
              </div>
            </Card>

            {/* Danh sách khóa học trong combo */}
            <div>
              <h2 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <BookOpen className="w-8 h-8 text-sky-500" />
                Các khóa học trong combo ({combo.courses?.length})
              </h2>
              <div className="space-y-4">
                {combo.courses?.map((course, index) => (
                  <Card
                    key={course._id}
                    className="p-6 rounded-2xl border-2 border-slate-100 hover:border-sky-200 transition-all hover:shadow-lg cursor-pointer"
                    onClick={() => navigate(`/course/${course.slug}`)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-600 font-bold flex items-center justify-center text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                              {course.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <Badge variant="outline">{course.category}</Badge>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {course.totalStudents || 0} học viên
                              </span>
                              {course.sections?.length > 0 && (
                                <span>{course.sections.length} chương học</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">Giá lẻ</p>
                            <p className="text-lg font-semibold text-sky-600">
                              {course.price?.toLocaleString()}đ
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: Card mua hàng (Sticky) */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-24">
            <Card className="p-8 rounded-3xl border-4 border-sky-200 shadow-2xl bg-gradient-to-br from-white to-sky-50">
              <div className="space-y-6">
                {/* Giá */}
                <div>
                  <div className="flex items-baseline gap-3">
                    {combo.originalPrice > combo.price && (
                      <span className="text-2xl text-slate-400 line-through">
                        {originalPrice}đ
                      </span>
                    )}
                  </div>
                  <div className="text-5xl font-bold text-amber-600 mt-2">
                    {displayPrice}
                  </div>
                  {discount > 0 && (
                    <div className="mt-2 inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">
                      Tiết kiệm:{" "}
                      {(combo.originalPrice - combo.price).toLocaleString()}đ
                    </div>
                  )}
                </div>

                {/* Thông tin */}
                <div className="space-y-3 py-6 border-y-2 border-sky-100">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Package className="w-5 h-5 text-sky-600" />
                    <span className="font-semibold">
                      {combo.courses?.length} khóa học
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Users className="w-5 h-5 text-sky-600" />
                    <span>{combo.totalStudents || 0} học viên đã tham gia</span>
                  </div>
                  {combo.averageRating > 0 && (
                    <div className="flex items-center gap-3 text-slate-700">
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span>
                        {combo.averageRating.toFixed(1)} ({combo.numOfReviews}{" "}
                        đánh giá)
                      </span>
                    </div>
                  )}
                </div>

                {/* Button đăng ký */}
                {isEnrolled ? (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                    <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 font-semibold">
                      Bạn đã tham gia combo này!
                    </p>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={async () => {
                        if (!isAuthenticated) {
                          toast.error("Vui lòng đăng nhập!");
                          navigate("/login");
                          return;
                        }
                        try {
                          await cartApi.addToCart(combo._id, "Combo");
                          toast.success("Đã thêm vào giỏ hàng!");
                        } catch (e) {
                          toast.error(e?.response?.data?.message || "Không thêm được vào giỏ hàng.");
                        }
                      }}
                      className="w-full py-6 text-lg font-bold rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Thêm vào giỏ hàng
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        if (!isAuthenticated) {
                          toast.error("Vui lòng đăng nhập!");
                          navigate("/login");
                          return;
                        }
                        try {
                          if (isInWishlist) {
                            await wishlistApi.removeFromWishlist(combo._id, "Combo");
                            setIsInWishlist(false);
                            toast.success("Đã xóa khỏi danh sách yêu thích.");
                          } else {
                            await wishlistApi.addToWishlist(combo._id, "Combo");
                            setIsInWishlist(true);
                            toast.success("Đã thêm vào danh sách yêu thích!");
                          }
                        } catch (e) {
                          toast.error(e?.response?.data?.message || "Không thực hiện được.");
                        }
                      }}
                      className={`w-full py-4 font-bold rounded-2xl border-2 transition-all ${
                        isInWishlist
                          ? "border-rose-400 bg-rose-50 text-rose-600"
                          : "border-rose-200 text-rose-500 hover:bg-rose-50"
                      }`}
                    >
                      <Heart className={`w-5 h-5 mr-2 ${isInWishlist ? "fill-rose-500" : ""}`} />
                      {isInWishlist ? "Đã yêu thích" : "Yêu thích"}
                    </Button>
                    <Button
                      onClick={handleEnroll}
                      disabled={enrolling || combo.status !== "published"}
                      variant="outline"
                      className="w-full py-4 font-bold rounded-2xl border-2 border-amber-200 text-amber-600 hover:bg-amber-50"
                    >
                      {enrolling
                        ? "Đang xử lý..."
                        : combo.status !== "published"
                          ? "Combo chưa được phát hành"
                          : "Mua ngay"}
                    </Button>
                  </>
                )}

                {/* Ưu đãi */}
                {discount > 0 && (
                  <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                    <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      Ưu đãi đặc biệt
                    </h4>
                    <ul className="space-y-1 text-sm text-amber-700">
                      <li>✓ Tiết kiệm {discount}% so với mua lẻ</li>
                      <li>✓ Truy cập trọn đời tất cả khóa học</li>
                      <li>✓ Học linh hoạt theo tiến độ riêng</li>
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
