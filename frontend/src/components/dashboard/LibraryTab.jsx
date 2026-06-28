import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchInput } from '../ui/SearchInput';
import { TemplateCard } from '../ui/TemplateCard';
import { SkeletonCard } from '../ui/SkeletonCard';
import { EmptyState } from '../ui/EmptyState';
import { Plus } from 'lucide-react';
export function LibraryTab({ lessons }) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');
  async function handleDelete(id) {
    if (!confirm('Delete this lesson? This cannot be undone.')) return;
    await lessons.remove(id);
  }
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-[20px] border-[4px] border-black dark:border-white bg-card shadow-card">
        <SearchInput
          value={filter}
          onChange={setFilter}
          placeholder="Search by theme name…"
          onSearch={() => void lessons.load(filter)}
          onClear={() => {
            setFilter('');
            void lessons.load();
          }}
          className="flex-1 max-w-md"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-secondary py-2.5 px-4"
            onClick={() => void lessons.load(filter)}
          >
            Search
          </button>
          <button
            type="button"
            className="btn-ghost py-2.5 px-4"
            onClick={() => {
              setFilter('');
              void lessons.load();
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      {lessons.loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard count={6} height="h-64" />
        </div>
      ) : lessons.items.length === 0 ? (
        <EmptyState
          title="No lesson plans found"
          description="No lesson plans match your search query. Try another keyword or create a new lesson."
          action={
            <button
              onClick={() => navigate('/dashboard?tab=generator')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> Create New Lesson
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.items.map((lesson) => (
            <TemplateCard
              key={lesson.id}
              lesson={lesson}
              onView={(id) => navigate(`/lessons/${id}`)}
              onDelete={handleDelete}
              deleting={lessons.deletingId === lesson.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
