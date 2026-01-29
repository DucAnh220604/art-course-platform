import { Search, Filter, ShoppingCart } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArtKidsLogo } from "../icons/ArtKidsLogo";

export function Header({ onNavigate }) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 2xl:-mx-16 px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      <div className="py-4 lg:py-5">
        <div className="flex items-center justify-between gap-4">
          <div
            className="flex items-center gap-2 lg:gap-3 cursor-pointer"
            onClick={() => onNavigate("/")}
          >
            <ArtKidsLogo className="w-10 h-10 lg:w-12 lg:h-12" />
            <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              ArtKids
            </span>
          </div>

          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 lg:w-6 lg:h-6" />
              <Input
                placeholder="Search courses..."
                className="pl-10 lg:pl-12 pr-12 h-10 lg:h-12 text-base lg:text-lg rounded-full border-2 border-sky-200 focus:border-sky-400"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
              >
                <Filter className="w-4 h-4 lg:w-5 lg:h-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <Button
              variant="outline"
              className="rounded-full hidden sm:flex border-sky-300 text-sky-600 hover:bg-sky-50 h-9 lg:h-11 px-4 lg:px-6 text-sm lg:text-base"
              onClick={() => onNavigate("/login")}
            >
              Login
            </Button>
            <Button
              className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 h-9 lg:h-11 px-4 lg:px-6 text-sm lg:text-base"
              onClick={() => onNavigate("/register")}
            >
              Register
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="rounded-full w-9 h-9 lg:w-11 lg:h-11"
            >
              <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
