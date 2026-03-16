import React from "react";
import { cn } from "@/lib/utils";

export function CourseCard({ course, onClick, index = 0 }) {
  const rating = course.averageRating || course.rating || 4.9;
  const lessons = course.lessons?.length || 8;

  const displayPrice =
    typeof course.price === "number"
      ? course.price === 0
        ? "MIỄN PHÍ"
        : `${course.price.toLocaleString()}đ`
      : course.price;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "scrapbook-card p-5 rounded-xl flex flex-col h-full group cursor-pointer",
        index % 2 === 0 ? "bg-surface-container-low" : "bg-surface-container -rotate-1 translate-y-4"
      )}
    >
      <div className="relative rounded-lg overflow-hidden mb-6 aspect-[4/3]">
        <img 
          src={course.thumbnail || "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800"} 
          alt={course.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
        />
        {(course.totalStudents > 500 || index === 0) && (
          <div className="absolute top-4 left-4 bg-tertiary text-on-tertiary px-4 py-1 rounded-full text-sm font-bold">
            Mới!
          </div>
        )}
      </div>
      <div className="px-2 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-secondary">palette</span>
          <span className="text-secondary font-bold text-sm tracking-wide uppercase">
            {course.category || "HỘI HỌA"}
          </span>
        </div>
        <h3 className="text-2xl font-bold font-headline mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed line-clamp-2">
          {course.description || "Học cách phối màu như một họa sĩ thực thụ và tự tay vẽ nên những bức tranh tuyệt đẹp."}
        </p>
      </div>
      <div className="px-2 pt-4 border-t border-outline-variant/10 flex items-center justify-between">
        <div>
          <span className="text-sm text-on-surface-variant block">{lessons} Bài học</span>
          <span className="text-xl font-extrabold text-on-surface">{displayPrice}</span>
        </div>
        <button className="gummy-button px-6 py-2.5 rounded-full text-on-primary-fixed font-bold text-sm shadow-[0_4px_0_0_#755700]">
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
