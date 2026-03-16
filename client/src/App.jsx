import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProfilePage from "./pages/ProfilePage";
import { LandingPage } from "./pages/LandingPage";
import { Dashboard } from "./pages/Dashboard";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import { CoursesPage } from "./pages/CoursesPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { ComboDetailPage } from "./pages/ComboDetailPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import PaymentResultPage from "./pages/PaymentResultPage";
import { CartPage } from "./pages/CartPage";
import { WishlistPage } from "./pages/WishlistPage";
import { MyCoursesPage } from "./pages/MyCoursesPage";
import { LessonPage } from "./pages/LessonPage";
import { ReviewsPage } from "./pages/ReviewsPage";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<LandingPage />} />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            ></Route>

            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:slug" element={<CourseDetailPage />} />

            <Route path="/combos/:slug" element={<ComboDetailPage />} />

            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />

            <Route path="/payment-result" element={<PaymentResultPage />} />

            <Route
              path="/cart"
              element={
                <ProtectedRoute>
                  <CartPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-courses"
              element={
                <ProtectedRoute>
                  <MyCoursesPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/learning/:slug"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/learning/:slug/:lessonId"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RoleRoute allowedRoles={["admin", "staff", "instructor"]}>
                  <Dashboard />
                </RoleRoute>
              }
            />
            {/* Wildcard route MUST be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>

        <Toaster position="top-right" richColors />
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
