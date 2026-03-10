// src/components/course/ReviewSection.jsx
import React, { useState, useEffect } from "react";
import { Star, Send, Trash2, Edit } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import reviewApi from "@/api/reviewApi";
import { useAuth } from "@/context/AuthContext";

export function ReviewSection({ courseId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "good" | "bad" | 1-5

  // Form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const response = await reviewApi.getCourseReviews(courseId);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("Lỗi tải đánh giá", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Bé cần đăng nhập để đánh giá nha!");
      return;
    }

    setIsSubmitting(true);
    toast.promise(reviewApi.createReview({ courseId, rating, comment }), {
      loading: "Đang gửi đánh giá...",
      success: () => {
        fetchReviews();
        setComment("");
        setRating(5);
        return "Tuyệt vời! Cảm ơn bé đã nhận xét ";
      },
      error: (err) => err.response?.data?.message || "Có lỗi xảy ra rồi!",
    });
    setIsSubmitting(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bé muốn xóa nhận xét này hả?")) return;
    toast.promise(reviewApi.deleteReview(id), {
      loading: "Đang xóa...",
      success: () => {
        fetchReviews();
        return "Đã xóa nhận xét!";
      },
      error: "Không xóa được rồi!",
    });
  };

  return (
    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100 mt-8">
      <h3 className="text-2xl font-bold text-slate-800 mb-6">
        Đánh giá từ học viên
      </h3>

      {/* Form Viết Đánh Giá */}
      {user && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 bg-slate-50 p-6 rounded-[24px]"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="font-bold text-slate-700 mr-2">
              Bé cho mấy sao?
            </span>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-colors ${
                  star <= (hoveredStar || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Textarea
            placeholder="Khóa học này như thế nào? Bé viết cảm nhận vào đây nhé..."
            className="rounded-2xl border-none bg-white mb-4 min-h-[100px]"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-sky-500 hover:bg-sky-600 px-8"
          >
            <Send className="w-4 h-4 mr-2" /> Gửi đánh giá
          </Button>
        </form>
      )}

      {/* Bộ lọc đánh giá */}
      {!loading &&
        reviews.length > 0 &&
        (() => {
          const goodCount = reviews.filter((r) => r.rating >= 3).length;
          const badCount = reviews.filter((r) => r.rating < 3).length;
          const starCount = (star) =>
            reviews.filter((r) => r.rating === star).length;
          return (
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {[
                { key: "all", label: `Tất cả (${reviews.length})` },
                { key: "good", label: ` Tốt (${goodCount})` },
                { key: "bad", label: ` Chưa tốt (${badCount})` },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    activeFilter === key
                      ? "bg-sky-500 text-white border-sky-500"
                      : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"
                  }`}
                >
                  {label}
                </button>
              ))}
              <Select
                value={
                  typeof activeFilter === "number" ? String(activeFilter) : ""
                }
                onValueChange={(val) => setActiveFilter(Number(val))}
              >
                <SelectTrigger
                  className={`w-44 rounded-full h-8 text-sm border transition-colors ${
                    typeof activeFilter === "number"
                      ? "bg-sky-500 text-white border-sky-500"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                >
                  <SelectValue placeholder="Lọc theo sao..." />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  {[5, 4, 3, 2, 1].map((s) => (
                    <SelectItem key={s} value={String(s)}>
                      {"★".repeat(s)}
                      {"☆".repeat(5 - s)} ({starCount(s)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })()}

      {/* Danh sách Đánh Giá */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center text-slate-400">Đang tải nhận xét...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-slate-400 py-8">
            Chưa có đánh giá nào. Bé hãy là người đầu tiên nhé!
          </div>
        ) : (
          (() => {
            const filtered = reviews.filter((r) => {
              if (activeFilter === "all") return true;
              if (activeFilter === "good") return r.rating >= 3;
              if (activeFilter === "bad") return r.rating < 3;
              return r.rating === activeFilter;
            });
            return filtered.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                Không có đánh giá nào trong nhóm này.
              </div>
            ) : (
              filtered.map((rev) => (
                <div
                  key={rev._id}
                  className="flex gap-4 p-4 hover:bg-slate-50 rounded-2xl transition-colors group"
                >
                  <Avatar className="w-12 h-12 border-2 border-slate-100">
                    <AvatarImage src={rev.user?.avatar} />
                    <AvatarFallback className="bg-sky-100 text-sky-600 font-bold">
                      {rev.user?.fullname?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800">
                        {rev.user?.fullname || "Người dùng ẩn danh"}
                      </h4>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {new Date(rev.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-slate-600">{rev.comment}</p>
                  </div>

                  {/* Nút Xóa (Chỉ hiện nếu là comment của user đang đăng nhập hoặc admin) */}
                  {(user?._id === rev.user?._id || user?.role === "admin") && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDelete(rev._id)}
                        className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))
            );
          })()
        )}
      </div>
    </div>
  );
}
