import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Send, Package, ChevronLeft, ChevronRight } from "lucide-react";
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
import comboApi from "@/api/comboApi";
import { ComboForm } from "./ComboForm";
import { useAuth } from "@/context/AuthContext";

export function ComboManagement() {
  const { user } = useAuth();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isComboFormOpen, setIsComboFormOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState(null);
  const [viewingCombo, setViewingCombo] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchCombos = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await comboApi.getAllCombos({ 
        forManagement: true,
        instructor: user._id,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        status: activeTab !== "all" ? activeTab : undefined
      });
      setCombos(response.data.combos || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      toast.error("Không thể tải danh sách combo!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCombos();
    }
  }, [user, currentPage, activeTab]);

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
      const response = await comboApi.getComboBySlug(slug);
      setViewingCombo(response.data.data);
      toast.success("Mở combo thành công! 📦");
    } catch (error) {
      toast.error("Không xem được chi tiết combo!");
    }
  };

  const confirmDeleteCombo = (combo) => {
    setComboToDelete(combo);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteCombo = async () => {
    if (!comboToDelete) return;

    const enrolled = comboToDelete.enrolledCount ?? comboToDelete.totalStudents ?? 0;
    if (enrolled > 0) {
      toast.error("Không thể xóa!", {
        description: `Combo đã có ${enrolled} học viên đăng ký.`,
      });
      setIsDeleteDialogOpen(false);
      return;
    }

    toast.promise(comboApi.deleteCombo(comboToDelete._id), {
      loading: "Đang xóa combo...",
      success: () => {
        fetchCombos();
        setIsDeleteDialogOpen(false);
        return `Đã xóa combo "${comboToDelete.title}" thành công! 🗑️`;
      },
      error: (err) =>
        err?.response?.data?.message || "Không xóa được, bé thử lại nhé! ❌",
    });
  };

  const handleSubmitForReview = async (comboId) => {
    toast.promise(comboApi.updateCombo(comboId, { status: "pending" }), {
      loading: "Đang gửi yêu cầu duyệt...",
      success: () => {
        fetchCombos();
        return "Đã gửi phê duyệt thành công! Vui lòng chờ admin duyệt nhé. 🚀";
      },
      error: "Không thể gửi yêu cầu, bé thử lại sau nha! ❌",
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

  // Nếu đang xem chi tiết combo
  if (viewingCombo) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setViewingCombo(null)}
            className="rounded-full"
          >
            ← Quay lại quản lý
          </Button>
          {getStatusBadge(viewingCombo.status)}
        </div>

        <Card className="p-6">
          <div className="flex gap-6">
            <img
              src={
                viewingCombo.courses?.[0]?.thumbnail ||
                viewingCombo.thumbnail ||
                "/placeholder-course.jpg"
              }
              alt={viewingCombo.title}
              className="w-64 h-48 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{viewingCombo.title}</h2>
              <p className="text-gray-600 mb-4">{viewingCombo.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tổng giá gốc:</span>
                  <p className="font-semibold">
                    {viewingCombo.originalPrice?.toLocaleString()}đ
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Giá combo:</span>
                  <p className="font-semibold text-sky-600">
                    {viewingCombo.price?.toLocaleString()}đ
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Giảm giá:</span>
                  <p className="font-semibold text-green-600">
                    {viewingCombo.discountPercentage}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Học viên:</span>
                  <p className="font-semibold">
                    {viewingCombo.enrolledCount ?? viewingCombo.totalStudents ?? 0} người
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4">
              Khóa học trong combo ({viewingCombo.courses?.length})
            </h3>
            <div className="space-y-3">
              {viewingCombo.courses?.map((course) => (
                <div
                  key={course._id}
                  className="p-4 border rounded-lg flex items-center justify-between hover:bg-slate-50"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-24 h-16 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-semibold">{course.title}</h4>
                      <p className="text-sm text-gray-500">{course.category}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-sky-600">
                    {course.price?.toLocaleString()}đ
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const filteredCombos = combos;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-800">Quản lý Combo</h1>
          <p className="text-slate-500 mt-2">
            Tạo và quản lý các gói combo khóa học của bé.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCombo(null);
            setIsComboFormOpen(true);
          }}
          className="rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-lg shadow-sky-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Combo Mới
        </Button>
      </div>

      {/* Tabs */}
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

      {/* Table */}
      <Card className="rounded-[32px] border border-slate-100 shadow-sm overflow-hidden bg-white">
        <Table>
          <TableHeader className="bg-slate-50/80">
            <TableRow className="border-b-slate-100">
              <TableHead className="pl-6 font-bold text-slate-700">Combo</TableHead>
              <TableHead className="font-bold text-slate-700">Trạng thái</TableHead>
              <TableHead className="font-bold text-slate-700">Giá gốc</TableHead>
              <TableHead className="font-bold text-slate-700">Giá combo</TableHead>
              <TableHead className="font-bold text-slate-700">Học viên</TableHead>
              <TableHead className="text-right pr-6 font-bold text-slate-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20 text-slate-500">
                  Đang tải dữ liệu...
                </TableCell>
              </TableRow>
            ) : filteredCombos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24 text-slate-400">
                  <div className="text-4xl mb-2">📦</div>
                  Bạn chưa có combo nào ở mục này.
                </TableCell>
              </TableRow>
            ) : (
              filteredCombos.map((combo) => (
                <TableRow key={combo._id} className="hover:bg-slate-50/50 transition-colors border-b-slate-50">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={combo.courses?.[0]?.thumbnail || combo.thumbnail || "/placeholder-course.jpg"}
                        alt={combo.title}
                        className="w-24 h-16 rounded-xl object-cover shadow-sm border border-slate-100"
                      />
                      <div className="max-w-[200px]">
                        <p className="font-bold text-slate-800 line-clamp-1">{combo.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {combo.courses?.length || 0} khóa học trong gói
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(combo.status)}</TableCell>
                  <TableCell className="text-slate-400 line-through text-xs">
                    {combo.originalPrice?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="font-black text-sky-600">
                    {combo.price?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="font-medium text-slate-600">
                    {combo.enrolledCount ?? combo.totalStudents ?? 0} học viên
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      {(combo.status === "draft" || combo.status === "rejected") && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="rounded-full hover:bg-green-100 text-green-600 bg-green-50 mr-1"
                          onClick={() => handleSubmitForReview(combo._id)}
                          title="Gửi duyệt"
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full hover:bg-sky-50 text-sky-600"
                        onClick={() => handleViewDetail(combo.slug)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {(combo.status === "draft" || combo.status === "rejected") && (
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="rounded-full hover:bg-amber-50 text-amber-600"
                          onClick={() => {
                            setEditingCombo(combo);
                            setIsComboFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="rounded-full hover:bg-red-50 text-red-600"
                        onClick={() => confirmDeleteCombo(combo)}
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
                const showEllipsisBefore =
                  idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsisBefore && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                    <Button
                      variant={
                        currentPage === page ? "default" : "outline"
                      }
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

      {/* Combo Form Modal */}
      <ComboForm
        open={isComboFormOpen}
        onClose={() => {
          setIsComboFormOpen(false);
          setEditingCombo(null);
        }}
        onSuccess={fetchCombos}
        editingCombo={editingCombo}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa combo</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa combo "{comboToDelete?.title}"? Hành
              động này không thể hoàn tác!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCombo}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
