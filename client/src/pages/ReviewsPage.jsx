import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, Footer } from "@/components/landing";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Star,
  Quote,
  Brush,
  Smile,
  Award,
  ThumbsUp,
  Send,
  Camera,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";

export function ReviewsPage() {
  const navigate = useNavigate();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState("");
  const [artworkFile, setArtworkFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!review.trim()) {
      toast.error("Vui lòng nhập cảm nhận của bé trước khi gửi.");
      return;
    }

    toast.success("Đã ghi nhận cảm nhận của bé.", {
      description: "Nếu cần hỗ trợ, vui lòng vào tab Liên hệ để gửi tin nhắn.",
    });
    setReview("");
    setRating(5);
    setHoverRating(0);
    setArtworkFile(null);
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col">
      <Header onNavigate={navigate} />

      <main className="flex-1 overflow-x-hidden">
        {/* Hero Header Section */}
        <header className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="absolute top-10 left-10 w-64 h-64 bg-secondary-container/20 scrapbook-blob -z-10 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-tertiary-container/20 scrapbook-blob -z-10"></div>
          <div className="max-w-4xl mx-auto text-center relative">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block px-4 py-1 bg-surface-container-high rounded-full mb-6 rotate-[-2deg]"
            >
              <span className="font-headline font-bold text-on-surface-variant uppercase tracking-widest text-sm">
                Nhật ký Nghệ thuật
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-headline text-6xl md:text-8xl font-black text-on-surface leading-tight mb-8"
            >
              Các Họa Sĩ Nhí <br />
              <span className="relative inline-block mt-4">
                Nói Gì Nhỉ?
                <svg
                  className="absolute -bottom-4 left-0 w-full"
                  fill="none"
                  viewBox="0 0 400 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 15C50 5 150 5 200 10C250 15 350 15 395 5"
                    stroke="#fdc003"
                    strokeLinecap="round"
                    strokeWidth="8"
                  ></path>
                </svg>
              </span>
            </motion.h1>
            <p className="text-xl md:text-2xl text-on-surface-variant max-w-2xl mx-auto font-medium">
              Từ những ngón tay lấm lem màu đến những kiệt tác xứng đáng trưng
              bày, hãy cùng khám phá hành trình sáng tạo của các ngôi sao nhỏ!
            </p>
          </div>
        </header>

        {/* Summary Section: The Scoreboard */}
        <section className="px-6 -mt-16 mb-24 relative z-10">
          <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 paper-stack flex flex-col md:flex-row items-center justify-around gap-12 border border-outline-variant/10">
              <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-1 mb-2 text-primary">
                  {[1, 2, 3, 4].map((i) => (
                    <Star key={i} fill="currentColor" className="w-8 h-8" />
                  ))}
                  <Star className="w-8 h-8 text-primary" strokeWidth={3} />
                </div>
                <h2 className="font-headline text-5xl font-black text-on-surface">
                  4.9 / 5
                </h2>
                <p className="font-bold text-on-surface-variant uppercase tracking-widest text-xs">
                  Điểm số hạnh phúc trung bình
                </p>
              </div>

              <div className="hidden md:block h-24 w-px bg-outline-variant/20"></div>

              <div className="flex flex-wrap justify-center gap-10">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary-container rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-sm rotate-3">
                    <Brush className="text-on-secondary-container w-8 h-8" />
                  </div>
                  <p className="font-headline font-black text-2xl text-on-surface">
                    1,200+
                  </p>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                    Bức tranh đã vẽ
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-tertiary-container rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-sm -rotate-3">
                    <Smile className="text-on-tertiary-container w-8 h-8" />
                  </div>
                  <p className="font-headline font-black text-2xl text-on-surface">
                    450+
                  </p>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                    Học viên hạnh phúc
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-3 mx-auto shadow-sm rotate-6">
                    <Award className="text-on-primary-container w-8 h-8" />
                  </div>
                  <p className="font-headline font-black text-2xl text-on-surface">
                    12
                  </p>
                  <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                    Giải thưởng nghệ thuật
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Bento Grid */}
        <section className="px-6 mb-32">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
            {/* Card 1: Large Featured */}
            <div className="md:col-span-7 bg-surface-container rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-stretch border border-outline-variant/10 hover:translate-y-[-4px] transition-transform shadow-premium">
              <div className="md:w-1/2 relative min-h-[300px]">
                <img
                  className="absolute inset-0 w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=800&auto=format&fit=crop"
                  alt="Kiệt tác của Leo"
                />
                <div className="absolute top-6 left-6 bg-primary-container text-on-primary-container px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
                  Kiệt tác của Leo
                </div>
              </div>
              <div className="md:w-1/2 p-10 flex flex-col justify-between bg-white/40 backdrop-blur-sm">
                <div>
                  <div className="flex gap-1 mb-6 text-primary">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} fill="currentColor" size={20} />
                    ))}
                  </div>
                  <blockquote className="font-headline text-2xl font-black text-on-surface leading-tight mb-6 italic">
                    "Con thích nhất là lúc vẽ dải ngân hà! Artie vui tính lắm,
                    đã dạy con cách tạo ra những vì sao bằng bàn chải đánh răng
                    đó!"
                  </blockquote>
                  <p className="font-headline font-black text-primary uppercase tracking-widest text-xs">
                    Leo, 7 tuổi
                  </p>
                </div>
                <div className="mt-8 p-6 bg-tertiary-container/30 rounded-[1.5rem] border-l-8 border-tertiary relative overflow-hidden group">
                  <p className="text-sm italic text-on-surface font-medium relative z-10">
                    <span className="font-black block text-tertiary uppercase tracking-widest text-[10px] mb-2">
                      Lời nhắn từ mẹ:
                    </span>
                    "Leo từng rất sợ vẽ sai. Giờ con gọi đó là 'những vết bẩn
                    hạnh phúc'. Thật sự là một sự thay đổi kỳ diệu!"
                  </p>
                  <Quote className="absolute -right-2 -bottom-2 w-16 h-16 text-tertiary/10 rotate-12 transition-transform group-hover:scale-110" />
                </div>
              </div>
            </div>

            {/* Card 2: Square */}
            <div className="md:col-span-5 bg-white rounded-[2.5rem] p-10 flex flex-col border border-outline-variant/10 rotate-[1deg] shadow-premium hover:rotate-0 transition-all duration-500">
              <div className="mb-8 rounded-[2rem] overflow-hidden h-56 border-4 border-white shadow-lg rotate-[-2deg]">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop"
                  alt="Lớp học nặn đất sét"
                />
              </div>
              <div className="flex-grow">
                <div className="flex gap-1 mb-4 text-primary">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} fill="currentColor" size={18} />
                  ))}
                </div>
                <p className="font-headline text-2xl font-black text-on-surface mb-4 leading-tight">
                  "Lớp học nặn đất sét là tuyệt nhất! Chú khủng long của con
                  trông như thật luôn ấy."
                </p>
                <p className="font-headline font-black text-primary uppercase tracking-widest text-xs">
                  Maya, 9 tuổi
                </p>
              </div>
            </div>

            {/* Card 3: Vertical Organic */}
            <div className="md:col-span-4 bg-secondary-container/20 rounded-[2.5rem] p-10 border border-outline-variant/10 flex flex-col gap-8 rotate-[-1deg] shadow-premium hover:rotate-0 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-xl rotate-6">
                  <img
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?q=80&w=400&auto=format&fit=crop"
                    alt="Sam"
                  />
                </div>
                <div>
                  <p className="font-headline font-black text-on-surface text-lg">
                    Sam, 6 tuổi
                  </p>
                  <div className="flex text-primary">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} fill="currentColor" size={14} />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-on-surface font-medium leading-relaxed text-lg italic">
                "Con thích việc mình có thể dùng tất cả các màu trong hộp. Artie
                bảo không có màu nào là sai trong nghệ thuật cả. Con đã vẽ một
                ông mặt trời màu xanh dương nè!"
              </p>
              <div className="rounded-[1.5rem] overflow-hidden h-40 mt-auto border-4 border-white shadow-lg">
                <img
                  className="w-full h-full object-cover"
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop"
                  alt="Mặt trời xanh"
                />
              </div>
            </div>

            {/* Card 4: Horizontal Low-Profile */}
            <div className="md:col-span-8 bg-white rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 border border-outline-variant/10 shadow-premium relative overflow-hidden group">
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-primary-container rounded-full flex items-center justify-center shadow-lg rotate-12 group-hover:scale-110 transition-transform">
                <ThumbsUp className="text-on-primary-container w-8 h-8" />
              </div>
              <div className="md:w-1/3 rounded-[2rem] overflow-hidden h-48 md:h-auto shadow-inner border-2 border-outline-variant/5">
                <img
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  src="https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=800&auto=format&fit=crop"
                  alt="Khu vườn màu sắc"
                />
              </div>
              <div className="md:w-2/3 flex flex-col justify-center">
                <div className="flex gap-1 mb-4 text-primary">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} fill="currentColor" size={20} />
                  ))}
                </div>
                <p className="font-headline text-3xl font-black text-on-surface mb-4 leading-tight">
                  "Đêm triển lãm thật là ngầu! Nhìn thấy bức vẽ của mình trên
                  tường làm con cảm thấy mình như một nghệ sĩ thực thụ ấy."
                </p>
                <p className="font-headline font-black text-on-surface-variant/40 uppercase tracking-widest text-xs">
                  Chloe, 11 tuổi
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mascot & Form Section */}
        <section className="px-6 mb-32 relative">
          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-primary-fixed/10 scrapbook-blob -z-10"></div>
          <div className="max-w-4xl mx-auto bg-white rounded-[3rem] p-8 md:p-16 border-2 border-dashed border-primary/30 relative paper-stack">
            <div className="text-center mb-12">
              <motion.div
                className="w-20 h-20 bg-primary-container rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-12"
                animate={{ rotate: [12, -12, 12] }}
                transition={{ repeat: Infinity, duration: 4 }}
              >
                <Pencil className="text-on-primary-container w-10 h-10" />
              </motion.div>
              <h2 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-4">
                Gửi Tác Phẩm & Cảm Nhận Của Bé
              </h2>
              <p className="text-on-surface-variant font-medium text-lg">
                Chia sẻ niềm vui sáng tạo cùng cộng đồng ArtKids!
              </p>
            </div>

            <form className="space-y-10" onSubmit={handleSubmit}>
              {/* Rating Selector */}
              <div className="flex flex-col items-center gap-4 p-6 bg-surface-container-lowest rounded-[2rem] border-2 border-outline-variant/10">
                <p className="font-headline font-black text-on-surface-variant uppercase tracking-widest text-[10px]">
                  Đánh giá của họa sĩ nhí
                </p>
                <div className="flex gap-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <button
                      key={i}
                      className="text-primary hover:scale-125 transition-transform outline-none"
                      type="button"
                      onClick={() => setRating(i)}
                      onMouseEnter={() => setHoverRating(i)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        size={40}
                        className={cn(
                          "transition-all duration-300",
                          (hoverRating || rating) >= i
                            ? "fill-current text-primary"
                            : "text-outline-variant/30",
                        )}
                      />
                    </button>
                  ))}
                </div>
                <p className="font-headline font-bold text-primary text-sm uppercase tracking-widest">
                  {rating === 5 && "TUYỆT VỜI LUÔN! 🌟"}
                  {rating === 4 && "Rất là vui luôn! 😊"}
                  {rating === 3 && "Cũng ổn áp nè! 👍"}
                  {rating === 2 && "Cần cố gắng thêm nha! 💪"}
                  {rating === 1 && "Bé hơi buồn một xíu... 😢"}
                </p>
              </div>

              {/* Review Content */}
              <div className="flex flex-col gap-3">
                <label className="font-headline font-black text-on-surface-variant uppercase tracking-widest text-[10px] pl-4">
                  Cảm nhận của con
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="w-full rounded-[2rem] border-2 border-outline-variant/20 bg-white p-6 font-medium focus:border-primary focus:ring-primary transition-all text-on-surface outline-none min-h-[150px] shadow-inner"
                  placeholder="Bé thấy buổi học hôm nay thế nào nhỉ?"
                ></textarea>
              </div>

              {/* Upload Area */}
              <div className="flex flex-col gap-3">
                <label className="font-headline font-black text-on-surface-variant uppercase tracking-widest text-[10px] pl-4">
                  Khoe tác phẩm của bé
                </label>
                <input
                  type="file"
                  id="artwork-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setArtworkFile(file);
                      toast.success(`Đã chọn ảnh: ${file.name}`);
                    }
                  }}
                />
                <div
                  onClick={() =>
                    document.getElementById("artwork-upload").click()
                  }
                  className="border-4 border-dashed border-outline-variant/30 rounded-[2rem] p-12 bg-surface-container-lowest/50 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-white hover:border-primary/30 transition-all group"
                >
                  <div className="w-20 h-20 bg-secondary-container rounded-3xl flex items-center justify-center text-on-secondary-container shadow-lg group-hover:scale-110 transition-transform">
                    <Camera size={36} />
                  </div>
                  <div className="text-center">
                    <p className="text-on-surface font-black text-lg mb-1">
                      Nhấn để tải lên ảnh chụp tranh
                    </p>
                    <p className="text-xs text-on-surface-variant/40 font-bold uppercase tracking-widest">
                      Định dạng JPG, PNG • Tối đa 5MB
                    </p>
                  </div>
                </div>
                {artworkFile && (
                  <p className="text-xs text-on-surface-variant/70 font-bold text-center">
                    Ảnh đã chọn: {artworkFile.name}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6 flex justify-center">
                <button
                  className="gummy-button bg-primary-container text-on-primary-container px-16 py-6 rounded-[2rem] font-headline font-black text-2xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-xl"
                  type="submit"
                >
                  GỬI ĐÁNH GIÁ 🚀
                  <Send size={24} />
                </button>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
