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

export function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);

  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  const [relatedCombos, setRelatedCombos] = useState([]);

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
      setSelectedLesson(lesson);
      setIsPlayingPreview(true);
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

  // Video ID đang phát
  const firstTrialLesson = course.sections
    ?.flatMap((s) => s.lessonsId || [])
    .find((l) => l.isTrial);
  // currentVideoUrl không cần nữa, đã dùng currentVideoId

  return (
    <div className="min-h-screen bg-slate-50/50 overflow-x-hidden">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <Header onNavigate={navigate} />
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="flex flex-col lg:flex-row gap-10 items-start">
          {/* CỘT TRÁI: Nội dung chính */}
          <div className="w-full lg:w-2/3 space-y-10">
            {/* 1. Tiêu đề & Giới thiệu ngắn */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-200 border-none px-4 py-1 rounded-full font-bold">
                  {course.category}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-slate-200 text-slate-500 rounded-full px-4 py-1"
                >
                  Cấp độ: {levelLabel[course.level] || course.level}
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-800 leading-tight mb-6">
                {course.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {course.description}
              </p>
            </div>

            {/* 2. VIDEO GIỚI THIỆU / BÀI HỌC */}
            <div className="rounded-[40px] overflow-hidden shadow-xl border-4 border-slate-100 bg-black aspect-video relative">
              {!isPlayingPreview || !currentVideoId ? (
                <>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="rounded-full bg-white/90 hover:bg-white text-sky-600 w-24 h-24 hover:scale-110 transition-transform shadow-2xl"
                      onClick={() => {
                        if (currentVideoId) setIsPlayingPreview(true);
                        else
                          toast.info("Khóa học chưa có video giới thiệu! 🎬");
                      }}
                    >
                      <PlayCircle className="w-14 h-14 ml-2" />
                    </Button>
                  </div>
                  {course.price === 0 && (
                    <div className="absolute top-6 left-6 bg-yellow-400 text-yellow-900 px-6 py-2 rounded-full font-bold shadow-lg shadow-yellow-400/30 tracking-wide">
                      🎁 MIỄN PHÍ HOÀN TOÀN
                    </div>
                  )}
                  {selectedLesson && (
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                      <span className="bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                        {selectedLesson.title}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div
                    id="yt-player-container"
                    className="w-full h-full"
                    style={{ minHeight: "100%" }}
                  />
                  <button
                    onClick={() => {
                      destroyPlayer();
                      setIsPlayingPreview(false);
                      setSelectedLesson(null);
                    }}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full px-3 py-1 text-sm transition-colors z-10"
                  >
                    ✕ Đóng
                  </button>
                </>
              )}
            </div>

            {/* 3. LỘ TRÌNH HỌC (Curriculum) */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="text-sky-500 w-6 h-6" /> Nội dung khóa học
              </h2>

              <div className="bg-white rounded-[32px] p-2 shadow-sm border border-slate-100">
                {course.sections?.length > 0 ? (
                  course.sections.map((section, index) => (
                    <div key={section._id} className="mb-2 last:mb-0">
                      <button
                        onClick={() =>
                          setExpandedSection(
                            expandedSection === section._id
                              ? null
                              : section._id,
                          )
                        }
                        className={`w-full flex items-center justify-between p-5 rounded-[24px] transition-colors ${
                          expandedSection === section._id
                            ? "bg-sky-50/50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-4 text-left">
                          <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-lg">
                              {section.title}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1">
                              {section.lessonsId?.length || 0} bài giảng
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-slate-400 transition-transform ${expandedSection === section._id ? "rotate-180 text-sky-500" : ""}`}
                        />
                      </button>

                      {/* Danh sách bài học */}
                      {expandedSection === section._id && (
                        <div className="pl-16 pr-5 py-4 space-y-3">
                          {section.lessonsId?.map((lesson) => {
                            const canWatch = isEnrolled || lesson.isTrial;
                            const isActive = selectedLesson?._id === lesson._id;
                            const isDone = completedLessons.has(
                              lesson._id?.toString(),
                            );
                            return (
                              <div
                                key={lesson._id}
                                onClick={() => handleSelectLesson(lesson)}
                                className={`flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border transition-colors cursor-pointer ${
                                  isActive
                                    ? "border-sky-400 bg-sky-50"
                                    : canWatch
                                      ? "border-slate-100 hover:border-sky-200"
                                      : "border-slate-100 opacity-60 cursor-not-allowed"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  {isActive ? (
                                    <PlayCircle className="w-5 h-5 text-sky-500" />
                                  ) : isDone ? (
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                  ) : canWatch ? (
                                    <Video className="w-5 h-5 text-sky-400" />
                                  ) : (
                                    <Video className="w-5 h-5 text-slate-300" />
                                  )}
                                  <span
                                    className={`font-medium transition-colors ${
                                      isActive
                                        ? "text-sky-600"
                                        : isDone
                                          ? "text-green-600"
                                          : canWatch
                                            ? "text-slate-700 hover:text-sky-600"
                                            : "text-slate-400"
                                    }`}
                                  >
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isDone && (
                                    <Badge className="bg-green-100 text-green-700 border-none text-xs">
                                      Đã xem
                                    </Badge>
                                  )}
                                  {lesson.isTrial && (
                                    <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">
                                      Học thử
                                    </Badge>
                                  )}
                                  {!canWatch && (
                                    <Badge
                                      variant="outline"
                                      className="text-slate-400 border-slate-200"
                                    >
                                      🔒
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500">
                    Khóa học đang được cập nhật nội dung.
                  </div>
                )}
              </div>
            </div>

            {/* 4. THÔNG TIN GIẢNG VIÊN (Dời xuống đây) */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="text-sky-500 w-6 h-6" /> Về giảng viên
              </h2>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 p-8 bg-white rounded-[32px] shadow-sm border border-slate-100">
                <Avatar className="w-24 h-24 border-4 border-sky-50 shadow-sm shrink-0">
                  <AvatarImage src={course.instructor?.avatar} />
                  <AvatarFallback className="bg-sky-100 text-sky-600 text-2xl font-bold">
                    {course.instructor?.fullname?.charAt(0) || "G"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold text-slate-800 mb-1">
                    {course.instructor?.fullname || "ArtKids Instructor"}
                  </h3>
                  <p className="text-sm font-bold text-sky-600 uppercase tracking-widest mb-4">
                    Giảng viên chuyên nghiệp
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    {course.instructor?.instructorInfo?.bio ||
                      "Giảng viên tại ArtKids luôn tận tâm và nhiệt huyết, giúp các bé khơi nguồn sáng tạo và phát triển tài năng nghệ thuật qua từng bài học."}
                  </p>
                  {course.instructor?.email && (
                    <p className="text-sm text-slate-400 mt-2">
                      📧 {course.instructor.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 5. REVIEW SECTION */}
            <ReviewSection courseId={course._id} />

            {/* 6. COMBO SECTION */}
            {relatedCombos.length > 0 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-amber-500 w-6 h-6" />
                  Nâng cấp lên Combo và tiết kiệm hơn!
                </h2>
                <div className="space-y-4">
                  {relatedCombos.map((combo) => (
                    <Card
                      key={combo._id}
                      className="p-6 rounded-3xl border-2 border-amber-100 hover:border-amber-300 transition-all hover:shadow-xl cursor-pointer bg-gradient-to-br from-white to-amber-50/30"
                      onClick={() => navigate(`/combo/${combo.slug}`)}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Thumbnail */}
                        <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden flex-shrink-0">
                          <img
                            src={
                              combo.thumbnail || combo.courses?.[0]?.thumbnail
                            }
                            alt={combo.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <Badge className="bg-amber-100 text-amber-700 mb-2">
                                <Package className="w-3 h-3 mr-1" />
                                COMBO {combo.courses?.length} KHÓA HỌC
                              </Badge>
                              <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {combo.title}
                              </h3>
                              <p className="text-sm text-slate-600 line-clamp-2">
                                {combo.description}
                              </p>
                            </div>
                          </div>

                          {/* Pricing Info */}
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-amber-100">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <span className="text-sm text-green-600 font-medium">
                                  Bạn đã có{" "}
                                  {combo.upgradeInfo.ownedCourses.length}/
                                  {combo.courses.length} khóa học
                                </span>
                              </div>
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm text-slate-400 line-through">
                                  {combo.upgradeInfo.unownedOriginalPrice?.toLocaleString()}
                                  đ
                                </span>
                                <span className="text-2xl font-bold text-green-600">
                                  {combo.upgradeInfo.upgradePrice?.toLocaleString()}
                                  đ
                                </span>
                              </div>
                              <p className="text-xs text-green-600 mt-1">
                                💎 Tiết kiệm{" "}
                                {(
                                  combo.upgradeInfo.unownedOriginalPrice -
                                  combo.upgradeInfo.upgradePrice
                                ).toLocaleString()}
                                đ
                              </p>
                            </div>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/combo/${combo.slug}`);
                              }}
                              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-full px-6"
                            >
                              Nâng cấp ngay →
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CỘT PHẢI: Khung thanh toán (Sticky Sidebar) */}
          <div className="w-full lg:w-1/3 shrink-0">
            <div className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
              {/* Giá và Đăng ký */}
              <div className="text-center mb-8">
                <p className="text-4xl font-black text-sky-600 mb-2">
                  {displayPrice}
                </p>
                {course.oldPrice > course.price && (
                  <p className="text-slate-400 line-through text-lg">
                    {course.oldPrice.toLocaleString()}đ
                  </p>
                )}

                {isEnrolled ? (
                  <></>
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
                          await cartApi.addToCart(course._id, "Course");
                          toast.success("Đã thêm vào giỏ hàng!");
                        } catch (e) {
                          toast.error(
                            e?.response?.data?.message ||
                              "Không thêm được vào giỏ hàng.",
                          );
                        }
                      }}
                      className="w-full mt-3 h-12 rounded-full font-bold bg-white border-2 border-sky-500 text-sky-600 hover:bg-sky-50 hover:text-black"
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
                            await wishlistApi.removeFromWishlist(
                              course._id,
                              "Course",
                            );
                            setIsInWishlist(false);
                            toast.success("Đã xóa khỏi danh sách yêu thích.");
                          } else {
                            await wishlistApi.addToWishlist(
                              course._id,
                              "Course",
                            );
                            setIsInWishlist(true);
                            toast.success("Đã thêm vào danh sách yêu thích!");
                          }
                        } catch (e) {
                          toast.error(
                            e?.response?.data?.message ||
                              "Không thực hiện được.",
                          );
                        }
                      }}
                      className={`w-full mt-3 h-12 rounded-full font-bold border-2 transition-all ${
                        isInWishlist
                          ? "border-rose-400 bg-rose-50 text-rose-600"
                          : "border-rose-200 text-rose-500 hover:bg-rose-50"
                      }`}
                    >
                      <Heart
                        className={`w-5 h-5 mr-2 ${isInWishlist ? "fill-rose-500" : ""}`}
                      />
                      {isInWishlist ? "Đã yêu thích" : "Yêu thích"}
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolled || enrolling}
                  className={`w-full mt-6 h-14 text-lg rounded-full font-bold shadow-lg transition-all hover:-translate-y-1 ${
                    isEnrolled
                      ? "bg-green-500 hover:bg-green-500 text-white cursor-default"
                      : "bg-slate-900 hover:bg-sky-500 text-white"
                  }`}
                >
                  {isEnrolled
                    ? "Đã đăng ký"
                    : enrolling
                      ? "Đang đăng ký..."
                      : "Đăng ký học ngay"}
                </Button>
                <p className="text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Cam kết hoàn tiền trong 7
                  ngày
                </p>
              </div>

              {/* Thống kê nhanh */}
              <div className="space-y-4 pt-6 border-t border-slate-50">
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />{" "}
                    Đánh giá
                  </div>
                  <span className="font-bold">{rating} / 5</span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-sky-500" /> Học viên
                  </div>
                  <span className="font-bold">
                    {course.totalStudents} bé đã tham gia
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Cập nhật
                  </div>
                  <span className="font-bold">
                    {new Date(course.updatedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="w-full bg-white mt-12">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <Footer />
        </div>
      </div>
    </div>
  );
}
