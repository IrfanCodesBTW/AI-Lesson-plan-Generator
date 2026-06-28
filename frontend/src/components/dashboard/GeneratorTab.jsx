import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AGE_GROUPS, THEMES } from '../../lib/api';
import { SectionCard } from '../ui/SectionCard';
import { Sparkles, Check, ChevronRight, ChevronLeft } from 'lucide-react';
const themeIcons = {
  Animals: '🦁',
  Colors: '🎨',
  'Numbers & Counting': '🔢',
  'Family & Friends': '👨‍👩‍👧',
  'Seasons & Weather': '🌤️',
  'Plants & Gardens': '🌻',
  'Transport & Vehicles': '🚗',
  'Water & Bubbles': '💧',
  Shapes: '🔷',
  'My Body': '🦴',
};
export function GeneratorTab({ lessons }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState('4-5');
  const [theme, setTheme] = useState('Animals');
  async function handleGenerate(e) {
    e?.preventDefault();
    const lesson = await lessons.generate({ ageGroup: age, theme });
    if (lesson) navigate(`/lessons/${lesson.id}`);
  }
  const steps = [
    { num: 1, label: 'Age Group' },
    { num: 2, label: 'Theme' },
    { num: 3, label: 'Generate' },
  ];
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="space-y-1">
        <h1 className="text-3xl font-black font-heading text-text-primary">
          AI Lesson Plan Generator
        </h1>
        <p className="text-sm font-semibold text-text-secondary">
          Prompt Gemini to construct step-by-step activity designs tailored by age bands.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex flex-wrap items-center justify-center gap-2 py-4 select-none">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black border-[2px] border-black dark:border-white transition-all duration-150 ${
                step === s.num
                  ? 'bg-[#8D6BE8] text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]'
                  : step > s.num
                    ? 'bg-[#3BAA63] text-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff]'
                    : 'bg-card text-text-secondary'
              }`}
            >
              {step > s.num ? (
                <Check className="h-4 w-4 stroke-[3]" />
              ) : (
                <span className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-black">
                  {s.num}
                </span>
              )}
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-[3px] mx-1 ${step > s.num ? 'bg-[#3BAA63]' : 'bg-black dark:bg-white'}`}
              />
            )}
          </div>
        ))}
      </div>

      <SectionCard title="">
        <form onSubmit={handleGenerate}>
          {/* Step 1: Age Group */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-black font-heading text-text-primary">
                Select Age Group
              </h3>
              <p className="text-sm font-semibold text-text-secondary">
                Choose the age range for your students.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {AGE_GROUPS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAge(a)}
                    className={`p-4 rounded-[16px] border-[3px] border-black dark:border-white text-left transition-all duration-150 cursor-pointer active:translate-y-[1px] ${
                      age === a
                        ? 'bg-[#FFD633] text-black shadow-[3px_3px_0px_#000]'
                        : 'bg-card text-text-primary hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_#000] dark:hover:shadow-[3px_3px_0px_#fff]'
                    }`}
                  >
                    <span className="text-lg font-black block">Ages {a}</span>
                    <span className="block text-xs font-semibold text-text-secondary mt-1">
                      Years old
                    </span>
                    {age === a && (
                      <div className="mt-2.5">
                        <span className="badge-primary !text-black !bg-[#FFD633]">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight className="h-4 w-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Theme */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <h3 className="text-xl font-black font-heading text-text-primary">Select Theme</h3>
              <p className="text-sm font-semibold text-text-secondary">
                Pick a curriculum theme for the lesson.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTheme(t)}
                    className={`p-4 rounded-[16px] border-[3px] border-black dark:border-white text-left transition-all duration-150 cursor-pointer active:translate-y-[1px] ${
                      theme === t
                        ? 'bg-[#8D6BE8] text-white shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]'
                        : 'bg-card text-text-primary hover:translate-y-[-2px] hover:shadow-[3px_3px_0px_#000] dark:hover:shadow-[3px_3px_0px_#fff]'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{themeIcons[t] || '📚'}</span>
                    <span className="text-sm font-black">{t}</span>
                    {theme === t && (
                      <div className="mt-2.5">
                        <span className="badge-primary !text-white !bg-[#8D6BE8]">Selected</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4 stroke-[3]" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight className="h-4 w-4 stroke-[3]" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Generate */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-black font-heading text-text-primary">
                Review & Generate
              </h3>
              <p className="text-sm font-semibold text-text-secondary">
                Confirm your selections and generate the lesson plan.
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-[16px] border-[3px] border-black dark:border-white bg-[#fffdf5] dark:bg-zinc-900 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]">
                  <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                    Age Group
                  </span>
                  <span className="block text-lg font-black font-heading mt-1 text-text-primary">
                    Ages {age} Years
                  </span>
                </div>
                <div className="p-4 rounded-[16px] border-[3px] border-black dark:border-white bg-[#fffdf5] dark:bg-zinc-900 shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]">
                  <span className="text-xs font-black uppercase tracking-wider text-text-secondary">
                    Theme
                  </span>
                  <span className="block text-lg font-black font-heading mt-1 text-text-primary">
                    {themeIcons[theme]} {theme}
                  </span>
                </div>
              </div>

              {lessons.error && (
                <div
                  role="alert"
                  className="rounded-[16px] px-4 py-3 text-sm font-semibold border-[3px] border-black bg-red-100 text-red-700"
                >
                  {lessons.error}
                </div>
              )}

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4 stroke-[3]" /> Back
                </button>
                <button
                  type="submit"
                  className="btn-primary px-8 py-3 flex items-center gap-2 text-base h-12"
                  disabled={lessons.generating}
                >
                  {lessons.generating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Constructing Curriculum Plan…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 stroke-[2.5]" />
                      Build Lesson Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </SectionCard>
    </div>
  );
}
