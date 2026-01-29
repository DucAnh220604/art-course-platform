import { Clock, PlayCircle, Award } from "lucide-react";
import { Card, CardContent } from "../ui/card";

const features = [
  {
    icon: Clock,
    title: "Lifetime Access",
    description:
      "Learn at your own pace with unlimited access to all course materials, forever!",
  },
  {
    icon: PlayCircle,
    title: "HD Video Lessons",
    description:
      "Crystal clear video tutorials that make learning fun and easy to follow.",
  },
  {
    icon: Award,
    title: "Certificate",
    description:
      "Earn a beautiful certificate of completion to celebrate achievements!",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 py-8 sm:py-12 lg:py-16 xl:py-20 my-8 sm:my-12 lg:my-16 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4">
            Why Choose KidsArt?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl text-white/90 px-4">
            Everything your child needs to become a confident artist
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="bg-white/10 backdrop-blur-lg border-white/20 text-white rounded-3xl hover:scale-105 transition-transform"
              >
                <CardContent className="p-6 lg:p-8 xl:p-10 text-center space-y-4">
                  <div className="w-14 h-14 lg:w-16 lg:h-16 xl:w-20 xl:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                    <IconComponent className="w-7 h-7 lg:w-8 lg:h-8 xl:w-10 xl:h-10 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl xl:text-3xl font-bold">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-sm lg:text-base xl:text-lg">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
