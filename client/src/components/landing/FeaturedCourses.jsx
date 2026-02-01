import { useEffect, useState } from "react";
import { CourseCard } from "./CourseCard";

const mockCourses = [
  {
    id: "1",
    title: "Watercolor Basics for Kids",
    thumbnail:
      "https://images.unsplash.com/photo-1578961140619-896df05b1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "Emma Wilson",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    },
    rating: 4.8,
    reviews: 234,
    price: "$29.99",
    students: 1250,
    isBestseller: true,
  },
  {
    id: "2",
    title: "Drawing Animals Step-by-Step",
    thumbnail:
      "https://images.unsplash.com/photo-1765547586679-b16ee179e653?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "John Smith",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    },
    rating: 4.9,
    reviews: 456,
    price: "$34.99",
    students: 2100,
    isBestseller: true,
  },
  {
    id: "3",
    title: "Creative Painting Adventures",
    thumbnail:
      "https://images.unsplash.com/photo-1696527014256-4755b3ac0b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "Sarah Lee",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    },
    rating: 4.7,
    reviews: 189,
    price: "$24.99",
    students: 890,
    isBestseller: true,
  },
  {
    id: "4",
    title: "Abstract Art for Young Artists",
    thumbnail:
      "https://images.unsplash.com/photo-1705254613735-1abb457f8a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "Mike Chen",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    },
    rating: 4.6,
    reviews: 312,
    price: "$27.99",
    students: 1450,
    isBestseller: true,
  },
  {
    id: "5",
    title: "Portrait Drawing for Beginners",
    thumbnail:
      "https://images.unsplash.com/photo-1610274672835-65a79c852f58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "Lisa Brown",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    },
    rating: 4.9,
    reviews: 567,
    price: "$32.99",
    students: 1890,
    isBestseller: true,
  },
  {
    id: "6",
    title: "Digital Art for Kids",
    thumbnail:
      "https://images.unsplash.com/photo-1705254613735-1abb457f8a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    instructor: {
      name: "Tom Davis",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    },
    rating: 4.8,
    reviews: 423,
    price: "$39.99",
    students: 2340,
    isBestseller: true,
  },
];

export function FeaturedCourses({ onCourseClick }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setTimeout(() => {
          setCourses(mockCourses);
          setLoading(false);
        }, 100);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              Featured Courses
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-96 bg-gray-200 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="text-center text-red-500">
          Error loading courses: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
          <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
            Featured Courses
          </span>
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
          Discover the perfect course to inspire your child's artistic journey
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            onCourseClick={onCourseClick}
          />
        ))}
      </div>
    </section>
  );
}
