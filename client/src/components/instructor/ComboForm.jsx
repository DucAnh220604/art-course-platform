import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronDown, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import comboApi from "@/api/comboApi";
import courseApi from "@/api/courseApi";
import { useAuth } from "@/context/AuthContext";

export function ComboForm({ open, onClose, onSuccess, editingCombo = null }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const dropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courses: [],
    price: 0,
  });

  // Fetch courses của instructor này
  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        const response = await courseApi.getAllCourses();
        const allCourses = response.data.courses || [];
        // Lọc ra courses của instructor này và đã published
        const myCourses = allCourses.filter(
          (c) =>
            (c.instructor?._id === user?._id || c.instructor === user?._id) &&
            c.status === "published",
        );
        setAvailableCourses(myCourses);
      } catch (error) {
        toast.error("Không thể tải danh sách khóa học!");
      }
    };

    if (open && user) {
      fetchMyCourses();
    }
  }, [open, user]);

  // Load data nếu đang edit
  useEffect(() => {
    if (editingCombo) {
      setFormData({
        title: editingCombo.title || "",
        description: editingCombo.description || "",
        courses: editingCombo.courses?.map((c) => c._id || c) || [],
        price: editingCombo.price || 0,
      });
    } else {
      // Reset form khi tạo mới
      setFormData({
        title: "",
        description: "",
        courses: [],
        price: 0,
      });
    }
  }, [editingCombo, open]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCourseToggle = (courseId) => {
    setFormData((prev) => {
      const courses = prev.courses.includes(courseId)
        ? prev.courses.filter((id) => id !== courseId)
        : [...prev.courses, courseId];
      return { ...prev, courses };
    });
  };

  const calculateOriginalPrice = () => {
    return availableCourses
      .filter((c) => formData.courses.includes(c._id))
      .reduce((sum, c) => sum + (c.price || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title?.trim()) {
      toast.error("Vui lòng nhập tên combo!");
      return;
    }
    if (!formData.description?.trim()) {
      toast.error("Vui lòng nhập mô tả combo!");
      return;
    }
    if (formData.courses.length < 2 || formData.courses.length > 8) {
      toast.error("Combo phải có từ 2 đến 8 khóa học!");
      return;
    }

    const originalPrice = calculateOriginalPrice();
    if (formData.price < 0) {
      toast.error("Giá không thể âm!");
      return;
    }
    if (formData.price >= originalPrice) {
      toast.error("Giá combo phải nhỏ hơn tổng giá gốc để có giảm giá!");
      return;
    }

    try {
      setLoading(true);
      if (editingCombo) {
        await comboApi.updateCombo(editingCombo._id, formData);
        toast.success("Cập nhật combo thành công! 🎉");
      } else {
        await comboApi.createCombo(formData);
        toast.success("Tạo combo thành công! Vui lòng gửi duyệt. 🚀");
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại! ❌",
      );
    } finally {
      setLoading(false);
    }
  };

  const originalPrice = calculateOriginalPrice();
  const discount =
    originalPrice > 0 && formData.price < originalPrice
      ? Math.round(((originalPrice - formData.price) / originalPrice) * 100)
      : 0;

  const categories = [
    ...new Set(availableCourses.map((c) => c.category).filter(Boolean)),
  ];
  const filteredCourses = availableCourses.filter((c) => {
    const matchesSearch = c.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  const selectedCourses = availableCourses.filter((c) =>
    formData.courses.includes(c._id),
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-sky-600">
            {editingCombo ? "Chỉnh sửa Combo" : "Tạo Combo Khóa Học Mới"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên Combo */}
          <div>
            <Label htmlFor="title" className="font-semibold">
              Tên Combo *
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ví dụ: Combo Học Vẽ Toàn Diện"
              required
            />
          </div>

          {/* Mô tả */}
          <div>
            <Label htmlFor="description" className="font-semibold">
              Mô tả *
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về combo này..."
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          {/* Chọn Khóa Học */}
          <div ref={dropdownRef}>
            <Label className="font-semibold mb-3 block">
              Chọn Khóa Học (2-8 khóa) *
            </Label>

            {/* Trigger button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="w-full flex items-center justify-between border rounded-md px-3 py-2 text-sm bg-background hover:bg-slate-50 transition-colors"
            >
              <span className="text-gray-600">
                {formData.courses.length === 0
                  ? "Bấm để chọn khóa học..."
                  : `Đã chọn ${formData.courses.length} khóa học`}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown panel */}
            {isDropdownOpen && (
              <div className="border rounded-lg mt-1 p-3 space-y-3 bg-white shadow-md">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Tìm khóa học..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Category filter */}
                <div onMouseDown={(e) => e.stopPropagation()}>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Lọc theo danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Course list */}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredCourses.length === 0 ? (
                    <p className="text-sm text-gray-500 py-2 text-center">
                      {availableCourses.length === 0
                        ? "Bạn chưa có khóa học nào được phát hành!"
                        : "Không tìm thấy khóa học phù hợp."}
                    </p>
                  ) : (
                    filteredCourses.map((course) => (
                      <div
                        key={course._id}
                        className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded cursor-pointer"
                        onClick={() => handleCourseToggle(course._id)}
                      >
                        <Checkbox
                          id={`dropdown-${course._id}`}
                          checked={formData.courses.includes(course._id)}
                          onCheckedChange={() => handleCourseToggle(course._id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <label
                          htmlFor={`dropdown-${course._id}`}
                          className="flex-1 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">
                                {course.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {course.category}
                              </p>
                            </div>
                            <p className="font-semibold text-sky-600 text-sm">
                              {course.price?.toLocaleString()}đ
                            </p>
                          </div>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Selected course tags */}
            {selectedCourses.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCourses.map((course) => (
                  <Badge
                    key={course._id}
                    variant="secondary"
                    className="flex items-center gap-1 pr-1"
                  >
                    <span className="text-xs">{course.title}</span>
                    <button
                      type="button"
                      onClick={() => handleCourseToggle(course._id)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500 mt-2">
              Đã chọn: {formData.courses.length}/8 khóa học
            </p>
          </div>

          {/* Giá */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="font-semibold">Tổng Giá Gốc</Label>
              <Input
                value={`${originalPrice.toLocaleString()}đ`}
                disabled
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="price" className="font-semibold">
                Giá Combo *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                required
              />
            </div>
          </div>

          {/* Hiển thị % giảm giá */}
          {discount > 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-semibold text-green-700">
                🎉 Giảm giá: {discount}%
              </p>
              <p className="text-xs text-green-600 mt-1">
                Tiết kiệm: {(originalPrice - formData.price).toLocaleString()}đ
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={loading} className="bg-sky-600">
              {loading
                ? "Đang xử lý..."
                : editingCombo
                  ? "Cập nhật"
                  : "Tạo Combo"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
