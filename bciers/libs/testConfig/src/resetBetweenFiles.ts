import { vi } from "vitest";

// Test files share a worker (isolate: false), so each file starts by dropping the modules the previous file
// loaded. Without this, a file's vi.mock calls don't apply to modules already cached by an earlier file, and the
// shared vi.fn()s in ./mocks keep the previous file's implementations and calls. It must run before global.tsx,
// so global.tsx's vi.mock factories and the test file share the same fresh copy of ./mocks.
vi.resetModules();
