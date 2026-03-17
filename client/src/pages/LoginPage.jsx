import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArtKidsLogo } from "@/components/icons/ArtKidsLogo";

import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onLogin = async (data) => {
    setIsLoading(true);

    try {
      const result = await login(data.email, data.password);
      toast.success("🎨 Chào mừng bé quay lại!", {
        description: "Đăng nhập thành công. Cùng vẽ tranh nào!",
        duration: 2000,
      });

      const r = String(result.user?.role || "").toLowerCase().trim();
      if (
        r === "admin" ||
        r === "staff" ||
        r === "instructor"
      ) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      let friendlyMessage = "Có lỗi xảy ra, bé thử lại nhé!";

      if (serverMessage?.includes("Email không tồn tại")) {
        friendlyMessage =
          "Email này chưa được đăng ký. Bé hãy tạo tài khoản mới nhé!";
      } else if (serverMessage?.includes("Mật khẩu không chính xác")) {
        friendlyMessage = "Mật khẩu không đúng rồi. Bé thử nhập lại nhé!";
      } else if (serverMessage?.includes("Vui lòng nhập đủ")) {
        friendlyMessage = "Bé cần điền đầy đủ email và mật khẩu nhé!";
      }

      toast.error("😢 Ôi, chưa vào được rồi!", {
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface scrapbook-bg p-6 relative overflow-hidden font-body">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
      
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/")}
        className="absolute top-8 left-8 z-50 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white shadow-premium hover:scale-105 active:scale-95 transition-all text-on-surface-variant font-black text-xs uppercase tracking-widest"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Trang chủ
      </motion.button>

      <div className="w-full max-w-6xl mx-auto relative z-10">
        <Card className="overflow-hidden border-none shadow-premium bg-white rounded-[3rem] grid grid-cols-1 lg:grid-cols-2 min-h-[700px]">
          {/* Left Side: Illustration */}
          <div className="hidden lg:flex flex-col bg-surface-container-low relative p-12 items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 opacity-10 select-none pointer-events-none p-10">
              <div className="grid grid-cols-4 gap-12 text-on-surface">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-6xl">
                    {["palette", "brush", "draw", "edit"][i % 4]}
                  </span>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              className="relative z-10 w-full max-w-md aspect-square bg-white rounded-[4rem] shadow-2xl overflow-hidden p-8 border-8 border-primary/10 rotate-2"
            >
              <img 
                src="https://images.unsplash.com/photo-1456086272160-b28b0645b729?q=80&w=800&auto=format&fit=crop" 
                alt="Kids painting" 
                className="w-full h-full object-cover rounded-[2.5rem]"
              />
              <div className="absolute top-4 right-4 bg-primary text-on-primary p-3 rounded-2xl shadow-xl -rotate-12 animate-pulse">
                <span className="material-symbols-outlined text-3xl">star</span>
              </div>
            </motion.div>

            <div className="mt-12 relative z-10 max-w-sm">
              <h2 className="text-4xl font-headline font-black text-on-surface leading-tight mb-4 tracking-tight">
                Khơi nguồn <span className="text-secondary italic">Sáng tạo</span> cho bé!
              </h2>
              <p className="text-on-surface-variant font-bold text-lg leading-relaxed">
                Tham gia cùng hơn 10.000 họa sĩ nhí tài năng khám phá thế giới muôn màu.
              </p>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-8 sm:p-12 lg:p-20 flex flex-col justify-center bg-white relative">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-12">
              <div 
                className="w-20 h-20 rounded-3xl bg-primary-container flex items-center justify-center shadow-lg group cursor-pointer mb-8 hover:rotate-12 transition-transform"
                onClick={() => navigate("/")}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white">
                   <span className="material-symbols-outlined text-4xl">palette</span>
                </div>
              </div>
              
              <h1 className="text-5xl font-headline font-black text-on-surface mb-3 tracking-tighter">
                Chào mừng <span className="text-primary">Bé!</span>
              </h1>
              <p className="text-on-surface-variant font-medium text-lg">
                Đã đến lúc tô vẽ những ước mơ xanh rồi nè!
              </p>
            </div>

            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-8">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-on-surface font-black text-xs uppercase tracking-widest pl-1">Email của bé hoặc Ba mẹ</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">alternate_email</span>
                          <Input
                            placeholder="hoasinho@artkids.vn"
                            className="pl-14 h-16 rounded-2xl bg-surface-container-low border-2 border-outline-variant/10 focus:border-primary/40 font-bold pr-6 outline-none transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-on-surface font-black text-xs uppercase tracking-widest pl-1">Mật khẩu bí mật</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors">lock</span>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-14 h-16 rounded-2xl bg-surface-container-low border-2 border-outline-variant/10 focus:border-primary/40 font-bold pr-6 outline-none transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 rounded-2xl gummy-button bg-primary text-on-primary font-headline font-black text-lg shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                >
                  {isLoading ? "BÉ CHỜ CHÚT NHA..." : "ĐĂNG NHẬP NGAY"}
                  {!isLoading && <span className="material-symbols-outlined">rocket_launch</span>}
                </button>
              </form>
            </Form>

            <div className="mt-12 text-center">
              <div className="relative mb-8">
                <Separator className="bg-outline-variant/10" />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-xs font-black text-on-surface-variant/40 uppercase tracking-widest">
                  Hoặc
                </span>
              </div>

              <p className="text-on-surface-variant font-bold">
                Bé chưa có tài khoản?{" "}
                <button
                  onClick={() => navigate("/register")}
                  className="text-primary hover:underline underline-offset-8 transition-all px-2"
                >
                  Hãy Đăng ký cùng Artie!
                </button>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
