import { Clock, PlayCircle, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";

const features = [
  {
    icon: Clock,
    title: "Truy cập trọn đời",
    description:
      "Học theo tốc độ của riêng bé với quyền truy cập không giới hạn tất cả tài liệu khóa học, mãi mãi!",
  },
  {
    icon: PlayCircle,
    title: "Video HD chất lượng",
    description:
      "Video bài giảng sắc nét giúp việc học trở nên thú vị và dễ theo dõi.",
  },
  {
    icon: Award,
    title: "Chứng chỉ",
    description:
      "Nhận chứng chỉ hoàn thành đẹp mắt để tôn vinh thành tích của bé!",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 py-8 sm:py-12 lg:py-16 xl:py-20 my-8 sm:my-12 lg:my-16 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 lg:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4">
            Tại sao chọn KidsArt?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/90 px-4">
            Tất cả những gì bé cần để trở thành một họa sĩ tự tin
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-3xl hover:scale-105 transition-transform">
                  <CardContent className="p-6 lg:p-8 xl:p-10 text-center space-y-4">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                      <IconComponent className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white" />
                    </div>
                    <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold">
                      {feature.title}
                    </h3>
                    <p className="text-white/80 text-sm lg:text-base xl:text-lg">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
