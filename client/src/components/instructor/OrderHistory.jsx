import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  Search,
  Loader2,
} from "lucide-react";
import paymentApi from "@/api/paymentApi";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]); // ✅ Thêm state cho filtered orders
  const [summary, setSummary] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Search states
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  // ✅ Debounce search input
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setSearchTerm(searchInput);
    }, 400);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput]);

  // ✅ Filter orders khi search term thay đổi
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) =>
        order.txnRef.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getInstructorOrders();
      setOrders(response.data.data.orders);
      setFilteredOrders(response.data.data.orders); // ✅ Set cả filtered orders
      setSummary(response.data.data.summary);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lịch sử đơn hàng</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi các giao dịch từ khóa học và combo của bạn
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.totalOrders}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingBag className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Giá trung bình</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {summary.totalOrders > 0
                  ? formatCurrency(summary.totalRevenue / summary.totalOrders)
                  : formatCurrency(0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Search Bar */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo mã giao dịch..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {searchInput !== searchTerm && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            </div>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            Tìm thấy{" "}
            <span className="font-semibold">{filteredOrders.length}</span> kết
            quả
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã GD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Khóa học/Combo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Học viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày thanh toán
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* ✅ Dùng filteredOrders thay vì orders */}
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-lg font-medium">
                      {searchTerm
                        ? "Không tìm thấy giao dịch"
                        : "Chưa có đơn hàng nào"}
                    </p>
                    <p className="text-sm">
                      {searchTerm
                        ? "Thử tìm kiếm với mã giao dịch khác"
                        : "Khi có học viên mua khóa học của bạn, chúng sẽ hiển thị ở đây"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {/* ✅ Highlight matched text */}
                        {searchTerm ? (
                          <>
                            {order.txnRef
                              .split(new RegExp(`(${searchTerm})`, "gi"))
                              .map((part, i) =>
                                part.toLowerCase() ===
                                searchTerm.toLowerCase() ? (
                                  <mark
                                    key={i}
                                    className="bg-yellow-200 px-0.5 rounded"
                                  >
                                    {part}
                                  </mark>
                                ) : (
                                  part
                                ),
                              )}
                          </>
                        ) : (
                          order.txnRef
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {order.item?.thumbnail && (
                          <img
                            src={order.item.thumbnail}
                            alt={order.item.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {order.item?.title || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {order.itemType === "course" ? "Khóa học" : "Combo"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {order.user?.fullname ||
                            order.user?.username ||
                            "N/A"}{" "}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.user?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {formatDate(order.paidAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="text-sm font-semibold text-green-600">
                        {formatCurrency(order.amount)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
