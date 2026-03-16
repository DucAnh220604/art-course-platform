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
          badgeText="🎨 Let's Get Creative!"
          title={<>Paint Your <br /><span className="text-primary italic">Imagination</span></>}
          description="Join Artie and a community of young creators. Discover online courses that turn every day into a colorful masterpiece!"
          primaryBtnText="Start Painting"
          secondaryBtnText="View Courses"
          imageSrc="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&q=80"
          mascotMode={true}
          showStats={false}
        />

        {/* Popular Courses Section */}
        <section className="py-24 bg-surface-container-low px-6">
          <div className="max-w-7xl mx-auto text-center">
             <h2 className="font-headline font-extrabold text-5xl text-on-background mb-4 relative inline-block">
                Popular Courses
                <div className="absolute -bottom-2 left-0 w-full h-4 bg-primary-container/30 -z-10 scrapbook-blob"></div>
              </h2>
              <p className="text-on-surface-variant text-lg mb-16 font-medium">Pick a path and start your artistic journey today.</p>
              
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
              <h2 className="font-headline font-extrabold text-5xl mb-4">Student Masterpieces</h2>
              <p className="text-on-surface-variant text-lg font-medium">Check out the amazing art created by our young students!</p>
            </div>
            <div className="columns-1 md:columns-2 lg:columns-4 gap-6 space-y-6">
                {[
                  { img: "https://images.unsplash.com/photo-1482160545775-568ad363fb7a?q=80&w=600&auto=format&fit=crop", name: "Leo, Age 7", rot: "rotate-2" },
                  { img: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format&fit=crop", name: "Emma, Age 5", rot: "-rotate-3" },
                  { img: "https://images.unsplash.com/photo-1560412431-7e8346e96906?q=80&w=600&auto=format&fit=crop", name: "Sophie, Age 10", rot: "rotate-1" },
                  { img: "https://images.unsplash.com/photo-1564349683136-77e08bef1ef1?q=80&w=600&auto=format&fit=crop", name: "Noah, Age 8", rot: "-rotate-1" }
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
