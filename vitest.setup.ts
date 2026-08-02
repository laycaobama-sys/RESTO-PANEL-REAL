// Vitest global setup.
// Mocks Next.js server-only modules that are not available in the vitest
// node environment so the lib/route units can be exercised in isolation.

import { vi } from "vitest";

// --- Mock next/headers cookies() ----------------------------------------
// The real `cookies()` returns a read-only handle backed by the AsyncLocalStorage
// of the current request. In tests there is no request, so we keep an in-memory
// jar that tests can mutate via `mockCookieStore.set`.
type CookieJar = Record<string, { value: string }>;

const mockCookieStore = {
  _jar: {} as CookieJar,
  set(name: string, value: string) {
    this._jar[name] = { value };
  },
  clear() {
    this._jar = {};
  },
  getAll() {
    return Object.entries(this._jar).map(([name, entry]) => ({
      name,
      value: entry.value,
    }));
  },
  get(name: string) {
    return this._jar[name] ?? undefined;
  },
};

vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => mockCookieStore.get(name),
    getAll: () => mockCookieStore.getAll(),
    set: (name: string, value: string) => mockCookieStore.set(name, value),
    delete: (name: string) => {
      delete mockCookieStore._jar[name];
    },
  }),
}));

// Expose the store globally so individual tests can drive the cookie jar
// without importing internals of the mock.
(globalThis as unknown as { __mockCookieStore: typeof mockCookieStore }).__mockCookieStore =
  mockCookieStore;

// Reset cookie jar + all mocks between tests so leakage cannot occur.
beforeEach(() => {
  mockCookieStore.clear();
  vi.clearAllMocks();
});
