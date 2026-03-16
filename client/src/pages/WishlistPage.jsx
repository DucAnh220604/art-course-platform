import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "@/components/landing";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import wishlistApi from "@/api/wishlistApi";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function WishlistPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { refreshWishlist, refreshCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    fetchWishlist();
  }, [isAuthenticated, currentPage]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await wishlistApi.getWishlist({ 
        page: currentPage, 
        limit: ITEMS_PER_PAGE 
      });
      
      const payload = res.data || {};
      const wishlistData = payload.wishlist || payload.data || [];
      
      const pagination = payload.pagination || {};
      const totalP = pagination.totalPages || payload.totalPages || 1;
      const totalI = pagination.total || payload.totalItems || 0;

      setWishlistItems(wishlistData);
      setTotalPages(totalP);
      setTotalItems(totalI);
    } catch (error) {
      console.error("Fetch Wishlist Error:", error);
      toast.error("Không tải được danh sách yêu thích.");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleRemove = async (productId, productModel) => {
    try {
      await wishlistApi.removeFromWishlist(productId, productModel);
      await refreshWishlist();
      toast.success("Đã xóa khỏi danh sách yêu thích.");
      if (wishlistItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchWishlist();
      }
    } catch {
      toast.error("Không xóa được.");
    }
  };

  const handleMoveToCart = async (productId, productModel) => {
    try {
      await wishlistApi.moveToCart(productId, productModel);
      await Promise.all([refreshWishlist(), refreshCart()]);
      toast.success("Đã chuyển sang giỏ hàng!");
      if (wishlistItems.length === 1 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else {
        fetchWishlist();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không chuyển được sang giỏ hàng.",
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface scrapbook-bg">
        <Header onNavigate={navigate} />
        <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[450px] bg-white/50 rounded-[2.5rem] animate-pulse border-2 border-outline-variant/5" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface scrapbook-bg font-body">
      <Header onNavigate={navigate} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 lg:py-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="relative">
            <div className="absolute -top-10 -left-6 text-primary/10 select-none pointer-events-none">
              <span className="material-symbols-outlined text-8xl">favorite</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-headline font-black text-on-surface tracking-tight relative z-10">
              Góc <span className="text-primary italic">Yêu Thích</span>
            </h1>
            <p className="text-on-surface-variant font-bold text-lg mt-2 flex items-center gap-2">
              <span className="w-8 h-1 bg-primary rounded-full"></span>
              Bé đã lưu {totalItems} điều tuyệt vời ở đây
            </p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-white/40 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-outline-variant/20"
          >
            <div className="w-32 h-32 rounded-full bg-primary-container/30 flex items-center justify-center mx-auto mb-8 rotate-12">
              <span className="material-symbols-outlined text-7xl text-primary/50">heart_broken</span>
            </div>
            <h3 className="text-3xl font-headline font-black text-on-surface mb-4">
              Hộp yêu thích đang trống trơn...
            </h3>
            <p className="text-on-surface-variant font-medium text-lg mb-10 max-w-md mx-auto leading-relaxed">
              Bạn Artie chưa thấy bé thả tim khóa học nào hết! Hãy cùng khám phá những bài học vẽ siêu vui nhé!
            </p>
            <button
              className="gummy-button bg-primary text-on-primary px-10 py-4 rounded-2xl font-black text-lg shadow-xl inline-flex items-center gap-2"
              onClick={() => navigate("/courses")}
            >
              ĐI XEM KHÓA HỌC THÔI
              <span className="material-symbols-outlined">rocket_launch</span>
            </button>
          </motion.div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {wishlistItems.map((item, idx) => {
                  const p = item.product;
                  if (!p) return null;
                  const isCombo = item.productModel === "Combo";
                  const slug = p.slug;
                  const oldPrice = isCombo ? p.originalPrice : p.oldPrice;
                  const hasDiscount = oldPrice && oldPrice > p.price;
                  const instructorName = p.instructor?.fullname || "Họa sĩ ArtKids";

                  return (
                    <motion.div
                      layout
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group"
                    >
                      <div className={cn(
                        "relative bg-white rounded-[2.5rem] overflow-hidden shadow-premium hover:shadow-2xl transition-all duration-500 h-full flex flex-col scrapbook-card",
                        idx % 3 === 0 ? "rotate-[-1deg]" : idx % 3 === 1 ? "rotate-[1deg]" : "rotate-[-0.5deg]"
                      )}>
                        {/* Thumbnail */}
                        <div className="relative aspect-[16/11] overflow-hidden group/thumb">
                          <img
                            src={isCombo ? p.courses?.[0]?.thumbnail || p.thumbnail : p.thumbnail}
                            alt={p.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onClick={() => navigate(isCombo ? `/combos/${slug}` : `/course/${slug}`)}
                          />
                          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                          
                          {/* Badges */}
                          <div className="absolute top-5 left-5 flex flex-col gap-2">
                            {isCombo ? (
                              <Badge className="bg-primary text-on-primary border-none px-4 py-1.5 rounded-full font-black text-[10px] shadow-lg tracking-widest uppercase">
                                <span className="material-symbols-outlined text-xs mr-1">package</span> COMBO BỘ
                              </Badge>
                            ) : (
                              <Badge className="bg-secondary-container text-on-secondary-container border-none px-4 py-1.5 rounded-full font-black text-[10px] shadow-sm tracking-widest uppercase">
                                {p.category || "HỌC VẼ"}
                              </Badge>
                            )}
                          </div>

                          {/* Discount % */}
                          {hasDiscount && (
                            <div className="absolute top-0 right-0 p-3">
                              <div className="bg-error text-white font-black text-xs w-12 h-12 rounded-full flex items-center justify-center shadow-lg rotate-12">
                                -{p.discountPercentage}%
                              </div>
                            </div>
                          )}

                          {/* Remove button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemove(p._id, item.productModel);
                            }}
                            className="absolute bottom-5 right-5 w-12 h-12 rounded-2xl bg-white/90 text-on-surface hover:bg-error hover:text-white flex items-center justify-center shadow-xl transition-all translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 backdrop-blur-md"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="w-8 h-8 ring-2 ring-primary/10">
                              <AvatarImage src={p.instructor?.avatar} />
                              <AvatarFallback className="bg-primary-container text-primary font-black text-[10px]">
                                {instructorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{instructorName}</span>
                          </div>

                          <h3 
                            className="text-xl font-headline font-black text-on-surface line-clamp-2 mb-4 hover:text-primary transition-colors cursor-pointer leading-tight h-14"
                            onClick={() => navigate(isCombo ? `/combos/${slug}` : `/course/${slug}`)}
                          >
                            {p.title}
                          </h3>

                          {/* Stats Row */}
                          <div className="flex items-center gap-5 text-on-surface-variant/60 font-bold text-[11px] mb-8">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-primary/40">group</span>
                              {p.totalStudents || 0} bạn học
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-base text-secondary/40">video_library</span>
                              {isCombo ? `${p.courses?.length || 0} khóa` : "Nhiều bài giảng"}
                            </div>
                          </div>

                          {/* Price & Action */}
                          <div className="mt-auto pt-6 border-t-2 border-dashed border-outline-variant/10">
                            <div className="flex items-center justify-between mb-6">
                              <div>
                                {hasDiscount && (
                                  <p className="text-[10px] font-black text-on-surface-variant/30 line-through leading-none mb-1 uppercase tracking-widest">
                                    {oldPrice?.toLocaleString()}đ
                                  </p>
                                )}
                                <p className="text-2xl font-black text-on-surface tracking-tighter">
                                  {p.price === 0 ? "MIỄN PHÍ" : `${p.price?.toLocaleString()}đ`}
                                </p>
                              </div>
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="material-symbols-outlined text-primary fill-primary">favorite</span>
                              </div>
                            </div>

                            <button
                              className="w-full h-14 rounded-2xl gummy-button bg-primary text-on-primary font-headline font-black text-sm shadow-lg flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                              onClick={() => handleMoveToCart(p._id, item.productModel)}
                            >
                              <span className="material-symbols-outlined">shopping_cart</span>
                              THÊM VÀO GIỎ HÀNG
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-20">
                <button
                  className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-on-surface disabled:opacity-30 disabled:shadow-none hover:bg-primary hover:text-white transition-all scrapbook-card"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "w-12 h-12 rounded-2xl font-black transition-all scrapbook-card",
                        currentPage === page 
                          ? "bg-primary text-on-primary shadow-lg -rotate-2" 
                          : "bg-white text-on-surface hover:bg-surface-container shadow-md"
                      )}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  className="w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-on-surface disabled:opacity-30 disabled:shadow-none hover:bg-primary hover:text-white transition-all scrapbook-card"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
