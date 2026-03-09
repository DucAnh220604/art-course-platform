import { useNavigate } from "react-router-dom";
import {
  Header,
  HeroSection,
  FeaturedCourses,
  FeaturedCombos,
  CourseBundles,
  WhyChooseUs,
  Testimonials,
  Footer,
} from "../components/landing";

export function LandingPage() {
  const navigate = useNavigate();

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  const handleComboClick = (comboSlug) => {
    navigate(`/combos/${comboSlug}`);
  };

  const handleBundleClick = (bundleId) => {
    navigate(`/bundle/${bundleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-white overflow-x-hidden">
      <Header onNavigate={navigate} />

      <main className="overflow-x-hidden">
        <HeroSection />

        <FeaturedCourses onCourseClick={handleCourseClick} />

        <FeaturedCombos onComboClick={handleComboClick} />

        <WhyChooseUs />

        <Testimonials />
      </main>

      <Footer />
    </div>
  );
}
