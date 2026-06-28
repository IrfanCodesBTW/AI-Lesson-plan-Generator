import { useAuth } from '../../hooks/useAuth';
import { SectionCard } from '../ui/SectionCard';
export function SettingsTab() {
  const { user } = useAuth();
  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <SectionCard title="Teacher Account Settings">
        <div className="space-y-5 text-sm">
          <div>
            <label className="label" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              className="input max-w-md"
              defaultValue={user?.name}
              disabled
            />
          </div>

          <div>
            <label className="label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="input max-w-md"
              defaultValue={user?.email}
              disabled
            />
          </div>

          <div className="pt-2">
            <span className="block text-xs font-black uppercase tracking-wider mb-2 text-text-secondary">
              Environment API Token Configuration
            </span>
            <p className="text-xs font-semibold leading-relaxed text-text-secondary">
              Your API request environment uses the credentials configured in the server&apos;s
              `.env` setup. To modify Gemini models or timeout thresholds, consult your
              administrator.
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
