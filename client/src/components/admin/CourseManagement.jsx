import React, { useState, useEffect } from "react";
import { Star, Edit, Trash2, Eye, CheckCircle2, XCircle } from "lucide-react";
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
import { SectionManager } from "../instructor/SectionManager"; // Dùng chung SectionManager
import { CourseForm } from "../instructor/CourseForm"; // Dùng chung CourseForm

export function AdminCourseManagement() {
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

  // States cho Dialog Nhập Lý do Từ chối
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [courseToReject, setCourseToReject] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Admin lấy TẤT CẢ khóa học, không lọc gì cả
      const response = await courseApi.getAllCourses();
      setCourses(response.data.courses || []);
    } catch (error) {
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

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
      error: "Lỗi hệ thống khi xóa khóa học! ❌",
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

  // Nếu đang xem chi tiết một khóa học (Admin View)
  if (viewingCourse) {
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
            <p className="text-sm font-medium text-purple-600 mt-1">
              Giảng viên: {viewingCourse.instructor?.fullname || "Không rõ"}
            </p>
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
            </div>
            {viewingCourse.status === "rejected" && viewingCourse.rejectedReason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-700">
                <span className="font-bold">Lý do từ chối: </span>
                {viewingCourse.rejectedReason}
              </div>
            )}
          </div>
        </div>

        {/* Tái sử dụng SectionManager để xem/xóa/sửa Lesson (Admin cũng cần có quyền này) */}
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
                  colSpan={4}
                  className="text-center py-20 text-slate-500"
                >
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : displayedCourses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
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
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
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
