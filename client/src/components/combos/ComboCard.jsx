import { useState, useEffect } from "react";
import { Star, Users, Package, PlayCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { cn } from "@/lib/utils";

export function ComboCard({ combo, onComboClick, compact = false }) {
  const discount = combo.discountPercentage || 0;

  // Lấy danh sách ảnh từ các khóa học trong combo
  const courseThumbnails =
    combo.courses?.map((course) => course.thumbnail).filter(Boolean) || [];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-rotate ảnh mỗi 2 giây
  useEffect(() => {
    if (courseThumbnails.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % courseThumbnails.length,
        );
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [courseThumbnails.length]);

  // Fallback thumbnail nếu không có courses
  const displayThumbnail =
    courseThumbnails.length > 0
      ? courseThumbnails[currentImageIndex]
      : combo.thumbnail || "/placeholder-course.jpg";

  const instructorName =
    combo.instructor?.fullname ||
    combo.instructor?.name ||
    "Giảng viên ArtKids";

  const rating = combo.averageRating || 0;

  const displayPrice =
    combo.price === 0 ? "MIỄN PHÍ" : `${combo.price?.toLocaleString()}đ`;

  const displayOldPrice =
    combo.originalPrice > combo.price
      ? `${combo.originalPrice?.toLocaleString()}đ`
      : null;

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
        onClick={() => onComboClick && onComboClick(combo.slug)}
      >
        <img
          src={displayThumbnail}
          alt={combo.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          key={currentImageIndex}
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />

        {/* Badge COMBO */}
        <Badge
          className={cn(
            "absolute bg-amber-400 text-amber-900 border-none rounded-full font-bold shadow-lg shadow-amber-200/50 flex items-center gap-1",
            compact
              ? "top-3 left-3 px-2 py-1 text-[8px]"
              : "top-5 left-5 px-4 py-1.5 text-[10px]",
          )}
        >
          <Package className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
          COMBO
        </Badge>

        {/* Ribbon giảm giá góc phải */}
        {discount > 0 && (
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
                  ? "top-2.5 -right-5.5 w-20 text-[9px] py-1"
                  : "top-4.5 -right-7 w-27.5 text-[11px] py-1.5",
              )}
            >
              -{discount}%
            </div>
          </div>
        )}

        {/* Carousel dots indicator - hidden in compact */}
        {!compact && courseThumbnails.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-1">
            {courseThumbnails.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentImageIndex
                    ? "bg-white w-6"
                    : "bg-white/50 w-1.5"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <CardContent
        className={cn("flex flex-col flex-1", compact ? "p-4" : "p-8")}
      >
        {/* Instructor Info - hidden in compact */}
        {!compact && (
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-8 h-8 border-2 border-amber-100 shadow-sm">
              <AvatarImage src={combo.instructor?.avatar} />
              <AvatarFallback className="bg-amber-50 text-amber-600 text-xs font-bold">
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
            "font-bold text-slate-800 hover:text-amber-600 transition-colors cursor-pointer leading-tight",
            compact ? "text-sm line-clamp-2 mb-2" : "text-xl line-clamp-2 mb-4",
          )}
          onClick={() => onComboClick && onComboClick(combo.slug)}
        >
          {combo.title}
        </h3>

        {/* Course count badge */}
        <Badge
          className={cn(
            "bg-sky-50 text-sky-700 border-sky-200 w-fit",
            compact ? "text-[10px] px-2 py-0.5 mb-2" : "mb-4",
          )}
        >
          {combo.courses?.length || 0} khóa học
        </Badge>

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
                {rating > 0 ? rating.toFixed(1) : "5.0"}
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
                {combo.totalStudents?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          <div className="text-right">
            {!compact && (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                Giá combo
              </p>
            )}
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
                "font-black text-amber-600",
                compact ? "text-base" : "text-2xl",
              )}
            >
              {displayPrice}
            </p>
          </div>
        </div>

        {/* Hover Action Button - hidden in compact */}
        {!compact && (
          <Button
            className="mt-6 w-full rounded-full bg-slate-900 group-hover:bg-amber-500 text-white font-bold h-12 shadow-lg shadow-slate-200 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
            onClick={() => onComboClick && onComboClick(combo.slug)}
          >
            Khám phá combo <PlayCircle className="ml-2 w-4 h-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
