import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export function HeroSection({ 
  title, 
  description, 
  primaryBtnText = "Dùng thử miễn phí",
  secondaryBtnText = "Xem khóa học",
  showStats = true,
  imageSrc,
  mascotMode = false,
  badgeText = "🎨 Cùng Bé Sáng Tạo!"
}) {
  const navigate = useNavigate();

  // Nội dung mặc định (từ LandingPage gốc)
  const defaultTitle = (
    <>
      Khơi Dậy <br />
      <span className="text-primary italic relative">
        Sáng Tạo Cùng Bé
        <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
          <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </span>
    </>
  );

  const defaultDescription = "Hàng nghìn họa sĩ nhí đang học vẽ, tô màu và sáng tạo những tác phẩm tuyệt vời cùng các giảng viên chuyên nghiệp!";
  const defaultImage = "https://images.unsplash.com/photo-1621360841013-c7683c659ec6?q=80&w=800&auto=format&fit=crop";

  return (
    <section className="relative pt-12 pb-24 px-6 overflow-hidden bg-surface font-body">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column: Content */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10"
        >
          <div className="inline-block bg-tertiary-container/30 text-on-tertiary-container px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.2em] mb-8 backdrop-blur-sm border border-tertiary-container/10">
            {badgeText}
          </div>
          
          <h1 className="font-headline font-black text-5xl lg:text-7xl leading-[1.1] text-on-surface tracking-tighter mb-8">
            {title || defaultTitle}
          </h1>
          
          <p className="text-xl text-on-surface-variant max-w-lg mb-12 leading-relaxed font-medium">
            {description || defaultDescription}
          </p>
          
          <div className="flex flex-wrap gap-6">
            <button 
              onClick={() => navigate("/courses")}
              className="gummy-button bg-primary text-on-primary font-headline font-black text-lg px-10 py-5 rounded-2xl flex items-center gap-3 shadow-xl"
            >
              {primaryBtnText}
              <span className="material-symbols-outlined font-black">brush</span>
            </button>
            <button 
              onClick={() => navigate("/courses")}
              className="px-8 py-5 rounded-2xl border-2 border-outline-variant/10 text-on-surface font-black text-sm uppercase tracking-widest hover:bg-surface-container transition-all"
            >
              {secondaryBtnText}
            </button>
          </div>

          {showStats && (
            <div className="mt-12 flex items-center gap-12">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-primary tracking-tighter">10k+</span>
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Học viên</span>
              </div>
              <div className="flex flex-col border-l-2 border-dashed border-outline-variant/10 pl-8">
                <span className="text-3xl font-black text-secondary tracking-tighter">500+</span>
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Khóa học</span>
              </div>
              <div className="flex flex-col border-l-2 border-dashed border-outline-variant/10 pl-8">
                <span className="text-3xl font-black text-primary tracking-tighter">4.9★</span>
                <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Đánh giá</span>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Right Column: Visuals */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative"
        >
          {/* Main Visual Container */}
          <div className={cn(
            "relative z-10 scrapbook-blob w-full aspect-square flex items-center justify-center p-4 overflow-hidden shadow-premium group transition-all duration-700",
            mascotMode ? "bg-surface-container-highest" : "bg-white p-6"
          )}>
            <motion.div 
              className="w-full h-full rounded-[3rem] overflow-hidden"
              whileHover={{ scale: 1.02 }}
            >
              <img 
                src={imageSrc || defaultImage} 
                alt="ArtKids" 
                className="w-full h-full object-cover rounded-[2rem] transition-transform duration-700 group-hover:scale-110" 
              />
            </motion.div>
          </div>
          
          {/* Decorative Back Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
          
          {/* Floating Sticker / Badge */}
          <motion.div 
            animate={{ rotate: [-2, 2, -2], y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-8 right-0 lg:-right-8 z-20 bg-white/90 backdrop-blur-md p-6 rounded-[2rem] border-2 border-primary/20 shadow-premium max-w-xs rotate-3"
          >
            <div className="flex items-center gap-3 mb-2">
               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-sm">workspace_premium</span>
               </div>
               <h3 className="font-headline font-black text-on-surface uppercase text-[10px] tracking-widest">Chứng chỉ ArtKids</h3>
            </div>
            <p className="text-on-surface-variant leading-relaxed font-bold italic text-sm">
                Nhận chứng chỉ họa sĩ nhí sau khi hoàn thành khóa học nha!
            </p>
          </motion.div>

          {/* Additional decorative sticker */}
          <div className="absolute -top-6 -left-6 z-20 bg-amber-400 text-white p-5 rounded-[2rem] shadow-xl rotate-[-15deg] hidden xl:flex items-center justify-center">
            <span className="material-symbols-outlined text-4xl fill-1">star</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
