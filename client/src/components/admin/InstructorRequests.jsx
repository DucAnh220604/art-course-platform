import { useState, useEffect, useCallback } from "react";
import {
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Briefcase,
  BookOpen,
  FileImage,
  ExternalLink,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import adminApi from "@/api/adminApi";

// Get the base server URL (without /api)
const getServerBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api$/, "");
};

// Helper function to get full CV file URL
const getCvFileUrl = (cvImage) => {
  if (!cvImage) return null;
  // If it's already a full URL (Cloudinary or other), return as-is
  if (cvImage.startsWith("http://") || cvImage.startsWith("https://")) {
    return cvImage;
  }
  // If it's a relative path, prepend server base URL
  return `${getServerBaseUrl()}${cvImage}`;
};

export function InstructorRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 10,
  });

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingRequest, setViewingRequest] = useState(null);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Helper function to download file with custom filename
  const handleDownloadFile = async (url, fileName) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download error:", error);
      // Fallback to opening in new tab
      window.open(url, "_blank");
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getInstructorRequests({
        page: pagination.currentPage,
        limit: pagination.limit,
        search: searchQuery,
        status: statusFilter,
      });

      if (response.data.success) {
        setRequests(response.data.data.requests || []);
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.currentPage, pagination.limit, searchQuery, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, [searchQuery, statusFilter]);

  const handleView = (request) => {
    setViewingRequest(request);
    setViewDialogOpen(true);
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setConfirmAction("approve");
    setConfirmDialogOpen(true);
  };

  const handleReject = (request) => {
    setSelectedRequest(request);
    setConfirmAction("reject");
    setRejectionReason("");
    setConfirmDialogOpen(true);
  };

  const handleConfirmAction = async () => {
    setIsProcessing(true);
    try {
      const response = await adminApi.handleInstructorRequest(
        selectedRequest._id,
        confirmAction,
        confirmAction === "reject" ? rejectionReason : "",
      );
      if (response.data.success) {
        toast.success(
          confirmAction === "approve"
            ? "Đã duyệt yêu cầu thành công!"
            : "Đã từ chối yêu cầu!",
        );
        setConfirmDialogOpen(false);
        setRejectionReason("");
        fetchRequests();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Đang chờ
          </Badge>
        );
      case "approved":
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã duyệt
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const stats = [
    {
      label: "Đang chờ duyệt",
      value: requests.filter((r) => r.instructorRequestStatus === "pending")
        .length,
      icon: Clock,
      bgColor: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Đã duyệt",
      value: requests.filter((r) => r.instructorRequestStatus === "approved")
        .length,
      icon: UserCheck,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Đã từ chối",
      value: requests.filter((r) => r.instructorRequestStatus === "rejected")
        .length,
      icon: UserX,
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Yêu cầu Instructor</h1>
        <p className="text-gray-600">
          Duyệt các yêu cầu đăng ký làm Instructor từ người dùng
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-xl border shadow-sm">
            <CardContent className="p-6">
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${stat.bgColor}`}
              >
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên, email..."
                className="pl-9 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 rounded-lg">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Đang chờ</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="rejected">Từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px]">Người dùng</TableHead>
                <TableHead className="min-w-[180px]">Email</TableHead>
                <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                <TableHead className="min-w-[100px]">Ngày gửi</TableHead>
                <TableHead className="min-w-[80px] text-right">
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {request.avatar &&
                          request.avatar !== "default-avatar.png" ? (
                            <img
                              src={request.avatar}
                              alt={request.fullname}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-600 font-medium">
                              {request.fullname?.charAt(0)?.toUpperCase() ||
                                "U"}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{request.fullname}</div>
                          <div className="text-xs text-gray-500">
                            @{request.username}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {request.email}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.instructorRequestStatus)}
                    </TableCell>
                    <TableCell className="text-gray-500 text-sm">
                      {formatDate(request.updatedAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(request)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {request.instructorRequestStatus === "pending" && (
                            <>
                              <DropdownMenuItem
                                className="text-green-600"
                                onClick={() => handleApprove(request)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Duyệt
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleReject(request)}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Từ chối
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-gray-500"
                  >
                    Không có yêu cầu nào.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Chi tiết yêu cầu đăng ký Giảng viên
            </DialogTitle>
          </DialogHeader>
          {viewingRequest && (
            <div className="space-y-6 py-4">
              {/* User Info */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {viewingRequest.avatar &&
                  viewingRequest.avatar !== "default-avatar.png" ? (
                    <img
                      src={viewingRequest.avatar}
                      alt={viewingRequest.fullname}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-600 text-2xl font-medium">
                      {viewingRequest.fullname?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-xl">
                    {viewingRequest.fullname}
                  </h3>
                  <p className="text-gray-500">@{viewingRequest.username}</p>
                  <div className="mt-2">
                    {getStatusBadge(viewingRequest.instructorRequestStatus)}
                  </div>
                </div>
              </div>

              {/* Request Data */}
              {viewingRequest.instructorRequestData && (
                <>
                  <div className="bg-sky-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-sky-500" />
                      Thông tin liên hệ
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Họ tên:</span>
                        <p className="font-medium">
                          {viewingRequest.instructorRequestData.fullName ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Số điện thoại:</span>
                        <p className="font-medium">
                          {viewingRequest.instructorRequestData.phone || "N/A"}
                        </p>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-slate-500">Email:</span>
                        <p className="font-medium">
                          {viewingRequest.instructorRequestData.email || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-purple-500" />
                      Thông tin chuyên môn
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Kinh nghiệm:</span>
                        <p className="font-medium">
                          {viewingRequest.instructorRequestData.experience ||
                            "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Chuyên môn:</span>
                        <p className="font-medium">
                          {viewingRequest.instructorRequestData
                            .specialization || "N/A"}
                        </p>
                      </div>
                      {viewingRequest.instructorRequestData.introduction && (
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">
                            Giới thiệu bản thân:
                          </span>
                          <p className="font-medium mt-1 whitespace-pre-wrap">
                            {viewingRequest.instructorRequestData.introduction}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* CV File */}
                  {viewingRequest.instructorRequestData.cvImage && (
                    <div className="bg-amber-50 rounded-xl p-4">
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <FileImage className="w-4 h-4 text-amber-500" />
                        CV / Hồ sơ
                      </h4>
                      <div className="relative group">
                        {viewingRequest.instructorRequestData.cvFileType ===
                          "pdf" ||
                        viewingRequest.instructorRequestData.cvImage
                          .toLowerCase()
                          .includes(".pdf") ||
                        viewingRequest.instructorRequestData.cvImage.includes(
                          "/raw/",
                        ) ? (
                          <div className="flex items-center justify-center p-8 bg-amber-100/50 rounded-lg border border-amber-200">
                            <div className="text-center">
                              <FileImage className="w-16 h-16 text-red-500 mx-auto mb-3" />
                              <p className="text-slate-700 font-medium">
                                {viewingRequest.instructorRequestData
                                  .cvFileName || "File PDF"}
                              </p>
                              <div className="flex items-center justify-center gap-2 mt-3">
                                <a
                                  href={getCvFileUrl(
                                    viewingRequest.instructorRequestData
                                      .cvImage,
                                  )}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                  Xem PDF
                                </a>
                                <button
                                  onClick={() =>
                                    handleDownloadFile(
                                      getCvFileUrl(
                                        viewingRequest.instructorRequestData
                                          .cvImage,
                                      ),
                                      viewingRequest.instructorRequestData
                                        .cvFileName || "CV.pdf",
                                    )
                                  }
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                  Tải về
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={getCvFileUrl(
                                viewingRequest.instructorRequestData.cvImage,
                              )}
                              alt="CV"
                              className="w-full max-h-[400px] object-contain rounded-lg border border-amber-200"
                            />
                            {viewingRequest.instructorRequestData
                              .cvFileName && (
                              <p className="text-center text-sm text-slate-600 mt-2">
                                {
                                  viewingRequest.instructorRequestData
                                    .cvFileName
                                }
                              </p>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                              <a
                                href={getCvFileUrl(
                                  viewingRequest.instructorRequestData.cvImage,
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                title="Xem ảnh"
                              >
                                <ExternalLink className="w-4 h-4 text-gray-600" />
                              </a>
                              <button
                                onClick={() =>
                                  handleDownloadFile(
                                    getCvFileUrl(
                                      viewingRequest.instructorRequestData
                                        .cvImage,
                                    ),
                                    viewingRequest.instructorRequestData
                                      .cvFileName || "CV.jpg",
                                  )
                                }
                                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                                title="Tải về"
                              >
                                <Download className="w-4 h-4 text-gray-600" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Request Timeline */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      Thời gian
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">
                          Ngày gửi yêu cầu:
                        </span>
                        <p className="font-medium">
                          {formatDate(
                            viewingRequest.instructorRequestData.requestedAt,
                          )}
                        </p>
                      </div>
                      {viewingRequest.instructorRequestData.reviewedAt && (
                        <div>
                          <span className="text-slate-500">Ngày xử lý:</span>
                          <p className="font-medium">
                            {formatDate(
                              viewingRequest.instructorRequestData.reviewedAt,
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                    {viewingRequest.instructorRequestData.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                        <span className="text-red-600 text-sm font-medium">
                          Lý do từ chối:
                        </span>
                        <p className="text-red-700 mt-1">
                          {viewingRequest.instructorRequestData.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Legacy Info (fallback if no instructorRequestData) */}
              {!viewingRequest.instructorRequestData &&
                viewingRequest.instructorInfo?.bio && (
                  <div>
                    <span className="text-gray-500">Giới thiệu:</span>
                    <p className="mt-1">{viewingRequest.instructorInfo.bio}</p>
                  </div>
                )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {viewingRequest?.instructorRequestStatus === "pending" && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleReject(viewingRequest);
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleApprove(viewingRequest);
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Duyệt yêu cầu
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmAction === "approve"
                ? "Duyệt yêu cầu"
                : "Từ chối yêu cầu"}
            </DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn{" "}
              {confirmAction === "approve" ? "duyệt" : "từ chối"} yêu cầu của "
              {selectedRequest?.fullname}"?
            </DialogDescription>
          </DialogHeader>
          {confirmAction === "reject" && (
            <div className="py-4">
              <Label htmlFor="rejectionReason" className="text-sm font-medium">
                Lý do từ chối <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="rejectionReason"
                placeholder="Nhập lý do từ chối yêu cầu..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isProcessing}
            >
              Hủy
            </Button>
            <Button
              variant={confirmAction === "approve" ? "default" : "destructive"}
              onClick={handleConfirmAction}
              disabled={
                isProcessing ||
                (confirmAction === "reject" && !rejectionReason.trim())
              }
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Đang xử lý...
                </span>
              ) : confirmAction === "approve" ? (
                "Duyệt"
              ) : (
                "Từ chối"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
