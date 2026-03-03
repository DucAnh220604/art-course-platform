import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { Header, Footer } from "@/components/landing";
import { ComboCard } from "@/components/combos/ComboCard";
import comboApi from "@/api/comboApi";
import { toast } from "sonner";

export function CombosPage() {
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);
        const response = await comboApi.getAllCombos({ status: "published" });
        // Chỉ hiển thị combo đã published
        const publishedCombos = (response.data.combos || []).filter(
          (c) => c.status === "published",
        );
        setCombos(publishedCombos);
      } catch (error) {
        toast.error("Không thể tải danh sách combo!", {
          description: "Vui lòng thử lại sau! 🎨",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, []);

  const handleComboClick = (slug) => {
    navigate(`/combos/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-sky-50">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 bg-white">
        <Header onNavigate={navigate} />
      </div>

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="w-12 h-12 text-amber-500" />
            <h1 className="text-5xl font-black text-slate-800">
              Combo Khóa Học
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Tiết kiệm nhiều hơn khi đăng ký combo! Học nhiều kỹ năng với giá ưu
            đãi đặc biệt 🎨
          </p>
        </div>

        {/* Combos Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 bg-slate-200 rounded-3xl animate-pulse"
              />
            ))}
          </div>
        ) : combos.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-24 h-24 mx-auto text-slate-300 mb-6" />
            <h2 className="text-2xl font-bold text-slate-600 mb-2">
              Chưa có combo nào
            </h2>
            <p className="text-slate-500">
              Hãy quay lại sau để khám phá các combo học hấp dẫn nhé! 🎨
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {combos.map((combo) => (
              <ComboCard
                key={combo._id}
                combo={combo}
                onComboClick={handleComboClick}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
