import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { fetchHealth } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import {
  GraduationCap,
  Sparkles,
  Activity,
  ArrowRight,
  CheckCircle,
  BarChart3,
  FileText,
  Zap,
} from 'lucide-react';
function useIntersectionObserver(threshold = 0.1) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}
function AnimatedCounter({ end, suffix = '' }) {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useIntersectionObserver();
  useEffect(() => {
    if (!isVisible) return;
    let current = 0;
    const steps = 40;
    const increment = end / steps;
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [end, isVisible]);
  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
export function HomePage() {
  const { user } = useAuth();
  const [health, setHealth] = useState({
    loading: true,
    ok: null,
    gemini: null,
    error: null,
  });
  const featuresSection = useIntersectionObserver(0.1);
  const statsSection = useIntersectionObserver(0.1);
  useEffect(() => {
    let cancelled = false;
    fetchHealth()
      .then((res) => {
        if (cancelled) return;
        setHealth({ loading: false, ok: res.ok, gemini: res.gemini, error: null });
      })
      .catch((err) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        setHealth({ loading: false, ok: false, gemini: null, error: message });
      });
    return () => {
      cancelled = true;
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f7f4ea] dark:bg-[#1a1a1a] text-text-primary">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b-[4px] border-black dark:border-white bg-[#f7f4ea] dark:bg-[#1a1a1a]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 active:scale-[0.98]">
            <img
              src="/logo.png"
              className="h-10 w-10 rounded-full border-[3px] border-black dark:border-white shadow-[2px_2px_0px_#000] dark:shadow-[2px_2px_0px_#fff] object-cover bg-white"
              alt="AI Plan Lesson Generator Logo"
            />
            <span className="font-black font-heading text-lg text-text-primary">
              AI Plan Lesson Generator
            </span>
          </Link>
          <nav className="flex items-center gap-3 text-sm font-bold">
            <ThemeToggle />
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary h-11 px-5 inline-flex items-center gap-1.5 text-xs"
              >
                Go to Dashboard <ArrowRight className="h-4 w-4 stroke-[3]" />
              </Link>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 text-text-secondary hover:underline">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary h-11 px-5 text-xs">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto max-w-6xl px-6 flex-1 flex flex-col">
        <div className="py-16 md:py-24 flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">
          {/* Sparkles Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wide border-[2px] border-black dark:border-white bg-[#ffd633] text-black shadow-[2px_2px_0px_#000]">
            <Sparkles className="h-3.5 w-3.5 stroke-[2.5]" /> Early Education AI Command Suite
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-black font-heading leading-tight text-stroke-black text-text-primary">
            Generate preschool lesson plans{' '}
            <span className="text-[#8D6BE8] dark:text-[#aa8ffa] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              in seconds.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg font-semibold leading-relaxed max-w-xl mx-auto text-text-secondary">
            AI Lesson Plan Generator empowers teachers to construct age-appropriate learning
            objectives, step-by-step activities, classroom rhymes, and worksheets in a single click.
          </p>

          {/* CTA */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4 items-center justify-center">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary h-14 px-8 text-base inline-flex items-center gap-2"
              >
                Go to Dashboard <ArrowRight className="h-5 w-5 stroke-[3]" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary h-14 px-8 text-base inline-flex items-center gap-2"
                >
                  Get Started for Free <ArrowRight className="h-5 w-5 stroke-[3]" />
                </Link>
                <Link
                  to="/login"
                  className="btn-secondary h-14 px-8 text-base inline-flex items-center gap-2"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div
          ref={statsSection.ref}
          className={`grid grid-cols-1 md:grid-cols-3 gap-6 pb-16 transition-all duration-700 ${statsSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {[
            {
              label: 'Lessons Generated',
              value: 2400,
              suffix: '+',
              icon: FileText,
              color: 'bg-[#ffd633]',
            },
            {
              label: 'AI Accuracy',
              value: 92,
              suffix: '%',
              icon: Zap,
              color: 'bg-[#f04d3a] text-white',
            },
            {
              label: 'Active Teachers',
              value: 500,
              suffix: '+',
              icon: BarChart3,
              color: 'bg-[#2f6fd6] text-white',
            },
          ].map((stat) => (
            <div key={stat.label} className="card text-center">
              <div
                className={`mx-auto h-12 w-12 rounded-xl flex items-center justify-center mb-3 border-[2.5px] border-black dark:border-white ${stat.color} shadow-[2px_2px_0px_#000]`}
              >
                <stat.icon className="h-6 w-6 stroke-[2.5]" />
              </div>
              <div className="text-4xl font-black font-heading text-text-primary">
                <AnimatedCounter end={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-xs font-black uppercase tracking-wider mt-1.5 text-text-secondary">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div
          ref={featuresSection.ref}
          className={`grid md:grid-cols-3 gap-6 pb-16 transition-all duration-700 delay-150 ${featuresSection.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {[
            {
              icon: Sparkles,
              title: 'Gemini AI Integration',
              description:
                'Dynamically tailors learning plans to custom themes using Google’s AI capabilities.',
              accentBg: 'bg-[#f4f0ff]',
              accentColor: 'text-[#8D6BE8]',
            },
            {
              icon: CheckCircle,
              title: 'Deterministic Fallbacks',
              description:
                'Maintains high-reliability generation using pre-authored templates if AI is offline.',
              accentBg: 'bg-[#fff9e0]',
              accentColor: 'text-[#E6BD19]',
            },
            {
              icon: GraduationCap,
              title: 'Structured PDF Exports',
              description:
                'Streams formatted, printable PDFs directly to your device for immediate classroom use.',
              accentBg: 'bg-[#ebf2fe]',
              accentColor: 'text-[#2F6FD6]',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="card space-y-3 hover:translate-y-[-4px] hover:shadow-card-hover transition-all duration-150"
            >
              <div
                className={`h-11 w-11 rounded-xl flex items-center justify-center border-[2.5px] border-black dark:border-white shadow-[2px_2px_0px_#000] ${feature.accentBg} ${feature.accentColor}`}
              >
                <feature.icon className="h-5 w-5 stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-black font-heading text-text-primary">{feature.title}</h3>
              <p className="text-sm font-semibold leading-relaxed text-text-secondary">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* System Connection Status Card */}
        <div className="max-w-md mx-auto mb-16 p-6 card space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b-[2px] border-black dark:border-white">
            <Activity className="h-4 w-4 stroke-[2.5] text-text-secondary" />
            <h2 className="text-xs font-black uppercase tracking-wider text-text-secondary">
              System Connection Status
            </h2>
          </div>

          {health.loading && (
            <p className="text-sm font-semibold text-text-secondary">Verifying API health probe…</p>
          )}
          {health.error && (
            <p className="text-sm font-black text-red-600" role="alert">
              API Connection failure: {health.error}
            </p>
          )}
          {!health.loading && !health.error && (
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
              <div>
                <span className="block font-black text-text-secondary uppercase tracking-wide mb-1">
                  Backend Status
                </span>
                <span className="font-black text-[#3BAA63] text-sm">
                  {health.ok ? 'Online' : 'Offline'}
                </span>
              </div>
              <div>
                <span className="block font-black text-text-secondary uppercase tracking-wide mb-1">
                  AI Deployment
                </span>
                <span className="font-black text-text-primary text-sm">
                  {health.gemini === 'configured' ? 'Gemini AI (Primary)' : 'Template Fallback'}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t-[4px] border-black dark:border-white bg-card">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs font-black tracking-wide uppercase text-text-secondary">
          &copy; {new Date().getFullYear()} AI Plan Lesson Generator. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
