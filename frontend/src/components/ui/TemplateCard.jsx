import { GraduationCap, ChevronRight, Trash2 } from 'lucide-react';
import { SourceBadge } from './StatusBadge';
export function TemplateCard({ lesson, onView, onDelete, deleting }) {
  return (
    <div className="flex flex-col justify-between rounded-[20px] p-6 border-[4px] border-black dark:border-white transition-all duration-150 bg-card shadow-card hover:translate-y-[-2px] hover:shadow-card-hover group">
      {/* Banner Header */}
      <div className="-mx-6 -mt-6 mb-5 h-20 rounded-t-[16px] p-4 flex items-end justify-between border-b-[4px] border-black dark:border-white bg-[#E6DCFF] dark:bg-zinc-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border-[3px] border-black dark:border-white bg-card text-[#8D6BE8] dark:text-white">
          <GraduationCap className="h-5 w-5 stroke-[2.5]" />
        </div>
        <SourceBadge source={lesson.source} />
      </div>

      <div className="space-y-2 flex-1">
        <button
          onClick={() => onView(lesson.id)}
          className="block text-lg font-black font-heading leading-snug text-left cursor-pointer text-text-primary hover:underline"
        >
          {lesson.theme}
        </button>
        <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
          <span>Ages {lesson.ageGroup}</span>
          <span>·</span>
          <span>{new Date(lesson.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-xs font-semibold leading-relaxed mt-2 text-text-secondary line-clamp-2">
          {lesson.lessonContent.objective}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 mt-5 border-t-[3px] border-black dark:border-white">
        <button
          onClick={() => onView(lesson.id)}
          className="text-xs font-black flex items-center gap-0.5 cursor-pointer text-primary-500 hover:underline"
        >
          Open Plan <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
        </button>
        <button
          type="button"
          className="p-2 transition-all duration-150 rounded-xl cursor-pointer border-[2px] border-black dark:border-white bg-card text-text-muted hover:bg-red-200 hover:text-[#F04D3A] active:translate-y-[2px]"
          disabled={deleting}
          aria-label="Delete lesson"
          onClick={() => onDelete(lesson.id)}
        >
          {deleting ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent border-danger" />
          ) : (
            <Trash2 className="h-4 w-4 stroke-[2.5]" />
          )}
        </button>
      </div>
    </div>
  );
}
