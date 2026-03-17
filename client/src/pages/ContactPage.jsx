import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, ArrowRight } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import contactApi from "@/api/contactApi";

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

    try {
      const response = await contactApi.sendMessage(formData);
      if (response.data?.success) {
        toast.success("Gửi tin nhắn thành công!", {
          description: "Chúng tôi sẽ phản hồi trong 24 giờ.",
        });
        setFormData({ name: "", email: "", message: "" });
      }
    } catch (error) {
      toast.error("Gửi tin nhắn thất bại!", {
        description: error.response?.data?.message || "Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    {
      icon: Mail,
      label: "Email",
      value: "hello@artkids.vn",
      iconClass: "text-primary",
      bgClass: "bg-primary-container",
    },
    {
      icon: Phone,
      label: "Điện thoại",
      value: "0909 123 456",
      iconClass: "text-secondary",
      bgClass: "bg-secondary-container",
    },
    {
      icon: MapPin,
      label: "Địa chỉ",
      value: "123 Nguyễn Huệ, Q.1, TP.HCM",
      iconClass: "text-tertiary",
      bgClass: "bg-tertiary-container",
    },
  ];

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen overflow-x-hidden">
      <Header onNavigate={navigate} />

      <main>
        <section className="relative px-6 pt-16 pb-20 overflow-hidden">
          <div className="absolute -top-20 -left-10 w-72 h-72 bg-primary-container/30 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -right-10 w-80 h-80 bg-secondary-container/30 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-14 text-center"
            >
              <span className="inline-block text-[10px] font-black uppercase tracking-[0.22em] text-primary bg-primary-container px-5 py-2 rounded-full mb-6">
                Liên hệ ArtKids
              </span>
              <h1 className="font-headline text-5xl md:text-7xl font-black leading-tight text-on-surface mb-5">
                Chúng Mình Lắng Nghe
                <span className="block italic text-primary">
                  Mọi Điều Từ Bé
                </span>
              </h1>
              <p className="text-on-surface-variant text-lg max-w-2xl mx-auto font-medium">
                Có thắc mắc về khóa học, đơn hàng hay tài khoản? Gửi lời nhắn
                cho ArtKids, đội ngũ sẽ phản hồi sớm nhất có thể.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.1 }}
                className="lg:col-span-2 space-y-5"
              >
                {contactItems.map((item) => (
                  <div
                    key={item.label}
                    className="bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 shadow-sm scrapbook-card"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-2xl ${item.bgClass} flex items-center justify-center shrink-0`}
                      >
                        <item.icon className={`w-5 h-5 ${item.iconClass}`} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/50 mb-1">
                          {item.label}
                        </p>
                        <p className="font-headline text-lg font-bold text-on-surface">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm">
                  <img
                    src="https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&h=500&fit=crop"
                    alt="ArtKids contact"
                    className="w-full h-56 object-cover"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.15 }}
                className="lg:col-span-3"
              >
                <div className="bg-surface-container-low rounded-[2rem] p-8 md:p-10 border-2 border-dashed border-outline-variant/20 shadow-premium">
                  <h2 className="font-headline text-3xl md:text-4xl font-black text-on-surface mb-2">
                    Gửi tin nhắn cho ArtKids
                  </h2>
                  <p className="text-on-surface-variant font-medium mb-8">
                    Điền thông tin bên dưới, chúng mình sẽ phản hồi trong vòng
                    24 giờ làm việc.
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60 mb-2 pl-1">
                          Họ và tên
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Nhập họ tên"
                          className="h-12 rounded-2xl border-2 border-outline-variant/10 bg-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60 mb-2 pl-1">
                          Email
                        </label>
                        <Input
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="email@example.com"
                          className="h-12 rounded-2xl border-2 border-outline-variant/10 bg-white font-bold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-on-surface-variant/60 mb-2 pl-1">
                        Nội dung tin nhắn
                      </label>
                      <Textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Bạn muốn ArtKids hỗ trợ điều gì?"
                        rows={6}
                        className="rounded-2xl border-2 border-outline-variant/10 bg-white resize-none font-medium"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-14 rounded-2xl gummy-button bg-primary text-on-primary font-headline font-black text-base"
                    >
                      {isSubmitting ? "ĐANG GỬI..." : "GỬI TIN NHẮN"}
                      <Send className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="max-w-5xl mx-auto bg-primary-container/40 rounded-[2.5rem] p-8 md:p-12 border border-outline-variant/10 text-center">
            <h3 className="font-headline text-3xl md:text-4xl font-black text-on-surface mb-3">
              Sẵn sàng cho buổi học tiếp theo?
            </h3>
            <p className="text-on-surface-variant font-medium mb-8">
              Khám phá thêm các khóa học vẽ vui nhộn dành cho bé.
            </p>
            <Button
              size="lg"
              className="rounded-full bg-white text-primary hover:bg-surface px-8 h-12 font-black"
              onClick={() => navigate("/courses")}
            >
              Xem khóa học
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
