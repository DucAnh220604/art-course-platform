import { ArtKidsLogo } from "../icons/ArtKidsLogo";
import { useNavigate } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-surface-container-highest mt-20 py-16 px-6 border-t border-outline-variant/10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div 
            className="flex items-center gap-4 mb-6 cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-surface text-3xl">palette</span>
            </div>
            <span className="font-headline font-bold text-2xl text-primary tracking-tighter">ArtKids Studio</span>
          </div>
          <p className="text-on-surface-variant max-w-sm font-medium leading-relaxed">
            Nơi khơi nguồn sáng tạo và chắp cánh ước mơ cho những họa sĩ nhí tài năng. Hãy cùng Artie vẽ nên thế giới muôn màu!
          </p>
          <div className="flex gap-4 mt-8">
            <button className="w-10 h-10 rounded-full bg-primary-container text-on-primary-fixed flex items-center justify-center hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">facebook</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">video_library</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary-container flex items-center justify-center hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-sm">camera_enhance</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-headline font-black text-on-surface uppercase tracking-widest text-xs mb-2">Khám Phá</h4>
          <button onClick={() => navigate("/about")} className="text-left text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">Về chúng mình</button>
          <button onClick={() => navigate("/courses")} className="text-left text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">Lớp học vẽ</button>
          <button className="text-left text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">Giảng viên nhân ái</button>
          <button className="text-left text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">Góc triển lãm</button>
        </div>

        <div className="flex flex-col gap-4">
          <h4 className="font-headline font-black text-on-surface uppercase tracking-widest text-xs mb-2">Hỗ Trợ Bé</h4>
          <button className="text-left text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">Trung tâm giải đáp</button>
          <button className="text-left text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">Quyền riêng tư</button>
          <button className="text-left text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">Điều khoản sử dụng</button>
          <button className="text-left text-on-surface-variant hover:text-primary transition-colors font-bold text-sm">Liên hệ thầy cô</button>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-on-surface-variant text-xs font-bold">© 2026 ArtKids Creative Studio. Cùng bé tô màu thế giới!</p>
        <div className="flex items-center gap-2 text-on-surface-variant/50">
          <span className="material-symbols-outlined text-sm">favorite</span>
          <span className="text-[10px] font-black uppercase tracking-widest">Làm bằng tình yêu cho trẻ em</span>
        </div>
      </div>
    </footer>
  );
}
