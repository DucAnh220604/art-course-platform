import { PlayCircle, Award } from "lucide-react";
import { Button } from "../ui/button";

export function HeroSection() {
  return (
    <section className="py-8 sm:py-12 lg:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="space-y-4 sm:space-y-6 text-center md:text-left order-2 md:order-1">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-sky-600 via-cyan-500 to-teal-500 bg-clip-text text-transparent">
              Unleash Your Child's Creativity
            </span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600">
            Join thousands of young artists learning to draw, paint, and create
            amazing artwork with expert instructors!
          </p>
          <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
            <Button
              size="lg"
              className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8"
            >
              Start Free Trial
              <PlayCircle className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full text-sm sm:text-base lg:text-lg px-4 sm:px-6 lg:px-8 border-sky-300 text-sky-600 hover:bg-sky-50"
            >
              Browse Courses
            </Button>
          </div>
          <div className="flex gap-4 sm:gap-6 lg:gap-8 pt-4 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-sky-600">
                10k+
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600">
                Happy Students
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-500">
                500+
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600">
                Art Courses
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-500">
                4.9★
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600">
                Average Rating
              </div>
            </div>
          </div>
        </div>
        <div className="relative order-1 md:order-2 mx-auto max-w-md md:max-w-none">
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <img
              src="https://images.unsplash.com/photo-1610274672835-65a79c852f58?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800"
              alt="Happy kids drawing"
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="absolute -bottom-3 -left-3 sm:-bottom-6 sm:-left-6 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-2 sm:p-4 transform rotate-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                <Award className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold">
                  Certificate
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  Upon Completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
