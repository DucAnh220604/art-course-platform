import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArtKidsLogo } from "../icons/ArtKidsLogo";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 sm:py-12 lg:py-16 -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 mb-6 sm:mb-8 lg:mb-10">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 justify-center sm:justify-start">
              <ArtKidsLogo className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold">
                KidsArt
              </span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg">
              Inspiring creativity in every child
            </p>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold mb-3 sm:mb-4 text-base lg:text-lg">
              Quick Links
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm sm:text-base lg:text-lg">
              <li className="hover:text-white cursor-pointer transition-colors">
                About Us
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Courses
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Instructors
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Contact
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold mb-3 sm:mb-4 text-base lg:text-lg">
              Support
            </h4>
            <ul className="space-y-2 text-gray-400 text-sm sm:text-base lg:text-lg">
              <li className="hover:text-white cursor-pointer transition-colors">
                Help Center
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Terms of Service
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Privacy Policy
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                FAQ
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold mb-3 sm:mb-4 text-base lg:text-lg">
              Newsletter
            </h4>
            <p className="text-gray-400 mb-4 text-sm sm:text-base lg:text-lg">
              Get updates on new courses!
            </p>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                placeholder="Your email"
                className="rounded-full h-10 lg:h-12 text-sm lg:text-base bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 whitespace-nowrap h-10 lg:h-12 px-4 lg:px-6 text-sm lg:text-base">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 sm:pt-8 lg:pt-10 text-center text-gray-400 text-sm sm:text-base lg:text-lg">
          <p>© 2026 KidsArt E-learning Platform. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
