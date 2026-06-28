import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
const templatePresets = [
  {
    theme: 'Animals',
    age: '3-4',
    description: 'Learn about wild and domestic animals through rhymes and play.',
    icon: '🦁',
  },
  {
    theme: 'Colors',
    age: '2-3',
    description: 'Introduce primary colors using shapes and classroom objects.',
    icon: '🎨',
  },
  {
    theme: 'Shapes',
    age: '4-5',
    description: 'Explore geometry through blocks, drawings, and visual exercises.',
    icon: '🔷',
  },
  {
    theme: 'Seasons & Weather',
    age: '5-6',
    description: 'Analyze atmospheric changes and clothing adaptations.',
    icon: '🌤️',
  },
];
export function TemplatesTab({ lessons }) {
  const navigate = useNavigate();
  async function handleQuickGenerate(quickAge, quickTheme) {
    const lesson = await lessons.generate({ ageGroup: quickAge, theme: quickTheme });
    if (lesson) navigate(`/lessons/${lesson.id}`);
  }
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h2 className="text-h2 font-bold" style={{ color: 'var(--color-text-primary)' }}>
          Pre-authored Templates
        </h2>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Select a pre-configured age group and theme to generate the lesson plan immediately.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templatePresets.map((preset) => (
          <div
            key={preset.theme}
            className="flex flex-col justify-between p-6 rounded-[20px] border-[4px] border-black dark:border-white bg-card shadow-card hover:translate-y-[-2px] hover:shadow-card-hover transition-all duration-150 group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#8D6BE8]">
                  Ages {preset.age} Years
                </span>
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border-[2px] border-black dark:border-white bg-[#f7f4ea] text-black shadow-[1px_1px_0px_#000]">
                  Preset
                </span>
              </div>
              <div className="text-3xl">{preset.icon}</div>
              <h3 className="text-lg font-black font-heading text-text-primary">{preset.theme}</h3>
              <p className="text-xs font-semibold leading-relaxed line-clamp-2 text-text-secondary">
                {preset.description}
              </p>
            </div>
            <button
              onClick={() => void handleQuickGenerate(preset.age, preset.theme)}
              disabled={lessons.generating}
              className="btn-secondary w-full text-xs font-black py-2.5 mt-4 flex items-center justify-center gap-1.5 cursor-pointer h-10"
            >
              {lessons.generating ? (
                <>
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-t-transparent border-black" />
                  Processing…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" />
                  Generate Preset
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
