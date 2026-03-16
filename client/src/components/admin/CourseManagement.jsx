import React, { useState, useEffect } from "react";
import {
  Star,
  Edit,
  Trash2,
  Eye,
  Layers,
  BookOpen,
  Wallet,
  Mail,
  CalendarDays,
  GraduationCap,
  CircleDot,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import courseApi from "@/api/courseApi";
import { CourseForm } from "../instructor/CourseForm"; // Dùng chung CourseForm

export function AdminCourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingCourse, setViewingCourse] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // State quản lý Tab hiển thị
  const [activeTab, setActiveTab] = useState("all");

  // States cho Course Form Modal
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // States cho Modal Xác nhận Xóa
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  // States cho Dialog Nhập Lý do Từ chối
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [courseToReject, setCourseToReject] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Admin lấy TẤT CẢ khóa học, có phân trang và lọc theo tab
      const response = await courseApi.getAllCourses({
        forManagement: true,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: activeTab !== "all" ? activeTab : undefined,
      });
      setCourses(response.data.courses || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [currentPage, activeTab]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Reset page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  const handleViewDetail = async (slug) => {
    try {
      const response = await courseApi.getCourseBySlug(slug);
      setViewingCourse(response.data);
      toast.info("Đang xem chi tiết khóa học", {
        description: `Quyền Quản trị viên: ${response.data.title} 🛠️`,
      });
    } catch (error) {
      toast.error("Không xem được chi tiết rồi!");
    }
  };

  const confirmDeleteCourse = (course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    toast.promise(courseApi.deleteCourse(courseToDelete._id), {
      loading: "Đang xóa khóa học khỏi hệ thống...",
      success: () => {
        fetchCourses();
        setIsDeleteDialogOpen(false);
        return `Khóa học "${courseToDelete.title}" đã bị xóa vĩnh viễn! 🗑️`;
      },
      error: (err) => {
        return (
          err.response?.data?.message || "Lỗi hệ thống khi xóa khóa học! ❌"
        );
      },
    });
  };

  // --- LOGIC DUYỆT / TỪ CHỐI BÀI ---
  const openRejectDialog = (courseId) => {
    setCourseToReject(courseId);
    setRejectReason("");
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!courseToReject) return;
    toast.promise(
      courseApi.updateCourse(courseToReject, {
        status: "rejected",
        rejectedReason: rejectReason.trim(),
      }),
      {
        loading: "Đang từ chối khóa học...",
        success: () => {
          fetchCourses();
          if (viewingCourse && viewingCourse._id === courseToReject) {
            setViewingCourse((prev) => ({
              ...prev,
              status: "rejected",
              rejectedReason: rejectReason.trim(),
            }));
          }
          setIsRejectDialogOpen(false);
          return "Đã từ chối khóa học! 🚫";
        },
        error: "Thao tác thất bại, vui lòng thử lại! ❌",
      },
    );
  };

  const handleReviewCourse = async (courseId, newStatus) => {
    toast.promise(courseApi.updateCourse(courseId, { status: newStatus }), {
      loading: "Đang duyệt khóa học...",
      success: () => {
        fetchCourses();
        if (viewingCourse && viewingCourse._id === courseId) {
          setViewingCourse((prev) => ({ ...prev, status: newStatus }));
        }
        return "Đã duyệt! Khóa học hiện đã được đăng lên trang chủ. 🎉";
      },
      error: "Thao tác thất bại, vui lòng thử lại! ❌",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      draft: { label: "Bản nháp", class: "bg-slate-100 text-slate-700" },
      pending: {
        label: "Chờ duyệt",
        class: "bg-amber-100 text-amber-700 border-amber-200",
      },
      published: {
        label: "Đã đăng",
        class: "bg-green-100 text-green-700 border-green-200",
      },
      rejected: {
        label: "Bị từ chối",
        class: "bg-red-100 text-red-700 border-red-200",
      },
    };
    const s = map[status] || map.draft;
    return <Badge className={`border font-bold ${s.class}`}>{s.label}</Badge>;
  };

  const getStatusLabel = (status) => {
    const map = {
      draft: "Bản nháp",
      pending: "Chờ duyệt",
      published: "Đã đăng",
      rejected: "Bị từ chối",
    };
    return map[status] || "Không xác định";
  };

  const getLevelLabel = (level) => {
    const map = {
      beginner: "Cơ bản",
      intermediate: "Trung cấp",
      advanced: "Nâng cao",
    };

    if (!level) return "Chưa cập nhật";

    return map[level] || `${level.charAt(0).toUpperCase()}${level.slice(1)}`;
  };

  const formatDuration = (seconds = 0) => {
    if (!seconds || Number.isNaN(Number(seconds))) return "0 phút";
    const totalSeconds = Number(seconds);
    const totalMinutes = Math.ceil(totalSeconds / 60);

    if (totalMinutes < 60) return `${totalMinutes} phút`;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
  };

  const getDiscountPercent = (course) => {
    if (!course) return 0;

    if (Number(course.discountPercentage) > 0) {
      return Number(course.discountPercentage);
    }

    const oldPrice = Number(course.oldPrice) || 0;
    const price = Number(course.price) || 0;

    if (oldPrice > 0 && oldPrice > price) {
      return Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    return 0;
  };

  // Nếu đang xem chi tiết một khóa học (Admin View)
  if (viewingCourse) {
    const discountPercent = getDiscountPercent(viewingCourse);

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setViewingCourse(null)}
            className="rounded-full"
          >
            ← Quay lại quản lý
          </Button>

          {/* Nút thao tác nhanh trong trang chi tiết nếu khóa học đang Pending */}
          {viewingCourse.status === "pending" && (
            <div className="flex gap-3">
              <Button
                onClick={() => openRejectDialog(viewingCourse._id)}
                variant="outline"
                className="rounded-full border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" /> Từ chối
              </Button>
              <Button
                onClick={() =>
                  handleReviewCourse(viewingCourse._id, "published")
                }
                className="rounded-full bg-green-500 hover:bg-green-600 shadow-lg shadow-green-200"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Duyệt khóa học
              </Button>
            </div>
          )}
        </div>

        <div className="relative overflow-hidden grid grid-cols-1 xl:grid-cols-[260px_minmax(0,1fr)] gap-5 bg-gradient-to-br from-white via-sky-50/40 to-amber-50/30 p-5 md:p-6 rounded-[32px] shadow-sm border border-slate-100">
          <div className="absolute -top-12 -right-10 w-36 h-36 rounded-full bg-sky-100/50 blur-2xl" />
          <div className="absolute -bottom-14 -left-10 w-40 h-40 rounded-full bg-amber-100/50 blur-2xl" />
          <img
            src={viewingCourse.thumbnail}
            className="relative z-10 w-full h-44 xl:h-full min-h-[180px] rounded-2xl object-contain shadow-md"
            alt=""
          />
          <div className="flex-1 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 shadow-sm mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-semibold text-slate-600">
                Admin Course Insight
              </span>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 leading-tight">
              {viewingCourse.title}
            </h2>
            <p className="text-sm font-medium text-purple-600 mt-1">
              Giảng viên: {viewingCourse.instructor?.fullname || "Không rõ"}
            </p>
            <p className="text-slate-500 mt-2 line-clamp-2">
              {viewingCourse.description}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 mt-4 text-sm">
              <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white px-4 py-3 shadow-sm">
                <p className="text-slate-400">Trạng thái</p>
                <p className="font-semibold text-slate-700 flex items-center gap-2 mt-1">
                  <CircleDot className="w-4 h-4 text-amber-500" />
                  {getStatusLabel(viewingCourse.status)}
                </p>
              </div>
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-white px-4 py-3 shadow-sm">
                <p className="text-slate-400">Danh mục</p>
                <p className="font-semibold text-slate-700 flex items-center gap-2 mt-1">
                  <BookOpen className="w-4 h-4 text-sky-600" />
                  {viewingCourse.category || "Chưa cập nhật"}
                </p>
              </div>
              <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white px-4 py-3 shadow-sm">
                <p className="text-slate-400">Cấp độ</p>
                <p className="font-semibold text-slate-700 flex items-center gap-2 mt-1">
                  <GraduationCap className="w-4 h-4 text-violet-600" />
                  {getLevelLabel(viewingCourse.level)}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white px-4 py-3 shadow-sm">
                <p className="text-slate-400">Giá bán</p>
                <div className="mt-1 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <p className="font-semibold text-emerald-700">
                    {(viewingCourse.price || 0).toLocaleString()}đ
                  </p>
                  {discountPercent > 0 && (
                    <span className="text-[11px] font-bold text-white bg-red-500 px-2 py-0.5 rounded-full">
                      -{discountPercent}%
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Giá gốc:
                  <span className="line-through ml-1">
                    {(viewingCourse.oldPrice || 0).toLocaleString()}đ
                  </span>
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white px-4 py-3 shadow-sm">
                <p className="text-slate-400">Email giảng viên</p>
                <p className="font-semibold text-slate-700 break-all flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-cyan-700 shrink-0" />
                  {viewingCourse.instructor?.email || "Chưa cập nhật"}
                </p>
              </div>
              <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white px-4 py-3 shadow-sm">
                <p className="text-slate-400">Số chương</p>
                <p className="font-semibold text-slate-700 flex items-center gap-2 mt-1">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  {viewingCourse.sections?.length || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-4 py-3 shadow-sm">
                <p className="text-slate-400">Tổng bài học</p>
                <p className="font-semibold text-slate-700 flex items-center gap-2 mt-1">
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  {viewingCourse.sections?.reduce(
                    (sum, section) => sum + (section.lessonsId?.length || 0),
                    0,
                  ) || 0}
                </p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white px-4 py-3 shadow-sm">
                <p className="text-slate-400">Ngày tạo</p>
                <p className="font-semibold text-slate-700 flex items-center gap-2 mt-1">
                  <CalendarDays className="w-4 h-4 text-rose-600" />
                  {viewingCourse.createdAt
                    ? new Date(viewingCourse.createdAt).toLocaleString("vi-VN")
                    : "Chưa cập nhật"}
                </p>
              </div>
            </div>
            {viewingCourse.status === "rejected" &&
              viewingCourse.rejectedReason && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                  <span className="font-bold">Lý do từ chối: </span>
                  {viewingCourse.rejectedReason}
                </div>
              )}
          </div>
        </div>

        <div className="relative overflow-hidden bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm">
          <div className="absolute -top-16 right-0 w-44 h-44 rounded-full bg-sky-100/50 blur-3xl" />
          <div className="relative z-10 flex items-center justify-between mb-5">
            <h3 className="text-2xl font-bold text-slate-800">
              Chi tiết nội dung khóa học
            </h3>
            <div className="hidden md:flex items-center gap-2 rounded-full bg-sky-50 border border-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
              <BookOpen className="w-3.5 h-3.5" />
              Chế độ xem chi tiết
            </div>
          </div>

          {!viewingCourse.sections || viewingCourse.sections.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-3xl text-slate-400">
              Khóa học này chưa có chương hoặc bài học.
            </div>
          ) : (
            <div className="space-y-4">
              {viewingCourse.sections.map((section, sectionIndex) => (
                <div
                  key={section._id}
                  className="relative border border-slate-200 rounded-3xl overflow-hidden bg-white shadow-sm"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-sky-400 to-indigo-500" />
                  <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-sky-50/40 border-b border-slate-100">
                    <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                      Chương {sectionIndex + 1}
                    </p>
                    <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      {section.title}
                    </h4>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-sky-600" />
                      {section.lessonsId?.length || 0} bài học
                    </p>
                  </div>

                  <div className="p-4 space-y-3">
                    {!section.lessonsId || section.lessonsId.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 text-slate-400 px-4 py-6 text-sm text-center">
                        Chương này chưa có bài học.
                      </div>
                    ) : (
                      section.lessonsId.map((lesson, lessonIndex) => (
                        <div
                          key={lesson._id}
                          className="rounded-2xl border border-slate-200 p-4 bg-gradient-to-br from-white to-slate-50/40"
                        >
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                            <h5 className="font-semibold text-slate-800">
                              Bài {sectionIndex + 1}.{lessonIndex + 1}:{" "}
                              {lesson.title}
                            </h5>
                            <p className="text-sm text-slate-500 rounded-full bg-white border border-slate-200 px-3 py-1">
                              Loại: {lesson.type || "video"} | Thời lượng:{" "}
                              {formatDuration(lesson.duration)}
                            </p>
                          </div>
                          <p className="text-sm text-slate-600 mt-2">
                            {lesson.description ||
                              "Bài học chưa có mô tả chi tiết."}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            Học thử: {lesson.isTrial ? "Có" : "Không"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Lọc khóa học theo Tab đã được thực hiện ở Server Side
  const displayedCourses = courses;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">
            Quản lý Khóa học
          </h1>
          <p className="text-slate-500 mt-2">
            Tổng quan toàn bộ khóa học trên hệ thống (Admin)
          </p>
        </div>
      </div>

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="bg-white border border-slate-100 p-1 rounded-full shadow-sm flex overflow-x-auto hide-scrollbar w-max max-w-full">
          <TabsTrigger
            value="all"
            className="rounded-full px-6 data-[state=active]:bg-sky-50 data-[state=active]:text-sky-600 data-[state=active]:font-bold transition-all"
          >
            Tất cả
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-full px-6 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600 data-[state=active]:font-bold transition-all relative"
          >
            Cần duyệt
            {/* Đếm số lượng cần duyệt */}
            {courses.filter((c) => c.status === "pending").length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                {courses.filter((c) => c.status === "pending").length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="published"
            className="rounded-full px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:font-bold transition-all"
          >
            Đang hoạt động
          </TabsTrigger>
          <TabsTrigger
            value="draft"
            className="rounded-full px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800 data-[state=active]:font-bold transition-all"
          >
            Bản nháp
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="rounded-full px-6 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 data-[state=active]:font-bold transition-all"
          >
            Bị từ chối
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="rounded-[32px] border border-slate-100 shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-b-slate-100">
              <TableHead className="pl-6 font-bold text-slate-700">
                Khóa học
              </TableHead>
              <TableHead className="font-bold text-slate-700">
                Giảng viên
              </TableHead>
              <TableHead className="font-bold text-slate-700">
                Học viên
              </TableHead>
              <TableHead className="font-bold text-slate-700">
                Trạng thái
              </TableHead>
              <TableHead className="text-right pr-6 font-bold text-slate-700">
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-20 text-slate-500"
                >
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : displayedCourses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-24 text-slate-400"
                >
                  <div className="text-4xl mb-2">📁</div>
                  Không có khóa học nào ở trạng thái này.
                </TableCell>
              </TableRow>
            ) : (
              displayedCourses.map((course) => (
                <TableRow
                  key={course._id}
                  className="hover:bg-slate-50/50 transition-colors border-b-slate-50"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={course.thumbnail}
                        className="w-24 h-16 rounded-xl object-cover shadow-sm border border-slate-100"
                        alt=""
                      />
                      <div className="max-w-[200px] md:max-w-xs">
                        <div
                          className="font-bold text-slate-800 line-clamp-1"
                          title={course.title}
                        >
                          {course.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          Tạo ngày:{" "}
                          {new Date(course.createdAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-600">
                    {course.instructor?.fullname || "Không rõ"}
                  </TableCell>
                  <TableCell className="font-medium text-slate-600">
                    {course.enrolledCount ?? course.totalStudents ?? 0} học viên
                  </TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      {/* CÁC NÚT DUYỆT (Chỉ hiện khi đang Pending) */}
                      {course.status === "pending" && (
                        <>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-full hover:bg-green-100 text-green-600 bg-green-50 mr-1"
                            onClick={() =>
                              handleReviewCourse(course._id, "published")
                            }
                            title="Duyệt (Hiển thị lên web)"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            className="rounded-full hover:bg-red-100 text-red-600 bg-red-50 mr-2"
                            onClick={() => openRejectDialog(course._id)}
                            title="Từ chối"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}

                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full hover:bg-sky-50 text-sky-600"
                        onClick={() => handleViewDetail(course.slug)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full hover:bg-red-50 text-red-500"
                        onClick={() => confirmDeleteCourse(course)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* PHÂN TRANG */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 py-6 border-t border-slate-50">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1,
              )
              .map((page, idx, arr) => {
                const showEllipsisBefore = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      className={`rounded-full w-10 h-10 ${currentPage === page ? "bg-sky-500 hover:bg-sky-600 text-white" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  </React.Fragment>
                );
              })}

            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-10 h-10"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* MODAL XÁC NHẬN XÓA KHÓA HỌC */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center text-slate-800">
              Admin xác nhận xóa?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 text-base mt-2">
              Khóa học{" "}
              <span className="font-bold text-slate-700">
                "{courseToDelete?.title}"
              </span>{" "}
              sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex sm:justify-center gap-3 mt-6">
            <AlertDialogCancel className="rounded-full px-8 border-slate-200 hover:bg-slate-50">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="rounded-full px-8 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100"
            >
              Xóa bằng quyền Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <CourseForm
        open={isCourseFormOpen}
        onOpenChange={setIsCourseFormOpen}
        initialData={editingCourse}
        onSuccess={fetchCourses}
      />

      {/* DIALOG NHẬP LÝ DO TỪ CHỐI */}
      <AlertDialog
        open={isRejectDialogOpen}
        onOpenChange={setIsRejectDialogOpen}
      >
        <AlertDialogContent className="rounded-[32px] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center text-slate-800">
              Từ chối khóa học?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 text-base mt-2">
              Nhập lý do từ chối để giảng viên biết và chỉnh sửa lại.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            className="mt-4 resize-none rounded-2xl border-slate-200 focus:border-red-300"
            rows={4}
            placeholder="Ví dụ: Nội dung chưa đầy đủ, thiếu mô tả bài học..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
          <AlertDialogFooter className="flex sm:justify-center gap-3 mt-6">
            <AlertDialogCancel className="rounded-full px-8 border-slate-200 hover:bg-slate-50">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmReject}
              className="rounded-full px-8 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100"
            >
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
