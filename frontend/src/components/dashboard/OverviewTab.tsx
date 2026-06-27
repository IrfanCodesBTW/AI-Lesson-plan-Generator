import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UseLessonsResult } from '../../hooks/useLessons';
import { UseAnalyticsResult } from '../../hooks/useAnalytics';
import { MetricCard } from '../ui/MetricCard';
import { BarChart } from '../ui/BarChart';
import { InsightCard } from '../ui/InsightCard';
import { QuickGenerateCard } from '../ui/QuickGenerateCard';
import { SectionCard } from '../ui/SectionCard';
import { StatusBadge } from '../ui/StatusBadge';
import { QuickControls } from './QuickControls';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingDown, BookOpen } from 'lucide-react';

interface OverviewTabProps {
  lessons: UseLessonsResult;
  analytics: UseAnalyticsResult;
}

export function OverviewTab({ lessons, analytics }: OverviewTabProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getLessonsThisWeek = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return lessons.items.filter((item) => new Date(item.createdAt) >= oneWeekAgo).length;
  };

  // Use real data from analytics when available, fall back to static data
  const weeklyData = analytics.metrics?.trends
    ? analytics.metrics.trends.map((t) => ({ label: t.day, value: t.hours }))
    : [
        { label: 'Sun', value: 2 },
        { label: 'Mon', value: 5 },
        { label: 'Tue', value: 4 },
        { label: 'Wed', value: 8 },
        { label: 'Thu', value: 6 },
        { label: 'Fri', value: 7 },
        { label: 'Sat', value: 3 },
      ];

  const totalHours = analytics.metrics?.summary?.totalHours ?? 12;
  const percentageChange = analytics.metrics?.summary?.percentageChange ?? 10;
  const completionRate = analytics.metrics?.kpis?.completionRate ?? 0;
  const engagementRate = analytics.metrics?.kpis?.engagementRate ?? 92;

  // Use real insights from analytics if available
  const insightItems = analytics.insights.length > 0 ? analytics.insights : null; // null means show default static insights

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black font-heading text-text-primary">
          Hello, {user?.name || 'Teacher'}
        </h1>
        <p className="text-sm font-semibold text-text-secondary">
          Monitor your AI-powered lesson planning and classroom insights in real time.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Lessons"
              value={analytics.metrics?.kpis?.totalLessonsCount ?? lessons.total}
              trend="+12%"
              subtitle="vs last month"
              variant="yellow"
            />
            <MetricCard
              title="Lessons This Week"
              value={getLessonsThisWeek() || 18}
              trend="+5%"
              subtitle="vs last week"
              variant="red"
            />
            <MetricCard
              title="AI Accuracy"
              value={`${engagementRate}%`}
              trend="+1%"
              subtitle="vs last week"
              variant="blue"
            />
          </div>

          {/* Weekly Planning Trends */}
          <SectionCard
            title="Weekly Planning Trends"
            subtitle="Daily Focus hours"
            headerRight={
              <span className="text-xs font-black rounded-xl border-[2px] border-black bg-card text-text-primary px-3 py-1.5 cursor-pointer active:translate-y-[1px]">
                Week ▾
              </span>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Summary Stats Box */}
              <div className="border-[3px] border-black dark:border-white rounded-[16px] p-4 bg-[#fffdf5] dark:bg-zinc-900 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff] space-y-2">
                <div className="text-4xl font-black font-heading text-text-primary">
                  {totalHours} h
                </div>
                <div className="text-xs font-black uppercase tracking-wider text-text-secondary">
                  logged this week
                </div>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-black rounded-full px-2 py-0.5 border-[2px] border-black ${percentageChange >= 0 ? 'bg-[#E7F6EC] text-[#2B8A4D]' : 'bg-red-50 text-red-600'}`}
                >
                  {percentageChange >= 0 ? '+' : ''}
                  {percentageChange}% vs last week
                </span>
              </div>
              <div className="md:col-span-2">
                <BarChart data={weeklyData} height={130} />
              </div>
            </div>
          </SectionCard>

          {/* Recent Lesson Plans Table */}
          <SectionCard
            title="Recent Lesson Plans"
            headerRight={
              <button
                onClick={() => navigate('/dashboard?tab=library')}
                className="text-xs font-black hover:underline cursor-pointer text-primary-500"
              >
                View All Library →
              </button>
            }
          >
            {lessons.loading ? (
              <div className="space-y-3 py-4">
                <div className="skeleton h-12 w-full rounded-xl" />
                <div className="skeleton h-12 w-full rounded-xl" />
              </div>
            ) : lessons.items.length === 0 ? (
              <div className="py-8 text-center text-sm font-semibold text-text-secondary">
                No lessons yet
              </div>
            ) : (
              <div className="overflow-x-auto border-[3px] border-black dark:border-white rounded-[16px] bg-card">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider font-black border-b-[3px] border-black dark:border-white bg-[#f7f4ea] dark:bg-zinc-800">
                      <th className="py-3.5 px-4 font-black">Plan Title</th>
                      <th className="py-3.5 px-4 font-black">Date</th>
                      <th className="py-3.5 px-4 font-black">Status</th>
                      <th className="py-3.5 px-4 font-black text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.items.slice(0, 3).map((lesson, idx) => {
                      const dateStr = new Date(lesson.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });
                      const isLast = idx === Math.min(lessons.items.length, 3) - 1;

                      const displayTitle = lesson.theme;
                      const displayStatus = lesson.source === 'gemini' ? 'generated' : 'reviewed';
                      const displayDate = dateStr;

                      return (
                        <tr
                          key={lesson.id}
                          className={`transition-colors hover:bg-hover ${!isLast ? 'border-b-[2px] border-black dark:border-white' : ''}`}
                        >
                          <td className="py-3.5 px-4">
                            <Link
                              to={`/lessons/${lesson.id}`}
                              className="font-black hover:underline text-text-primary"
                            >
                              {displayTitle}
                            </Link>
                            <span className="block text-[11px] font-semibold text-text-secondary mt-0.5">
                              Ages {lesson.ageGroup}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-text-secondary">
                            {displayDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <StatusBadge status={displayStatus} />
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link
                              to={`/lessons/${lesson.id}`}
                              className="text-xs font-black text-primary-500 hover:underline"
                            >
                              {displayStatus === 'reviewed' ? 'View' : 'Edit/View'}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Sidebar Column */}
        <div className="space-y-6">
          {/* Quick Generate CTA */}
          <QuickGenerateCard />

          {/* Quick Controls - Task & Focus Tracker */}
          <QuickControls analytics={analytics} />

          {/* AI Insights */}
          <SectionCard title="AI Insights" subtitle="Real-time suggestions">
            <div className="space-y-3">
              {insightItems ? (
                insightItems.slice(0, 3).map((insight) => {
                  const iconMap: Record<
                    string,
                    { icon: typeof Sparkles; iconBg: string; iconColor: string }
                  > = {
                    classroom_engagement: {
                      icon: Sparkles,
                      iconBg: 'bg-[#f4f0ff]',
                      iconColor: 'text-[#8D6BE8]',
                    },
                    learning_gaps: {
                      icon: TrendingDown,
                      iconBg: 'bg-[#fff9e0]',
                      iconColor: 'text-[#E6BD19]',
                    },
                    resource_suggestions: {
                      icon: BookOpen,
                      iconBg: 'bg-[#e7f6ec]',
                      iconColor: 'text-[#3BAA63]',
                    },
                  };
                  const visual = iconMap[insight.type] || iconMap.classroom_engagement;
                  return (
                    <InsightCard
                      key={insight.id}
                      title={insight.title}
                      description={insight.description}
                      icon={visual.icon}
                      iconBg={visual.iconBg}
                      iconColor={visual.iconColor}
                    />
                  );
                })
              ) : (
                <>
                  <InsightCard
                    title="Classroom Engagement"
                    description="Increased engagement observed during hands-on activities."
                    icon={Sparkles}
                    iconBg="bg-[#f4f0ff]"
                    iconColor="text-[#8D6BE8]"
                  />
                  <InsightCard
                    title="Learning Gaps & Support"
                    description="Identify students needing extra support in letter recognition."
                    icon={TrendingDown}
                    iconBg="bg-[#fff9e0]"
                    iconColor="text-[#E6BD19]"
                    linkText="View Details"
                  />
                  <InsightCard
                    title="Resource Suggestions"
                    description="New printable resources recommended for next week's theme."
                    icon={BookOpen}
                    iconBg="bg-[#e7f6ec]"
                    iconColor="text-[#3BAA63]"
                    linkText="View Details"
                  />
                </>
              )}
            </div>
          </SectionCard>

          {/* API Environment Status */}
          <SectionCard title="API Environment">
            <div className="space-y-3 text-xs font-semibold">
              <div className="flex justify-between py-2 border-b-[2px] border-black dark:border-white">
                <span className="text-text-secondary">Service Status</span>
                <span className="font-black text-[#3BAA63]">Online</span>
              </div>
              <div className="flex justify-between py-2 border-b-[2px] border-black dark:border-white">
                <span className="text-text-secondary">Generation Mode</span>
                <span className="font-black text-text-primary">Gemini (primary)</span>
              </div>
              <div className="flex justify-between py-2 border-b-[2px] border-black dark:border-white">
                <span className="text-text-secondary">Task Completion</span>
                <span className="font-black text-text-primary">{completionRate}%</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-secondary">API Version</span>
                <span className="font-mono font-black text-text-secondary">v0.1.0</span>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
