import { useNavigate } from "react-router-dom";
import {
  Header,
  HeroSection,
  FeaturedCourses,
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

  const handleBundleClick = (bundleId) => {
    navigate(`/bundle/${bundleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-white">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <Header onNavigate={navigate} />

        <HeroSection />

        <FeaturedCourses onCourseClick={handleCourseClick} />

        <CourseBundles onBundleClick={handleBundleClick} />

        <WhyChooseUs />

        <Testimonials />

        <Footer />
      </div>
    </div>
  );
}
