import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ArtKidsLogo } from "../icons/ArtKidsLogo";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-8 lg:mb-10">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2 lg:gap-3 mb-4 justify-center sm:justify-start">
              <ArtKidsLogo className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              <span className="text-xl sm:text-2xl lg:text-3xl font-bold">
                ArtKids
              </span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">
              Truyền cảm hứng sáng tạo cho mọi trẻ em
            </p>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4 text-base">
              Liên kết nhanh
            </h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">
                Về chúng tôi
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Khóa học
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Giảng viên
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Liên hệ
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4 text-base">
              Hỗ trợ
            </h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="hover:text-white cursor-pointer transition-colors">
                Trung tâm trợ giúp
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Điều khoản dịch vụ
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Chính sách bảo mật
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                Câu hỏi thường gặp
              </li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-semibold mb-4 text-base">
              Bản tin
            </h4>
            <p className="text-gray-400 mb-4 text-sm">
              Nhận thông tin về khóa học mới!
            </p>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Input
                placeholder="Email của bạn"
                className="rounded-xl h-10 text-sm bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button className="rounded-xl bg-sky-500 hover:bg-sky-600 whitespace-nowrap h-10 px-4 text-sm">
                Đăng ký
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>© 2026 ArtKids - Nền tảng học vẽ cho trẻ em. Bảo lưu mọi quyền.</p>
        </div>
      </div>
    </footer>
  );
}
