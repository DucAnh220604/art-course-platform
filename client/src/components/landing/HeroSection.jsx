import { PlayCircle, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
  const navigate = useNavigate();
  return (
    <section className="py-12 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6 text-center md:text-left order-2 md:order-1"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                Khơi Dậy Sáng Tạo Cùng Bé
              </span>
            </h1>
            <p className="text-lg text-gray-600">
              Hàng nghìn họa sĩ nhí đang học vẽ, tô màu và sáng tạo những tác
              phẩm tuyệt vời cùng các giảng viên chuyên nghiệp!
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                className="rounded-full bg-slate-900 hover:bg-slate-800 px-8 h-12"
              >
                Dùng thử miễn phí
                <PlayCircle className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/courses")}
                className="rounded-full border-slate-300 text-slate-700 hover:bg-slate-50 px-8 h-12"
              >
                Xem khóa học
              </Button>
            </div>
            <div className="flex gap-8 pt-6 justify-center md:justify-start">
              {[
                { number: "10k+", label: "Học viên", color: "text-sky-600" },
                { number: "500+", label: "Khóa học", color: "text-orange-500" },
                { number: "4.9★", label: "Đánh giá", color: "text-green-500" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="text-center md:text-left"
                >
                  <div className={`text-3xl font-bold ${stat.color}`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative order-1 md:order-2"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1610274672835-65a79c852f58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                alt="Happy kids drawing"
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-400 rounded-3xl -z-10" />
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-400 rounded-full -z-10" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-4 transform rotate-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold">Chứng chỉ</div>
                  <div className="text-xs text-gray-500">Khi hoàn thành</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
