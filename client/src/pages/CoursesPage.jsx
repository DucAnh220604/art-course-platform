import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Header, Footer } from "@/components/landing";
import { CourseCard } from "@/components/courses/CourseCard";
import { ComboCard } from "@/components/combos/ComboCard";
import courseApi from "@/api/courseApi";
import comboApi from "@/api/comboApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ITEMS_PER_PAGE = 9;

export function CoursesPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [courses, setCourses] = useState([]);
  const [combos, setCombos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page")) || 1,
  );
  const [courseTotalPages, setCourseTotalPages] = useState(1);
  const [comboTotalPages, setComboTotalPages] = useState(1);

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(
    searchParams.get("category") || "all",
  );
  const [level, setLevel] = useState(searchParams.get("level") || "all");
  const [type, setType] = useState(searchParams.get("type") || "all");

  useEffect(() => {
    courseApi
      .getCategories()
      .then((res) => {
        const data = res.data || res || {};
        setCategories(data.categories || []);
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const baseParams = {
        search: search || undefined,
        category: category !== "all" ? category : undefined,
        level: level !== "all" ? level : undefined,
        status: "published",
        limit: type === "all" ? Math.ceil(ITEMS_PER_PAGE / 2) : ITEMS_PER_PAGE,
        page: currentPage,
      };

      let coursesRes = { data: { courses: [], totalPages: 1 } };
      let combosRes = { data: { combos: [], totalPages: 1 } };

      if (type === "all") {
        [coursesRes, combosRes] = await Promise.all([
          courseApi.getAllCourses({ ...baseParams, limit: 5 }),
          comboApi.getAllCombos({ ...baseParams, limit: 4 })
        ]);
      } else if (type === "courses") {
        coursesRes = await courseApi.getAllCourses(baseParams);
      } else if (type === "combos") {
        combosRes = await comboApi.getAllCombos(baseParams);
      }

      const publishedCourses = coursesRes?.data?.courses || coursesRes?.courses || [];
      const publishedCombos = combosRes?.data?.combos || combosRes?.combos || [];

      setCourses(publishedCourses);
      setCombos(publishedCombos);

      setCourseTotalPages(coursesRes?.data?.totalPages || coursesRes?.totalPages || 1);
      setComboTotalPages(combosRes?.data?.totalPages || combosRes?.totalPages || 1);
    } catch (error) {
      console.error("Lỗi fetch data:", error);
      toast.error("Ối, có lỗi rồi!", {
        description: "Máy chủ đang bận một chút, bé đợi tẹo rồi tải lại trang nhé! 🛠️",
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
  }, [search, category, level, type, currentPage]);

  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [search, category, level, type]);

  useEffect(() => {
    const params = {};
    if (type !== "all") params.type = type;
    if (search) params.search = search;
    if (category !== "all") params.category = category;
    if (level !== "all") params.level = level;
    if (currentPage > 1) params.page = currentPage.toString();

    setSearchParams(params, { replace: true });
  }, [type, search, category, level, currentPage, setSearchParams]);

  const totalPages =
    type === "combos"
      ? comboTotalPages
      : type === "courses"
        ? courseTotalPages
        : Math.max(courseTotalPages, comboTotalPages);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const displayItems =
    type === "courses"
      ? courses
      : type === "combos"
        ? combos
        : [...courses, ...combos];

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden min-h-screen">
      <Header onNavigate={navigate} />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <header className="mb-12 relative text-center md:text-left">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-tertiary-container/30 rounded-full blur-3xl -z-10"></div>
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-extrabold font-headline leading-tight mb-6">
              Hôm nay bé sẽ <span className="relative inline-block">sáng tạo<span className="absolute -bottom-2 left-0 w-full h-4 bg-secondary-container/60 -z-10 -rotate-2"></span></span> gì nào?
            </h1>
            <p className="text-xl text-on-surface-variant leading-relaxed font-medium">
              Chọn môn nghệ thuật, chọn trình độ phù hợp và để trí tưởng tượng của bé bay xa!
            </p>
          </div>
        </header>

        {/* Unified Filter Bar */}
        <div className="bg-white/50 backdrop-blur-md p-8 rounded-3xl border-4 border-dashed border-primary/10 mb-16 shadow-premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Filter Group: Type */}
            <div>
              <label className="block text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em] mb-4 pl-1">Bạn muốn tìm gì?</label>
              <div className="flex gap-2">
                {[
                  { id: "all", label: "Tất cả", icon: "auto_awesome" },
                  { id: "courses", label: "Khóa học", icon: "brush" },
                  { id: "combos", label: "Combo", icon: "package" }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={cn(
                      "flex-1 py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all border-2",
                      type === t.id ? "bg-primary text-on-primary border-primary shadow-lg" : "bg-white border-outline-variant/10 text-on-surface hover:bg-surface-container"
                    )}
                  >
                    <span className="material-symbols-outlined text-lg">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter Group: Category */}
            <div>
              <label className="block text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em] mb-4 pl-1">Danh mục nghệ thuật</label>
              <Select value={category} onValueChange={(val) => setCategory(val)}>
                <SelectTrigger className="w-full bg-white border-2 border-outline-variant/10 rounded-2xl py-3 px-6 h-auto font-bold text-sm text-on-surface shadow-sm focus:border-primary/20 focus:ring-0">
                  <SelectValue placeholder="Mọi danh mục 🎨" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-outline-variant/10 shadow-premium font-bold text-sm">
                  <SelectItem value="all">Mọi danh mục 🎨</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filter Group: Level */}
            <div>
              <label className="block text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em] mb-4 pl-1">Trình độ của con</label>
              <Select value={level} onValueChange={(val) => setLevel(val)}>
                <SelectTrigger className="w-full bg-white border-2 border-outline-variant/10 rounded-2xl py-3 px-6 h-auto font-bold text-sm text-on-surface shadow-sm focus:border-primary/20 focus:ring-0">
                  <SelectValue placeholder="Mọi trình độ ✨" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-2 border-outline-variant/10 shadow-premium font-bold text-sm">
                  <SelectItem value="all">Mọi trình độ ✨</SelectItem>
                  <SelectItem value="beginner">Mới bắt đầu 🌱</SelectItem>
                  <SelectItem value="intermediate">Khám phá 🚀</SelectItem>
                  <SelectItem value="advanced">Tài năng 💎</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-dashed border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="relative w-full sm:max-w-md group text-left">
              <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">search</span>
              <input 
                type="text"
                placeholder="Tìm tên khóa học..."
                className="w-full bg-surface-container-lowest border-2 border-outline-variant/5 rounded-2xl py-3 pl-14 pr-6 focus:border-primary/20 outline-none placeholder:text-on-surface-variant/30 font-bold text-sm shadow-sm transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <button 
              onClick={() => {
                setSearch("");
                setCategory("all");
                setLevel("all");
                setType("all");
              }}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40 hover:text-primary transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">restart_alt</span> Xóa tất cả lọc
            </button>
          </div>
        </div>

        {/* Combined Content Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 min-h-[400px]">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-surface-container-high animate-pulse rounded-xl scrapbook-card" />
            ))
          ) : displayItems.length > 0 ? (
            displayItems.map((item, index) => {
              const isCombo = item.courses && Array.isArray(item.courses);
              return isCombo ? (
                <ComboCard
                  key={`combo-${item._id}`}
                  combo={item}
                  compact={true}
                  onComboClick={(slug) => navigate(`/combos/${slug}`)}
                />
              ) : (
                <CourseCard
                  key={`course-${item._id}`}
                  course={item}
                  index={index}
                  onClick={() => navigate(`/course/${item.slug}`)}
                />
              );
            })
          ) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-32 h-32 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-white shadow-xl rotate-6">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant/20">search_off</span>
              </div>
              <h3 className="text-3xl font-bold font-headline mb-4">Không tìm thấy rồi...</h3>
              <p className="text-on-surface-variant font-medium">Bạn hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm xem sao nhé!</p>
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-24 flex justify-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary hover:text-on-secondary disabled:opacity-30 transition-all font-bold"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button 
                key={page}
                onClick={() => handlePageChange(page)}
                className={cn(
                  "w-12 h-12 rounded-full font-black text-lg transition-all",
                  currentPage === page ? "bg-primary-container text-on-primary-container scale-110 shadow-lg" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {page}
              </button>
            ))}
            <button 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-secondary hover:text-on-secondary disabled:opacity-30 transition-all font-bold"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>

      {/* Mascot Bubble */}
      <div className="fixed bottom-24 right-8 z-40 max-w-xs hidden md:block">
        <div className="bg-tertiary-container/90 backdrop-blur-md p-6 rounded-xl border-b-4 border-on-tertiary-container/20 relative scrapbook-card shadow-xl">
          <p className="font-headline font-bold text-on-tertiary-container leading-tight">
            "Suỵt! Nếu bé mua combo 3 khóa học, Artie sẽ gửi một bộ dụng cụ vẽ bí mật đến tận nhà đấy!"
          </p>
          <div className="absolute -bottom-4 right-10 w-8 h-8 bg-tertiary-container/90 rotate-45 border-r-4 border-b-4 border-on-tertiary-container/20"></div>
        </div>
        <div className="mt-4 flex justify-end pr-6">
          <div className="w-20 h-20 bg-primary-container rounded-full border-4 border-surface overflow-hidden shadow-2xl">
            <img alt="Artie Mascot" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuACdCuB435ZjTtnysh1s4ZoPAcacQSM_Q-EcyudQTi5jLa-AfosgeF7Z9X_Trf8digai3G7Dkr3pQrpi5F0g1TxI3PClz26B8PzokiyRLt5B-B_YkploW66OmkP7X-h5Wg9w13Guup-V3HDEAijyoBX6wsVArmAeRRyGdxCDZwD9cJs6gssMcShDhvzoRaX5NeUiyOyr4Pu7e_YcI788OTzfZ2fpWFrBuNxKYvKTJClYjBWsFoMRVkvIg-mdrlMxuM9rwKQQLKjrxU" />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
