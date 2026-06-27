import { useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ui/ThemeToggle';
import {
  LayoutDashboard,
  Sparkles,
  BookOpen,
  BarChart3,
  FolderHeart,
  Settings,
  LogOut,
  Menu,
  X,
  Clock,
  Library,
  HelpCircle,
  Building,
} from 'lucide-react';

interface SidebarLayoutProps {
  children: ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const currentTab = searchParams.get('tab') || 'overview';
  const isLessonDetailPage = location.pathname.startsWith('/lessons/');

  const mainNavItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard?tab=overview' },
    { id: 'generator', label: 'Generator', icon: Sparkles, path: '/dashboard?tab=generator' },
    { id: 'library', label: 'My Lessons', icon: BookOpen, path: '/dashboard?tab=library' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/dashboard?tab=analytics' },
    { id: 'templates', label: 'Templates', icon: FolderHeart, path: '/dashboard?tab=templates' },
    {
      id: 'operations',
      label: 'Centre Operations',
      icon: Building,
      path: '/dashboard?tab=operations',
    },
  ];

  const toolNavItems = [
    { id: 'tracker', label: 'Time Tracker', icon: Clock, path: '/dashboard?tab=tracker' },
    {
      id: 'resources',
      label: 'Resource Library',
      icon: Library,
      path: '/dashboard?tab=resources',
    },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/dashboard?tab=settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (itemId: string) => {
    if (isLessonDetailPage) return itemId === 'library';
    return currentTab === itemId && location.pathname === '/dashboard';
  };

  const NavItem = ({ item }: { item: (typeof mainNavItems)[0] }) => {
    const ActiveIcon = item.icon;
    const active = isActive(item.id);
    return (
      <Link
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-black rounded-[14px] transition-all duration-150 cursor-pointer select-none group border-[3px] ${
          active
            ? 'bg-white text-black border-black shadow-[2px_2px_0px_#000] dark:bg-black dark:text-white dark:border-white dark:shadow-[2px_2px_0px_#fff]'
            : 'bg-transparent text-text-secondary border-transparent hover:border-black dark:hover:border-white hover:bg-hover hover:text-text-primary'
        }`}
      >
        <ActiveIcon
          className={`h-[18px] w-[18px] transition-colors duration-150 stroke-[2.5] ${
            active ? 'text-black dark:text-white' : 'text-text-muted group-hover:text-text-primary'
          }`}
        />
        <span>{item.label}</span>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col overflow-hidden border-r-[4px] border-black dark:border-white bg-[#f7f4ea] dark:bg-[#1a1a1a]">
      <div className="flex-1 flex flex-col justify-between px-4 py-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Brand / Logo */}
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <img
              src="/logo.png"
              className="h-11 w-11 rounded-full border-[3px] border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] object-cover bg-white"
              alt="AI Plan Lesson Generator Logo"
            />
            <div>
              <span className="block text-base font-black font-heading tracking-tight leading-none text-text-primary">
                AI Plan Lesson
                <br />
                Generator
              </span>
            </div>
          </Link>

          <div className="border-t-[3px] border-black dark:border-white my-3 -mx-4" />

          {/* Main Navigation */}
          <nav aria-label="Main navigation" className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-widest px-3 mb-2 text-text-muted">
              Main
            </span>
            {mainNavItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>

          {/* Tools Navigation */}
          <nav aria-label="Tools navigation" className="space-y-1">
            <span className="block text-[10px] font-black uppercase tracking-widest px-3 mb-2 text-text-muted">
              Tools
            </span>
            {toolNavItems.map((item) => (
              <NavItem key={item.id} item={item} />
            ))}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="space-y-3 pt-4">
          {/* Help Card */}
          <div className="rounded-[20px] p-4 text-center space-y-3 border-[3px] border-black dark:border-white bg-card shadow-[3px_3px_0px_#000] dark:shadow-[3px_3px_0px_#fff]">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-[2px] border-black bg-[#f4f0ff] text-[#8d6be8]">
              <HelpCircle className="h-5 w-5 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs font-black text-text-primary">Need help?</p>
              <p className="text-[11px] font-bold mt-0.5 text-text-secondary">
                Feel free to contact us
              </p>
            </div>
            <button className="w-full rounded-xl py-2 text-xs font-black text-white border-[2px] border-black bg-[#8d6be8] hover:bg-[#734bd3] transition-colors cursor-pointer active:translate-y-[1px]">
              Get support
            </button>
          </div>

          {/* Theme Toggle & User Section */}
          <div className="pt-3 border-t-[3px] border-black dark:border-white">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <span className="text-xs font-black text-text-secondary uppercase tracking-wide">
                Theme
              </span>
              <ThemeToggle />
            </div>

            {/* User Card */}
            {user && (
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border-[2px] border-black dark:border-white bg-card shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] mb-2">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-white border-[2px] border-black bg-[#8d6be8] text-sm font-black flex-shrink-0">
                  {user.name?.charAt(0)?.toUpperCase() || 'T'}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-sm font-black truncate leading-tight text-text-primary">
                    {user.name}
                  </span>
                  <span className="block text-[11px] font-semibold truncate mt-0.5 text-text-muted">
                    {user.email}
                  </span>
                </div>
              </div>
            )}

            {/* Sign Out */}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-black rounded-xl border-[2px] border-transparent transition-all duration-150 cursor-pointer select-none text-text-secondary hover:text-red-500 hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <LogOut className="h-4 w-4 stroke-[2.5]" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-canvas text-text-primary">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-20 md:block md:w-[280px]">
        <SidebarContent />
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col md:pl-[280px] relative overflow-hidden">
        {/* Mobile Navbar Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between px-4 md:hidden border-b-[4px] border-black dark:border-white bg-[#f7f4ea] dark:bg-[#1a1a1a]">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img
              src="/logo.png"
              className="h-8 w-8 rounded-full border-[2px] border-black dark:border-white shadow-[1.5px_1.5px_0px_#000] dark:shadow-[1.5px_1.5px_0px_#fff] object-cover bg-white"
              alt="AI Plan Lesson Generator Logo"
            />
            <span className="text-sm font-black font-heading tracking-tight text-text-primary">
              AI Plan Lesson Generator
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-xl p-2 border-[2px] border-black dark:border-white bg-card text-text-primary cursor-pointer transition-colors active:translate-y-[1px]"
            >
              <Menu className="h-5 w-5 stroke-[2.5]" />
            </button>
          </div>
        </header>

        {/* Mobile Drawer (Overlay) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex w-full max-w-xs flex-1 flex-col border-r-[4px] border-black bg-[#f7f4ea] dark:bg-[#1a1a1a]">
              <div className="absolute right-4 top-4 z-10">
                <button
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close navigation menu"
                  className="rounded-xl p-2 border-[2px] border-black bg-card text-text-primary cursor-pointer transition-colors active:translate-y-[1px]"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="mx-auto w-full max-w-[1440px] px-6 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
