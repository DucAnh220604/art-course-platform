import { useState, useEffect } from "react";
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
    <div 
      onClick={() => onComboClick && onComboClick(combo.slug)}
      className={cn(
        "scrapbook-card bg-surface-container-highest p-5 rounded-xl flex flex-col h-full group cursor-pointer border border-outline-variant/10",
        compact ? "scale-95 origin-top-left" : ""
      )}
    >
      <div className="relative rounded-lg overflow-hidden mb-6 aspect-[4/3] shadow-sm">
        <img 
          src={displayThumbnail} 
          alt={combo.title}
          key={currentImageIndex}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-4 left-4 bg-primary text-on-primary px-4 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">package</span> COMBO
        </div>
        {discount > 0 && (
          <div className="absolute top-4 right-4 bg-error text-on-error px-3 py-1 rounded-full text-xs font-black shadow-sm">
            -{discount}%
          </div>
        )}
      </div>
      <div className="px-2 flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-tertiary text-lg">auto_fix_high</span>
          <span className="text-tertiary font-bold text-xs tracking-wider uppercase">
            {combo.courses?.length || 0} KHÓA HỌC TRONG BỘ
          </span>
        </div>
        <h3 className="text-2xl font-bold font-headline mb-3 leading-tight group-hover:text-primary transition-colors line-clamp-2">
          {combo.title}
        </h3>
        <p className="text-on-surface-variant text-sm mb-6 leading-relaxed line-clamp-2 font-medium">
          {combo.description || "Gói học tiết kiệm, đầy đủ lộ trình cho bé."}
        </p>
        
        {!compact && (
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center overflow-hidden border border-white shadow-sm">
              <img src={combo.instructor?.avatar || "https://i.pravatar.cc/150"} alt={instructorName} className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant text-secondary">Bởi {instructorName}</span>
          </div>
        )}
      </div>
      <div className="px-2 pt-4 border-t border-outline-variant/10 flex items-center justify-between mt-auto">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <span className="material-symbols-outlined text-amber-400 text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="text-xs font-bold text-on-surface-variant">{rating > 0 ? rating.toFixed(1) : "5.0"} ({combo.totalStudents || 0})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold text-on-surface">{displayPrice}</span>
            {displayOldPrice && (
              <span className="text-sm font-bold text-on-surface-variant/40 line-through">{displayOldPrice}</span>
            )}
          </div>
        </div>
        <button className="gummy-button px-6 py-2.5 rounded-full text-on-primary-fixed font-bold text-sm">
          Mua Combo
        </button>
      </div>
    </div>
  );
}
