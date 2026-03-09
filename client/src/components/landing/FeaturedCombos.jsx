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
        // Lấy top 4 combo phổ biến nhất (theo số học viên)
        const response = await comboApi.getAllCombos({
          status: "published",
          sort: "totalStudents",
          order: "desc",
          limit: 4,
        });
        setCombos(response.data.combos || []);
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
    <section className="py-16 lg:py-20 bg-amber-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-slate-800">
            Combo <span className="text-amber-500">Tiết kiệm</span>
          </h2>
          <p className="text-lg text-slate-500 mb-6">
            Những combo được nhiều bé yêu thích nhất
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-72 bg-slate-100 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {combos.map((combo) => (
              <ComboCard
                key={combo._id}
                combo={combo}
                onComboClick={onComboClick}
                compact
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
