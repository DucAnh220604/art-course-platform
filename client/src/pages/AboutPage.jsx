import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Header, Footer, HeroSection } from "@/components/landing";
import { cn } from "@/lib/utils";
import courseApi from "../api/courseApi";

export function AboutPage() {
  const navigate = useNavigate();
  const [popularCourses, setPopularCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseApi.getAllCourses({ limit: 10, status: "published" });
        // Cấu trúc API chính xác từ CoursesPage: response.data?.courses hoặc response.data
        const courses = response.data?.courses || response.data || [];
        
        // Sắp xếp theo số lượng học viên nếu có, hoặc lấy ngẫu nhiên 3 cái đầu
        const sorted = Array.isArray(courses) 
          ? [...courses].sort((a, b) => (b.enrollmentCount || 0) - (a.enrollmentCount || 0))
          : [];
          
        setPopularCourses(sorted.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="bg-surface font-body text-on-surface antialiased overflow-x-hidden min-h-screen">
      <Header onNavigate={navigate} />

      <main className="relative">
        <HeroSection 
          badgeText="🎨 Hãy cùng sáng tạo!"
          title={<>Vẽ Lên <br /><span className="text-primary italic">Trí Tưởng Tượng</span> Của Bạn</>}
          description="Tham gia cùng Artie và cộng đồng các nhà sáng tạo nhí. Khám phá các khóa học trực tuyến biến mỗi ngày thành một kiệt tác đầy màu sắc!"
          primaryBtnText="Bắt Đầu Vẽ"
          secondaryBtnText="Xem Khóa Học"
          imageSrc="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
          mascotMode={true}
          showStats={false}
        />

        {/* Popular Courses Section */}
        <section className="py-24 bg-surface-container-low px-6">
          <div className="max-w-7xl mx-auto text-center">
             <h2 className="font-headline font-extrabold text-5xl text-on-background mb-4 relative inline-block">
                Khóa Học Phổ Biến
                <div className="absolute -bottom-2 left-0 w-full h-4 bg-primary-container/30 -z-10 scrapbook-blob"></div>
              </h2>
              <p className="text-on-surface-variant text-lg mb-16 font-medium">Chọn một con đường và bắt đầu hành trình nghệ thuật của bạn ngay hôm nay.</p>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                {popularCourses.length > 0 ? (
                  popularCourses.map((course, index) => (
                    <motion.div 
                      key={course._id} 
                      whileHover={{ y: -10 }} 
                      onClick={() => navigate(`/course/${course.slug}`)}
                      className={cn(
                        "bg-surface-container-lowest rounded-xl overflow-hidden paper-stack hover:shadow-2xl transition-all cursor-pointer",
                        index === 1 ? "lg:mt-8" : index === 2 ? "lg:-mt-4" : ""
                      )}
                    >
                      <div className="h-64 bg-secondary-container relative overflow-hidden">
                        <img alt={course.title} className="w-full h-full object-cover" src={course.thumbnail || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800"} />
                        {course.category && (
                          <div className="absolute top-4 left-4 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            {course.category}
                          </div>
                        )}
                      </div>
                      <div className="p-8 text-left">
                        <h3 className="font-headline font-bold text-2xl text-on-background mb-3 line-clamp-1">{course.title}</h3>
                        <p className="text-on-surface-variant mb-6 line-clamp-2">{course.description}</p>
                        <div className="flex items-center justify-between border-t border-outline-variant/10 pt-6">
                          <span className="font-headline font-extrabold text-2xl text-primary">
                            {course.price === 0 ? "Miễn phí" : `${course.price?.toLocaleString()}đ`}
                          </span>
                          <div className="flex items-center gap-1 text-on-surface-variant">
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="text-sm font-bold">
                              {(course.averageRating || course.rating || 4.9).toFixed(1)} ({course.totalStudents || course.enrollmentCount || 0})
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  // Fallback hoặc Loading khi không có dữ liệu
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-surface-container-low h-[400px] animate-pulse rounded-xl" />
                  ))
                )}
              </div>
          </div>
        </section>


        {/* Student Masterpieces Gallery */}
        <section className="py-24 bg-surface px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="font-headline font-extrabold text-5xl mb-4">Kiệt Tác Của Học Viên</h2>
              <p className="text-on-surface-variant text-lg font-medium">Hãy xem những tác phẩm nghệ thuật tuyệt vời được tạo ra bởi các học viên nhí của chúng tôi!</p>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-4 gap-6 space-y-6">
                {[
                  { img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=600&auto=format&fit=crop", name: "Leo, 7 Tuổi", rot: "rotate-2" },
                  { img: "https://images.unsplash.com/photo-1602498456745-e9503b30470b?q=80&w=600&auto=format&fit=crop", name: "Emma, 5 Tuổi", rot: "-rotate-3" },
                  { img: "https://images.unsplash.com/photo-1560421683-6856ea585c78?q=80&w=600&auto=format&fit=crop", name: "Sophie, 10 Tuổi", rot: "rotate-1" },
                  { img: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=600&auto=format&fit=crop", name: "Noah, 8 Tuổi", rot: "-rotate-1" }
                ].map((item, i) => (
                 <div key={i} className={`break-inside-avoid relative group rounded-xl overflow-hidden paper-stack ${item.rot}`}>
                  <img alt={item.name} className="w-full h-auto" src={item.img} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex items-end">
                    <p className="text-white font-bold">{item.name}</p>
                  </div>
                </div>
               ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
