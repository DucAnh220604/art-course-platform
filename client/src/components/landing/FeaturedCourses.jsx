import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { Button } from "@/components/ui/button";
import courseApi from "@/api/courseApi";
import { useNavigate } from "react-router-dom";

export function FeaturedCourses({ onCourseClick }) {
  const navigate = useNavigate();
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
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800">
            Khóa học <span className="text-sky-500">Nổi bật</span>
          </h2>
          <p className="text-lg text-slate-500 mb-6">
            Khám phá những khóa học mới nhất dành cho các họa sĩ nhí
          </p>
          <Button
            variant="outline"
            className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-50"
            onClick={() => navigate("/courses")}
          >
            Xem tất cả khóa học
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 bg-slate-100 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <CourseCard
                key={course._id}
                course={course}
                onClick={() => onCourseClick(course.slug || course._id)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
