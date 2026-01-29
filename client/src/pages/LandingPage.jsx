import {
  Star,
  ShoppingCart,
  Search,
  Filter,
  PlayCircle,
  Award,
  Clock,
  Users,
  Quote,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { useLocation } from "wouter";
import { ArtKidsLogo } from "../components/icons/ArtKidsLogo";

export function LandingPage() {
  const [, navigate] = useLocation();
  const courses = [
    {
      id: "1",
      title: "Watercolor Basics for Kids",
      thumbnail:
        "https://images.unsplash.com/photo-1578961140619-896df05b1fd2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      instructor: {
        name: "Emma Wilson",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      },
      rating: 4.8,
      reviews: 234,
      price: "$29.99",
      students: 1250,
    },
    {
      id: "2",
      title: "Drawing Animals Step-by-Step",
      thumbnail:
        "https://images.unsplash.com/photo-1765547586679-b16ee179e653?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      instructor: {
        name: "John Smith",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      },
      rating: 4.9,
      reviews: 456,
      price: "$34.99",
      students: 2100,
    },
    {
      id: "3",
      title: "Creative Painting Adventures",
      thumbnail:
        "https://images.unsplash.com/photo-1696527014256-4755b3ac0b4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      instructor: {
        name: "Sarah Lee",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      },
      rating: 4.7,
      reviews: 189,
      price: "$24.99",
      students: 890,
    },
    {
      id: "4",
      title: "Abstract Art for Young Artists",
      thumbnail:
        "https://images.unsplash.com/photo-1705254613735-1abb457f8a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      instructor: {
        name: "Mike Chen",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      },
      rating: 4.6,
      reviews: 312,
      price: "$27.99",
      students: 1450,
    },
    {
      id: "5",
      title: "Portrait Drawing for Beginners",
      thumbnail:
        "https://images.unsplash.com/photo-1610274672835-65a79c852f58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      instructor: {
        name: "Lisa Brown",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      },
      rating: 4.9,
      reviews: 567,
      price: "$32.99",
      students: 1890,
    },
    {
      id: "6",
      title: "Digital Art for Kids",
      thumbnail:
        "https://images.unsplash.com/photo-1705254613735-1abb457f8a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
      instructor: {
        name: "Tom Davis",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      },
      rating: 4.8,
      reviews: 423,
      price: "$39.99",
      students: 2340,
    },
  ];

  const courseBundles = [
    {
      id: "bundle-1",
      name: "Complete Drawing Bundle",
      description: "Master all drawing techniques with 4 comprehensive courses",
      courses: ["1", "2", "5", "6"],
      originalPrice: "$137.96",
      bundlePrice: "$89.99",
      discount: "35% OFF",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      icon: "✏️",
    },
    {
      id: "bundle-2",
      name: "Painting Masterclass Bundle",
      description:
        "Explore painting with watercolor, creative and abstract art",
      courses: ["1", "3", "4"],
      originalPrice: "$82.97",
      bundlePrice: "$59.99",
      discount: "28% OFF",
      color: "from-orange-500 to-yellow-500",
      bgColor: "from-orange-50 to-yellow-50",
      icon: "🎨",
    },
    {
      id: "bundle-3",
      name: "Young Artist Complete Package",
      description: "All 6 courses to become a well-rounded young artist",
      courses: ["1", "2", "3", "4", "5", "6"],
      originalPrice: "$189.94",
      bundlePrice: "$119.99",
      discount: "37% OFF",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      icon: "🌟",
    },
  ];

  const testimonials = [
    {
      name: "Jennifer M.",
      role: "Parent",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      text: "My daughter loves these courses! Her creativity has really blossomed. The instructors are patient and engaging.",
      rating: 5,
    },
    {
      name: "David K.",
      role: "Parent",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      text: "Great value for money. My son learned so much and now he draws every day. Highly recommend!",
      rating: 5,
    },
    {
      name: "Sophie L.",
      role: "Student, Age 10",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      text: "I love learning new art techniques! The videos are fun and easy to follow. I made so many cool drawings!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-white shadow-md -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <header className="py-4">
            <div className="flex items-center justify-between gap-4">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => navigate("/")}
              >
                <ArtKidsLogo className="w-10 h-10" />
                <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  ArtKid
                </span>
              </div>

              <div className="hidden md:flex flex-1 max-w-xl">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search courses..."
                    className="pl-10 pr-12 rounded-full border-2 border-sky-200 focus:border-sky-400"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-full hidden sm:flex border-sky-300 text-sky-600 hover:bg-sky-50"
                  onClick={() => navigate("/login")}
                >
                  Login
                </Button>
                <Button
                  className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
                  onClick={() => navigate("/register")}
                >
                  Register
                </Button>
                <Button size="icon" variant="outline" className="rounded-full">
                  <ShoppingCart className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>
        </header>

        {/* Hero Section */}
        <section className="py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
                  Unleash Your Child's Creativity
                </span>
              </h1>
              <p className="text-xl text-gray-600">
                Join thousands of young artists learning to draw, paint, and
                create amazing artwork with expert instructors!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-lg px-8"
                >
                  Start Free Trial
                  <PlayCircle className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full text-lg px-8 border-sky-300 text-sky-600 hover:bg-sky-50"
                  onClick={() => onNavigate && onNavigate("courses")}
                >
                  Browse Courses
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-sky-600">10k+</div>
                  <div className="text-gray-600">Happy Students</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-orange-500">500+</div>
                  <div className="text-gray-600">Art Courses</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-500">4.9★</div>
                  <div className="text-gray-600">Average Rating</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1610274672835-65a79c852f58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
                  alt="Happy kids drawing"
                  className="w-full h-auto"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 transform rotate-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-bold">Certificate</div>
                    <div className="text-sm text-gray-600">Upon Completion</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                Featured Courses
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Discover the perfect course to inspire your child's artistic
              journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 rounded-3xl border-4 border-transparent hover:border-sky-200"
              >
                <div
                  className="relative h-48 overflow-hidden cursor-pointer"
                  onClick={() =>
                    onNavigate && onNavigate("course-detail", course.id)
                  }
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-amber-400 text-amber-900 px-3 py-1 rounded-full text-sm font-bold">
                    BESTSELLER
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="border-2 border-sky-300">
                      <AvatarImage
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                      />
                      <AvatarFallback>
                        {course.instructor.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm text-gray-600">
                      {course.instructor.name}
                    </div>
                  </div>

                  <h3
                    className="text-xl font-bold text-gray-800 hover:text-sky-600 cursor-pointer"
                    onClick={() =>
                      onNavigate && onNavigate("course-detail", course.id)
                    }
                  >
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(course.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-700">
                      {course.rating}
                    </span>
                    <span className="text-gray-500 text-sm">
                      ({course.reviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students.toLocaleString()} students</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-2xl font-bold text-sky-600">
                      {course.price}
                    </div>
                    <Button className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600">
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Course Bundles */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                Course Bundles
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Save big with our curated course bundles
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {courseBundles.map((bundle) => (
              <Card
                key={bundle.id}
                className="bg-gradient-to-br from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-3xl hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <div className="text-4xl text-sky-400">{bundle.icon}</div>
                  </div>
                  <h3 className="text-2xl font-bold">{bundle.name}</h3>
                  <p className="text-gray-700 italic">{bundle.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(4.5) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-gray-700">4.5</span>
                    <span className="text-gray-500 text-sm">(123 reviews)</span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>1234 students</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-2xl font-bold text-sky-600">
                      <span className="line-through text-gray-500">
                        {bundle.originalPrice}
                      </span>
                      <span className="ml-2">{bundle.bundlePrice}</span>
                    </div>
                    <Button className="rounded-full bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500">
                      Buy Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Learning Experience */}
        <section className="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 py-16 my-16 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Why Choose KidsArt?
              </h2>
              <p className="text-xl text-white/90">
                Everything your child needs to become a confident artist
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-3xl hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Lifetime Access</h3>
                  <p className="text-white/80">
                    Learn at your own pace with unlimited access to all course
                    materials, forever!
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-3xl hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">HD Video Lessons</h3>
                  <p className="text-white/80">
                    Crystal clear video tutorials that make learning fun and
                    easy to follow.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-3xl hover:scale-105 transition-transform">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold">Certificate</h3>
                  <p className="text-white/80">
                    Earn a beautiful certificate of completion to celebrate
                    achievements!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
                What Parents & Kids Say
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Real stories from our creative community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="bg-gradient-to-br from-green-50 to-teal-50 border-2 border-green-200 rounded-3xl hover:shadow-xl transition-shadow"
              >
                <CardContent className="p-6 space-y-4">
                  <Quote className="w-10 h-10 text-green-400" />
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3 pt-4">
                    <Avatar className="border-2 border-green-300">
                      <AvatarImage
                        src={testimonial.avatar}
                        alt={testimonial.name}
                      />
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold text-gray-800">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-600">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div>
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ArtKidsLogo className="w-10 h-10" />
                  <span className="text-2xl font-bold">KidsArt</span>
                </div>
                <p className="text-gray-400">
                  Inspiring creativity in every child
                </p>
              </div>

              <div>
                <h4 className="font-bold mb-4">Quick Links</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-white cursor-pointer">About Us</li>
                  <li className="hover:text-white cursor-pointer">Courses</li>
                  <li className="hover:text-white cursor-pointer">
                    Instructors
                  </li>
                  <li className="hover:text-white cursor-pointer">Contact</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li className="hover:text-white cursor-pointer">
                    Help Center
                  </li>
                  <li className="hover:text-white cursor-pointer">
                    Terms of Service
                  </li>
                  <li className="hover:text-white cursor-pointer">
                    Privacy Policy
                  </li>
                  <li className="hover:text-white cursor-pointer">FAQ</li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold mb-4">Newsletter</h4>
                <p className="text-gray-400 mb-4">
                  Get updates on new courses!
                </p>
                <div className="flex gap-2">
                  <Input placeholder="Your email" className="rounded-full" />
                  <Button className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500">
                    Subscribe
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
              <p>© 2026 KidsArt E-learning Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
