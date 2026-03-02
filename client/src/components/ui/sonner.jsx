"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      // Cấu hình các icon riêng biệt cho phong cách ArtKids
      icons={{
        success: <CheckCircle2 className="size-5 text-green-500" />,
        error: <AlertCircle className="size-5 text-pink-500" />,
        info: <Info className="size-5 text-sky-500" />,
        loading: <Loader2 className="size-5 text-purple-500 animate-spin" />,
      }}
      toastOptions={{
        unstyled: true, // Bật tính năng này để tự định nghĩa style bằng Tailwind hoàn toàn
        classNames: {
          toast:
            "group w-full flex items-center gap-3 p-4 rounded-[24px] border-2 bg-white shadow-xl pointer-events-auto select-none font-medium",
          // Định nghĩa màu sắc cho từng loại thông báo
          success: "border-green-100 bg-green-50/50 text-green-800",
          error: "border-pink-100 bg-pink-50/50 text-pink-800",
          info: "border-sky-100 bg-sky-50/50 text-sky-800",
          warning: "border-orange-100 bg-orange-50/50 text-orange-800",
          description: "text-slate-500 font-normal text-xs",
          actionButton:
            "group-data-[type=success]:bg-green-500 group-data-[type=error]:bg-pink-500 rounded-full text-white px-3 py-1 text-xs",
          cancelButton: "bg-slate-100 rounded-full px-3 py-1 text-xs",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
