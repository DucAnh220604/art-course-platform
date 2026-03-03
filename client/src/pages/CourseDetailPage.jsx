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

export function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getCourseBySlug(slug);
        setCourse(response.data);

        // Mở sẵn chương đầu tiên
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

  // Kiểm tra đã đăng ký chưa sau khi có course + user
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
    // Double-check với API nếu enrolledCourses không được populate đầy đủ
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
      await userApi.enrollCourse(course._id);
      setIsEnrolled(true);
      await refreshUser(); // Cập nhật lại user trong context
      toast.success("Đăng ký thành công! 🎉", {
        description: `Chúc bé học vui với "${course.title}"! 🎨`,
      });
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

            {/* Thông tin Giảng viên */}
            <div className="flex items-center gap-4 p-6 bg-white rounded-[32px] shadow-sm border border-slate-100">
              <Avatar className="w-16 h-16 border-4 border-sky-50 shadow-sm">
                <AvatarImage src={course.instructor?.avatar} />
                <AvatarFallback className="bg-sky-100 text-sky-600 text-xl font-bold">
                  {course.instructor?.fullname?.charAt(0) || "G"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Giảng viên hướng dẫn
                </p>
                <p className="text-xl font-bold text-slate-800">
                  {course.instructor?.fullname || "ArtKids Instructor"}
                </p>
              </div>
            </div>

            {/* 2. Lộ trình học (Curriculum) */}
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
                          {section.lessonsId?.map((lesson) => (
                            <div
                              key={lesson._id}
                              className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group hover:border-sky-200 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <Video className="w-5 h-5 text-sky-400" />
                                <span className="font-medium text-slate-700 group-hover:text-sky-600 transition-colors">
                                  {lesson.title}
                                </span>
                              </div>
                              {lesson.isTrial && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none cursor-pointer">
                                  Học thử
                                </Badge>
                              )}
                            </div>
                          ))}
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

            {/* 3. TÍCH HỢP REVIEW SECTION Ở ĐÂY */}
            <ReviewSection courseId={course._id} />
          </div>

          {/* CỘT PHẢI: Khung thanh toán (Sticky Sidebar) */}
          <div className="w-full lg:w-1/3 shrink-0">
            <div className="bg-white rounded-[40px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
              {/* Ảnh bìa */}
              <div className="relative aspect-[16/10] rounded-3xl overflow-hidden mb-8 shadow-inner">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group cursor-pointer hover:bg-black/40 transition-colors">
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-8 h-8 text-sky-500 ml-1" />
                  </div>
                </div>
              </div>

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
