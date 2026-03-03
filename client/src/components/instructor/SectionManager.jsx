import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Video,
  ChevronDown,
  ChevronRight,
  Layout,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import courseApi from "@/api/courseApi";
import { SectionForm } from "./SectionForm";
import { LessonForm } from "./LessonForm";

export function SectionManager({ course, onRefresh }) {
  const [expandedSection, setExpandedSection] = useState(null);

  // States cho Forms
  const [isSectionFormOpen, setIsSectionFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isLessonFormOpen, setIsLessonFormOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [targetSectionId, setTargetSectionId] = useState(null);

  // States cho Confirm Delete
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({
    id: null,
    type: "",
    title: "",
  });

  const openConfirmDialog = (id, type, title) => {
    setDeleteConfig({ id, type, title });
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    const { id, type } = deleteConfig;
    const apiCall =
      type === "section"
        ? courseApi.deleteSection(id)
        : courseApi.deleteLesson(id);
    const loadingMsg =
      type === "section" ? "Đang gỡ chương học..." : "Đang xóa bài giảng...";

    toast.promise(apiCall, {
      loading: loadingMsg,
      success: () => {
        onRefresh();
        setIsConfirmOpen(false);
        return "Xong rồi! Dữ liệu đã được xóa sạch sẽ ✨";
      },
      error: "Không xóa được, bé kiểm tra lại quyền nhé! 🛠️",
    });
  };

  return (
    <div className="space-y-6 mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <Layout className="text-sky-500 w-6 h-6" />
          <h3 className="text-2xl font-bold text-slate-800">
            Nội dung bài học
          </h3>
        </div>
        <Button
          onClick={() => {
            setEditingSection(null);
            setIsSectionFormOpen(true);
          }}
          variant="outline"
          className="rounded-full border-sky-200 text-sky-600 hover:bg-sky-50"
        >
          <Plus className="w-4 h-4 mr-2" /> Thêm chương mới
        </Button>
      </div>

      <div className="space-y-4">
        {course.sections?.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-3xl text-slate-400">
            Chưa có nội dung. Hãy bắt đầu bằng việc thêm chương mới!
          </div>
        )}

        {course.sections?.map((section) => (
          <div
            key={section._id}
            className="group border-2 border-slate-100 rounded-3xl overflow-hidden bg-white hover:border-sky-100 transition-all"
          >
            <div
              className={`p-5 flex items-center justify-between cursor-pointer transition-colors ${expandedSection === section._id ? "bg-sky-50/30" : "hover:bg-slate-50"}`}
              onClick={() =>
                setExpandedSection(
                  expandedSection === section._id ? null : section._id,
                )
              }
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-slate-100">
                  {expandedSection === section._id ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-700 text-lg">
                    {section.title}
                  </span>
                  <div className="text-xs text-slate-400">
                    {section.lessonsId?.length || 0} bài giảng
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingSection(section);
                    setIsSectionFormOpen(true);
                  }}
                >
                  <Edit className="w-4 h-4 text-amber-500" />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    openConfirmDialog(section._id, "section", section.title);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>

            {expandedSection === section._id && (
              <div className="px-5 pb-5 pt-2 bg-slate-50/30 space-y-3">
                {section.lessonsId?.map((lesson) => (
                  <div
                    key={lesson._id}
                    className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600">
                        <Video className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-700">
                          {lesson.title}
                        </div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] py-0">
                            {lesson.type}
                          </Badge>
                          {lesson.isTrial && (
                            <Badge className="bg-green-100 text-green-700 text-[10px] py-0 border-none">
                              Học thử
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingLesson(lesson);
                          setTargetSectionId(section._id);
                          setIsLessonFormOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4 text-slate-400 hover:text-amber-500" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() =>
                          openConfirmDialog(lesson._id, "lesson", lesson.title)
                        }
                      >
                        <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="dashed"
                  className="w-full py-6 rounded-2xl border-sky-200 text-sky-600 hover:bg-sky-50 hover:border-sky-400 transition-all border-2"
                  onClick={() => {
                    setEditingLesson(null);
                    setTargetSectionId(section._id);
                    setIsLessonFormOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" /> Thêm bài học mới vào chương
                  này
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* MODAL XÁC NHẬN DÙNG CHUNG CHO SECTION/LESSON */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="rounded-[32px] p-8 border-none shadow-2xl">
          <AlertDialogHeader>
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${deleteConfig.type === "section" ? "bg-orange-100" : "bg-red-100"}`}
            >
              <Trash2
                className={`w-8 h-8 ${deleteConfig.type === "section" ? "text-orange-500" : "text-red-500"}`}
              />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-center">
              {deleteConfig.type === "section"
                ? "Xóa chương học này?"
                : "Xóa bài học này?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-slate-500 mt-2">
              Bé muốn xóa{" "}
              <span className="font-bold text-slate-800">
                "{deleteConfig.title}"
              </span>
              ?
              {deleteConfig.type === "section" &&
                " Lưu ý: Toàn bộ bài học bên trong cũng sẽ mất hết đó!"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex sm:justify-center gap-3 mt-6">
            <AlertDialogCancel className="rounded-full px-8 border-slate-200">
              Quay lại
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className={`rounded-full px-8 shadow-lg ${deleteConfig.type === "section" ? "bg-orange-500 hover:bg-orange-600 shadow-orange-100" : "bg-red-500 hover:bg-red-600 shadow-red-100"}`}
            >
              Đồng ý xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SectionForm
        open={isSectionFormOpen}
        onOpenChange={setIsSectionFormOpen}
        courseId={course._id}
        initialData={editingSection}
        onSuccess={onRefresh}
      />
      <LessonForm
        open={isLessonFormOpen}
        onOpenChange={setIsLessonFormOpen}
        sectionId={targetSectionId}
        initialData={editingLesson}
        onSuccess={onRefresh}
      />
    </div>
  );
}
