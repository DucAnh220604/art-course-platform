import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import paymentApi from "@/api/paymentApi";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Home,
  BookOpen,
  Sparkles,
  Loader2,
  CircleCheckBig,
  CircleX,
  Clock3,
  RefreshCcw,
} from "lucide-react";
import { ArtKidsLogo } from "@/components/icons/ArtKidsLogo";

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState("");
  const [itemType, setItemType] = useState(null);
  const [itemSlug, setItemSlug] = useState(null);

  const txnRef = searchParams.get("txnRef");

  useEffect(() => {
    const run = async () => {
      if (!txnRef) {
        setStatus("failed");
        setMessage("Thiếu mã giao dịch.");
        setLoading(false);
        return;
      }

      try {
        let finalStatus = "pending";
        let lastData = null;

        for (let i = 0; i < 6; i += 1) {
          const res = await paymentApi.getPaymentStatus(txnRef);
          lastData = res.data?.data;
          const s = lastData?.status || "pending";
          finalStatus = s;
          if (s !== "pending") break;
          await new Promise((r) => setTimeout(r, 1500));
        }

        setStatus(finalStatus);
        if (lastData?.itemType) setItemType(lastData.itemType);
        if (lastData?.itemSlug) setItemSlug(lastData.itemSlug);

        if (finalStatus === "paid") {
          await refreshUser();
          setMessage(
            "Thanh toán thành công! Bé đã được cấp quyền học ngay bây giờ.",
          );
        } else if (finalStatus === "pending") {
          setMessage(
            "Hệ thống đang xác nhận giao dịch, vui lòng chờ thêm một chút.",
          );
        } else {
          setMessage(
            "Thanh toán chưa thành công. Bé có thể thử lại để tiếp tục học nhé.",
          );
        }
      } catch (error) {
        setStatus("failed");
        setMessage("Không kiểm tra được trạng thái giao dịch.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [txnRef, refreshUser]);

  const ui = useMemo(() => {
    if (loading) {
      return {
        title: "Đang kiểm tra thanh toán...",
        color: "text-sky-600",
        icon: <Loader2 className="w-16 h-16 animate-spin text-sky-500" />,
      };
    }

    if (status === "paid") {
      return {
        title: "Thanh toán thành công!",
        color: "text-emerald-600",
        icon: <CircleCheckBig className="w-16 h-16 text-emerald-500" />,
      };
    }

    if (status === "pending") {
      return {
        title: "Đang chờ xác nhận",
        color: "text-amber-600",
        icon: <Clock3 className="w-16 h-16 text-amber-500" />,
      };
    }

    return {
      title: "Thanh toán chưa thành công",
      color: "text-rose-600",
      icon: <CircleX className="w-16 h-16 text-rose-500" />,
    };
  }, [loading, status]);

  const getItemUrl = () => {
    if (!itemSlug) return "/courses";
    if (itemType === "combo") return `/combos/${itemSlug}`;
    return `/course/${itemSlug}`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white p-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200/50 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-200/50 rounded-full blur-2xl" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-200/50 rounded-full blur-2xl" />

      <motion.div
        animate={{ y: [0, -14, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20"
      >
        <Sparkles className="w-12 h-12 text-yellow-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-8"
      >
        <ArtKidsLogo className="w-12 h-12" />
        <span className="font-bold text-3xl text-sky-500">ArtKids</span>
      </motion.div>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="w-full max-w-2xl bg-white/90 backdrop-blur rounded-[32px] border border-sky-100 shadow-xl p-8 md:p-10"
      >
        <div className="flex flex-col items-center text-center">
          {ui.icon}

          <h1
            className={`mt-5 text-3xl md:text-4xl font-extrabold ${ui.color}`}
          >
            {ui.title}
          </h1>

          <p className="mt-3 text-slate-600 text-base md:text-lg max-w-xl">
            {message}
          </p>

          {txnRef && (
            <p className="mt-4 text-sm text-slate-400">
              Mã giao dịch:{" "}
              <span className="font-semibold text-slate-500">{txnRef}</span>
            </p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          {status === "paid" && !loading ? (
            <>
              <div className="flex mx-auto gap-8">
                <Button
                  onClick={() => navigate(getItemUrl())}
                  className="h-12 px-6 rounded-full text-base font-bold bg-sky-500 hover:bg-sky-600 text-white"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  {itemType === "combo" ? "Đi đến combo" : "Đi đến khóa học"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/")}
                  className="h-12 px-6 rounded-full text-base font-semibold border-2"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Về trang chủ
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex mx-auto gap-8">
                <Button
                  onClick={() => window.location.reload()}
                  className="h-12 px-6 rounded-full text-base font-bold bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <RefreshCcw className="w-5 h-5 mr-2" />
                  Kiểm tra lại
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/courses")}
                  className="h-12 px-6 rounded-full text-base font-semibold border-2"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Chọn khóa học khác
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 text-sm text-slate-400"
      >
        ArtKids Payment Center
      </motion.p>
    </div>
  );
}
