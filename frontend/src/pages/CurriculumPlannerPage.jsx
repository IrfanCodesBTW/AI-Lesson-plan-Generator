import { useEffect, useState } from 'react';
import { fetchCurriculumMapping, createCurriculum } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Plus } from 'lucide-react';
export function CurriculumPlannerPage() {
  const [mapping, setMapping] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [theme, setTheme] = useState('');
  const [week, setWeek] = useState(1);
  const [details, setDetails] = useState('');
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchCurriculumMapping();
      setMapping(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCurriculum({ theme, week_number: week, details });
      setShowForm(false);
      setTheme('');
      setDetails('');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <PageHeader
          title="Curriculum Planner"
          subtitle="Manage monthly themes and weekly activities"
        />
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Activity
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white dark:bg-gray-900 border-2 border-black rounded-2xl space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Theme</label>
              <input
                required
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full p-2 border-2 border-black rounded-xl"
                placeholder="e.g. Animals"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Week Number</label>
              <input
                required
                type="number"
                min={1}
                max={52}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                className="w-full p-2 border-2 border-black rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold mb-1">Details/Activities</label>
            <textarea
              required
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full p-2 border-2 border-black rounded-xl"
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-[#8d6be8] text-white font-bold rounded-xl border-2 border-black hover:bg-[#734bd3]"
          >
            Save Activity
          </button>
        </form>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {mapping.length === 0 && (
            <p className="text-gray-500 font-bold">No curriculum activities found.</p>
          )}
          {mapping.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-gray-800 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-black text-lg">
                  {item.theme} <span className="text-[#8d6be8] ml-2">Week {item.week_number}</span>
                </h3>
              </div>
              <p className="whitespace-pre-wrap">{item.details}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
