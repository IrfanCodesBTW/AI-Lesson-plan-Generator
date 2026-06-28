import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useLessons } from '../hooks/useLessons';
import { useAnalytics } from '../hooks/useAnalytics';
import { OverviewTab } from '../components/dashboard/OverviewTab';
import { GeneratorTab } from '../components/dashboard/GeneratorTab';
import { LibraryTab } from '../components/dashboard/LibraryTab';
import { AnalyticsTab } from '../components/dashboard/AnalyticsTab';
import { TemplatesTab } from '../components/dashboard/TemplatesTab';
import { ResourcesTab } from '../components/dashboard/ResourcesTab';
import { SettingsTab } from '../components/dashboard/SettingsTab';
import { TrackerTab } from '../components/dashboard/TrackerTab';
import { OperationsTab } from '../components/dashboard/OperationsTab';
import { Header } from '../components/Header';
export function DashboardPage() {
  const location = useLocation();
  const lessons = useLessons();
  const analytics = useAnalytics();
  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';
  useEffect(() => {
    void lessons.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const renderTab = () => {
    switch (currentTab) {
      case 'generator':
        return <GeneratorTab lessons={lessons} />;
      case 'library':
        return <LibraryTab lessons={lessons} />;
      case 'analytics':
        return <AnalyticsTab lessons={lessons} />;
      case 'templates':
        return <TemplatesTab lessons={lessons} />;
      case 'resources':
        return <ResourcesTab />;
      case 'settings':
        return <SettingsTab />;
      case 'tracker':
        return <TrackerTab analytics={analytics} />;
      case 'operations':
        return <OperationsTab />;
      default:
        return <OverviewTab lessons={lessons} analytics={analytics} />;
    }
  };
  return (
    <div className="space-y-2">
      <Header />
      {renderTab()}
    </div>
  );
}
