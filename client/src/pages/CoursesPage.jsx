import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  BookOpen,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { CourseCard } from "@/components/courses/CourseCard";
import { ComboCard } from "@/components/combos/ComboCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import courseApi from "@/api/courseApi";
import comboApi from "@/api/comboApi";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 9;

export function CoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination state
  const [coursePage, setCoursePage] = useState(1);
  const [comboPage, setComboPage] = useState(1);
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const [comboTotalPages, setComboTotalPages] = useState(1);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [type, setType] = useState(searchParams.get("type") || "all"); // all, courses, combos

  const fetchData = async () => {
    try {
      setLoading(true);
      const baseParams = {
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        level: level !== "all" ? level : undefined,
        status: "published",
        limit: ITEMS_PER_PAGE,
      };

      // Fetch courses và combos song song
      const [coursesResponse, combosResponse] = await Promise.all([
        type !== "combos"
          ? courseApi.getAllCourses({ ...baseParams, page: coursePage })
          : Promise.resolve({ data: { courses: [], totalPages: 1 } }),
        type !== "courses"
          ? comboApi.getAllCombos({ ...baseParams, page: comboPage })
          : Promise.resolve({ data: { combos: [], totalPages: 1 } }),
      ]);

      const publishedCourses = coursesResponse.data.courses || [];
      const publishedCombos = combosResponse.data.combos || [];

      setCourses(publishedCourses);
      setCombos(publishedCombos);
      setCourseTotalPages(coursesResponse.data.totalPages || 1);
      setComboTotalPages(combosResponse.data.totalPages || 1);

      if (
        search &&
        (publishedCourses.length > 0 || publishedCombos.length > 0)
      ) {
        toast.info("Tìm thấy rồi nè!", {
          description: `Có ${publishedCourses.length + publishedCombos.length} kết quả phù hợp với bé đó! ✨`,
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
      fetchData();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, level, type, coursePage, comboPage]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setCoursePage(1);
    setComboPage(1);
  }, [search, category, level, type]);

  // Update URL params when type changes
  useEffect(() => {
    if (type !== "all") {
      setSearchParams({ type });
    } else {
      setSearchParams({});
    }
  }, [type, setSearchParams]);

  const handleTypeChange = (newType) => {
    setType(newType);
  };

  // Pagination helpers
  const currentPage = type === "combos" ? comboPage : coursePage;
  const totalPages =
    type === "combos"
      ? comboTotalPages
      : type === "courses"
        ? courseTotalPages
        : Math.max(courseTotalPages, comboTotalPages);

  const handlePageChange = (newPage) => {
    if (type === "combos") {
      setComboPage(newPage);
    } else if (type === "courses") {
      setCoursePage(newPage);
    } else {
      setCoursePage(newPage);
      setComboPage(newPage);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getDisplayItems = () => {
    if (type === "courses") return courses;
    if (type === "combos") return combos;
    // "all" - gộp cả hai
    return [...courses, ...combos];
  };

  const displayItems = getDisplayItems();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-slate-50/50 overflow-x-hidden"
    >
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
            Tìm thấy cảm hứng sáng tạo qua các khóa học và combo ưu đãi dành cho
            bé.
          </p>
        </div>

        {/* Tabs để filter type */}
        <div className="mb-8">
          <Tabs
            value={type}
            onValueChange={handleTypeChange}
            className="w-full"
          >
            <TabsList className="grid w-full max-w-md grid-cols-3 h-12">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Tất cả
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Khóa học
              </TabsTrigger>
              <TabsTrigger value="combos" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Combo
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* LAYOUT: CHIA CỘT 2.5 / 7.5 */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* CỘT TRÁI (SIDEBAR) */}
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
                  placeholder="Tên khóa học hoặc combo..."
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
                setType("all");
              }}
            >
              Xóa bộ lọc
            </Button>
          </aside>

          {/* CỘT PHẢI (MAIN CONTENT) */}
          <div className="w-full lg:w-3/4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-[380px] bg-slate-200/50 animate-pulse rounded-[32px]"
                  />
                ))}
              </div>
            ) : displayItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayItems.map((item) => {
                    // Kiểm tra xem item có phải là combo không (có field courses)
                    const isCombo = item.courses && Array.isArray(item.courses);

                    return isCombo ? (
                      <ComboCard
                        key={item._id}
                        combo={item}
                        onComboClick={(slug) => navigate(`/combos/${slug}`)}
                      />
                    ) : (
                      <CourseCard
                        key={item._id}
                        course={item}
                        onClick={() => navigate(`/course/${item.slug}`)}
                      />
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
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
                      .filter((page) => {
                        // Show first, last, current, and neighbors
                        return (
                          page === 1 ||
                          page === totalPages ||
                          Math.abs(page - currentPage) <= 1
                        );
                      })
                      .map((page, idx, arr) => {
                        // Add ellipsis
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
                              className={`rounded-full w-10 h-10 ${
                                currentPage === page
                                  ? "bg-sky-500 hover:bg-sky-600"
                                  : ""
                              }`}
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
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-[40px] shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <div className="text-7xl mb-6 grayscale opacity-50">
                  {type === "combos" ? "📦" : type === "courses" ? "📚" : "🎨"}
                </div>
                <h3 className="text-2xl font-bold text-slate-800">
                  {type === "combos"
                    ? "Không có combo nào"
                    : type === "courses"
                      ? "Không có khóa học nào"
                      : "Không có kết quả"}
                </h3>
                <p className="text-slate-500 mt-2 text-base max-w-sm">
                  Hiện tại không có{" "}
                  {type === "combos"
                    ? "combo"
                    : type === "courses"
                      ? "khóa học"
                      : "kết quả"}{" "}
                  nào đang được hiển thị. Bé hãy thử thay đổi bộ lọc bên trái
                  xem sao nhé!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </motion.div>
  );
}
