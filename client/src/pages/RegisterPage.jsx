import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Paintbrush, Mail, Star, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { ChildrenArtIllustration } from "@/components/icons/ChildrenArtIllustration";
import { ArtKidsLogo } from "@/components/icons/ArtKidsLogo";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const registerSchema = z
  .object({
    fullname: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    username: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const [, navigate] = useLocation();

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullname: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onRegister = (data) => {
    console.log("Register data:", data);

    toast.success("Đăng ký thành công!", {
      description: "Chào mừng bạn mới gia nhập lớp học vẽ!",
      duration: 3000,
    });

    setTimeout(() => navigate("/login"), 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8 overflow-x-hidden relative">
      {/* Back Home Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all text-slate-600 hover:text-slate-800 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Trang chủ</span>
      </button>

      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-20 sm:w-32 h-20 sm:h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-24 sm:w-40 h-24 sm:h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/4 w-16 sm:w-24 h-16 sm:h-24 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />

      <Card className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto overflow-hidden shadow-2xl border-none rounded-3xl bg-white/80 backdrop-blur-sm relative z-10 grid grid-cols-1 md:grid-cols-2">
        {/* Left Side - Form */}
        <div className="p-5 md:p-8 lg:p-10 flex flex-col justify-center relative">
          <div
            className="flex items-center gap-2 lg:gap-3 cursor-pointer mb-4 lg:mb-6"
            onClick={() => navigate("/")}
          >
            <ArtKidsLogo className="w-8 h-8 lg:w-10 lg:h-10" />
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              ArtKids
            </span>
          </div>

          <div className="mb-3 lg:mb-5">
            <h1
              className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800 mb-1 lg:mb-2"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Tạo tài khoản mới
            </h1>
            <p className="text-slate-500 text-xs lg:text-sm">
              Tham gia cùng chúng tớ để học vẽ thật vui!
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(onRegister)}
                className="space-y-2 lg:space-y-4"
              >
                <FormField
                  control={registerForm.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-foreground/80 text-xs lg:text-sm">
                        Họ và tên bé
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nguyễn Văn A"
                          className="h-9 lg:h-11 rounded-lg bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans text-sm lg:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-foreground/80 text-xs lg:text-sm">
                        Email phụ huynh
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 lg:left-4 top-2.5 lg:top-3 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                          <Input
                            placeholder="phuhuynh@email.com"
                            className="pl-9 lg:pl-11 h-9 lg:h-11 rounded-lg bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans text-sm lg:text-base"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3 lg:gap-4">
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-foreground/80 text-xs lg:text-sm">
                          Tên đăng nhập
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="nghesi_nho"
                            className="h-9 lg:h-11 rounded-lg bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans text-sm lg:text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold text-foreground/80 text-xs lg:text-sm">
                          Mật khẩu
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••"
                            className="h-9 lg:h-11 rounded-lg bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans text-sm lg:text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-foreground/80 text-xs lg:text-sm lg:text-sm">
                        Nhập lại mật khẩu
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••"
                          className="h-9 lg:h-11 rounded-lg bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans text-sm lg:text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-10 lg:h-12 rounded-full text-base lg:text-lg font-bold bg-orange-400 hover:bg-orange-500 text-white shadow-lg shadow-orange-400/25 hover:shadow-orange-400/40 transition-all active:scale-95 cursor-pointer mt-2 lg:mt-4"
                >
                  Đăng ký ngay
                  <Star className="ml-2 w-4 h-4 lg:w-5 lg:h-5 fill-current" />
                </Button>
              </form>
            </Form>
          </motion.div>

          <div className="mt-3 lg:mt-5 text-center">
            <div className="relative mb-3 lg:mb-4">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs lg:text-sm text-muted-foreground font-bold uppercase tracking-wider">
                Hoặc
              </span>
            </div>

            <p className="text-slate-500 text-sm lg:text-base">
              Đã có tài khoản?{" "}
              <button
                onClick={() => navigate("/login")}
                className="font-bold hover:underline underline-offset-4 transition-colors text-slate-800"
              >
                Đăng nhập ngay
              </button>
            </p>
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden md:flex flex-col relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
          {/* Dotted pattern background */}
          <div
            className="absolute inset-0 z-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 lg:p-10 text-center">
            <div className="relative w-full max-w-md lg:max-w-lg aspect-[4/3] mb-4 lg:mb-6 group">
              {/* Background layers */}
              <div className="absolute inset-0 bg-orange-200/50 rounded-3xl transform rotate-3 scale-95 transition-transform group-hover:rotate-6 duration-500" />
              <div className="absolute inset-0 bg-pink-200/50 rounded-3xl transform -rotate-2 scale-95 transition-transform group-hover:-rotate-4 duration-500" />

              {/* Main illustration container */}
              <div className="relative w-full h-full rounded-3xl shadow-xl overflow-hidden transform transition-transform group-hover:scale-[1.02] duration-500">
                <ChildrenArtIllustration className="w-full h-full" />
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-2 -right-2 lg:-top-3 lg:-right-3 bg-white p-2 lg:p-3 rounded-xl shadow-lg flex items-center gap-2"
              >
                <div className="bg-green-100 p-1.5 lg:p-2 rounded-full">
                  <Paintbrush className="w-4 h-4 lg:w-5 lg:h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-bold text-gray-500">
                    Bài học
                  </p>
                  <p className="text-xs lg:text-sm font-bold text-foreground">
                    Sáng tạo
                  </p>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-2 -left-2 lg:-bottom-3 lg:-left-3 bg-white p-2 lg:p-3 rounded-xl shadow-lg flex items-center gap-2"
              >
                <div className="bg-yellow-100 p-1.5 lg:p-2 rounded-full">
                  <Star className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600 fill-yellow-600" />
                </div>
                <div>
                  <p className="text-xs lg:text-sm font-bold text-gray-500">
                    Đánh giá
                  </p>
                  <p className="text-xs lg:text-sm font-bold text-foreground">
                    5.0/5.0
                  </p>
                </div>
              </motion.div>
            </div>

            <h2
              className="text-lg lg:text-xl font-bold text-slate-800 mb-1 lg:mb-2"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Bắt đầu hành trình sáng tạo
            </h2>
            <p className="text-slate-500 text-xs lg:text-sm max-w-xs lg:max-w-sm mx-auto">
              Tham gia cộng đồng hàng ngàn bé yêu nghệ thuật!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
