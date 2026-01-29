import { useLocation } from "wouter";
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
  const [, navigate] = useLocation();

  // Handle course click - navigate to course detail page
  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // Handle bundle click - navigate to bundle detail page
  const handleBundleClick = (bundleId) => {
    navigate(`/bundle/${bundleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-white">
      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        {/* Header */}
        <Header onNavigate={navigate} />

        {/* Hero Section */}
        <HeroSection />

        {/* Featured Courses - Will load from API */}
        <FeaturedCourses onCourseClick={handleCourseClick} />

        {/* Course Bundles - Will load from API */}
        <CourseBundles onBundleClick={handleBundleClick} />

        {/* Why Choose Us */}
        <WhyChooseUs />

        {/* Testimonials */}
        <Testimonials />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
