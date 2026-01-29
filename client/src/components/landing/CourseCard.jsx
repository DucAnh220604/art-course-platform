import { Star, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CourseCard({ course, onCourseClick }) {
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl border-4 border-transparent hover:border-sky-200">
      <div
        className="relative h-48 overflow-hidden cursor-pointer"
        onClick={() => onCourseClick && onCourseClick(course.id)}
      >
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
        />
        {course.isBestseller && (
          <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-sm font-bold">
            BESTSELLER
          </div>
        )}
      </div>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="border-2 border-sky-300">
            <AvatarImage
              src={course.instructor?.avatar}
              alt={course.instructor?.name}
            />
            <AvatarFallback>
              {course.instructor?.name?.[0] || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm text-gray-600">{course.instructor?.name}</div>
        </div>

        <h3
          className="text-xl font-bold text-gray-800 hover:text-sky-600 cursor-pointer"
          onClick={() => onCourseClick && onCourseClick(course.id)}
        >
          {course.title}
        </h3>

        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(course.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="font-bold text-gray-700">{course.rating}</span>
          <span className="text-gray-500 text-sm">
            ({course.reviews} reviews)
          </span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{course.students?.toLocaleString()} students</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-2xl font-bold text-sky-600">{course.price}</div>
          <Button className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600">
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
