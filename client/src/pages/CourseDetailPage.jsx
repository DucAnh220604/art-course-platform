import React, { useState, useEffect } from "react";
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

  // Chuyển YouTube video ID hoặc URL thành embed URL
  const getEmbedUrl = (videoUrl) => {
    if (!videoUrl) return null;
    if (videoUrl.startsWith("http")) {
      // Đã là full URL, thay /watch?v= bằng /embed/
      try {
        const url = new URL(videoUrl);
        if (url.hostname.includes("youtube.com") && url.searchParams.get("v")) {
          return `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
        }
        if (url.hostname === "youtu.be") {
          return `https://www.youtube.com/embed${url.pathname}`;
        }
        return videoUrl;
      } catch {
        return videoUrl;
      }
    }
    // Chỉ là video ID
    return `https://www.youtube.com/embed/${videoUrl}`;
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

  const displayPrice =
    course.price === 0 ? "MIỄN PHÍ" : `${course.price?.toLocaleString()}đ`;
  const rating = course.averageRating || 0;

  // URL video đang phát: lesson đang chọn, hoặc video đầu tiên dùng thử
  const firstTrialLesson = course.sections
    ?.flatMap((s) => s.lessonsId || [])
    .find((l) => l.isTrial);
  const currentVideoUrl = selectedLesson
    ? getEmbedUrl(selectedLesson.videoUrl)
    : firstTrialLesson
      ? getEmbedUrl(firstTrialLesson.videoUrl)
      : null;

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
                  Cấp độ: {course.level}
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
              {!isPlayingPreview || !currentVideoUrl ? (
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
                        if (currentVideoUrl) setIsPlayingPreview(true);
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
                  <iframe
                    key={currentVideoUrl}
                    className="w-full h-full"
                    src={`${currentVideoUrl}?autoplay=1`}
                    title={selectedLesson?.title || course.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  <button
                    onClick={() => {
                      setIsPlayingPreview(false);
                      setSelectedLesson(null);
                    }}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white rounded-full px-3 py-1 text-sm transition-colors"
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
                                  ) : canWatch ? (
                                    <Video className="w-5 h-5 text-sky-400" />
                                  ) : (
                                    <Video className="w-5 h-5 text-slate-300" />
                                  )}
                                  <span
                                    className={`font-medium transition-colors ${
                                      isActive
                                        ? "text-sky-600"
                                        : canWatch
                                          ? "text-slate-700 hover:text-sky-600"
                                          : "text-slate-400"
                                    }`}
                                  >
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
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
                    ? "✅ Đã đăng ký"
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
