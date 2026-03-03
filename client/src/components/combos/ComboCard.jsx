import { useState, useEffect } from "react";
import { Star, Users, Package, PlayCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function ComboCard({ combo, onComboClick }) {
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
    <Card className="group rounded-[40px] border-none shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden bg-white flex flex-col h-full hover:-translate-y-2">
      {/* Thumbnail area */}
      <div
        className="relative aspect-[16/10] overflow-hidden cursor-pointer"
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
        <Badge className="absolute top-5 left-5 bg-amber-400 text-amber-900 border-none px-4 py-1.5 rounded-full font-bold text-[10px] shadow-lg shadow-amber-200/50 flex items-center gap-1">
          <Package className="w-3 h-3" />
          COMBO 📦
        </Badge>

        {/* Ribbon giảm giá góc phải */}
        {discount > 0 && (
          <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 pointer-events-none">
            <div className="absolute top-[18px] right-[-28px] w-[110px] bg-rose-500 text-white text-[11px] font-black text-center py-1.5 rotate-45 shadow-md shadow-rose-300/60 tracking-wide">
              -{discount}%
            </div>
          </div>
        )}

        {/* Carousel dots indicator */}
        {courseThumbnails.length > 1 && (
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

      <CardContent className="p-8 flex flex-col flex-1">
        {/* Instructor Info */}
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

        {/* Title */}
        <h3
          className="text-xl font-bold text-slate-800 line-clamp-2 mb-4 hover:text-amber-600 transition-colors cursor-pointer leading-tight"
          onClick={() => onComboClick && onComboClick(combo.slug)}
        >
          {combo.title}
        </h3>

        {/* Course count badge */}
        <Badge className="bg-sky-50 text-sky-700 border-sky-200 w-fit mb-4">
          {combo.courses?.length || 0} khóa học
        </Badge>

        {/* Stats Section */}
        <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-black text-slate-700">
                {rating > 0 ? rating.toFixed(1) : "5.0"}
              </span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">
                {combo.totalStudents?.toLocaleString() || 0} học viên
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">
              Giá combo
            </p>
            {displayOldPrice && (
              <p className="text-xs font-bold text-slate-400 line-through leading-none mb-0.5">
                {displayOldPrice}
              </p>
            )}
            <p className="text-2xl font-black text-amber-600">{displayPrice}</p>
          </div>
        </div>

        {/* Hover Action Button */}
        <Button
          className="mt-6 w-full rounded-full bg-slate-900 group-hover:bg-amber-500 text-white font-bold h-12 shadow-lg shadow-slate-200 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0"
          onClick={() => onComboClick && onComboClick(combo.slug)}
        >
          Khám phá combo <PlayCircle className="ml-2 w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
