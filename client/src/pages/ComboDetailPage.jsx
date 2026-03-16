import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function ComboDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { refreshCart, refreshWishlist } = useCart();
  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [upgradeInfo, setUpgradeInfo] = useState(null);

  useEffect(() => {
    const fetchComboDetail = async () => {
      try {
        setLoading(true);
        const response = await comboApi.getComboBySlug(slug);
        setCombo(response.data.data);
        setUpgradeInfo(response.data.upgradeInfo);
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
    setIsEnrolled(false);
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
            item.product?._id === combo._id && item.productModel === "Combo",
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
    }, 4000);

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
      <div className="min-h-screen bg-surface scrapbook-bg">
        <Header onNavigate={navigate} />
        <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse">
          <div className="h-12 bg-white/50 rounded-full w-1/3 mb-10" />
          <div className="h-[500px] bg-white/50 rounded-[3rem] w-full" />
        </div>
      </div>
    );
  }

  if (!combo) return null;

  const displayPrice = combo.price === 0 ? "MIỄN PHÍ" : `${combo.price?.toLocaleString()}đ`;
  const originalPrice = combo.originalPrice?.toLocaleString();
  const discount = combo.discountPercentage;
  const instructorName = combo.instructor?.fullname || combo.instructor?.username || "Giảng viên ArtKids";

  return (
    <div className="min-h-screen bg-surface scrapbook-bg font-body text-on-surface selection:bg-primary/30">
      <Header onNavigate={navigate} />

      <main className="w-full max-w-7xl mx-auto px-6 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* LEFT COLUMN: Main Content */}
          <div className="w-full lg:w-2/3 space-y-12">
            
            {/* 1. Header & Intro */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge className="bg-primary-container text-on-primary-fixed border-none px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">package_2</span>
                  ARTIE COMBO
                </Badge>
                {discount > 0 && (
                  <Badge className="bg-error/10 text-error border-none px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    TIẾT KIỆM {discount}%
                  </Badge>
                )}
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-headline font-black text-on-surface leading-tight mb-8 tracking-tighter">
                {combo.title.split(' ').map((word, i) => (
                  <span key={i} className={i % 3 === 2 ? "text-primary italic" : ""}>{word} </span>
                ))}
              </h1>
              
              <div className="relative p-8 bg-white/40 backdrop-blur-sm rounded-[2.5rem] border-4 border-dashed border-outline-variant/10 scrapbook-card">
                 <span className="material-symbols-outlined absolute -top-5 -left-5 text-6xl text-primary/20 rotate-12 select-none">format_quote</span>
                 <p className="text-xl text-on-surface-variant font-medium leading-relaxed italic">
                    {combo.description}
                 </p>
              </div>
            </motion.div>

            {/* 2. Visual Showcase (Carousel) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative group scrapbook-card"
            >
              <div className="aspect-[16/9] rounded-[3.5rem] overflow-hidden shadow-premium border-8 border-white bg-surface-container relative">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={combo.courses?.[currentImageIndex]?.thumbnail || combo.thumbnail}
                    alt={combo.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.6, ease: "circOut" }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
                
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

                {/* Info chip */}
                <div className="absolute top-6 left-6 z-10">
                   <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3 border border-primary/10">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                        {currentImageIndex + 1}
                      </div>
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest leading-none">
                         Khóa học {currentImageIndex + 1} / {combo.courses?.length}
                      </p>
                   </div>
                </div>

                {/* Dots indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
                  {combo.courses?.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={cn(
                        "h-2.5 rounded-full transition-all duration-500",
                        idx === currentImageIndex ? "w-10 bg-primary shadow-[0_0_10px_rgba(253,192,3,0.5)]" : "w-2.5 bg-white/50 hover:bg-white"
                      )}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 3. Courses in Combo */}
            <div className="pt-8">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center text-primary shadow-sm rotate-3">
                  <span className="material-symbols-outlined text-3xl">menu_book</span>
                </div>
                <div>
                  <h2 className="text-3xl font-headline font-black text-on-surface tracking-tight">Kế hoạch học tập</h2>
                  <p className="text-on-surface-variant font-bold text-sm uppercase tracking-widest">Gồm {combo.courses?.length} chặng hành trình</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {combo.courses?.map((course, index) => (
                  <motion.div
                    key={course._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Card
                      className="p-3 pr-8 rounded-[2rem] border-none shadow-premium hover:shadow-2xl transition-all cursor-pointer bg-white group flex flex-col sm:flex-row items-center gap-6"
                      onClick={() => navigate(`/course/${course.slug}`)}
                    >
                      <div className="w-full sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden shrink-0">
                        <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                      </div>
                      
                      <div className="flex-1 py-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{course.category}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant/30"></span>
                          <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Chặng {index + 1}</span>
                        </div>
                        <h3 className="text-2xl font-headline font-black text-on-surface mb-4 group-hover:text-primary transition-colors">{course.title}</h3>
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                             <span className="material-symbols-outlined text-lg text-secondary">groups</span>
                             {course.totalStudents || 0} Bạn nhỏ
                          </div>
                          {course.sections?.length > 0 && (
                            <div className="flex items-center gap-2 text-xs font-bold text-on-surface-variant">
                              <span className="material-symbols-outlined text-lg text-primary">view_quilt</span>
                              {course.sections.length} Chương
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0 hidden sm:block">
                        <p className="text-[10px] font-black text-on-surface-variant/20 uppercase mb-1">Giá lẻ</p>
                        <p className="text-xl font-black text-on-surface/40 line-through text-sm">{course.price?.toLocaleString()}đ</p>
                        <p className="text-2xl font-black text-primary tracking-tighter">Miễn phí</p>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 4. Instructor Card */}
            <Card className="p-10 rounded-[3rem] bg-surface-container-low border-2 border-primary/10 scrapbook-card rotate-[0.5deg]">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative">
                  <Avatar className="w-28 h-28 border-4 border-white shadow-xl ring-2 ring-primary/20">
                    <AvatarImage src={combo.instructor?.avatar} alt={instructorName} />
                    <AvatarFallback className="bg-primary text-on-primary text-3xl font-black">
                      {instructorName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 bg-on-secondary-container text-secondary-container p-2 rounded-xl shadow-lg rotate-12">
                    <span className="material-symbols-outlined text-xl">palette</span>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                   <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2 leading-none">Họa sĩ hướng dẫn</p>
                   <h4 className="text-3xl font-headline font-black text-on-surface mb-3 tracking-tight">{instructorName}</h4>
                   <p className="text-on-surface-variant font-medium leading-relaxed max-w-sm">
                      Người truyền cảm hứng và cùng bé khám phá thế giới nghệ thuật đầy màu sắc tại ArtKids Studio.
                   </p>
                </div>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Action Card (Sticky) */}
          <div className="w-full lg:w-1/3 lg:sticky lg:top-28">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-8 lg:p-10 rounded-[3.5rem] border-none shadow-premium bg-white relative overflow-hidden scrapbook-card rotate-[-0.5deg]">
                {/* Decorative background circle */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 space-y-8">
                  {/* Pricing Display */}
                  <div className="space-y-2">
                    {upgradeInfo && !upgradeInfo.isFullyOwned ? (
                      <div className="space-y-4">
                        <div className="bg-primary/5 rounded-3xl p-6 border-2 border-dashed border-primary/20">
                           <div className="flex items-center gap-3 mb-3">
                              <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                              <span className="font-black text-xs uppercase text-on-surface tracking-widest">
                                Bé đã có {upgradeInfo.ownedCourses.length} khóa
                              </span>
                           </div>
                           <p className="text-[11px] font-bold text-on-surface-variant/70 leading-relaxed">
                               Cơ hội vàng để sở hữu {upgradeInfo.unownedCourses.length} phần còn lại với mức giá ưu đãi nhất!
                           </p>
                        </div>
                        
                        <div>
                           <p className="text-[10px] font-black text-on-surface-variant/30 uppercase tracking-widest pl-1 mb-1">Giá trị thật ({combo.courses.length} khóa): {upgradeInfo.unownedOriginalPrice?.toLocaleString()}đ</p>
                           <div className="flex items-center gap-2">
                              <span className="text-5xl font-black text-on-surface tracking-tighter">{upgradeInfo.upgradePrice?.toLocaleString()}đ</span>
                              <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span>
                           </div>
                        </div>
                      </div>
                    ) : upgradeInfo?.isFullyOwned ? (
                      <div className="text-center py-6">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12">
                           <span className="material-symbols-outlined text-5xl text-primary">emoji_events</span>
                        </div>
                        <h4 className="text-2xl font-headline font-black text-on-surface mb-3 tracking-tight">Tuyệt vời quá!</h4>
                        <p className="text-on-surface-variant font-medium leading-relaxed">
                           Bé đã sở hữu trọn bộ hành trình này rồi. Hãy cùng sáng tạo thật nhiều tác phẩm nhé!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {combo.originalPrice > combo.price && (
                          <div className="flex items-center gap-3">
                            <span className="text-xl text-on-surface-variant/30 line-through font-black">{originalPrice}đ</span>
                            <Badge className="bg-error/10 text-error border-none px-3 py-1 rounded-lg font-black text-[9px] uppercase tracking-widest">-{discount}%</Badge>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                           <span className="text-6xl font-black text-on-surface tracking-tighter">{displayPrice}</span>
                           <span className="material-symbols-outlined text-secondary text-3xl animate-pulse">loyalty</span>
                        </div>
                        {discount > 0 && (
                          <p className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] pl-1">
                             Tiết kiệm ngay {(combo.originalPrice - combo.price).toLocaleString()}đ
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary Features */}
                  <div className="py-8 border-y-2 border-dashed border-outline-variant/10 space-y-4">
                     <div className="flex items-center gap-4 text-on-surface font-black text-xs uppercase tracking-widest">
                        <span className="material-symbols-outlined text-primary">full_coverage</span>
                        Trọn bộ {combo.courses?.length} khóa học
                     </div>
                     <div className="flex items-center gap-4 text-on-surface font-black text-xs uppercase tracking-widest">
                        <span className="material-symbols-outlined text-secondary">update</span>
                        Cập nhật bài học trọn đời
                     </div>
                     <div className="flex items-center gap-4 text-on-surface font-black text-xs uppercase tracking-widest">
                        <span className="material-symbols-outlined text-on-surface-variant/40">all_inclusive</span>
                        Học mọi lúc, mọi nơi
                     </div>
                  </div>

                  {/* Action Buttons */}
                  {!isEnrolled && (
                    <div className="space-y-4">
                      <button
                        onClick={async () => {
                          if (!isAuthenticated) { navigate("/login"); return; }
                          try {
                            const res = await cartApi.addToCart(combo._id, "Combo");
                            await refreshCart();
                            toast.success("Đã thêm vào giỏ hàng!");
                          } catch (e) {
                            toast.error(e?.response?.data?.message || "Lỗi khi thêm vào giỏ.");
                          }
                        }}
                        className="w-full h-16 rounded-2xl gummy-button bg-primary text-on-primary font-headline font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl"
                      >
                         <span className="material-symbols-outlined">shopping_cart</span>
                         Thêm vào giỏ hàng
                      </button>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <button
                           onClick={async () => {
                             if (!isAuthenticated) { navigate("/login"); return; }
                             try {
                               if (isInWishlist) {
                                 await wishlistApi.removeFromWishlist(combo._id, "Combo");
                                 setIsInWishlist(false);
                                 toast.success("Đã xóa khỏi yêu thích.");
                               } else {
                                 await wishlistApi.addToWishlist(combo._id, "Combo");
                                 setIsInWishlist(true);
                                 toast.success("Đã thêm vào yêu thích!");
                               }
                               await refreshWishlist();
                             } catch (e) { toast.error("Có lỗi xảy ra."); }
                           }}
                           className={cn(
                             "h-14 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all",
                             isInWishlist ? "bg-error/10 border-error/20 text-error" : "bg-white border-outline-variant/10 text-on-surface-variant hover:bg-surface-container"
                           )}
                         >
                           <span className={cn("material-symbols-outlined text-xl", isInWishlist && "fill-1")}>favorite</span>
                           {isInWishlist ? "Đã lưu" : "Lưu lại"}
                         </button>

                         <button
                           onClick={handleEnroll}
                           disabled={enrolling || combo.status !== 'published'}
                           className="h-14 rounded-2xl border-2 border-primary/20 bg-white text-primary font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
                         >
                           <span className="material-symbols-outlined text-xl">rocket_launch</span>
                           Mua ngay
                         </button>
                      </div>
                    </div>
                  )}

                  {/* Promo Badge */}
                  {discount > 0 && !upgradeInfo?.isFullyOwned && (
                    <div className="bg-secondary-container/30 rounded-3xl p-6 border-b-4 border-secondary-container">
                       <h5 className="font-black text-on-secondary-container text-[11px] uppercase tracking-widest mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">auto_awesome</span>
                          Đặc quyền Artie
                       </h5>
                       <p className="text-[10px] font-bold text-on-secondary-container/70 leading-relaxed italic">
                          "Bé sẽ được nhận quà tặng bí mật và chứng chỉ hoàn thành sau khi kết thúc chặng học cuối cùng nha!"
                       </p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
