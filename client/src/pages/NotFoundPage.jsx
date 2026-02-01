import { motion } from "framer-motion";
import { Home, ArrowLeft, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtKidsLogo } from "@/components/icons/ArtKidsLogo";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-sky-50 to-white p-4 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-20 h-20 bg-pink-200/50 rounded-full blur-2xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-yellow-200/50 rounded-full blur-2xl" />
      <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-200/50 rounded-full blur-2xl" />

      <motion.div
        animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 text-6xl"
      >
        🎨
      </motion.div>
      <motion.div
        animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-32 left-20 text-5xl"
      >
        🖌️
      </motion.div>
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
        className="absolute top-40 left-1/4 text-4xl"
      >
        ⭐
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 mb-8"
      >
        <ArtKidsLogo className="w-12 h-12" />
        <span className="font-bold text-3xl text-sky-500">ArtKids</span>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative mb-6"
      >
        <svg viewBox="0 0 300 120" className="w-72 md:w-96 h-auto">
          <text
            x="20"
            y="100"
            fontSize="100"
            fontWeight="bold"
            fill="#38BDF8"
            fontFamily="Quicksand, sans-serif"
          >
            4
          </text>
          <ellipse
            cx="150"
            cy="60"
            rx="45"
            ry="50"
            fill="#FDE68A"
            stroke="#F59E0B"
            strokeWidth="3"
          />
          <ellipse cx="150" cy="70" rx="12" ry="10" fill="#38BDF8" />
          <circle cx="125" cy="40" r="10" fill="#EF4444" />
          <circle cx="150" cy="30" r="10" fill="#F97316" />
          <circle cx="175" cy="40" r="10" fill="#22C55E" />
          <circle cx="130" cy="70" r="8" fill="#8B5CF6" />
          <circle cx="170" cy="70" r="8" fill="#EC4899" />
          <text
            x="200"
            y="100"
            fontSize="100"
            fontWeight="bold"
            fill="#38BDF8"
            fontFamily="Quicksand, sans-serif"
          >
            4
          </text>
        </svg>

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-8 h-8 text-yellow-400" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
          className="absolute -bottom-2 -left-2"
        >
          <Sparkles className="w-6 h-6 text-pink-400" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center mb-8"
      >
        <h1
          className="text-2xl md:text-3xl font-bold text-slate-800 mb-3"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          Ối! Trang này đi lạc rồi!
        </h1>
        <p className="text-slate-500 text-lg max-w-md mx-auto">
          Có vẻ như bức tranh bạn tìm chưa được vẽ. Hãy quay về lớp học để tiếp
          tục sáng tạo nhé!
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <svg viewBox="0 0 200 100" className="w-48 h-auto">
          <g transform="translate(60, 10)">
            <rect x="35" y="20" width="12" height="50" fill="#A16207" rx="3" />
            <rect x="33" y="18" width="16" height="8" fill="#78350F" rx="2" />
            <ellipse cx="41" cy="78" rx="10" ry="15" fill="#EC4899" />
            <ellipse cx="41" cy="75" rx="7" ry="10" fill="#F472B6" />
            <circle cx="38" cy="38" r="2" fill="#1F2937" />
            <circle cx="44" cy="38" r="2" fill="#1F2937" />
            <path
              d="M38 46 Q41 44 44 46"
              stroke="#1F2937"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
            <text x="55" y="25" fontSize="16" fill="#94A3B8">
              ?
            </text>
            <text x="20" y="30" fontSize="12" fill="#94A3B8">
              ?
            </text>
          </g>
          <g transform="translate(120, 40)">
            <rect
              x="0"
              y="0"
              width="40"
              height="35"
              fill="#FEF3C7"
              stroke="#F59E0B"
              strokeWidth="2"
              rx="3"
            />
            <line
              x1="5"
              y1="10"
              x2="35"
              y2="10"
              stroke="#D1D5DB"
              strokeWidth="2"
            />
            <line
              x1="5"
              y1="18"
              x2="25"
              y2="18"
              stroke="#D1D5DB"
              strokeWidth="2"
            />
            <line
              x1="5"
              y1="26"
              x2="30"
              y2="26"
              stroke="#D1D5DB"
              strokeWidth="2"
            />
            <text x="25" y="30" fontSize="20" fill="#EF4444" fontWeight="bold">
              ✗
            </text>
          </g>
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <Button
          onClick={() => window.history.back()}
          variant="outline"
          className="h-12 px-6 rounded-full text-lg font-semibold border-2 border-slate-300 hover:border-sky-400 hover:text-sky-600 transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </Button>
        <Button
          asChild
          className="h-12 px-6 rounded-full text-lg font-bold bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all"
        >
          <a href="/">
            <Home className="w-5 h-5 mr-2" />
            Về trang chủ
          </a>
        </Button>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-sm text-slate-400"
      >
        Mã lỗi: 404 - Không tìm thấy trang
      </motion.p>
    </div>
  );
}
