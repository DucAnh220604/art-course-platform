import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  Header,
  HeroSection,
  FeaturedCourses,
  FeaturedCombos,
  CourseBundles,
  Testimonials,
  Footer,
} from "../components/landing";
import { AboutPage } from "./AboutPage";

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading, user } = useAuth();

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleComboClick = (comboSlug) => {
    navigate(`/combos/${comboSlug}`);
  };

  const handleBundleClick = (bundleId) => {
    navigate(`/bundle/${bundleId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Chưa đăng nhập: hiển thị trang giới thiệu
  if (!isAuthenticated) {
    return <AboutPage />;
  }

  // Admin, Staff hoặc Instructor: redirect đến Dashboard
  if (
    user?.role === "admin" ||
    user?.role === "staff" ||
    user?.role === "instructor"
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // User thường: hiển thị trang chủ
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-white overflow-x-hidden"
    >
      <Header onNavigate={navigate} />

      <main className="overflow-x-hidden">
        <HeroSection />

        <FeaturedCourses onCourseClick={handleCourseClick} />

        <FeaturedCombos onComboClick={handleComboClick} />

        <Testimonials />
      </main>

      <Footer />
    </motion.div>
  );
}
