import React from "react";
import { Star, Users, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CourseCard({ course, onClick, compact = false }) {
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
      : course.price;

  const displayOldPrice =
    typeof course.oldPrice === "number" && course.oldPrice > 0
      ? `${course.oldPrice.toLocaleString()}đ`
      : null;

  const discountPercent =
    course.discountPercentage > 0 ? course.discountPercentage : null;

  return (
    <Card
      className={cn(
        "group border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden bg-white flex flex-col h-full hover:-translate-y-1",
        compact
          ? "rounded-2xl"
          : "rounded-[40px] hover:-translate-y-2 hover:shadow-2xl duration-500",
      )}
    >
      {/* Thumbnail area */}
      <div
        className={cn(
          "relative overflow-hidden cursor-pointer",
          compact ? "aspect-[4/3]" : "aspect-[16/10]",
        )}
        onClick={onClick}
      >
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

        {/* Badge Phổ biến */}
        {(course.students > 500 ||
          course.totalStudents > 500 ||
          course.isBestseller) && (
          <Badge
            className={cn(
              "absolute bg-amber-400 text-amber-900 border-none rounded-full font-bold shadow-lg shadow-amber-200/50",
              compact
                ? "top-3 left-3 px-2 py-1 text-[8px]"
                : "top-5 left-5 px-4 py-1.5 text-[10px]",
            )}
          >
            PHỔ BIẾN 🔥
          </Badge>
        )}

        {/* Ribbon giảm giá góc phải */}
        {discountPercent && (
          <div
            className={cn(
              "absolute top-0 right-0 overflow-hidden pointer-events-none",
              compact ? "w-16 h-16" : "w-24 h-24",
            )}
          >
            <div
              className={cn(
                "absolute bg-rose-500 text-white font-black text-center rotate-45 shadow-md shadow-rose-300/60 tracking-wide",
                compact
                  ? "top-[10px] right-[-22px] w-[80px] text-[9px] py-1"
                  : "top-[18px] right-[-28px] w-[110px] text-[11px] py-1.5",
              )}
            >
              -{discountPercent}%
            </div>
          </div>
        )}
      </div>

      <CardContent
        className={cn("flex flex-col flex-1", compact ? "p-4" : "p-8")}
      >
        {/* Instructor Info - hidden in compact mode */}
        {!compact && (
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
        )}

        {/* Title */}
        <h3
          className={cn(
            "font-bold text-slate-800 hover:text-sky-500 transition-colors cursor-pointer leading-tight",
            compact ? "text-sm line-clamp-2 mb-2" : "text-xl line-clamp-2 mb-4",
          )}
          onClick={onClick}
        >
          {course.title}
        </h3>

        {/* Stats Section */}
        <div
          className={cn(
            "flex items-center justify-between mt-auto",
            compact
              ? "pt-3 border-t border-slate-100"
              : "pt-6 border-t border-slate-50",
          )}
        >
          <div className={compact ? "flex items-center gap-3" : "space-y-1"}>
            <div className="flex items-center gap-1">
              <Star
                className={cn(
                  "fill-amber-400 text-amber-400",
                  compact ? "w-3.5 h-3.5" : "w-4 h-4",
                )}
              />
              <span
                className={cn(
                  "font-bold text-slate-700",
                  compact ? "text-xs" : "text-sm",
                )}
              >
                {rating}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Users className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
              <span
                className={cn(
                  "font-medium",
                  compact ? "text-[10px]" : "text-[11px] font-bold",
                )}
              >
                {course.totalStudents || course.students || 0}
              </span>
            </div>
          </div>

          <div className="text-right">
            {displayOldPrice && (
              <p
                className={cn(
                  "font-bold text-slate-400 line-through leading-none",
                  compact ? "text-[10px] mb-0" : "text-xs mb-0.5",
                )}
              >
                {displayOldPrice}
              </p>
            )}
            <p
              className={cn(
                "font-black text-sky-600",
                compact ? "text-base" : "text-2xl",
              )}
            >
              {displayPrice}
            </p>
          </div>
        </div>

        {/* Hover Action Button - hidden in compact mode */}
        {!compact && (
          <Button
            className="mt-6 w-full rounded-full bg-slate-900 group-hover:bg-sky-500 text-white font-bold h-12 shadow-lg shadow-slate-200 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
            onClick={onClick}
          >
            Khám phá ngay <PlayCircle className="ml-2 w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
