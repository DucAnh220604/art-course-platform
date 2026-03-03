import React, { useEffect, useState } from "react";
import { CourseCard } from "@/components/courses/CourseCard"; // Dẫn đúng đường dẫn của bạn

const mockCourses = [
  {
    id: "1",
    slug: "watercolor-basics",
    title: "Làm quen với Màu nước cho Bé",
    thumbnail:
      "https://images.unsplash.com/photo-1578961140619-896df05b1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "Cô Emma Wilson",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    averageRating: 4.8,
    price: 299000,
    totalStudents: 1250,
    isBestseller: true,
  },
  {
    id: "2",
    slug: "drawing-animals",
    title: "Vẽ Động vật từng bước một",
    thumbnail:
      "https://images.unsplash.com/photo-1765547586679-b16ee179e653?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "Thầy John Smith",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    averageRating: 4.9,
    price: 349000,
    totalStudents: 2100,
    isBestseller: true,
  },
  {
    id: "3",
    slug: "creative-painting",
    title: "Cuộc phiêu lưu Sáng tạo với Cọ vẽ",
    thumbnail:
      "https://images.unsplash.com/photo-1696527014256-4755b3ac0b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "Cô Sarah Lee",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    averageRating: 4.7,
    price: 0, // Khóa học miễn phí
    totalStudents: 890,
  },
];

export function FeaturedCourses({ onCourseClick }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      // Giả lập load API nhanh
      setTimeout(() => {
        setCourses(mockCourses);
        setLoading(false);
      }, 500);
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
          Khám phá những khóa học được các họa sĩ nhí yêu thích nhất
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
              key={course.id}
              course={course}
              // Gọi callback để chuyển trang, dùng slug hoặc id tùy hệ thống của bạn
              onClick={() => onCourseClick(course.slug || course.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
