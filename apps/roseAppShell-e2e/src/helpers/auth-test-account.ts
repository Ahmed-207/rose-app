import { request as playwrightRequest } from '@playwright/test';

const API = 'https://rose-app.elevate-bootcamp.cloud';
const MAIL_API = 'https://api.mail.tm';

export interface TestAccount {
  email: string;
  username: string;
  password: string;
  mailToken: string;
}

async function mailTm<T>(path: string, options: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  const ctx = await playwrightRequest.newContext({
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
  });

  const response = await ctx.fetch(`${MAIL_API}${path}`, {
    method: options.method ?? 'GET',
    data: options.body,
  });

  const text = await response.text();
  await ctx.dispose();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function api<T>(path: string, body: unknown): Promise<T> {
  const ctx = await playwrightRequest.newContext({
    extraHTTPHeaders: { 'Content-Type': 'application/json', Accept: 'application/json' },
  });
  const response = await ctx.fetch(`${API}${path}`, { method: 'POST', data: body });
  const payload = (await response.json()) as T;
  await ctx.dispose();
  return payload;
}

function messageText(full: Record<string, unknown>): string {
  const parts = ['text', 'html', 'subject', 'intro'].map((key) => {
    const value = full[key];
    if (value == null) return '';
    if (Array.isArray(value)) return value.map(String).join('');
    return String(value);
  });
  return parts.join('');
}

async function waitForMail(
  mailToken: string,
  predicate: (text: string) => string | null,
  timeoutMs = 90_000,
): Promise<string> {
  const deadline = Date.now() + timeoutMs;
  const seen = new Set<string>();

  while (Date.now() < deadline) {
    const list = await mailTm<{ 'hydra:member'?: Array<{ id: string }> } | Array<{ id: string }>>(
      '/messages',
      { token: mailToken },
    );
    const messages = Array.isArray(list) ? list : list['hydra:member'] ?? [];

    for (const message of messages) {
      if (seen.has(message.id)) continue;
      seen.add(message.id);

      const full = await mailTm<Record<string, unknown>>(`/messages/${message.id}`, { token: mailToken });
      const text = messageText(full);
      const match = predicate(text);
      if (match) return match;
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }

  throw new Error('Timed out waiting for email');
}

export async function createTestAccount(): Promise<TestAccount> {
  const domains = await mailTm<{ 'hydra:member'?: Array<{ domain: string }> } | Array<{ domain: string }>>(
    '/domains',
  );
  const members = Array.isArray(domains) ? domains : domains['hydra:member'] ?? [];
  const domain = members[0]?.domain;
  if (!domain) throw new Error('No mail.tm domain available');

  const ts = String(Date.now());
  const email = `uitest${ts}@${domain}`;
  const mailPass = 'RoseTest123!';
  const username = `ui${ts.slice(-6)}`;
  const password = 'TestPass123!';

  await mailTm('/accounts', {
    method: 'POST',
    body: { address: email, password: mailPass },
  });

  const tokenResp = await mailTm<{ token: string }>('/token', {
    method: 'POST',
    body: { address: email, password: mailPass },
  });
  const mailToken = tokenResp.token;

  await api('/api/auth/send-email-verification', { email });
  const code = await waitForMail(mailToken, (text) => text.match(/\b(\d{6})\b/)?.[1] ?? null);
  await api('/api/auth/confirm-email-verification', { email, code });
  const register = await api<{ status: boolean; message?: string }>('/api/auth/register', {
    username,
    email,
    password,
    confirmPassword: password,
    firstName: 'Rose',
    lastName: 'UI',
  });

  if (!register.status) {
    throw new Error(`Register failed: ${register.message ?? 'unknown error'}`);
  }

  return { email, username, password, mailToken };
}

export async function getResetTokenFromEmail(mailToken: string): Promise<string> {
  const token = await waitForMail(mailToken, (text) => {
    const patterns = [
      /reset-password\?token=([A-Za-z0-9._-]+)/,
      /token=([A-Za-z0-9._-]+)/,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  });

  return token;
}
