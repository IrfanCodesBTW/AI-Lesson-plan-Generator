import { useState } from 'react';
import { SectionCard } from '../ui/SectionCard';
import { Plus, Trash2, Clock, CheckSquare, Users, Sparkles, Loader2 } from 'lucide-react';
export function QuickControls({ analytics }) {
  const [activeTab, setActiveTab] = useState('hours');
  // Log Hours Form State
  const [hours, setHours] = useState('2');
  const [activityType, setActivityType] = useState('planning');
  const [hoursDate, setHoursDate] = useState(new Date().toISOString().split('T')[0]);
  const [loggingHours, setLoggingHours] = useState(false);
  // Task Form State
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  // Student Metrics Form State
  const [studentName, setStudentName] = useState('Group A');
  const [activityName, setActivityName] = useState('hands-on science activities');
  const [score, setScore] = useState('85');
  const [attendance, setAttendance] = useState('present');
  const [engagement, setEngagement] = useState('5');
  const [loggingStudent, setLoggingStudent] = useState(false);
  const handleLogHours = async (e) => {
    e.preventDefault();
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) return;
    setLoggingHours(true);
    const ok = await analytics.logSession(h, activityType, hoursDate);
    setLoggingHours(false);
    if (ok) {
      setHours('2');
    }
  };
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setAddingTask(true);
    const ok = await analytics.addTask(newTaskTitle.trim());
    setAddingTask(false);
    if (ok) {
      setNewTaskTitle('');
    }
  };
  const handleLogStudent = async (e) => {
    e.preventDefault();
    setLoggingStudent(true);
    const ok = await analytics.logStudentMetrics({
      studentName,
      activityName,
      score: score ? parseInt(score, 10) : undefined,
      attendanceStatus: attendance,
      engagementScore: parseInt(engagement, 10),
      date: new Date().toISOString().split('T')[0],
    });
    setLoggingStudent(false);
    if (ok) {
      setScore('85');
    }
  };
  return (
    <SectionCard
      title="Quick Controls"
      subtitle="Interactive tools to update dashboard state"
      className="border-[#8D6BE8] dark:border-[#8D6BE8]"
    >
      <div className="space-y-4">
        {/* Tab Controls */}
        <div className="flex border-[2px] border-black dark:border-white rounded-xl overflow-hidden bg-[#f7f4ea] dark:bg-zinc-800 p-0.5">
          <button
            onClick={() => setActiveTab('hours')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-black rounded-lg transition-colors ${
              activeTab === 'hours'
                ? 'bg-[#8D6BE8] text-white'
                : 'hover:bg-hover text-text-secondary'
            }`}
          >
            <Clock className="h-3.5 w-3.5" /> Log Hours
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-black rounded-lg transition-colors ${
              activeTab === 'tasks'
                ? 'bg-[#FFD633] text-black'
                : 'hover:bg-hover text-text-secondary'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" /> Tasks
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-black rounded-lg transition-colors ${
              activeTab === 'students'
                ? 'bg-[#F04D3A] text-white'
                : 'hover:bg-hover text-text-secondary'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Students
          </button>
        </div>

        {/* Tab Contents */}
        {activeTab === 'hours' && (
          <form onSubmit={handleLogHours} className="space-y-3 text-xs font-bold">
            <div className="space-y-1">
              <label className="text-text-secondary">Hours Logged</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
                className="w-full px-3 py-2 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary">Activity Type</label>
              <select
                value={activityType}
                onChange={(e) => setActivityType(e.target.value)}
                className="w-full px-3 py-2 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover font-semibold"
              >
                <option value="planning">Planning & Prep</option>
                <option value="teaching">Teaching Sessions</option>
                <option value="grading">Grading & Assessment</option>
                <option value="focus_session">Focus Session</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary">Date</label>
              <input
                type="date"
                value={hoursDate}
                onChange={(e) => setHoursDate(e.target.value)}
                required
                className="w-full px-3 py-2 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover"
              />
            </div>
            <button
              type="submit"
              disabled={loggingHours}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-[2px] border-black bg-[#E7F6EC] text-[#2B8A4D] hover:bg-[#d8f0de] active:translate-y-[1px] cursor-pointer"
            >
              {loggingHours ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              Log Focus Session
            </button>
          </form>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-3">
            {/* Task Add Form */}
            <form onSubmit={handleAddTask} className="flex gap-2 text-xs font-bold">
              <input
                type="text"
                placeholder="New task..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                required
                className="flex-1 px-3 py-2 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover"
              />
              <button
                type="submit"
                disabled={addingTask}
                className="p-2.5 rounded-lg border-[2px] border-black bg-[#FFD633] text-black hover:bg-[#ffe166] active:translate-y-[1px] cursor-pointer"
              >
                {addingTask ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 stroke-[3]" />
                )}
              </button>
            </form>

            {/* Task Checklist */}
            <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1 border-[2px] border-black dark:border-white rounded-xl p-2 bg-[#fffdf5] dark:bg-zinc-900 shadow-inner">
              {analytics.tasks.length === 0 ? (
                <div className="text-center text-text-secondary text-xs py-4">No tasks found</div>
              ) : (
                analytics.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 p-1 text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer font-semibold flex-1 select-none">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => analytics.toggleTask(task.id, e.target.checked)}
                        className="h-4 w-4 accent-[#FFD633] border-[2px] border-black rounded cursor-pointer"
                      />
                      <span
                        className={`${task.completed ? 'line-through text-text-secondary font-medium' : 'text-text-primary'}`}
                      >
                        {task.title}
                      </span>
                    </label>
                    <button
                      onClick={() => analytics.deleteTask(task.id)}
                      className="text-text-secondary hover:text-red-500 cursor-pointer p-0.5 rounded transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <form onSubmit={handleLogStudent} className="space-y-3 text-xs font-bold">
            <div className="space-y-1">
              <label className="text-text-secondary">Student / group Name</label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                className="w-full px-3 py-2 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover"
              />
            </div>
            <div className="space-y-1">
              <label className="text-text-secondary">Activity Name</label>
              <select
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                className="w-full px-3 py-2 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover font-semibold"
              >
                <option value="hands-on science activities">hands-on science activities</option>
                <option value="phonics recognition exercises">phonics recognition exercises</option>
                <option value="alphabet tracing worksheets">alphabet tracing worksheets</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-text-secondary">Score</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full px-2 py-1.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover text-center"
                />
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary">Status</label>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value)}
                  className="w-full px-1 py-1.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover font-semibold"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="tardy">Tardy</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-text-secondary">Engagement</label>
                <select
                  value={engagement}
                  onChange={(e) => setEngagement(e.target.value)}
                  className="w-full px-1.5 py-1.5 border-[2px] border-black dark:border-white rounded-lg bg-card text-text-primary outline-none focus:bg-hover text-center font-semibold"
                >
                  <option value="1">1/5</option>
                  <option value="2">2/5</option>
                  <option value="3">3/5</option>
                  <option value="4">4/5</option>
                  <option value="5">5/5</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              disabled={loggingStudent}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-[2px] border-black bg-[#FFF0E6] text-[#F04D3A] hover:bg-[#ffe5df] active:translate-y-[1px] cursor-pointer"
            >
              {loggingStudent ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Users className="h-4 w-4" />
              )}
              Log Student Metrics
            </button>
          </form>
        )}

        <hr className="border-t-[2px] border-black dark:border-white" />

        {/* Regenerate AI Insights */}
        <button
          onClick={() => analytics.regenerateAIInsights()}
          disabled={analytics.insightsLoading}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border-[2px] border-black bg-card text-text-primary hover:bg-hover active:translate-y-[1px] cursor-pointer font-black text-xs"
        >
          {analytics.insightsLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5 text-[#8D6BE8] stroke-[2.5]" />
          )}
          Regenerate AI Insights
        </button>
      </div>
    </SectionCard>
  );
}
