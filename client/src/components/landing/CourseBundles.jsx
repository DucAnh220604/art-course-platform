import { useEffect, useState } from "react";
import { BundleCard } from "./BundleCard";

// Mock data - sẽ được thay thế bằng API call
const mockBundles = [
  {
    id: "bundle-1",
    name: "Complete Drawing Bundle",
    description: "Master all drawing techniques with 4 comprehensive courses",
    courses: ["1", "2", "5", "6"],
    originalPrice: "$137.96",
    bundlePrice: "$89.99",
    discount: "35% OFF",
    icon: "✏️",
    rating: 4.8,
    reviews: 156,
    students: 1890,
  },
  {
    id: "bundle-2",
    name: "Painting Masterclass Bundle",
    description: "Explore painting with watercolor, creative and abstract art",
    courses: ["1", "3", "4"],
    originalPrice: "$82.97",
    bundlePrice: "$59.99",
    discount: "28% OFF",
    icon: "🎨",
    rating: 4.7,
    reviews: 98,
    students: 1234,
  },
  {
    id: "bundle-3",
    name: "Young Artist Complete Package",
    description: "All 6 courses to become a well-rounded young artist",
    courses: ["1", "2", "3", "4", "5", "6"],
    originalPrice: "$189.94",
    bundlePrice: "$119.99",
    discount: "37% OFF",
    icon: "🌟",
    rating: 4.9,
    reviews: 234,
    students: 2567,
  },
];

export function CourseBundles({ onBundleClick }) {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Replace with actual API call
    // Example: fetchBundles().then(data => setBundles(data))
    const fetchBundles = async () => {
      try {
        setLoading(true);
        // Simulate API call
        // const response = await fetch('/api/courses/bundles');
        // const data = await response.json();
        // setBundles(data);

        // Using mock data for now
        setTimeout(() => {
          setBundles(mockBundles);
          setLoading(false);
        }, 100);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  if (loading) {
    return (
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
              Course Bundles
            </span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 bg-gray-200 rounded-3xl animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="text-center text-red-500">
          Error loading bundles: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
          <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
            Course Bundles
          </span>
        </h2>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 px-4">
          Save big with our curated course bundles
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {bundles.map((bundle) => (
          <BundleCard
            key={bundle.id}
            bundle={bundle}
            onBundleClick={onBundleClick}
          />
        ))}
      </div>
    </section>
  );
}
