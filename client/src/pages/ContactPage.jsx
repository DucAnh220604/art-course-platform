import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success("Gửi tin nhắn thành công!", {
      description: "Chúng tôi sẽ phản hồi trong 24 giờ.",
    });

    setFormData({ name: "", email: "", message: "" });
    setIsSubmitting(false);
  };

  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: "hello@artkids.vn",
      color: "sky",
    },
    {
      icon: Phone,
      label: "Điện thoại",
      value: "0909 123 456",
      color: "emerald",
    },
    {
      icon: MapPin,
      label: "Địa chỉ",
      value: "123 Nguyễn Huệ, Q.1, TP.HCM",
      color: "amber",
    },
  ];

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Header onNavigate={navigate} />
      </div>

      <main className="overflow-x-hidden">
        {/* Hero Section */}
        <section className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <span className="inline-block px-4 py-2 bg-sky-100 text-sky-600 rounded-full text-sm font-medium mb-6">
                Liên hệ
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
                Hãy kết nối với chúng tôi
              </h1>
              <p className="text-lg text-slate-500">
                Bạn có câu hỏi hoặc cần hỗ trợ? Chúng tôi luôn sẵn sàng lắng
                nghe.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-2 space-y-8"
              >
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Thông tin liên hệ
                  </h2>
                  <p className="text-slate-500 mb-8">
                    Hãy liên hệ với chúng tôi qua các kênh dưới đây hoặc gửi tin
                    nhắn trực tiếp.
                  </p>
                </div>

                <div className="space-y-6">
                  {contactItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      className="flex items-start gap-4"
                    >
                      <div
                        className={`w-12 h-12 rounded-2xl bg-${item.color}-50 flex items-center justify-center shrink-0`}
                      >
                        <item.icon
                          className={`w-5 h-5 text-${item.color}-500`}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-slate-400 mb-1">
                          {item.label}
                        </p>
                        <p className="font-medium text-slate-900">
                          {item.value}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Decorative Image */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="hidden lg:block pt-8"
                >
                  <img
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&h=400&fit=crop"
                    alt="Contact"
                    className="rounded-3xl w-full h-48 object-cover"
                  />
                </motion.div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="lg:col-span-3"
              >
                <div className="bg-slate-50 rounded-3xl p-8 lg:p-10">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    Gửi tin nhắn
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Họ và tên
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Nhập họ tên"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          className="h-12 rounded-xl border-slate-200 bg-white focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nội dung tin nhắn
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Bạn muốn hỏi điều gì?"
                        rows={6}
                        className="rounded-xl border-slate-200 bg-white resize-none focus:border-sky-500 focus:ring-sky-500"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-xl bg-slate-900 hover:bg-slate-800 text-base font-medium"
                    >
                      {isSubmitting ? (
                        "Đang gửi..."
                      ) : (
                        <>
                          Gửi tin nhắn
                          <Send className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-sky-400 via-cyan-400 to-teal-400">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                Sẵn sàng bắt đầu học vẽ?
              </h2>
              <p className="text-white/90 mb-8">
                Khám phá hàng trăm khóa học thú vị dành cho bé
              </p>
              <Button
                size="lg"
                className="rounded-full bg-white text-cyan-600 hover:bg-slate-100 px-8 h-12 font-semibold"
                onClick={() => navigate("/courses")}
              >
                Xem khóa học
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
