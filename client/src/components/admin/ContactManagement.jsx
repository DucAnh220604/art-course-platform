import { useState, useEffect } from "react";
import {
  Mail,
  Search,
  Reply,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  Eye,
  Send,
  User,
  Calendar,
  MessageSquare,
  Filter,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import contactApi from "@/api/contactApi";
import { useAuth } from "@/context/AuthContext";

export function ContactManagement() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Dialog states
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [replying, setReplying] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    replied: 0,
    closed: 0,
  });

  useEffect(() => {
    fetchMessages();
  }, [pagination.page, statusFilter]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await contactApi.getAllMessages({
        status: statusFilter,
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response.data?.success) {
        setMessages(response.data.data.messages);
        setPagination(response.data.data.pagination);
        calculateStats(response.data.data.messages);
      }
    } catch (error) {
      toast.error("Không thể tải tin nhắn");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = async () => {
    try {
      // Fetch all messages to calculate stats
      const [pendingRes, repliedRes, closedRes] = await Promise.all([
        contactApi.getAllMessages({ status: "pending", limit: 1 }),
        contactApi.getAllMessages({ status: "replied", limit: 1 }),
        contactApi.getAllMessages({ status: "closed", limit: 1 }),
      ]);

      setStats({
        pending: pendingRes.data?.data?.pagination?.total || 0,
        replied: repliedRes.data?.data?.pagination?.total || 0,
        closed: closedRes.data?.data?.pagination?.total || 0,
        total:
          (pendingRes.data?.data?.pagination?.total || 0) +
          (repliedRes.data?.data?.pagination?.total || 0) +
          (closedRes.data?.data?.pagination?.total || 0),
      });
    } catch (error) {
      console.error("Error calculating stats:", error);
    }
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const handleOpenReply = (message) => {
    setSelectedMessage(message);
    setReplyContent("");
    setReplyDialogOpen(true);
  };

  const handleReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      setReplying(true);
      const response = await contactApi.replyMessage(
        selectedMessage._id,
        replyContent,
      );

      if (response.data?.success) {
        toast.success("Phản hồi thành công!", {
          description: "Email đã được gửi đến người dùng.",
        });
        setReplyDialogOpen(false);
        setReplyContent("");
        fetchMessages();
      }
    } catch (error) {
      toast.error("Phản hồi thất bại", {
        description:
          error.response?.data?.message ||
          "Vui lòng kiểm tra cấu hình email server.",
      });
    } finally {
      setReplying(false);
    }
  };

  const handleUpdateStatus = async (messageId, status) => {
    try {
      const response = await contactApi.updateStatus(messageId, status);
      if (response.data?.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchMessages();
      }
    } catch (error) {
      toast.error("Cập nhật thất bại");
    }
  };

  const handleDelete = async (messageId) => {
    if (!confirm("Bạn có chắc muốn xóa tin nhắn này?")) return;

    try {
      const response = await contactApi.deleteMessage(messageId);
      if (response.data?.success) {
        toast.success("Xóa tin nhắn thành công");
        fetchMessages();
      }
    } catch (error) {
      toast.error("Xóa thất bại");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            <Clock className="w-3 h-3 mr-1" />
            Chờ phản hồi
          </Badge>
        );
      case "replied":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã phản hồi
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            <XCircle className="w-3 h-3 mr-1" />
            Đã đóng
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý tin nhắn liên hệ
          </h1>
          <p className="text-gray-500 mt-1">
            Xem và phản hồi tin nhắn từ khách hàng
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchMessages}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Tổng tin nhắn</p>
                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Chờ phản hồi</p>
                <p className="text-xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã phản hồi</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.replied}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Đã đóng</p>
                <p className="text-xl font-bold text-gray-600">
                  {stats.closed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email, nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ phản hồi</SelectItem>
            <SelectItem value="replied">Đã phản hồi</SelectItem>
            <SelectItem value="closed">Đã đóng</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Messages Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Không có tin nhắn nào</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Người gửi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Nội dung
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Ngày gửi
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredMessages.map((message) => (
                    <tr key={message._id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {message.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {message.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-gray-700 line-clamp-2 max-w-md">
                          {message.message}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(message.createdAt)}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(message.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleViewMessage(message)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {message.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenReply(message)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Reply className="w-4 h-4" />
                            </Button>
                          )}
                          {user?.role === "admin" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(message._id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-sm text-gray-500">
                Hiển thị {filteredMessages.length} / {pagination.total} tin nhắn
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page - 1 }))
                  }
                >
                  Trước
                </Button>
                <span className="flex items-center px-3 text-sm text-gray-600">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() =>
                    setPagination((p) => ({ ...p, page: p.page + 1 }))
                  }
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết tin nhắn</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-sky-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedMessage.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedMessage.email}
                    </p>
                  </div>
                </div>
                {getStatusBadge(selectedMessage.status)}
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {formatDate(selectedMessage.createdAt)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-700 mb-2">Nội dung:</h4>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {selectedMessage.reply?.content && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Đã phản hồi
                  </h4>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {selectedMessage.reply.content}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Phản hồi bởi: {selectedMessage.reply.repliedBy?.username} -{" "}
                    {formatDate(selectedMessage.reply.repliedAt)}
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                {selectedMessage.status === "pending" && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      setViewDialogOpen(false);
                      handleOpenReply(selectedMessage);
                    }}
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Phản hồi
                  </Button>
                )}
                {selectedMessage.status !== "closed" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleUpdateStatus(selectedMessage._id, "closed");
                      setViewDialogOpen(false);
                    }}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Đóng tin nhắn
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Phản hồi tin nhắn</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{selectedMessage.name}</span>
                  <span className="text-gray-500">
                    ({selectedMessage.email})
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-3">
                  "{selectedMessage.message}"
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội dung phản hồi
                </label>
                <Textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Nhập nội dung phản hồi... Email sẽ được gửi đến người dùng."
                  rows={6}
                  className="resize-none"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setReplyDialogOpen(false)}
                  disabled={replying}
                >
                  Hủy
                </Button>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={handleReply}
                  disabled={replying || !replyContent.trim()}
                >
                  {replying ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Gửi phản hồi
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
