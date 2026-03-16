import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Header, Footer } from "@/components/landing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import courseApi from "@/api/courseApi";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function LessonPage() {
  const { slug, lessonId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  
  const ytPlayerRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const markedCompleteRef = useRef(new Set());

  // Helper to get YouTube ID
  const getEmbedId = (videoUrl) => {
    if (!videoUrl) return null;
    try {
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        const url = new URL(videoUrl);
        if (url.hostname.includes("youtube.com")) {
          return url.searchParams.get("v");
        }
        return url.pathname.slice(1);
      }
      return videoUrl;
    } catch {
      return videoUrl;
    }
  };

  const destroyPlayer = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (_) {}
      ytPlayerRef.current = null;
    }
  }, []);

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  // Fetch Course Data
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        const res = await courseApi.getCourseBySlug(slug);
        const courseData = res.data;
        setCourse(courseData);

        // Find the lesson to play
        const allLessons = courseData.sections?.flatMap(s => s.lessonsId || []) || [];
        let currentLesson = null;
        
        if (lessonId) {
          currentLesson = allLessons.find(l => l._id === lessonId);
        } else {
          currentLesson = allLessons[0];
        }
        
        if (currentLesson) {
          // Check Enrollment Status
          const isEnrolled = isAuthenticated && (user?.enrolledCourses?.some(
            e => (e.course?._id || e.course)?.toString() === courseData._id?.toString()
          ));

          // Primary Guard: Allow if enrolled OR if lesson is a trial
          if (!currentLesson.isTrial && !isEnrolled) {
            toast.error("Bé cần mua khóa học để xem nội dung này nhé! 🔐", {
                description: "Đăng ký ngay để cùng Artie khám phá trọn bộ bài học nha! ✨"
            });
            navigate(`/course/${slug}`);
            return;
          }

          setSelectedLesson(currentLesson);
        }

        // Fetch Progress (Optional for trials)
        try {
            const progressRes = await courseApi.getCourseProgress(courseData._id);
            const completedIds = (progressRes.data.data || []).map(p => p.lesson?._id || p.lesson);
            setCompletedLessons(new Set(completedIds));
            markedCompleteRef.current = new Set(completedIds);
        } catch (e) {
            console.log("Not enrolled or progress hidden.");
        }

      } catch (error) {
        toast.error("Không tải được dữ liệu khóa học.");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchCourseData();
    }
  }, [slug, navigate, lessonId]); // Removed isAuthenticated dependency to allow trial view

  // Update URL and Selected Lesson
  useEffect(() => {
    if (course && lessonId) {
      const allLessons = course.sections?.flatMap(s => s.lessonsId || []) || [];
      const lesson = allLessons.find(l => l._id === lessonId);
      if (lesson) setSelectedLesson(lesson);
    }
  }, [lessonId, course]);

  // Player Setup
  useEffect(() => {
    if (!selectedLesson || loading) return;

    const videoId = getEmbedId(selectedLesson.videoUrl);
    if (!videoId) return;

    const createPlayer = () => {
      destroyPlayer();
      const container = document.getElementById("lesson-player-actual");
      if (!container) return;
      
      const div = document.createElement("div");
      div.id = "yt-iframe-lesson";
      container.appendChild(div);

      ytPlayerRef.current = new window.YT.Player("yt-iframe-lesson", {
        videoId: videoId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        width: "100%",
        height: "100%",
        events: {
          onReady: (e) => {
            e.target.playVideo();
            startTracking(e.target, selectedLesson._id);
          },
          onStateChange: (e) => {
            if (e.data === window.YT.PlayerState.PLAYING) {
              startTracking(e.target, selectedLesson._id);
            } else {
              if (progressIntervalRef.current) {
                clearInterval(progressIntervalRef.current);
                progressIntervalRef.current = null;
              }
            }
          }
        }
      });
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      window.onYouTubeIframeAPIReady = createPlayer;
    }

    return () => destroyPlayer();
  }, [selectedLesson, loading, destroyPlayer]);

  const startTracking = (player, currentId) => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    progressIntervalRef.current = setInterval(() => {
      try {
        const duration = player.getDuration();
        const current = player.getCurrentTime();
        if (duration > 0 && current / duration >= 0.75) {
          clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
          handleMarkAsDone(currentId);
        }
      } catch (_) {}
    }, 5000);
  };

  const handleMarkAsDone = async (lId) => {
    const id = lId || selectedLesson?._id;
    if (!id || markedCompleteRef.current.has(id)) return;

    try {
      await courseApi.markLessonComplete(id);
      setCompletedLessons(prev => new Set([...prev, id]));
      markedCompleteRef.current.add(id);
      toast.success("Tuyệt vời! Bé đã hoàn thành bài học này. 🎨", {
        description: "Hành trình sáng tạo lại tiến thêm một bước rồi!"
      });
    } catch (e) {
      console.error(e);
    }
  };

  const isEnrolled = isAuthenticated && (user?.enrolledCourses?.some(
    e => (e.course?._id || e.course)?.toString() === course?._id?.toString()
  ));

  const navigateLesson = (direction) => {
    if (!course) return;
    const allLessons = course.sections?.flatMap(s => s.lessonsId || []) || [];
    const currentIndex = allLessons.findIndex(l => l._id === selectedLesson?._id);
    
    let targetLesson = null;
    if (direction === "next" && currentIndex < allLessons.length - 1) {
      targetLesson = allLessons[currentIndex + 1];
    } else if (direction === "prev" && currentIndex > 0) {
      targetLesson = allLessons[currentIndex - 1];
    }

    if (targetLesson) {
      if (isEnrolled || targetLesson.isTrial) {
        navigate(`/learning/${slug}/${targetLesson._id}`);
      } else {
        toast.error("Bé cần mua khóa học để xem bài tiếp theo nhé! 🔐", {
          description: "Đăng ký để mở khóa toàn bộ hành trình sáng tạo nha! ✨"
        });
      }
    }
  };

  if (loading || !course) {
    return (
      <div className="min-h-screen flex flex-col bg-surface scrapbook-bg">
        <Header onNavigate={navigate} />
        <div className="flex-1 flex items-center justify-center">
            <div className="animate-bounce">
                <span className="material-symbols-outlined text-primary text-6xl">palette</span>
            </div>
        </div>
      </div>
    );
  }

  const allLessons = course.sections?.flatMap(s => s.lessonsId || []) || [];
  const currentIndex = allLessons.findIndex(l => l._id === selectedLesson?._id);
  const progressPercent = Math.round((completedLessons.size / allLessons.length) * 100) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-surface font-body text-on-surface">
      <Header onNavigate={navigate} />

      <main className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-5rem)] overflow-hidden">
        {/* SIDEBAR: Lesson List */}
        <aside className="w-full lg:w-80 bg-surface-container-low border-r border-outline-variant/10 flex flex-col overflow-y-auto scrapbook-bg pt-6">
          <div className="px-6 mb-8">
            <div className="flex items-center gap-4 p-4 bg-white/60 rounded-2xl shadow-sm border border-primary/10">
              <div className="w-12 h-12 bg-secondary-container rounded-lg overflow-hidden shrink-0 border-2 border-white shadow-sm">
                <img src={course.thumbnail} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="min-w-0">
                <h3 className="font-headline font-bold text-on-surface leading-tight truncate">{course.title}</h3>
                <p className="text-[10px] font-black text-tertiary uppercase tracking-widest">{progressPercent}% Hoàn thành</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 space-y-8 pb-10">
            {course.sections?.map((section, sIdx) => (
              <div key={section._id} className="space-y-3">
                <h4 className="px-2 text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] flex items-center gap-2">
                   <span className="w-4 h-0.5 bg-outline-variant/20"></span>
                   Phần {sIdx + 1}: {section.title}
                </h4>
                <div className="space-y-2">
                  {section.lessonsId?.map((lesson) => {
                    const isSelected = selectedLesson?._id === lesson._id;
                    const isDone = completedLessons.has(lesson._id);
                    const canWatch = isEnrolled || lesson.isTrial;

                    return (
                      <button
                        key={lesson._id}
                        onClick={() => {
                            if (canWatch) {
                                navigate(`/learning/${slug}/${lesson._id}`);
                            } else {
                                toast.error("Bé cần mua khóa học để xem nội dung này nhé! 🔐");
                            }
                        }}
                        className={cn(
                          "w-full flex items-center gap-3 p-3.5 rounded-xl transition-all text-left group border-2",
                          isSelected 
                            ? "bg-primary-container/20 border-primary shadow-sm" 
                            : "bg-transparent border-transparent hover:bg-white/40",
                          !canWatch && "opacity-50 grayscale"
                        )}
                      >
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border-2 transition-colors",
                            isSelected ? "bg-primary border-primary text-on-primary" : "bg-white border-outline-variant/10 text-on-surface-variant group-hover:border-primary/30"
                        )}>
                            <span className="material-symbols-outlined text-lg">
                                {canWatch ? (isDone ? "check_circle" : (isSelected ? "play_arrow" : "bolt")) : "lock"}
                            </span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className={cn(
                                "text-sm font-bold truncate transition-colors",
                                isSelected ? "text-primary" : "text-on-surface-variant"
                            )}>
                                {lesson.title}
                            </p>
                            <p className="text-[9px] font-medium text-on-surface-variant/40 uppercase tracking-widest leading-none mt-0.5">
                                {lesson.duration || "10 ph"} • {lesson.isTrial ? "Học thử" : "Hành trình"}
                            </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT: Video Player */}
        <section className="flex-1 overflow-y-auto bg-surface p-6 md:p-10 scrapbook-bg relative">
          <div className="max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Link to={`/course/${slug}`} className="inline-flex items-center gap-2 text-primary hover:underline font-black text-[10px] uppercase tracking-widest mb-4">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Quay lại trang chi tiết
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-headline font-black text-on-surface tracking-tight leading-tight">
                        Bài {currentIndex + 1}: {selectedLesson?.title}
                    </h1>
                </div>
                <Badge className="bg-secondary-container/50 text-on-secondary-container px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest border-none">
                    <span className="material-symbols-outlined text-sm mr-2">verified</span>
                    BÀI HỌC HOÀN TOÀN MỚI
                </Badge>
            </div>

            {/* Video Player Frame */}
            <div className="relative group mb-10">
                <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] translate-x-3 translate-y-3"></div>
                <div className="relative bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white aspect-video" id="lesson-player-actual">
                    {/* YT Player Mounts here */}
                </div>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigateLesson("prev")}
                        disabled={currentIndex === 0}
                        className="px-6 py-3 rounded-2xl bg-white border-2 border-outline-variant/10 font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-surface-container transition-all disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                        Bài Trước
                    </button>
                    <button 
                         onClick={() => navigateLesson("next")}
                         disabled={currentIndex === allLessons.length - 1}
                         className="px-8 py-3 rounded-2xl gummy-button text-on-primary-fixed font-black text-[10px] uppercase tracking-widest flex items-center gap-2 disabled:opacity-30 shadow-lg"
                    >
                        Bài Tiếp Theo
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>

                <div className="flex items-center gap-4">
                    <div 
                        className={cn(
                            "px-6 py-3 rounded-2xl flex items-center gap-2 transition-all font-black text-[10px] uppercase tracking-widest shadow-sm select-none cursor-default",
                            completedLessons.has(selectedLesson?._id)
                                ? "bg-tertiary text-on-tertiary"
                                : "bg-white/50 border-2 border-outline-variant/10 text-on-surface-variant/40"
                        )}
                    >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: completedLessons.has(selectedLesson?._id) ? "'FILL' 1" : "" }}>
                            {completedLessons.has(selectedLesson?._id) ? "check_circle" : "pending"}
                        </span>
                        {completedLessons.has(selectedLesson?._id) ? "Đã Hoàn Thành" : "Đang Học"}
                    </div>
                </div>
            </div>

            {/* Bento Description Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Artie's Pro Tip */}
                <div className="md:col-span-1">
                    <div className="bg-primary/10 p-8 rounded-[2rem] relative overflow-hidden border-2 border-primary/10 scrapbook-card h-full rotate-[-1deg]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg rotate-12">
                                <span className="material-symbols-outlined text-white">auto_awesome</span>
                            </div>
                            <h4 className="font-headline font-black text-on-surface uppercase tracking-widest text-xs">Mẹo của Artie!</h4>
                        </div>
                        <p className="text-on-surface font-medium italic leading-relaxed text-sm">
                            "Bé hãy chuẩn bị sẵn một cốc nước sạch để rửa bút nhé! Đừng quên lau khô bút trước khi lấy màu tiếp theo để màu vẽ được đẹp nhất nha!"
                        </p>
                        <div className="absolute -right-6 -bottom-6 opacity-10">
                            <span className="material-symbols-outlined text-[100px] text-primary rotate-12">palette</span>
                        </div>
                    </div>
                </div>

                {/* Lesson Details */}
                <div className="md:col-span-2">
                    <div className="bg-white/60 p-10 rounded-[2.5rem] border-2 border-dashed border-outline-variant/10 scrapbook-card rotate-[1deg] h-full">
                        <h3 className="text-2xl font-headline font-black text-on-surface mb-6 flex items-center gap-3">
                             <span className="material-symbols-outlined text-tertiary">description</span>
                             Chi tiết bài học
                        </h3>
                        <p className="text-on-surface-variant font-medium leading-[1.8] mb-8">
                            {selectedLesson?.description || "Bé cùng Artie bắt đầu những nét vẽ đầu tiên nhé! Ở bài học này, chúng mình sẽ cùng học cách cầm cọ đúng cách và làm quen với những loại màu sắc cơ bản nhất tạii ArtKids Studio."}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4">
                             <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-outline-variant/5">
                                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-lg">brush</span>
                                </span>
                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Cọ vẽ tròn</span>
                             </div>
                             <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-outline-variant/5">
                                <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                                    <span className="material-symbols-outlined text-lg">water_drop</span>
                                </span>
                                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Cốc nước sạch</span>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer is hidden or simplified for player mode */}
      <div className="h-10 bg-surface-container-high flex items-center justify-center px-8 border-t border-outline-variant/10">
           <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em]">© 2024 ArtKids Studio - Nơi bé tự do sáng tạo</p>
      </div>

       {/* Organic Decoration */}
       <div className="fixed bottom-0 right-0 pointer-events-none opacity-5 select-none -z-10">
            <span className="material-symbols-outlined text-[300px] rotate-[-15deg]">draw</span>
       </div>
    </div>
  );
}
