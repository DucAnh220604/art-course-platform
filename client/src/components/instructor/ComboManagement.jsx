import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, Send, Package } from "lucide-react";
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

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const response = await comboApi.getAllCombos({ forManagement: true });
      const allCombos = response.data.combos || [];

      // Lọc ra combo của instructor này
      const myCombos = allCombos.filter(
        (c) => c.instructor?._id === user?._id || c.instructor === user?._id,
      );
      setCombos(myCombos);
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
  }, [user]);

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

  const filteredCombos =
    activeTab === "all" ? combos : combos.filter((c) => c.status === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Quản lý Combo</h2>
          <p className="text-gray-600 mt-1">
            Tạo và quản lý combo khóa học của bạn
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCombo(null);
            setIsComboFormOpen(true);
          }}
          className="bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 rounded-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tạo Combo Mới
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-5">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="draft">Nháp</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="published">Đã đăng</TabsTrigger>
          <TabsTrigger value="rejected">Từ chối</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Combo</TableHead>
              <TableHead>Khóa học</TableHead>
              <TableHead>Giá gốc</TableHead>
              <TableHead>Giá combo</TableHead>
              <TableHead>Giảm giá</TableHead>
              <TableHead>Học viên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : filteredCombos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <Package className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">Chưa có combo nào</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCombos.map((combo) => (
                <TableRow key={combo._id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          combo.courses?.[0]?.thumbnail ||
                          combo.thumbnail ||
                          "/placeholder-course.jpg"
                        }
                        alt={combo.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-semibold">{combo.title}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{combo.courses?.length || 0}</TableCell>
                  <TableCell>
                    {combo.originalPrice?.toLocaleString()}đ
                  </TableCell>
                  <TableCell className="font-semibold text-sky-600">
                    {combo.price?.toLocaleString()}đ
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-700">
                      {combo.discountPercentage}%
                    </Badge>
                  </TableCell>
                  <TableCell>{combo.enrolledCount ?? combo.totalStudents ?? 0}</TableCell>
                  <TableCell>{getStatusBadge(combo.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewDetail(combo.slug)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {combo.status === "draft" && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingCombo(combo);
                              setIsComboFormOpen(true);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleSubmitForReview(combo._id)}
                          >
                            <Send className="w-4 h-4 text-amber-600" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => confirmDeleteCombo(combo)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </>
                      )}
                      {combo.status === "rejected" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCombo(combo);
                            setIsComboFormOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
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
