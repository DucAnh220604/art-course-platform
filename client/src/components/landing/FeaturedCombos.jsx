import React, { useEffect, useState } from "react";
import { Package, ArrowRight } from "lucide-react";
import { ComboCard } from "@/components/combos/ComboCard";
import { Button } from "@/components/ui/button";
import comboApi from "@/api/comboApi";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function FeaturedCombos({ onComboClick }) {
  const navigate = useNavigate();
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        setLoading(true);
        const response = await comboApi.getAllCombos({ status: "published" });
        // Lấy top 3 combo mới nhất đã published
        const publishedCombos = (response.data.combos || [])
          .filter((c) => c.status === "published")
          .slice(0, 3);
        setCombos(publishedCombos);
      } catch (error) {
        console.error("Không thể tải combo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombos();
  }, []);

  // Không hiển thị section nếu không có combo nào
  if (!loading && combos.length === 0) {
    return null;
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800 flex items-center justify-center gap-3">
          <Package className="w-10 h-10 text-amber-500" />
          Combo Khóa học <span className="text-amber-500">Tiết kiệm</span> 🎁
        </h2>
        <p className="text-lg text-slate-500 mb-6">
          Học nhiều hơn, tiết kiệm nhiều hơn với các combo khóa học ưu đãi
        </p>
        <Button
          variant="outline"
          className="rounded-full border-amber-300 text-amber-600 hover:bg-amber-50"
          onClick={() => navigate("/courses?type=combos")}
        >
          Xem tất cả Combo
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[450px] bg-slate-100 rounded-[40px] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {combos.map((combo) => (
            <ComboCard
              key={combo._id}
              combo={combo}
              onComboClick={onComboClick}
            />
          ))}
        </div>
      )}
    </section>
  );
}
