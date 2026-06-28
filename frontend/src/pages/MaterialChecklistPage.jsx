import { useEffect, useState } from 'react';
import { fetchMaterialRequirements } from '../lib/api';
import { PageHeader } from '../components/ui/PageHeader';
import { Search } from 'lucide-react';
export function MaterialChecklistPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTheme, setSearchTheme] = useState('');
  const loadData = async (theme) => {
    setLoading(true);
    try {
      const data = await fetchMaterialRequirements(theme);
      setMaterials(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadData();
  }, []);
  const handleSearch = (e) => {
    e.preventDefault();
    loadData(searchTheme || undefined);
  };
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Material Checklist"
        subtitle="Aggregate materials from lesson plans across themes"
      />

      <form onSubmit={handleSearch} className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={searchTheme}
            onChange={(e) => setSearchTheme(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-xl font-bold"
            placeholder="Search by theme to filter materials..."
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-black text-white font-bold rounded-xl border-2 border-black hover:bg-gray-800"
        >
          Filter
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="bg-white dark:bg-gray-900 border-2 border-black rounded-2xl overflow-hidden">
          <div className="p-4 border-b-2 border-black bg-gray-50 dark:bg-gray-800">
            <h3 className="font-black text-lg">Aggregated Materials List</h3>
          </div>
          <div className="p-4">
            {materials.length === 0 ? (
              <p className="text-gray-500">No materials found for the selected criteria.</p>
            ) : (
              <ul className="space-y-3">
                {materials.map((mat, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 border-2 border-black rounded cursor-pointer"
                    />
                    <span className="font-medium text-lg">{mat}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
