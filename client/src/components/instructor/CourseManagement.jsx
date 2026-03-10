import React, { useState, useEffect } from "react";
import { Plus, Star, Edit, Trash2, Eye, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { SectionManager } from "./SectionManager";
import { CourseForm } from "./CourseForm";
import { useAuth } from "@/context/AuthContext"; // Import để lấy ID của Instructor

export function CourseManagement() {
  const { user } = useAuth(); // Lấy thông tin user đang đăng nhập
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingCourse, setViewingCourse] = useState(null);

  // State quản lý Tab hiển thị
  const [activeTab, setActiveTab] = useState("all");

  // States cho Course Form Modal
  const [isCourseFormOpen, setIsCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // States cho Modal Xác nhận Xóa
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseApi.getAllCourses({ forManagement: true });
      const allCourses = response.data.courses || [];

      // 1. CHỈ LỌC RA KHÓA HỌC CỦA INSTRUCTOR NÀY
      const myCourses = allCourses.filter(
        (c) => c.instructor?._id === user?._id || c.instructor === user?._id,
      );
      setCourses(myCourses);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const handleViewDetail = async (slug) => {
    try {
      const response = await courseApi.getCourseBySlug(slug);
      setViewingCourse(response.data);
      toast.success("Mở khóa học thành công!", {
        description: `Bé đang xem chi tiết: ${response.data.title} 📖`,
      });
    } catch (error) {
      toast.error("Không xem được chi tiết rồi!", {
        description: "Bé thử chọn khóa học khác xem sao nhé! 🎨",
      });
    }
  };

  const confirmDeleteCourse = (course) => {
    setCourseToDelete(course);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    // Guard thêm ở FE (phòng trường hợp dữ liệu thay đổi)
    const enrolled = courseToDelete.enrolledCount ?? courseToDelete.totalStudents ?? 0;
    if (enrolled > 0) {
      toast.error("Không thể xóa!", {
        description: `Khóa học đã có ${enrolled} học viên đăng ký.`,
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    toast.promise(courseApi.deleteCourse(courseToDelete._id), {
      loading: "Đang dọn dẹp khóa học...",
      success: () => {
        fetchCourses();
        setIsDeleteDialogOpen(false);
        return `Đã xóa khóa học "${courseToDelete.title}" thành công! 🧹`;
      },
      error: (err) =>
        err?.response?.data?.message ||
        "Không xóa được rồi, bé kiểm tra lại nhé! ❌",
    });
  };

  // 2. HÀM GỬI DUYỆT (Chuyển status thành pending)
  const handleSubmitForReview = async (courseId) => {
    toast.promise(
      // Tận dụng API update hiện có để cập nhật trạng thái
      courseApi.updateCourse(courseId, { status: "pending" }),
      {
        loading: "Đang gửi yêu cầu duyệt...",
        success: () => {
          fetchCourses(); // Tải lại danh sách để cập nhật UI
          return "Đã gửi phê duyệt thành công! Vui lòng chờ admin duyệt nhé. 🚀";
        },
        error: (err) => {
          return err.response?.data?.message || "Không thể gửi yêu cầu, bé thử lại sau nha! ❌";
        },
      },
    );
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

  // Nếu đang xem chi tiết một khóa học
  if (viewingCourse) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => setViewingCourse(null)}
          className="rounded-full"
        >
          ← Quay lại danh sách
        </Button>
        <div className="flex flex-col md:flex-row gap-6 items-start bg-white p-6 rounded-[32px] shadow-sm border border-slate-100">
          <img
            src={viewingCourse.thumbnail}
            className="w-full md:w-64 h-40 rounded-2xl object-cover shadow-md"
            alt=""
          />
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-slate-800">
              {viewingCourse.title}
            </h2>
            <p className="text-slate-500 mt-2 line-clamp-2">
              {viewingCourse.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              {getStatusBadge(viewingCourse.status)}
              <Badge
                variant="secondary"
                className="bg-sky-50 text-sky-700 border-sky-100"
              >
                {viewingCourse.category}
              </Badge>
              <Badge variant="outline">
                Giá: {viewingCourse.price?.toLocaleString()}đ
              </Badge>
              <Badge className="bg-amber-50 text-amber-700 border-amber-200 border">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 mr-1" />
                {viewingCourse.averageRating ?? 0} / 5 ({viewingCourse.numOfReviews ?? 0} đánh giá)
              </Badge>
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200 border">
                {viewingCourse.totalStudents ?? 0} học viên
              </Badge>
            </div>
            {viewingCourse.status === "rejected" && viewingCourse.rejectedReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                <span className="font-bold">Lý do từ chối: </span>
                {viewingCourse.rejectedReason}
              </div>
            )}
          </div>
        </div>

        <SectionManager
          course={viewingCourse}
          onRefresh={() => handleViewDetail(viewingCourse.slug)}
        />
      </div>
    );
  }

  // Lọc khóa học theo Tab đang chọn
  const displayedCourses = courses.filter(
    (c) => activeTab === "all" || c.status === activeTab,
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-bold text-slate-800">Khóa học của tôi</h1>
        <Button
          onClick={() => {
            setEditingCourse(null);
            setIsCourseFormOpen(true);
          }}
          className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-lg shadow-sky-200"
        >
          <Plus className="w-4 h-4 mr-2" /> Tạo khóa học mới
        </Button>
      </div>

      {/* 3. TABS PHÂN LOẠI TRẠNG THÁI */}
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
            value="draft"
            className="rounded-full px-6 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-800 data-[state=active]:font-bold transition-all"
          >
            Bản nháp
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-full px-6 data-[state=active]:bg-amber-50 data-[state=active]:text-amber-600 data-[state=active]:font-bold transition-all"
          >
            Chờ duyệt
          </TabsTrigger>
          <TabsTrigger
            value="published"
            className="rounded-full px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-600 data-[state=active]:font-bold transition-all"
          >
            Đã đăng
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
                Trạng thái
              </TableHead>
              <TableHead className="font-bold text-slate-700">Giá</TableHead>
              <TableHead className="font-bold text-slate-700">
                Học viên
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
                  <div className="text-4xl mb-2">🎨</div>
                  Bạn chưa có khóa học nào ở mục này.
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
                          Cập nhật:{" "}
                          {new Date(course.updatedAt).toLocaleDateString(
                            "vi-VN",
                          )}
                        </div>
                        {course.status === "rejected" && course.rejectedReason && (
                          <div className="text-xs text-red-500 mt-1 line-clamp-2" title={course.rejectedReason}>
                            <span className="font-semibold">Lý do: </span>
                            {course.rejectedReason}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(course.status)}</TableCell>
                  <TableCell className="font-black text-sky-600">
                    {course.price?.toLocaleString()}đ
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-medium">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{" "}
                      {course.averageRating}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {course.enrolledCount ?? course.totalStudents ?? 0} học viên
                    </div>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      {/* 4. NÚT GỬI DUYỆT (Chỉ hiện khi là draft hoặc rejected) */}
                      {(course.status === "draft" ||
                        course.status === "rejected") && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="rounded-full hover:bg-green-100 text-green-600 bg-green-50 mr-1"
                          onClick={() => handleSubmitForReview(course._id)}
                          title="Gửi yêu cầu kiểm duyệt"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
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
                        className="rounded-full hover:bg-amber-50 text-amber-600"
                        onClick={() => {
                          setEditingCourse(course);
                          setIsCourseFormOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={(course.enrolledCount ?? course.totalStudents ?? 0) > 0}
                        className="rounded-full hover:bg-red-50 text-red-500 disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => confirmDeleteCourse(course)}
                        title={
                          (course.enrolledCount ?? course.totalStudents ?? 0) > 0
                            ? `Không thể xóa — đã có ${course.enrolledCount ?? course.totalStudents ?? 0} học viên đăng ký`
                            : "Xóa khóa học"
                        }
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
              Bé có chắc muốn xóa không?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 text-base mt-2">
              Khóa học{" "}
              <span className="font-bold text-slate-700">
                "{courseToDelete?.title}"
              </span>{" "}
              sẽ biến mất và không thể lấy lại được đâu nhé! 🎨
              {(courseToDelete?.enrolledCount ?? courseToDelete?.totalStudents ?? 0) > 0 && (
                <span className="block mt-2 text-red-500 font-semibold">
                  ⚠️ Không thể xóa — khóa học đã có{" "}
                  {courseToDelete.enrolledCount ?? courseToDelete.totalStudents ?? 0} học viên đăng ký.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex sm:justify-center gap-3 mt-6">
            <AlertDialogCancel className="rounded-full px-8 border-slate-200 hover:bg-slate-50">
              Hủy bỏ
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="rounded-full px-8 bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100"
            >
              Xác nhận xóa
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
    </div>
  );
}
