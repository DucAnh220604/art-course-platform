import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Button } from "@/components/ui/button";

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header onNavigate={navigate} />
      </div>

      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-block px-4 py-2 bg-sky-100 text-sky-600 rounded-full text-sm font-medium mb-6">
                  Về chúng tôi
                </span>
                <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
                  Nơi khơi nguồn
                  <span className="text-sky-500"> sáng tạo</span>
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed mb-8">
                  ArtKids là nền tảng học vẽ trực tuyến hàng đầu dành cho trẻ em
                  Việt Nam. Chúng tôi tin rằng nghệ thuật là ngôn ngữ của tâm
                  hồn.
                </p>
                <Button
                  size="lg"
                  className="rounded-full bg-slate-900 hover:bg-slate-800 px-8 h-14 text-base"
                  onClick={() => navigate("/courses")}
                >
                  Khám phá khóa học
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop"
                    alt="Children painting"
                    className="w-full h-[400px] lg:h-[500px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-amber-400 rounded-3xl -z-10" />
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-sky-400 rounded-full -z-10" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: "10K+", label: "Học viên" },
                { number: "500+", label: "Bài học" },
                { number: "50+", label: "Giảng viên" },
                { number: "4.9", label: "Đánh giá" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <p className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
                    {stat.number}
                  </p>
                  <p className="text-slate-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 lg:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-2 lg:order-1 relative"
              >
                <div className="grid grid-cols-2 gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop"
                    alt="Art class"
                    className="rounded-2xl h-48 w-full object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop"
                    alt="Painting"
                    className="rounded-2xl h-48 w-full object-cover mt-8"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=300&fit=crop"
                    alt="Art supplies"
                    className="rounded-2xl h-48 w-full object-cover"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1551913902-c92207136625?w=400&h=300&fit=crop"
                    alt="Kids drawing"
                    className="rounded-2xl h-48 w-full object-cover mt-8"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="order-1 lg:order-2"
              >
                <span className="inline-block px-4 py-2 bg-amber-100 text-amber-600 rounded-full text-sm font-medium mb-6">
                  Sứ mệnh
                </span>
                <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                  Nuôi dưỡng tài năng nghệ thuật
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed mb-6">
                  Chúng tôi mong muốn mang đến cho mỗi trẻ em cơ hội được học vẽ
                  một cách vui vẻ và sáng tạo, giúp các bé tự tin thể hiện bản
                  thân qua nghệ thuật.
                </p>
                <div className="space-y-4">
                  {[
                    "Học theo tốc độ riêng",
                    "Giảng viên tận tâm",
                    "Chứng chỉ hoàn thành",
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-sky-500 rounded-full" />
                      <span className="text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Bắt đầu hành trình nghệ thuật
              </h2>
              <p className="text-lg text-white/90 mb-8">
                Hàng ngàn khóa học đang chờ bé khám phá
              </p>
              <Button
                size="lg"
                className="rounded-full bg-white text-amber-600 hover:bg-slate-100 px-8 h-14 text-base font-semibold"
                onClick={() => navigate("/courses")}
              >
                Xem khóa học ngay
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
