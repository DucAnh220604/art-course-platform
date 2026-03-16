import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Users,
  BookOpen,
  PlayCircle,
  CheckCircle2,
  ShieldCheck,
  Video,
  ChevronDown,
  ShoppingCart,
  Heart,
  Package,
  TrendingUp,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import courseApi from "@/api/courseApi";
import userApi from "@/api/userApi";
import { toast } from "sonner";
import { ReviewSection } from "@/components/courses/ReviewSection";
import { useAuth } from "@/context/AuthContext";
import paymentApi from "@/api/paymentApi";
import cartApi from "@/api/cartApi";
import wishlistApi from "@/api/wishlistApi";
import comboApi from "../api/comboApi";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

export function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const { refreshCart, refreshWishlist } = useCart();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [relatedCombos, setRelatedCombos] = useState([]);

  const [courseInCart, setCourseInCart] = useState(null);

  // Theo dõi bài học đã hoàn thành
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const ytPlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const markedCompleteRef = useRef(new Set());

  const getEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.startsWith("http")) {
      // Đã là full URL, thay /watch?v= bằng /embed/
      try {
        const url = new URL(videoUrl);
        if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
          return url.searchParams.get("v");
        }
        if (url.hostname === "youtu.be") {
          return url.pathname.slice(1);
        }
        return videoUrl;
      } catch {
        return videoUrl;
      }
    }
    // Chỉ là video ID
    return videoUrl;
  };

  // Khởi tạo YouTube IFrame API một lần
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  // Tạo/cập nhật player khi lesson thay đổi
  const currentVideoId = selectedLesson
    ? getEmbedUrl(selectedLesson.videoUrl)
    : course
      ? getEmbedUrl(
          course.sections
            ?.flatMap((s) => s.lessonsId || [])
            .find((l) => l.isTrial)?.videoUrl,
        )
      : null;

  const destroyPlayer = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (_) {}
      ytPlayerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isPlayingPreview || !currentVideoId) return;

    const lessonId = selectedLesson?._id;
    const canTrack = isEnrolled && isAuthenticated && lessonId;

    const createPlayer = () => {
      destroyPlayer();
      const container = document.getElementById("yt-player-container");
      if (!container) return;
      container.innerHTML = "";
      const div = document.createElement("div");
      div.id = "yt-iframe";
      container.appendChild(div);

      ytPlayerRef.current = new window.YT.Player("yt-iframe", {
        videoId: currentVideoId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        width: "100%",
        height: "100%",
        events: {
          onReady: (e) => {
            e.target.playVideo();
            if (canTrack) startProgressTracking(e.target, lessonId);
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING && canTrack) {
              startProgressTracking(e.target, lessonId);
            } else if (
              e.data === window.YT.PlayerState.PAUSED ||
              e.data === window.YT.PlayerState.ENDED
            ) {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => destroyPlayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlayingPreview, currentVideoId]);

  const startProgressTracking = (player, lessonId) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      try {
        const duration = player.getDuration();
        const current = player.getCurrentTime();
        if (duration > 0 && current / duration >= 0.75) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          if (!markedCompleteRef.current.has(lessonId)) {
            markedCompleteRef.current.add(lessonId);
            courseApi
              .markLessonComplete(lessonId)
              .then(() => {
                setCompletedLessons((prev) => new Set([...prev, lessonId]));
                toast.success("✅ Hoàn thành bài học!", {
                  description:
                    "Bạn đã xem đủ 75% video này ấy! Ôn ngoàn lắm bé ơi! 🎉",
                });
              })
              .catch(() => {
                markedCompleteRef.current.delete(lessonId);
              });
          }
        }
      } catch (_) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    }, 3000);
  };

  const handleSelectLesson = (lesson) => {
    if (isEnrolled || lesson.isTrial) {
      navigate(`/learning/${slug}/${lesson._id}`);
    } else {
      toast.error("Bạn cần đăng ký khóa học!", {
        description: "Đăng ký để xem toàn bộ bài học nhé! 🔐",
      });
    }
  };

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getCourseBySlug(slug);
        setCourse(response.data);

        if (response.data.sections?.length > 0) {
          setExpandedSection(response.data.sections[0]._id);
        }
      } catch (error) {
        toast.error("Ối, không tìm thấy khóa học này rồi!", {
          description: "Bé quay lại danh sách chọn khóa khác nhé! 🎨",
        });
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCourseDetail();
  }, [slug, navigate]);

  useEffect(() => {
    setIsEnrolled(false);
    if (!course || !isAuthenticated) return;
    const enrolled = user?.enrolledCourses?.some(
      (e) =>
        e.course === course._id ||
        e.course?.toString() === course._id?.toString(),
    );
    if (enrolled) {
      setIsEnrolled(true);
      return;
    }
    userApi
      .checkEnrollment(course._id)
      .then((res) => setIsEnrolled(res.data.isEnrolled))
      .catch(() => {});
  }, [course, isAuthenticated, user]);

  // Tải danh sách bài học đã hoàn thành khi đã enrolled
  useEffect(() => {
    if (!course || !isEnrolled) return;
    courseApi
      .getCourseProgress(course._id)
      .then((res) => {
        const ids = (res.data.data || []).map(
          (p) => p.lesson?.toString() || p.lesson,
        );
        setCompletedLessons(new Set(ids));
        markedCompleteRef.current = new Set(ids);
      })
      .catch(() => {});
  }, [course, isEnrolled]);

  useEffect(() => {
    if (!course || !isAuthenticated) return;
    wishlistApi
      .getWishlist()
      .then((res) => {
        const items = res.data.data || [];
        const found = items.some(
          (item) =>
            item.product?._id === course._id && item.productModel === "Course",
        );
        setIsInWishlist(found);
      })
      .catch(() => {});
  }, [course, isAuthenticated]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập!", {
        description: "Vui lòng đăng nhập để đăng ký khóa học nhé! 🔐",
      });
      navigate("/login");
      return;
    }

    try {
      setEnrolling(true);

      const res = await paymentApi.createPayment({
        itemType: "course",
        itemId: course._id,
      });

      const data = res.data;

      if (data.flow === "free") {
        setIsEnrolled(true);
        await refreshUser();
        toast.success(data.message || "Đăng ký thành công!");
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

  useEffect(() => {
    const checkInCart = async () => {
      if (!course?._id || !isAuthenticated) {
        setCourseInCart(null);
        return;
      }

      try {
        const res = await cartApi.checkCourseInCart(course._id);
        if (res.data.inCart) {
          setCourseInCart(res.data);
        } else {
          setCourseInCart(null);
        }
      } catch (error) {
        setCourseInCart(null);
      }
    };

    checkInCart();
  }, [course, isAuthenticated]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Bạn cần đăng nhập!", {
        description: "Vui lòng đăng nhập để thêm vào giỏ hàng nhé! 🔐",
      });
      navigate("/login");
      return;
    }

    try {
      await cartApi.addToCart(course._id, "Course");
      setCourseInCart({ inCart: true });
      await refreshCart();
      toast.success("Đã thêm vào giỏ hàng!", {
        description: "Khóa học đã nằm gọn trong giỏ của bé rồi nhé! 🛒",
      });
    } catch (error) {
      toast.error("Thất bại!", {
        description: error?.response?.data?.message || "Bé thử lại sau nhé! ❌",
      });
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

  if (!course) return null;

  const levelLabel = {
    beginner: "Cơ bản",
    intermediate: "Trung Cấp",
    advanced: "Nâng Cao",
  };

  const displayPrice =
    course.price === 0 ? "MIỄN PHÍ" : `${course.price?.toLocaleString()}đ`;
  const rating = course.averageRating || 0;

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen">
      <Header onNavigate={navigate} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <header className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-7 z-10">
            <div className="inline-flex items-center gap-2 bg-tertiary-container/30 px-4 py-1 rounded-full text-on-tertiary-container font-label font-bold mb-6">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              {levelLabel[course.level] || "Tất cả trình độ"}
            </div>
            <h1 className="font-headline font-extrabold text-5xl md:text-7xl leading-tight text-on-surface mb-6">
              {course.title.split(":")[0]} <br/> 
              <span className="text-secondary">{course.title.split(":")[1] || ""}</span>
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed max-w-xl mb-10 font-medium">
              {course.description}
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              {!isEnrolled ? (
                <>
                  <button 
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="gummy-button px-8 py-4 rounded-xl font-headline font-bold text-xl text-on-primary-fixed flex items-center gap-3"
                  >
                    {enrolling ? "Đang xử lý..." : `Mua Khóa Học - ${displayPrice}`}
                    <span className="material-symbols-outlined">payments</span>
                  </button>
                  
                  {!courseInCart ? (
                    <button 
                      onClick={handleAddToCart}
                      className="px-8 py-4 rounded-xl border-2 border-primary/20 hover:bg-primary/5 text-primary font-headline font-bold text-xl flex items-center justify-center gap-3 transition-all"
                    >
                      Giỏ hàng
                      <span className="material-symbols-outlined text-2xl">add_shopping_cart</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate("/cart")}
                      className="px-8 py-4 bg-secondary-container/30 text-secondary border-2 border-secondary/20 rounded-xl font-headline font-bold text-xl flex items-center justify-center gap-3 transition-all"
                    >
                      Xem Giỏ Hàng
                      <span className="material-symbols-outlined text-2xl">shopping_cart_checkout</span>
                    </button>
                  )}
                </>
              ) : (
                <div className="bg-tertiary text-on-tertiary px-8 py-4 rounded-xl font-headline font-bold text-xl flex items-center gap-3 shadow-lg">
                  <span className="material-symbols-outlined">check_circle</span>
                  Đã Đăng Ký
                </div>
              )}
              {!isEnrolled && (
                <button 
                  onClick={async () => {
                    try {
                      if (isInWishlist) {
                        await wishlistApi.removeFromWishlist(course._id, "Course");
                        setIsInWishlist(false);
                        toast.success("Đã xóa khỏi yêu thích.");
                      } else {
                        await wishlistApi.addToWishlist(course._id, "Course");
                        setIsInWishlist(true);
                        toast.success("Đã thêm vào yêu thích!");
                      }
                      await refreshWishlist();
                    } catch (e) {
                      toast.error("Có lỗi xảy ra.");
                    }
                  }}
                  className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center transition-all border-2",
                    isInWishlist ? "bg-error text-on-error border-error" : "bg-white text-error border-outline-variant/20 hover:bg-error/5"
                  )}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${isInWishlist ? 1 : 0}` }}>favorite</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl"></div>
            <div className="relative bg-surface-container-highest rounded-xl p-4 rotate-3 shadow-xl">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-black group">
                {!isPlayingPreview || !currentVideoId ? (
                  <>
                    <img 
                      src={course.thumbnail} 
                      alt={course.title}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={() => {
                          if (isEnrolled) {
                            navigate(`/learning/${slug}`);
                          } else {
                            setIsPlayingPreview(true);
                          }
                        }}
                        className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center text-primary shadow-2xl hover:scale-110 transition-all"
                      >
                        <span className="material-symbols-outlined text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full">
                    <div id="yt-player-container" className="w-full h-full" />
                    <button 
                      onClick={() => { destroyPlayer(); setIsPlayingPreview(false); }}
                      className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/80 transition-all z-20"
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}
              </div>
              {/* Mascot Bubble */}
              <div className="absolute -bottom-8 -left-12 bg-tertiary-container/90 backdrop-blur-md p-6 rounded-xl shadow-2xl max-w-[200px] border border-tertiary/20 -rotate-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-on-tertiary-container text-sm">chat_bubble</span>
                  <span className="font-headline font-bold text-xs uppercase tracking-wider text-on-tertiary-container">Artie Nhắc:</span>
                </div>
                <p className="text-on-tertiary-container font-headline font-bold text-lg leading-snug">
                  "Học nghệ thuật là để vui mà bé!"
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Course Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          <div className="bg-surface-container-low p-8 rounded-xl scrapbook-card border border-outline-variant/5">
            <span className="material-symbols-outlined text-secondary text-4xl mb-4">group</span>
            <h3 className="text-xl font-bold font-headline mb-2">{course.totalStudents || 0}+ Học Viên</h3>
            <p className="text-on-surface-variant text-sm font-medium">Bé sẽ được học cùng những người bạn nhỏ đáng yêu khác!</p>
          </div>
          <div className="bg-secondary-container/30 p-8 rounded-xl scrapbook-card border border-outline-variant/5">
            <span className="material-symbols-outlined text-primary text-4xl mb-4">star</span>
            <h3 className="text-xl font-bold font-headline mb-2">{rating} / 5 Sao</h3>
            <p className="text-on-surface-variant text-sm font-medium">Các bạn nhỏ đều thích mê những bài vẽ của Artie.</p>
          </div>
          <div className="bg-tertiary-container/30 p-8 rounded-xl scrapbook-card border border-outline-variant/5">
            <span className="material-symbols-outlined text-tertiary text-4xl mb-4">schedule</span>
            <h3 className="text-xl font-bold font-headline mb-2">Học Trọn Đời</h3>
            <p className="text-on-surface-variant text-sm font-medium">Mua một lần, bé có thể xem lại bài giảng bất cứ lúc nào.</p>
          </div>
        </section>

        {/* Content Tabs (Curriculum) */}
        <section className="mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-12 w-2 bg-primary rounded-full"></div>
            <h2 className="font-headline font-bold text-4xl">Hành trình khám phá</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Curriculum List */}
            <div className="lg:col-span-8 space-y-6">
              {course.sections?.map((section, sIdx) => (
                <div key={section._id} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-secondary text-on-secondary px-4 py-1 rounded-full text-sm font-bold">Phần {sIdx + 1}</span>
                    <h3 className="text-2xl font-bold font-headline">{section.title}</h3>
                  </div>
                  <div className="space-y-4">
                    {section.lessonsId?.map((lesson, lIdx) => {
                      const isDone = completedLessons.has(lesson._id?.toString());
                      const isActive = selectedLesson?._id === lesson._id;
                      const canWatch = isEnrolled || lesson.isTrial;
                      
                      return (
                        <div key={lesson._id} className="relative group">
                          <div className={cn(
                            "absolute inset-0 rounded-xl translate-x-1.5 translate-y-1.5 transition-all",
                            isActive ? "bg-primary" : "bg-outline-variant/20 group-hover:translate-x-1 group-hover:translate-y-1"
                          )}></div>
                          <div 
                            onClick={() => handleSelectLesson(lesson)}
                            className={cn(
                              "relative bg-white p-6 rounded-xl border border-outline-variant/20 flex items-center justify-between cursor-pointer",
                              !canWatch && "opacity-60 grayscale"
                            )}
                          >
                            <div className="flex items-center gap-6">
                              <div className={cn(
                                "w-12 h-12 rounded-full flex items-center justify-center font-headline font-black text-xl border-2",
                                isActive ? "bg-primary text-on-primary border-primary" : "bg-surface-container text-on-surface-variant border-outline-variant/10"
                              )}>
                                {lIdx + 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-headline font-bold text-lg">{lesson.title}</h4>
                                  {lesson.isTrial && (
                                    <span className="bg-tertiary-container px-3 py-0.5 rounded-full text-[10px] font-black text-on-tertiary-container uppercase tracking-widest">Học Thử</span>
                                  )}
                                  {isDone && (
                                    <span className="material-symbols-outlined text-tertiary text-xl">check_circle</span>
                                  )}
                                </div>
                                <p className="text-on-surface-variant text-sm font-medium">{lesson.description || "Bí mật nghệ thuật chờ bé khám phá!"}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {canWatch ? (
                                <button className={cn(
                                  "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all",
                                  isActive ? "bg-primary border-primary text-on-primary" : "border-outline-variant/20 text-on-surface-variant group-hover:bg-primary-container/20 group-hover:border-primary/30"
                                )}>
                                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                                    {isActive ? "pause" : "play_arrow"}
                                  </span>
                                </button>
                              ) : (
                                <span className="material-symbols-outlined text-on-surface-variant/40">lock</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar Sticky Info */}
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-24 space-y-8">
                {/* Instructor Card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-secondary-container rounded-[2rem] translate-x-2 translate-y-2"></div>
                  <div className="relative bg-white p-8 rounded-[2rem] border border-outline-variant/10 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                      <div className="absolute inset-0 bg-primary-container rounded-full rotate-6 scale-110"></div>
                      <img 
                        src={course.instructor?.avatar || "https://i.pravatar.cc/150"} 
                        alt={course.instructor?.fullname}
                        className="relative w-full h-full object-cover rounded-full border-4 border-white shadow-lg" 
                      />
                    </div>
                    <h3 className="text-xl font-bold font-headline mb-2">{course.instructor?.fullname || "Ms. Sarah"}</h3>
                    <p className="text-primary font-bold text-xs uppercase tracking-tighter mb-4">Giảng viên ArtKids</p>
                    <p className="text-on-surface-variant text-sm leading-relaxed italic">
                      "{course.instructor?.instructorInfo?.bio || "Mọi đứa trẻ đều là nghệ sĩ, chỉ cần bé có đủ cảm hứng!"}"
                    </p>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-surface-container-low p-8 rounded-[2rem] border border-outline-variant/5">
                  <h4 className="font-headline font-bold text-lg mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">verified</span> Ưu đãi đặc biệt
                  </h4>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-tertiary text-xl">check_circle</span>
                      <span className="text-sm font-medium text-on-surface-variant">Truy cập toàn bộ bài giảng trọn đời</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-tertiary text-xl">check_circle</span>
                      <span className="text-sm font-medium text-on-surface-variant">Tài liệu hướng dẫn (.pdf) độc quyền</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-tertiary text-xl">check_circle</span>
                      <span className="text-sm font-medium text-on-surface-variant">Chứng nhận hoàn thành đầy sắc màu</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Combo Upgrade Section */}
        {relatedCombos.length > 0 && (
          <section className="mb-32">
            <div className="flex items-center gap-4 mb-12">
              <div className="h-12 w-2 bg-secondary rounded-full"></div>
              <h2 className="font-headline font-bold text-4xl">Combo hời - Chơi cực vui!</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {relatedCombos.map((combo) => (
                <div 
                  key={combo._id} 
                  onClick={() => navigate(`/combo/${combo.slug}`)}
                  className="bg-surface-container-highest p-8 rounded-[2rem] relative overflow-hidden flex flex-col md:flex-row gap-8 items-center scrapbook-card cursor-pointer border border-outline-variant/10"
                >
                  <div className="w-full md:w-48 h-48 bg-white rounded-lg p-3 shadow-md rotate-2 flex-shrink-0 overflow-hidden">
                    <img 
                      src={combo.thumbnail || combo.courses?.[0]?.thumbnail} 
                      alt={combo.title}
                      className="w-full h-full object-cover rounded-sm"
                    />
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <div className="inline-block bg-primary text-on-primary px-3 py-1 rounded-full text-[10px] font-black mb-4">TIẾT KIỆM NHẤT</div>
                    <h3 className="text-2xl font-bold font-headline mb-4">{combo.title}</h3>
                    <div className="flex flex-col gap-1 mb-6">
                      <span className="text-sm text-on-surface-variant font-bold">Chỉ thêm:</span>
                      <span className="text-3xl font-black text-on-surface">{combo.upgradeInfo.upgradePrice?.toLocaleString()}đ</span>
                      <span className="text-xs text-secondary font-bold">(Đã giảm cho phần bé đã có)</span>
                    </div>
                    <button className="gummy-button px-8 py-3 rounded-full text-on-primary-fixed font-extrabold text-sm">Nâng Cấp Combo</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews Section */}
        <ReviewSection courseId={course._id} />

        {/* Final CTA */}
        <section className="mb-24 bg-surface-container-highest rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-container/20 via-transparent to-transparent"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-headline font-extrabold text-5xl mb-8">Sẵn sàng bắt đầu <br/> <span className="text-secondary">Hành trình này chưa?</span></h2>
            <p className="text-xl text-on-surface-variant mb-12 leading-relaxed font-medium">Truy cập trọn đời, tài liệu học tập PDF và sự hỗ trợ nhiệt tình từ các thầy cô ArtKids đang chờ bé đó!</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-10">
              <div className="text-left">
                <span className="text-on-surface-variant line-through block text-lg font-bold">{course.oldPrice?.toLocaleString()}đ</span>
                <span className="text-5xl font-headline font-extrabold text-on-surface">{displayPrice}</span>
              </div>
              <button 
                onClick={() => isEnrolled ? navigate(`/learning/${slug}`) : handleEnroll()}
                disabled={enrolling}
                className="gummy-button px-12 py-6 rounded-2xl font-headline font-extrabold text-2xl text-on-primary-fixed hover:scale-105 transition-transform flex items-center gap-4 shadow-xl"
              >
                {isEnrolled ? "Bắt Đầu Học" : "Đăng Ký Ngay"}
                <span className="material-symbols-outlined text-3xl">rocket_launch</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* Floating CTA for Mobile or Desktop Scroll */}
    </div>
  );
}
