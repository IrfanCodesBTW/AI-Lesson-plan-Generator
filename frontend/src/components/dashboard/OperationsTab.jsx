import { useState, useEffect, useCallback } from 'react';
import { SectionCard } from '../ui/SectionCard';
import {
  fetchEnquiries,
  createEnquiry,
  updateEnquiryStatus,
  fetchRoutines,
  createRoutine,
} from '../../lib/api';
import {
  UserPlus,
  ClipboardList,
  Loader2,
  Plus,
  Baby,
  UtensilsCrossed,
  Moon,
  Activity,
} from 'lucide-react';
const STATUS_COLORS = {
  pending: 'bg-[#fff9e0] text-[#b8920b] border-[#b8920b]',
  contacted: 'bg-[#ebf2fe] text-[#2f6fd6] border-[#2f6fd6]',
  admitted: 'bg-[#E7F6EC] text-[#2B8A4D] border-[#2B8A4D]',
  rejected: 'bg-red-50 text-red-600 border-red-600 dark:bg-red-950/20',
};
const ROUTINE_ICONS = {
  meal: UtensilsCrossed,
  nap: Moon,
  diaper: Baby,
  activity: Activity,
};
const ROUTINE_COLORS = {
  meal: 'bg-[#fff9e0] text-[#b8920b]',
  nap: 'bg-[#f4f0ff] text-[#8D6BE8]',
  diaper: 'bg-[#ebf2fe] text-[#2f6fd6]',
  activity: 'bg-[#E7F6EC] text-[#2B8A4D]',
};
export function OperationsTab() {
  const [activePanel, setActivePanel] = useState('enquiries');
  // Enquiry State
  const [enquiries, setEnquiries] = useState([]);
  const [enquiriesLoading, setEnquiriesLoading] = useState(true);
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('3');
  const [remarks, setRemarks] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);
  // Routine State
  const [routines, setRoutines] = useState([]);
  const [routinesLoading, setRoutinesLoading] = useState(true);
  const [routineChild, setRoutineChild] = useState('');
  const [routineType, setRoutineType] = useState('meal');
  const [routineDetail, setRoutineDetail] = useState('');
  const [submittingRoutine, setSubmittingRoutine] = useState(false);
  const loadEnquiries = useCallback(async () => {
    setEnquiriesLoading(true);
    try {
      const data = await fetchEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setEnquiriesLoading(false);
    }
  }, []);
  const loadRoutines = useCallback(async () => {
    setRoutinesLoading(true);
    try {
      const data = await fetchRoutines();
      setRoutines(data);
    } catch (err) {
      console.error('Failed to load routines:', err);
    } finally {
      setRoutinesLoading(false);
    }
  }, []);
  useEffect(() => {
    void loadEnquiries();
    void loadRoutines();
  }, [loadEnquiries, loadRoutines]);
  const handleCreateEnquiry = async (e) => {
    e.preventDefault();
    if (!parentName.trim() || !childName.trim()) return;
    setSubmittingEnquiry(true);
    try {
      const newEnquiry = await createEnquiry({
        parentName: parentName.trim(),
        childName: childName.trim(),
        childAge: parseInt(childAge, 10),
        remarks: remarks.trim() || undefined,
      });
      setEnquiries((prev) => [newEnquiry, ...prev]);
      setParentName('');
      setChildName('');
      setChildAge('3');
      setRemarks('');
    } catch (err) {
      console.error('Failed to create enquiry:', err);
    } finally {
      setSubmittingEnquiry(false);
    }
  };
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const updated = await updateEnquiryStatus(id, newStatus);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };
  const handleCreateRoutine = async (e) => {
    e.preventDefault();
    if (!routineChild.trim() || !routineDetail.trim()) return;
    setSubmittingRoutine(true);
    try {
      const newRoutine = await createRoutine({
        childName: routineChild.trim(),
        routineType,
        detail: routineDetail.trim(),
      });
      setRoutines((prev) => [newRoutine, ...prev]);
      setRoutineChild('');
      setRoutineDetail('');
    } catch (err) {
      console.error('Failed to create routine:', err);
    } finally {
      setSubmittingRoutine(false);
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-black font-heading text-text-primary">
          Centre Operations Portal
        </h1>
        <p className="text-sm font-semibold text-text-secondary">
          Manage parent enquiries, admissions, and daily daycare routines for FirstCry Intellitots.
        </p>
      </div>

      {/* Panel Switcher */}
      <div className="flex border-[3px] border-black dark:border-white rounded-xl overflow-hidden bg-[#f7f4ea] dark:bg-zinc-800 p-1 max-w-md">
        <button
          onClick={() => setActivePanel('enquiries')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black rounded-lg transition-colors cursor-pointer ${
            activePanel === 'enquiries'
              ? 'bg-[#8D6BE8] text-white shadow-[2px_2px_0px_#000]'
              : 'hover:bg-hover text-text-secondary'
          }`}
        >
          <UserPlus className="h-4 w-4 stroke-[2.5]" /> Enquiries
        </button>
        <button
          onClick={() => setActivePanel('routines')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-black rounded-lg transition-colors cursor-pointer ${
            activePanel === 'routines'
              ? 'bg-[#FFD633] text-black shadow-[2px_2px_0px_#000]'
              : 'hover:bg-hover text-text-secondary'
          }`}
        >
          <ClipboardList className="h-4 w-4 stroke-[2.5]" /> Routines
        </button>
      </div>

      {/* Enquiries Panel */}
      {activePanel === 'enquiries' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <SectionCard title="New Parent Enquiry" subtitle="Register a new admission enquiry">
            <form onSubmit={handleCreateEnquiry} className="space-y-3 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-text-secondary">Parent Name</label>
                <input
                  type="text"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  required
                  className="w-full px-3 py-2.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover"
                />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary">Child Name</label>
                <input
                  type="text"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  required
                  className="w-full px-3 py-2.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover"
                />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary">Child Age</label>
                <select
                  value={childAge}
                  onChange={(e) => setChildAge(e.target.value)}
                  className="w-full px-3 py-2.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover font-semibold"
                >
                  {[1, 2, 3, 4, 5, 6].map((a) => (
                    <option key={a} value={a}>
                      {a} years
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary">Remarks (optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-3 py-2.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingEnquiry}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-black bg-[#8D6BE8] text-white hover:bg-[#734bd3] active:translate-y-[1px] cursor-pointer font-black text-xs"
              >
                {submittingEnquiry ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 stroke-[3]" />
                )}
                Submit Enquiry
              </button>
            </form>
          </SectionCard>

          {/* Enquiry List */}
          <SectionCard
            title="Enquiry Records"
            subtitle={`${enquiries.length} total`}
            className="lg:col-span-2"
          >
            {enquiriesLoading ? (
              <div className="space-y-3 py-4">
                <div className="skeleton h-16 w-full rounded-xl" />
                <div className="skeleton h-16 w-full rounded-xl" />
              </div>
            ) : enquiries.length === 0 ? (
              <div className="py-12 text-center text-sm font-semibold text-text-secondary">
                No enquiries yet. Submit the first one using the form.
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="p-4 rounded-[14px] border-[2px] border-black dark:border-white bg-card shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-black text-sm text-text-primary block">
                          {enq.childName}
                        </span>
                        <span className="text-[11px] font-semibold text-text-secondary block mt-0.5">
                          Parent: {enq.parentName} · Age: {enq.childAge} yrs ·{' '}
                          {new Date(enq.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border-[2px] ${STATUS_COLORS[enq.status]}`}
                      >
                        {enq.status}
                      </span>
                    </div>
                    {enq.remarks && (
                      <p className="text-xs font-semibold text-text-secondary italic">
                        "{enq.remarks}"
                      </p>
                    )}
                    <div className="flex gap-1.5 pt-1">
                      {['pending', 'contacted', 'admitted', 'rejected']
                        .filter((s) => s !== enq.status)
                        .map((s) => (
                          <button
                            key={s}
                            onClick={() => handleStatusUpdate(enq.id, s)}
                            className="text-[10px] font-black px-2 py-1 rounded-lg border-[2px] border-black dark:border-white bg-card hover:bg-hover active:translate-y-[1px] cursor-pointer capitalize"
                          >
                            → {s}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* Routines Panel */}
      {activePanel === 'routines' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <SectionCard title="Log Daily Routine" subtitle="Record a child's daycare activity">
            <form onSubmit={handleCreateRoutine} className="space-y-3 text-xs font-bold">
              <div className="space-y-1">
                <label className="text-text-secondary">Child Name</label>
                <input
                  type="text"
                  value={routineChild}
                  onChange={(e) => setRoutineChild(e.target.value)}
                  placeholder="e.g. Aarav"
                  required
                  className="w-full px-3 py-2.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover"
                />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary">Routine Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {['meal', 'nap', 'diaper', 'activity'].map((rt) => {
                    const Icon = ROUTINE_ICONS[rt];
                    return (
                      <button
                        key={rt}
                        type="button"
                        onClick={() => setRoutineType(rt)}
                        className={`flex items-center gap-1.5 p-2.5 rounded-lg border-[2px] border-black dark:border-white transition-all duration-100 cursor-pointer capitalize text-xs font-black ${
                          routineType === rt
                            ? 'bg-[#FFD633] text-black shadow-[2px_2px_0px_#000]'
                            : 'bg-card text-text-primary hover:bg-hover'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 stroke-[2.5]" />
                        {rt}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary">Details</label>
                <textarea
                  value={routineDetail}
                  onChange={(e) => setRoutineDetail(e.target.value)}
                  placeholder="e.g. Had lunch at 12:30pm – rice, dal, veggies"
                  rows={3}
                  required
                  className="w-full px-3 py-2.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={submittingRoutine}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-[2px] border-black bg-[#FFD633] text-black hover:bg-[#ffe166] active:translate-y-[1px] cursor-pointer font-black text-xs"
              >
                {submittingRoutine ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 stroke-[3]" />
                )}
                Log Routine
              </button>
            </form>
          </SectionCard>

          {/* Routine Timeline */}
          <SectionCard
            title="Routine Timeline"
            subtitle={`${routines.length} entries`}
            className="lg:col-span-2"
          >
            {routinesLoading ? (
              <div className="space-y-3 py-4">
                <div className="skeleton h-14 w-full rounded-xl" />
                <div className="skeleton h-14 w-full rounded-xl" />
              </div>
            ) : routines.length === 0 ? (
              <div className="py-12 text-center text-sm font-semibold text-text-secondary">
                No routines logged yet. Use the form to record a child's daily activity.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {routines.map((r) => {
                  const Icon = ROUTINE_ICONS[r.routineType] || Activity;
                  const color = ROUTINE_COLORS[r.routineType] || ROUTINE_COLORS.activity;
                  return (
                    <div
                      key={r.id}
                      className="flex items-start gap-3 p-3 rounded-[14px] border-[2px] border-black dark:border-white bg-card"
                    >
                      <div
                        className={`h-9 w-9 rounded-xl flex items-center justify-center border-[2px] border-black dark:border-white flex-shrink-0 ${color}`}
                      >
                        <Icon className="h-4 w-4 stroke-[2.5]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-text-primary">
                            {r.childName}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-wider text-text-muted capitalize">
                            {r.routineType}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-text-secondary mt-0.5 line-clamp-2">
                          {r.detail}
                        </p>
                        <span className="text-[10px] font-semibold text-text-muted mt-1 block">
                          {new Date(r.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}
    </div>
  );
}
