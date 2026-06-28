import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  downloadLessonPdf,
  fetchLesson,
  getApiError,
  generateLesson,
  deleteLesson,
  downloadLessonCsv,
  approveLesson,
} from '../lib/api';
import { StatusBadge } from '../components/ui/StatusBadge';
import { SectionCard } from '../components/ui/SectionCard';
import { ArrowLeft, FileDown, Trash2, Sparkles, Bookmark } from 'lucide-react';
export function LessonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchLesson(id)
      .then(setLesson)
      .catch((err) => setError(getApiError(err).message))
      .finally(() => setLoading(false));
  }, [id]);
  async function handlePdf() {
    if (!id || !lesson) return;
    setDownloading(true);
    setError(null);
    try {
      const filename = `lesson-${lesson.theme.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lesson.createdAt.slice(0, 10)}.pdf`;
      await downloadLessonPdf(id, filename);
      const count = parseInt(localStorage.getItem('export_count') || '0', 10);
      localStorage.setItem('export_count', (count + 1).toString());
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setDownloading(false);
    }
  }
  async function handleCsv() {
    if (!id || !lesson) return;
    setDownloading(true);
    setError(null);
    try {
      const filename = `lesson-${lesson.theme.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${lesson.createdAt.slice(0, 10)}.csv`;
      await downloadLessonCsv(id, filename);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setDownloading(false);
    }
  }
  async function handleApprove(status) {
    if (!id || !lesson) return;
    try {
      const updated = await approveLesson(id, status);
      setLesson(updated);
    } catch (err) {
      setError(getApiError(err).message);
    }
  }
  async function handleDelete() {
    if (!id || !lesson) return;
    if (!confirm('Delete this lesson plan? This cannot be undone.')) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteLesson(id);
      navigate('/dashboard?tab=library');
    } catch (err) {
      setError(getApiError(err).message);
      setDeleting(false);
    }
  }
  async function handleRegenerate() {
    if (!lesson) return;
    setRegenerating(true);
    setError(null);
    try {
      const newLesson = await generateLesson({
        ageGroup: lesson.ageGroup,
        theme: lesson.theme,
      });
      navigate(`/lessons/${newLesson.id}`);
    } catch (err) {
      setError(getApiError(err).message);
    } finally {
      setRegenerating(false);
    }
  }
  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8 animate-fade-in">
        <div className="skeleton h-10 w-24 rounded-xl" />
        <div className="skeleton h-24 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="skeleton h-40 md:col-span-2 rounded-2xl" />
          <div className="skeleton h-40 rounded-2xl" />
        </div>
      </div>
    );
  }
  if (error && !lesson) {
    return (
      <div className="max-w-md mx-auto py-12 space-y-4 text-center animate-fade-in">
        <div className="card space-y-3">
          <p role="alert" className="text-sm font-bold" style={{ color: 'var(--color-danger)' }}>
            {error}
          </p>
          <Link
            to="/dashboard?tab=library"
            className="btn-secondary w-full inline-flex items-center gap-1.5 justify-center"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  if (!lesson) return null;
  const c = lesson.lessonContent;
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-[4px] border-black dark:border-white">
        <div className="space-y-2">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-colors text-primary-500 hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5 stroke-[3]" /> Back
          </Link>
          <h1 className="text-4xl font-black font-heading text-text-primary">{lesson.theme}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text-secondary">
            <span>Ages {lesson.ageGroup}</span>
            <span>·</span>
            <span>{new Date(lesson.createdAt).toLocaleString()}</span>
            <StatusBadge status={lesson.source === 'gemini' ? 'generated' : 'reviewed'} />
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex flex-wrap items-center gap-2">
          {lesson.approvalStatus !== 'approved' && (
            <button
              type="button"
              className="btn-primary py-2 px-4 flex items-center gap-1.5 h-11 text-xs bg-green-600 hover:bg-green-700 border-green-800 text-white"
              onClick={() => handleApprove('approved')}
            >
              Approve
            </button>
          )}
          {lesson.approvalStatus !== 'rejected' && (
            <button
              type="button"
              className="btn-secondary py-2 px-4 flex items-center gap-1.5 h-11 text-xs"
              onClick={() => handleApprove('rejected')}
            >
              Reject
            </button>
          )}
          <button
            type="button"
            className="btn-secondary py-2 px-4 flex items-center gap-1.5 h-11 text-xs"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <Sparkles className="h-4 w-4 stroke-[2.5]" />
            {regenerating ? 'Regenerating…' : 'Regenerate'}
          </button>
          <button
            type="button"
            className="btn-primary py-2 px-4 flex items-center gap-1.5 h-11 text-xs"
            onClick={handleCsv}
            disabled={downloading}
          >
            <FileDown className="h-4 w-4 stroke-[2.5]" />
            CSV
          </button>
          <button
            type="button"
            className="btn-primary py-2 px-4 flex items-center gap-1.5 h-11 text-xs"
            onClick={handlePdf}
            disabled={downloading}
          >
            <FileDown className="h-4 w-4 stroke-[2.5]" />
            PDF
          </button>
          <button
            type="button"
            className="btn-danger py-2 px-4 flex items-center gap-1.5 h-11 text-xs"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4 stroke-[2.5]" />
            Delete
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          className="rounded-[16px] px-4 py-3 text-sm font-black border-[3px] border-black bg-red-100 text-red-700 animate-fade-in"
        >
          {error}
        </div>
      )}

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core Lesson Detail Sections */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Learning Objective">
            <p className="text-base font-semibold leading-relaxed text-text-primary">
              {c.objective}
            </p>
          </SectionCard>

          <SectionCard title="Classroom Activity">
            <pre className="whitespace-pre-wrap font-sans text-sm font-semibold leading-relaxed text-text-secondary">
              {c.activity}
            </pre>
          </SectionCard>

          <SectionCard title="Rhyme / Song">
            <pre className="whitespace-pre-wrap font-sans text-sm font-semibold italic leading-relaxed p-4 rounded-[16px] border-[3px] border-black dark:border-white bg-[#fffdf5] dark:bg-zinc-900 shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]">
              {c.rhyme}
            </pre>
          </SectionCard>

          <SectionCard title="Worksheet Idea">
            <p className="text-sm font-semibold leading-relaxed text-text-secondary">
              {c.worksheet}
            </p>
          </SectionCard>
        </div>

        {/* Sidebar Materials Panel */}
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-[2px] border-black dark:border-white">
              <Bookmark className="h-5 w-5 stroke-[2.5] text-[#8D6BE8]" />
              <h2 className="text-base font-black text-text-primary">Materials Required</h2>
            </div>
            <ul className="space-y-2.5 font-semibold">
              {c.materials.map((m, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-sm leading-relaxed text-text-secondary"
                >
                  <div className="h-2 w-2 rounded-full mt-2 bg-[#8D6BE8] border-[1px] border-black flex-shrink-0" />
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
