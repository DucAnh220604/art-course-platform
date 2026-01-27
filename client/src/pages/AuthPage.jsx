import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Paintbrush,
  User,
  Lock,
  Mail,
  ArrowRight,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { ArtKidsLogo } from "@/components/icons/ArtKidsLogo";
import { ChildrenArtIllustration } from "@/components/icons/ChildrenArtIllustration";

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

const loginSchema = z.object({
  username: z.string().min(1, "Vui lòng nhập tên đăng nhập"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, setLocation] = useLocation();

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

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

  const onLogin = (data) => {
    console.log("Login data:", data);

    toast.success("Chào mừng bé quay lại!", {
      description: "Đăng nhập thành công. Cùng vẽ tranh nào!",
      duration: 3000,
    });

    setTimeout(() => setLocation("/dashboard"), 1000);
  };

  const onRegister = (data) => {
    console.log("Register data:", data);

    toast.success("Đăng ký thành công!", {
      description: "Chào mừng bạn mới gia nhập lớp học vẽ!",
      duration: 3000,
    });

    setTimeout(() => setIsLogin(true), 1000);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 md:p-8 overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />

      <Card className="w-full max-w-5xl overflow-hidden shadow-2xl border-none rounded-[2rem] bg-white/80 backdrop-blur-sm relative z-10 grid md:grid-cols-2 min-h-[600px]">
        {/* Left Side - Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center relative">
          <div className="absolute top-6 left-8 flex items-center gap-2">
            <ArtKidsLogo className="w-10 h-10" />
            <span className="font-bold text-2xl text-sky-500 tracking-tight">
              ArtKids
            </span>
          </div>

          <div className="mt-16 mb-8">
            <h1
              className="text-3xl md:text-4xl font-bold text-slate-800 mb-2"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              {isLogin ? "Chào mừng bé!" : "Tạo tài khoản mới"}
            </h1>
            <p className="text-slate-500 text-lg">
              {isLogin
                ? "Sẵn sàng sáng tạo những bức tranh đẹp chưa?"
                : "Tham gia cùng chúng tớ để học vẽ thật vui!"}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLogin)}
                    className="space-y-6"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-foreground/80">
                            Tên đăng nhập
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                placeholder="nghesi_nho"
                                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all font-sans"
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
                          <FormLabel className="font-bold text-foreground/80">
                            Mật khẩu
                          </FormLabel>
                          <FormControl>
                            <div className="relative group">
                              <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                              <Input
                                type="password"
                                placeholder="••••••••"
                                className="pl-10 h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all font-sans"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-full text-lg font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all active:scale-95 cursor-pointer"
                    >
                      Đăng nhập ngay
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegister)}
                    className="space-y-4"
                  >
                    <FormField
                      control={registerForm.control}
                      name="fullname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-foreground/80">
                            Họ và tên bé
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nguyễn Văn A"
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-foreground/80">
                            Email phụ huynh
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="phuhuynh@email.com"
                                className="pl-9 h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-foreground/80">
                              Tên đăng nhập
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="nghesi_nho"
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-foreground/80">
                              Mật khẩu
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="••••••"
                                className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-foreground/80">
                            Nhập lại mật khẩu
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••"
                              className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-secondary focus:ring-secondary/20 transition-all font-sans"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full h-12 rounded-full text-lg font-bold bg-orange-400 hover:bg-orange-500 text-white shadow-lg shadow-orange-400/25 hover:shadow-orange-400/40 transition-all active:scale-95  cursor-pointer"
                    >
                      Đăng ký ngay
                      <Star className="ml-2 w-5 h-5 fill-current" />
                    </Button>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 text-center">
            <div className="relative mb-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground font-bold uppercase tracking-wider">
                Hoặc
              </span>
            </div>

            <p className="text-slate-500">
              {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}{" "}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-bold hover:underline underline-offset-4 transition-colors text-slate-800"
              >
                {isLogin ? "Hãy Đăng ký" : "Đăng nhập ngay"}
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

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="relative w-full aspect-[4/3] mb-8 group perspective-1000">
              {/* Background layers */}
              <div className="absolute inset-0 bg-sky-200/50 rounded-[2rem] transform rotate-3 scale-95 transition-transform group-hover:rotate-6 duration-500" />
              <div className="absolute inset-0 bg-green-200/50 rounded-[2rem] transform -rotate-2 scale-95 transition-transform group-hover:-rotate-4 duration-500" />

              {/* Main illustration container */}
              <div className="relative w-full h-full rounded-[2rem] shadow-xl overflow-hidden transform transition-transform group-hover:scale-[1.02] duration-500">
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
                className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-lg flex items-center gap-2"
              >
                <div className="bg-green-100 p-2 rounded-full">
                  <Paintbrush className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">Bài học</p>
                  <p className="text-sm font-bold text-foreground">Sáng tạo</p>
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
                className="absolute -bottom-6 -left-4 bg-white p-3 rounded-2xl shadow-lg flex items-center gap-2"
              >
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500">Đánh giá</p>
                  <p className="text-sm font-bold text-foreground">5.0/5.0</p>
                </div>
              </motion.div>
            </div>

            <h2
              className="text-2xl font-bold text-slate-800 mb-4"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Khơi dậy niềm đam mê nghệ thuật
            </h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Hàng ngàn bài học vẽ thú vị giúp bé phát triển tư duy sáng tạo mỗi
              ngày.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
