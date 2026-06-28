import { SectionCard } from '../ui/SectionCard';
import { Sparkles, Layers } from 'lucide-react';
export function AnalyticsTab({ lessons }) {
  const getAiCount = () => {
    return lessons.items.filter((item) => item.source === 'gemini').length;
  };
  const aiPercentage = lessons.total > 0 ? (getAiCount() / lessons.total) * 100 : 0;
  const templatePercentage = lessons.total > 0 ? 100 - aiPercentage : 0;
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* AI Generation Distribution */}
        <SectionCard
          title="AI Generation Distribution"
          subtitle="Visual breakdown of your curriculum sources"
          className="md:col-span-2"
        >
          <div className="space-y-6">
            {/* AI Generated Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black">
                <span className="flex items-center gap-1 text-[#8D6BE8]">
                  <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" /> AI Generated (Gemini)
                </span>
                <span className="text-text-secondary">
                  {getAiCount()} / {lessons.total} Plans ({Math.round(aiPercentage)}%)
                </span>
              </div>
              <div className="w-full rounded-full h-6 overflow-hidden border-[3px] border-black dark:border-white bg-[#f7f4ea] dark:bg-zinc-900 shadow-[1px_1px_0px_#000] dark:shadow-[1px_1px_0px_#fff]">
                <div
                  className={`h-full transition-all duration-700 ease-out bg-[#8D6BE8] ${aiPercentage > 0 ? 'border-r-[3px] border-black dark:border-white' : ''}`}
                  style={{
                    width: `${aiPercentage}%`,
                  }}
                />
              </div>
            </div>

            {/* Template Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-black">
                <span className="flex items-center gap-1 text-[#E6BD19]">
                  <Layers className="h-3.5 w-3.5 stroke-[2.5]" /> Local Backup Templates
                </span>
                <span className="text-text-secondary">
                  {lessons.total - getAiCount()} / {lessons.total} Plans (
                  {Math.round(templatePercentage)}%)
                </span>
              </div>
              <div className="w-full rounded-full h-6 overflow-hidden border-[3px] border-black dark:border-white bg-[#f7f4ea] dark:bg-zinc-900 shadow-[1px_1px_0px_#000] dark:shadow-[1px_1px_0px_#fff]">
                <div
                  className={`h-full transition-all duration-700 ease-out bg-[#FFD633] ${templatePercentage > 0 ? 'border-r-[3px] border-black dark:border-white' : ''}`}
                  style={{
                    width: `${templatePercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Weekly Summary */}
        <SectionCard title="Weekly Summary">
          <div className="space-y-4 text-xs font-semibold">
            <div className="flex justify-between py-2 border-b-[2px] border-black dark:border-white">
              <span className="text-text-secondary">Total Plans Created</span>
              <span className="font-black text-text-primary">{lessons.total}</span>
            </div>
            <div className="flex justify-between py-2 border-b-[2px] border-black dark:border-white">
              <span className="text-text-secondary">Exports Active</span>
              <span className="font-black text-text-primary">
                {parseInt(localStorage.getItem('export_count') || '0', 10)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-text-secondary">Active Age Bands</span>
              <span className="font-black text-text-primary">4 Bands (Ages 2-6)</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
