import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const testimonials = [
  {
    name: "Chị Lan",
    role: "Phụ huynh",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    text: "Con gái tôi rất thích các khóa học này! Sự sáng tạo của con đã nở rộ. Các giảng viên kiên nhẫn và cuốn hút.",
    rating: 5,
  },
  {
    name: "Anh Hùng",
    role: "Phụ huynh",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    text: "Đáng giá từng đồng. Con trai tôi đã học được rất nhiều và bây giờ bé vẽ mỗi ngày. Rất đáng giới thiệu!",
    rating: 5,
  },
  {
    name: "Bé Vy",
    role: "Học viên, 10 tuổi",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
    text: "Con rất thích học các kỹ thuật vẽ mới! Các video vui và dễ theo dõi. Con đã vẽ được nhiều bức tranh đẹp!",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-8 sm:py-12 lg:py-16 xl:py-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8 sm:mb-12 lg:mb-16"
      >
        <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 sm:mb-4">
          <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
            Phụ huynh và học viên nói gì?
          </span>
        </h2>
        <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-gray-600 px-4">
          Câu chuyện thật từ cộng đồng sáng tạo của chúng tôi
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.15 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-3xl hover:shadow-xl transition-shadow h-full">
              <CardContent className="p-5 lg:p-6 xl:p-8 space-y-4">
                <Quote className="w-8 h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 text-green-400" />
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 lg:w-5 lg:h-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-gray-700 italic text-sm lg:text-base xl:text-lg">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3 pt-4">
                  <Avatar className="border-2 border-green-300 w-10 h-10 lg:w-12 lg:h-12">
                    <AvatarImage
                      src={testimonial.avatar}
                      alt={testimonial.name}
                    />
                    <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-bold text-gray-800 text-sm lg:text-base">
                      {testimonial.name}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
