import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
  Mail,
  Paintbrush,
  User,
  Lock,
  ArrowRight,
  Star,
  ArrowLeft,
} from "lucide-react";
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

import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

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
      await login(data.email, data.password);
      toast.success("🎨 Chào mừng bé quay lại!", {
        description: "Đăng nhập thành công. Cùng vẽ tranh nào!",
        duration: 2000,
      });

      navigate("/");
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 lg:p-8 overflow-x-hidden relative">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:bg-white hover:shadow-lg transition-all text-slate-600 hover:text-slate-800 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Trang chủ</span>
      </button>

      <div className="absolute top-10 left-10 w-20 sm:w-32 h-20 sm:h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-10 right-10 w-24 sm:w-40 h-24 sm:h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute top-1/2 left-1/4 w-16 sm:w-24 h-16 sm:h-24 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500" />

      <Card className="w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto overflow-hidden shadow-2xl border-none rounded-3xl bg-white/80 backdrop-blur-sm relative z-10 grid grid-cols-1 md:grid-cols-2">
        <div className="p-6 md:p-10 lg:p-12 flex flex-col justify-center relative">
          <div
            className="flex items-center gap-2 lg:gap-3 cursor-pointer mb-6 lg:mb-8"
            onClick={() => navigate("/")}
          >
            <ArtKidsLogo className="w-8 h-8 lg:w-10 lg:h-10" />
            <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              ArtKids
            </span>
          </div>

          <div className="mb-4 lg:mb-6">
            <h1
              className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-1 lg:mb-2"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Chào mừng bé!
            </h1>
            <p className="text-slate-500 text-sm lg:text-base">
              Sẵn sàng sáng tạo những bức tranh đẹp chưa?
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-4 lg:space-y-6"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-foreground/80 text-sm lg:text-base">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className="absolute left-3 lg:left-4 top-2.5 lg:top-3.5 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            placeholder="nghesi_nho@example.com"
                            className="pl-9 lg:pl-11 h-10 lg:h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all font-sans text-sm lg:text-base"
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
                      <FormLabel className="font-bold text-foreground/80 text-sm lg:text-base">
                        Mật khẩu
                      </FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-3 lg:left-4 top-2.5 lg:top-3.5 h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-9 lg:pl-11 h-10 lg:h-12 rounded-xl bg-slate-50 border-slate-200 focus:border-primary focus:ring-primary/20 transition-all font-sans text-sm lg:text-base"
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
                  className="w-full h-10 lg:h-12 rounded-full text-base lg:text-lg font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all active:scale-95 cursor-pointer"
                >
                  {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                  {!isLoading && (
                    <ArrowRight className="ml-2 w-4 h-4 lg:w-5 lg:h-5" />
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>

          <div className="mt-4 lg:mt-6 text-center">
            <div className="relative mb-4 lg:mb-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs lg:text-sm text-muted-foreground font-bold uppercase tracking-wider">
                Hoặc
              </span>
            </div>

            <p className="text-slate-500 text-sm lg:text-base">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => navigate("/register")}
                className="font-bold hover:underline underline-offset-4 transition-colors text-slate-800"
              >
                Hãy Đăng ký
              </button>
            </p>
          </div>
        </div>

        <div className="hidden md:flex flex-col relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
          <div
            className="absolute inset-0 z-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, #94a3b8 1px, transparent 0)",
              backgroundSize: "20px 20px",
            }}
          />

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 lg:p-10 text-center">
            <div className="relative w-full max-w-md lg:max-w-lg aspect-[4/3] mb-6 lg:mb-8 group">
              <div className="absolute inset-0 bg-sky-200/50 rounded-3xl transform rotate-3 scale-95 transition-transform group-hover:rotate-6 duration-500" />
              <div className="absolute inset-0 bg-green-200/50 rounded-3xl transform -rotate-2 scale-95 transition-transform group-hover:-rotate-4 duration-500" />

              <div className="relative w-full h-full rounded-3xl shadow-xl overflow-hidden transform transition-transform group-hover:scale-[1.02] duration-500">
                <ChildrenArtIllustration className="w-full h-full" />
              </div>

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
              className="text-xl lg:text-2xl font-bold text-slate-800 mb-2 lg:mb-3"
              style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
              Khơi dậy niềm đam mê nghệ thuật
            </h2>
            <p className="text-slate-500 text-sm lg:text-base max-w-xs lg:max-w-sm mx-auto">
              Hàng ngàn bài học vẽ thú vị giúp bé phát triển tư duy sáng tạo.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
