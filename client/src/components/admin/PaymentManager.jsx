import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import paymentApi from "@/api/paymentApi";

export default function PaymentManager() {
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    statusCount: {},
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false); // ✅ Thêm state này
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    itemType: "all",
    search: "",
    page: 1,
  });

  // ✅ Debounce search input
  const [searchInput, setSearchInput] = useState("");
  const debounceTimerRef = useRef(null);

  // Effect để fetch data khi filters thay đổi
  useEffect(() => {
    fetchPayments();
  }, [filters]);

  // ✅ Effect để debounce search
  useEffect(() => {
    // Clear timer cũ
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set timer mới - chỉ update filters.search sau 600ms
    debounceTimerRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
    }, 600);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  const fetchPayments = async () => {
    try {
      // ✅ Chỉ show full loading lần đầu, sau đó dùng fetching
      if (payments.length === 0) {
        setLoading(true);
      } else {
        setFetching(true);
      }

      const response = await paymentApi.getAllPayments(filters);
      setPayments(response.data.data.payments);
      setSummary(response.data.data.summary);
      setPagination(response.data.data.pagination);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    // ✅ Scroll to top để user thấy data mới
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date) => {
    return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: {
        label: "Đã thanh toán",
        className: "bg-green-100 text-green-800",
      },
      pending: {
        label: "Đang chờ",
        className: "bg-yellow-100 text-yellow-800",
      },
      failed: { label: "Thất bại", className: "bg-red-100 text-red-800" },
      cancelled: { label: "Đã hủy", className: "bg-gray-100 text-gray-800" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  // ✅ Chỉ hiển thị full loading lần đầu tiên
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý giao dịch
          </h1>
          <p className="text-gray-600 mt-1">
            Theo dõi và quản lý tất cả giao dịch thanh toán trong hệ thống
          </p>
        </div>
        {/* ✅ Loading indicator nhỏ */}
        {fetching && (
          <div className="flex items-center gap-2 text-sky-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Đang tải...</span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(summary.totalRevenue)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng giao dịch</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {pagination.totalItems}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đã thanh toán</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {summary.statusCount?.paid || 0}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Đang chờ</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {summary.statusCount?.pending || 0}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search - ✅ Dùng searchInput thay vì filters.search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo mã GD hoặc mô tả..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              {/* ✅ Hiển thị searching indicator */}
              {searchInput !== filters.search && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="paid">Đã thanh toán</option>
              <option value="pending">Đang chờ</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filters.itemType}
              onChange={(e) => handleFilterChange("itemType", e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">Tất cả loại</option>
              <option value="course">Khóa học</option>
              <option value="combo">Combo</option>
              <option value="cart">Giỏ hàng</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table - ✅ Thêm opacity khi fetching */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div
          className={`overflow-x-auto transition-opacity ${fetching ? "opacity-50" : ""}`}
        >
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã GD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sản phẩm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giảng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Filter className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">
                      Không tìm thấy giao dịch
                    </p>
                    <p className="text-sm">
                      Thử thay đổi bộ lọc để xem kết quả khác
                    </p>
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {payment.txnRef}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {payment.item?.thumbnail && (
                          <img
                            src={payment.item.thumbnail}
                            alt={payment.item.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {payment.item?.title || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {payment.itemType === "course"
                              ? "Khóa học"
                              : payment.itemType === "combo"
                                ? "Combo"
                                : "Giỏ hàng"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {payment.user?.fullname ||
                            payment.user?.username ||
                            "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {payment.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">
                        {payment.item?.instructor?.fullname ||
                          payment.item?.instructor?.username ||
                          "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatDate(payment.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Hiển thị {(pagination.currentPage - 1) * 20 + 1} -{" "}
              {Math.min(pagination.currentPage * 20, pagination.totalItems)} của{" "}
              {pagination.totalItems} giao dịch
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1 || fetching}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-1 border rounded-lg bg-sky-50 text-sky-600 font-medium">
                {pagination.currentPage} / {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={
                  pagination.currentPage === pagination.totalPages || fetching
                }
                className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
