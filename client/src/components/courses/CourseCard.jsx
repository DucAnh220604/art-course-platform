import React from "react";
import { Star, Users, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function CourseCard({ course, onClick }) {
  // Xử lý linh hoạt cho cả dữ liệu Mock và dữ liệu từ API
  const instructorName =
    course.instructor?.fullname ||
    course.instructor?.name ||
    "Giảng viên ArtKids";
  const rating = course.averageRating || course.rating || 0;

  // Xử lý định dạng giá tiền thông minh
  const displayPrice =
    typeof course.price === "number"
      ? course.price === 0
        ? "MIỄN PHÍ"
        : `${course.price.toLocaleString()}đ`
      : course.price; // Nếu là string (như $29.99 trong mock) thì in ra luôn

  const displayOldPrice =
    typeof course.oldPrice === "number" && course.oldPrice > 0
      ? `${course.oldPrice.toLocaleString()}đ`
      : null;

  const discountPercent =
    course.discountPercentage > 0 ? course.discountPercentage : null;

  return (
    <Card className="group rounded-[40px] border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white flex flex-col h-full hover:-translate-y-2">
      {/* Thumbnail area */}
      <div
        className="relative aspect-[16/10] overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

        {/* Badge Phổ biến */}
        {course.students > 500 ||
        course.totalStudents > 500 ||
        course.isBestseller ? (
          <Badge className="absolute top-5 left-5 bg-amber-400 text-amber-900 border-none px-4 py-1.5 rounded-full font-bold text-[10px] shadow-lg shadow-amber-200/50">
            PHỔ BIẾN 🔥
          </Badge>
        ) : null}

        {/* Ribbon giảm giá góc phải */}
        {discountPercent && (
          <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
            <div className="absolute top-[18px] right-[-28px] w-[110px] bg-rose-500 text-white text-[11px] font-black text-center py-1.5 rotate-45 shadow-md shadow-rose-300/60 tracking-wide">
              -{discountPercent}%
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-8 flex flex-col flex-1">
        {/* Instructor Info */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="w-8 h-8 border-2 border-sky-100 shadow-sm">
            <AvatarImage src={course.instructor?.avatar} />
            <AvatarFallback className="bg-sky-50 text-sky-600 text-xs font-bold">
              {instructorName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {instructorName}
          </span>
        </div>

        {/* Title */}
        <h3
          className="text-xl font-bold text-slate-800 line-clamp-2 mb-4 hover:text-sky-500 transition-colors cursor-pointer leading-tight"
          onClick={onClick}
        >
          {course.title}
        </h3>

        {/* Stats Section */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-slate-700">
                {rating}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">
                {course.totalStudents || course.students} học viên
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              Học phí
            </p>
            {displayOldPrice && (
              <p className="text-xs font-bold text-slate-400 line-through leading-none mb-0.5">
                {displayOldPrice}
              </p>
            )}
            <p className="text-2xl font-black text-sky-600">{displayPrice}</p>
          </div>
        </div>

        {/* Hover Action Button */}
        <Button
          className="mt-6 w-full rounded-full bg-slate-900 group-hover:bg-sky-500 text-white font-bold h-12 shadow-lg shadow-slate-200 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
          onClick={onClick}
        >
          Khám phá ngay <PlayCircle className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
