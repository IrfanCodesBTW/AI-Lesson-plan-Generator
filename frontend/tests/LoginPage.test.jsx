import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { LoginPage } from '../src/pages/LoginPage';
import { supabase } from '../src/lib/supabase';
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
  return {
    supabase: {
      auth: {
        getSession: mockGetSession,
        onAuthStateChange: mockOnAuthStateChange,
        signInWithPassword: mockSignInWithPassword,
        signInWithOAuth: mockSignInWithOAuth,
        signOut: vi.fn(),
      },
    },
  };
});
function renderLogin() {
  return render(
    <MemoryRouter initialEntries={['/login']}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}
describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(supabase.auth.signInWithPassword).mockReset();
    vi.mocked(supabase.auth.signInWithOAuth).mockReset();
  });
  it('submits credentials and navigates to /dashboard on success', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: {
        user: { id: 'u1', email: 'teacher@example.com', user_metadata: { name: 'Teacher' } },
        session: { access_token: 'jwt' },
      },
      error: null,
    });
    const user = userEvent.setup();
    renderLogin();
    await user.type(await screen.findByLabelText(/email/i), 'teacher@example.com');
    await user.type(screen.getByLabelText(/password/i), 'passw0rd-strong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'teacher@example.com',
      password: 'passw0rd-strong',
    });
  });
  it('shows error message on failed login', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Invalid credentials'),
    });
    const user = userEvent.setup();
    renderLogin();
    await user.type(await screen.findByLabelText(/email/i), 'wrong@example.com');
    await user.type(screen.getByLabelText(/password/i), 'badpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('Invalid credentials');
  });
  it('triggers Google login on click', async () => {
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: {},
      error: null,
    });
    const user = userEvent.setup();
    renderLogin();
    await user.click(await screen.findByRole('button', { name: /continue with google/i }));
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: expect.stringContaining('/auth/callback'),
      },
    });
  });
});
