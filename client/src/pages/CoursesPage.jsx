import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import courseApi from "@/api/courseApi";
import { toast } from "sonner";

export function CoursesPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        level: level !== "all" ? level : undefined,
        status: "published", // Truyền thêm param để BE hỗ trợ lọc (nếu có)
      };
      const response = await courseApi.getAllCourses(params);

      // Lọc chắc chắn ở Frontend: CHỈ lấy khóa học "published"
      const publishedCourses = (response.data.courses || []).filter(
        (course) => course.status === "published",
      );

      setCourses(publishedCourses);

      if (search && publishedCourses.length > 0) {
        toast.info("Tìm thấy rồi nè!", {
          description: `Có ${publishedCourses.length} khóa học phù hợp với bé đó! ✨`,
        });
      }
    } catch (error) {
      toast.error("Ối, có lỗi rồi!", {
        description:
          "Máy chủ đang bận một chút, bé đợi tẹo rồi tải lại trang nhé! 🛠️",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCourses();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, level]);

  return (
    <div className="min-h-screen bg-slate-50/50 overflow-x-hidden">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <Header onNavigate={navigate} />
      </div>

      <main className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        {/* Tiêu đề trang */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
            Khám phá thế giới <span className="text-sky-500">Nghệ thuật</span>{" "}
            🎨
          </h1>
          <p className="text-slate-500 text-lg font-medium mt-2">
            Tìm thấy cảm hứng sáng tạo qua các khóa học chất lượng cao dành cho
            bé.
          </p>
        </div>

        {/* LAYOUT MỚI: CHIA CỘT 2.5 / 7.5 */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* CỘT TRÁI (SIDEBAR): Chiếm 25% trên Desktop */}
          <aside className="w-full lg:w-1/4 shrink-0 bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-6 sticky top-24">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-4">
              <Filter className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-lg text-slate-800">
                Bộ lọc tìm kiếm
              </h3>
            </div>

            {/* Ô tìm kiếm */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Tên khóa học..."
                  className="pl-10 rounded-2xl h-12 border-slate-200 bg-slate-50 focus-visible:ring-sky-500"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Lọc danh mục */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">
                Danh mục
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full rounded-2xl h-12 border-slate-200 bg-slate-50 font-medium text-slate-700">
                  <SelectValue placeholder="Tất cả danh mục" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  <SelectItem value="Vẽ chì">Vẽ chì</SelectItem>
                  <SelectItem value="Màu nước">Màu nước</SelectItem>
                  <SelectItem value="Digital Art">Digital Art</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Lọc cấp độ */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cấp độ</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="w-full rounded-2xl h-12 border-slate-200 bg-slate-50 font-medium text-slate-700">
                  <SelectValue placeholder="Mọi cấp độ" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-xl">
                  <SelectItem value="all">Mọi cấp độ</SelectItem>
                  <SelectItem value="beginner">Cơ bản</SelectItem>
                  <SelectItem value="intermediate">Trung cấp</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Nút xóa bộ lọc */}
            <Button
              variant="outline"
              className="w-full rounded-2xl mt-4 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setLevel("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </aside>

          {/* CỘT PHẢI (MAIN CONTENT): Chiếm 75% trên Desktop */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              // Khoảng cách (gap) và kích thước lưới được tinh chỉnh để card nhỏ lại
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-[380px] bg-slate-200/50 animate-pulse rounded-[32px]"
                  />
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onClick={() => navigate(`/course/${course.slug}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <div className="text-7xl mb-6 grayscale opacity-50">🎨</div>
                <h3 className="text-2xl font-bold text-slate-800">
                  Không có khóa học nào
                </h3>
                <p className="text-slate-500 mt-2 text-base max-w-sm">
                  Hiện tại không có khóa học nào đang được hiển thị. Bé hãy thử
                  thay đổi bộ lọc bên trái xem sao nhé!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="w-full bg-white">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <Footer />
        </div>
      </div>
    </div>
  );
}
