import { QuickControls } from './QuickControls';
import { SectionCard } from '../ui/SectionCard';
import { BarChart } from '../ui/BarChart';
import { MetricCard } from '../ui/MetricCard';
export function TrackerTab({ analytics }) {
  const weeklyData = analytics.metrics?.trends
    ? analytics.metrics.trends.map((t) => ({ label: t.day, value: t.hours }))
    : [];
  const totalHours = analytics.metrics?.summary?.totalHours ?? 0;
  const percentageChange = analytics.metrics?.summary?.percentageChange ?? 0;
  const completionRate = analytics.metrics?.kpis?.completionRate ?? 0;
  const totalTasks = analytics.metrics?.kpis?.totalTasks ?? 0;
  const completedTasks = analytics.metrics?.kpis?.completedTasks ?? 0;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-black font-heading text-text-primary">
          Time Tracker & Task Manager
        </h1>
        <p className="text-sm font-semibold text-text-secondary">
          Log focus sessions, track tasks, and monitor student engagement data.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Focus Hours"
          value={`${totalHours}h`}
          trend={`${percentageChange >= 0 ? '+' : ''}${percentageChange}%`}
          subtitle="vs previous period"
          variant="yellow"
        />
        <MetricCard
          title="Tasks Completed"
          value={`${completedTasks}/${totalTasks}`}
          trend={`${completionRate}%`}
          subtitle="completion rate"
          variant="red"
        />
        <MetricCard
          title="Attendance Rate"
          value={`${analytics.metrics?.kpis?.attendanceRate ?? 100}%`}
          trend="+2%"
          subtitle="vs last week"
          variant="blue"
        />
        <MetricCard
          title="Engagement"
          value={`${analytics.metrics?.kpis?.engagementRate ?? 92}%`}
          trend="+1%"
          subtitle="avg score"
          variant="yellow"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Trends Chart */}
        <SectionCard title="Weekly Focus Trends" subtitle="Hours logged per day">
          {analytics.loading ? (
            <div className="space-y-3 py-4">
              <div className="skeleton h-32 w-full rounded-xl" />
            </div>
          ) : weeklyData.length > 0 ? (
            <BarChart data={weeklyData} height={180} />
          ) : (
            <div className="py-12 text-center text-sm font-semibold text-text-secondary">
              No focus data yet. Use the Quick Controls panel to log sessions.
            </div>
          )}
        </SectionCard>

        {/* Quick Controls Panel */}
        <QuickControls analytics={analytics} />
      </div>

      {/* Error State */}
      {analytics.error && (
        <div className="p-4 rounded-[16px] border-[3px] border-red-500 bg-red-50 dark:bg-red-950/20 text-sm font-bold text-red-600">
          {analytics.error}
        </div>
      )}
    </div>
  );
}
