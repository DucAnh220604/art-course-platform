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

import authApi from "../api/authApi";
import { useState } from "react";
import { cn } from "@/lib/utils";

const registerSchema = z
  .object({
    fullname: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    username: z.string().optional(),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      fullname: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRegister = async (data) => {
    setIsLoading(true);
    try {
      await authApi.register({
        fullname: data.fullname,
        username: data.username,
        email: data.email,
        password: data.password,
      });

      toast.success("🎉 Chào mừng bé đến với ArtKids!", {
        description: `${data.fullname || data.username} đã sẵn sàng tham gia lớp học vẽ!`,
        duration: 2000,
      });

      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const serverMessage = error.response?.data?.message;
      let friendlyMessage = "Có lỗi xảy ra, bé thử lại nhé!";

      if (
        serverMessage?.includes("Email này đã được sử dụng") ||
        serverMessage?.includes("duplicate")
      ) {
        friendlyMessage =
          "Email này đã có bạn khác dùng rồi. Bé thử email khác nhé!";
      } else if (serverMessage?.includes("validation")) {
        friendlyMessage = "Thông tin chưa đúng rồi. Bé kiểm tra lại nhé!";
      }

      toast.error("😢 Chưa đăng ký được rồi!", {
        description: friendlyMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-surface scrapbook-bg p-6 relative overflow-hidden font-body">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
      
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
        <Card className="overflow-hidden border-none shadow-premium bg-white rounded-[3rem] grid grid-cols-1 lg:grid-cols-2 min-h-[750px]">
          {/* Left Side: Form */}
          <div className="p-8 sm:p-12 flex flex-col justify-center bg-white relative">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8">
              <div 
                className="w-16 h-16 rounded-2xl bg-secondary-container flex items-center justify-center shadow-lg group cursor-pointer mb-6 hover:-rotate-12 transition-transform"
                onClick={() => navigate("/")}
              >
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white">
                   <span className="material-symbols-outlined text-2xl">draw</span>
                </div>
              </div>
              
              <h1 className="text-4xl font-headline font-black text-on-surface mb-2 tracking-tighter">
                Gia đình <span className="text-secondary">ArtKids!</span>
              </h1>
              <p className="text-on-surface-variant font-medium">
                Cùng bé bắt đầu hành trình sáng tạo tuyệt vời ngay nào!
              </p>
            </div>

            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-5">
                <FormField
                  control={registerForm.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-on-surface font-black text-[10px] uppercase tracking-widest pl-1">Họ và tên của bé</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Họa sĩ tí hon tên là..."
                          className="h-14 rounded-xl bg-surface-container-low border-2 border-outline-variant/10 focus:border-secondary/40 font-bold px-6 outline-none transition-all shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-on-surface font-black text-[10px] uppercase tracking-widest pl-1">Email của Ba mẹ</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-secondary transition-colors">mail</span>
                          <Input
                            placeholder="phuhuynh@artkids.vn"
                            className="pl-14 h-14 rounded-xl bg-surface-container-low border-2 border-outline-variant/10 focus:border-secondary/40 font-bold pr-6 outline-none transition-all shadow-sm"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-on-surface font-black text-[10px] uppercase tracking-widest pl-1">Tên đăng nhập</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="nghesi_nho"
                            className="h-14 rounded-xl bg-surface-container-low border-2 border-outline-variant/10 focus:border-secondary/40 font-bold px-6 outline-none transition-all shadow-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-on-surface font-black text-[10px] uppercase tracking-widest pl-1">Mật khẩu</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            className="h-14 rounded-xl bg-surface-container-low border-2 border-outline-variant/10 focus:border-secondary/40 font-bold px-6 outline-none transition-all shadow-sm"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-on-surface font-black text-[10px] uppercase tracking-widest pl-1">Nhập lại mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          className="h-14 rounded-xl bg-surface-container-low border-2 border-outline-variant/10 focus:border-secondary/40 font-bold px-6 outline-none transition-all shadow-sm"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px]" />
                    </FormItem>
                  )}
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-16 rounded-2xl gummy-button bg-secondary text-on-secondary font-headline font-black text-lg shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50 mt-4"
                >
                  {isLoading ? "ĐANG TẠO..." : "ĐĂNG KÝ NGAY"}
                  {!isLoading && <span className="material-symbols-outlined">auto_awesome</span>}
                </button>
              </form>
            </Form>

            <div className="mt-8 text-center">
              <p className="text-on-surface-variant font-bold text-sm">
                Bé đã có tài khoản rồi?{" "}
                <button
                  onClick={() => navigate("/login")}
                  className="text-secondary hover:underline underline-offset-8 transition-all px-2 font-black"
                >
                  Đăng nhập tại đây nè!
                </button>
              </p>
            </div>
          </div>

          {/* Right Side: Illustration */}
          <div className="hidden lg:flex flex-col bg-surface-container p-12 items-center justify-center text-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-5 select-none pointer-events-none p-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative z-10 w-full max-w-sm aspect-[3/4] bg-white rounded-[3rem] shadow-2xl overflow-hidden p-6 border-4 border-dashed border-secondary/20 -rotate-3 hover:rotate-0 transition-transform duration-500"
            >
              <img 
                src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop" 
                alt="Kid painting" 
                className="w-full h-full object-cover rounded-2xl"
              />
              <div className="absolute -bottom-4 -right-4 bg-secondary text-on-secondary p-4 rounded-full shadow-2xl rotate-12">
                <span className="material-symbols-outlined text-4xl">edit_note</span>
              </div>
            </motion.div>

            <div className="mt-16 relative z-10 max-w-xs">
              <h2 className="text-3xl font-headline font-black text-on-surface leading-tight mb-4 tracking-tight">
                Mỗi đứa trẻ đều là <span className="text-primary underline decoration-wavy decoration-2 underline-offset-4">Họa sĩ</span>
              </h2>
              <p className="text-on-surface-variant font-bold text-sm leading-relaxed italic">
                - Pablo Picasso -
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
