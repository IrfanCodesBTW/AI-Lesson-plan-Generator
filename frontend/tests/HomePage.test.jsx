import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { HomePage } from '../src/pages/HomePage';
vi.mock('../src/lib/api', () => ({
  fetchHealth: vi.fn().mockResolvedValue({ ok: true, service: 'test', gemini: 'fallback' }),
}));
describe('HomePage', () => {
  it('renders welcome heading and shows backend status', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <HomePage />
        </AuthProvider>
      </MemoryRouter>,
    );
    expect(await screen.findByRole('heading', { name: /generate preschool/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/online/i)).toBeInTheDocument();
    });
  });
});
