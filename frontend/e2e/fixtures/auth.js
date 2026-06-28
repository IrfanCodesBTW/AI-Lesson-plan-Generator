import { expect } from '@playwright/test';
const UNIQUE = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}-${UNIQUE}-${Math.random().toString(36).slice(2, 8)}@example.com`;
}
export function uniqueName(prefix = 'User') {
  return `${prefix} ${UNIQUE}`;
}
export async function registerViaApi(page, { name, email, password }) {
  const res = await page.request.post('/api/auth/register', {
    data: { name, email, password },
  });
  expect(res.status()).toBe(201);
}
export async function loginViaApi(page, { email, password }) {
  const res = await page.request.post('/api/auth/login', {
    data: { email, password },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  return body.token;
}
export async function seedAuth(page, token, user) {
  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { token, user },
  );
}
