import { Star, Users } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function BundleCard({ bundle, onBundleClick }) {
  return (
    <Card className="bg-gradient-to-br from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-3xl hover:shadow-xl transition-shadow">
      <CardContent className="p-6 space-y-4">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
          <div className="text-4xl text-sky-400">{bundle.icon}</div>
        </div>
        <h3 className="text-2xl font-bold text-center">{bundle.name}</h3>
        <p className="text-gray-700 italic text-center">{bundle.description}</p>

        <div className="flex items-center justify-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${i < Math.floor(bundle.rating || 4.5) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
              />
            ))}
          </div>
          <span className="font-bold text-gray-700">
            {bundle.rating || 4.5}
          </span>
          <span className="text-gray-500 text-sm">
            ({bundle.reviews || 123} reviews)
          </span>
        </div>

        <div className="flex items-center justify-center text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{bundle.students?.toLocaleString() || "1234"} students</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-xl font-bold text-sky-600">
            <span className="line-through text-gray-500 text-base">
              {bundle.originalPrice}
            </span>
            <span className="ml-2">{bundle.bundlePrice}</span>
          </div>
          <Button
            className="rounded-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500"
            onClick={() => onBundleClick && onBundleClick(bundle.id)}
          >
            Buy Now
          </Button>
        </div>

        {bundle.discount && (
          <div className="text-center">
            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">
              {bundle.discount}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
