import React, { useEffect, useState } from "react";
import { CourseCard } from "@/components/courses/CourseCard";
import courseApi from "@/api/courseApi";

export function FeaturedCourses({ onCourseClick }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await courseApi.getAllCourses();

        // Lọc khóa học published và sắp xếp theo mới nhất, lấy 3 khóa đầu
        const publishedCourses = (response.data.courses || [])
          .filter((course) => course.status === "published")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        setCourses(publishedCourses);
      } catch (error) {
        console.error("Error fetching featured courses:", error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <section className="py-8 sm:py-12 lg:py-16 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800">
          Khóa học <span className="text-sky-500">Nổi bật</span> 🌟
        </h2>
        <p className="text-lg text-slate-500">
          Khám phá những khóa học mới nhất dành cho các họa sĩ nhí
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[450px] bg-slate-100 rounded-[40px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {courses.map((course) => (
            <CourseCard
              key={course._id}
              course={course}
              onClick={() => onCourseClick(course.slug || course._id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
