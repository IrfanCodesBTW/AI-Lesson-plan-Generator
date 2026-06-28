import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
vi.mock('../src/lib/supabase', () => {
  const mockUnsubscribe = vi.fn();
  const mockOnAuthStateChange = vi.fn().mockImplementation((cb) => {
    cb('INITIAL_SESSION', null);
    return {
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    };
  });
  const mockGetSession = vi.fn().mockResolvedValue({ data: { session: null } });
  const mockSignInWithPassword = vi.fn();
  const mockSignInWithOAuth = vi.fn();
  const mockSignUp = vi.fn();
  return {
    supabase: {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: mockSignInWithOAuth,
        signUp: mockSignUp,
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});
class MockIntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});
