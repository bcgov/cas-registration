import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useAutosaveGrid } from "./useAutosaveGrid";
import { actionHandler } from "@bciers/actions";

vi.mock("@bciers/actions", () => ({
  actionHandler: vi.fn(),
}));

interface TestRecord {
  id: string;
  is_completed: boolean;
}

describe("useAutosaveGrid hook", () => {
  const mockOptions = {
    endpoint: "test/endpoint",
    getRecordKey: (record: TestRecord) => record.id,
    debounceMs: 500,
  };

  const initialRecord: TestRecord = { id: "123", is_completed: false };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("applies overrides and clears them on successful save", async () => {
    let resolveRequest!: (value: unknown) => void;

    (actionHandler as any).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { result } = renderHook(() =>
      useAutosaveGrid<TestRecord>(mockOptions),
    );

    act(() => {
      result.current.requestVersionRef.current["123"] = 1;
      result.current.persistChange({ ...initialRecord, is_completed: true }, 1);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    expect(result.current.isSaving).toBe(true);

    await act(async () => {
      resolveRequest({ success: true });
      await Promise.resolve();
    });

    expect(result.current.isSaving).toBe(false);
  });
  it("handles race conditions by respecting the latest request version", async () => {
    let resolveFirst!: (val: unknown) => void;
    let resolveSecond!: (val: unknown) => void;

    const firstPromise = new Promise((res) => {
      resolveFirst = res;
    });

    const secondPromise = new Promise((res) => {
      resolveSecond = res;
    });

    (actionHandler as any)
      .mockReturnValueOnce(firstPromise) // V1 hangs
      .mockReturnValueOnce(secondPromise); // V2 also hangs until we release it

    const { result } = renderHook(() =>
      useAutosaveGrid<TestRecord>(mockOptions),
    );

    // 1. Trigger V1
    act(() => {
      result.current.requestVersionRef.current["123"] = 1;
      result.current.persistChange({ ...initialRecord, is_completed: true }, 1);
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    // 2. Trigger V2
    act(() => {
      result.current.requestVersionRef.current["123"] = 2;
      result.current.persistChange(
        { ...initialRecord, is_completed: false },
        2,
      );
    });

    await act(async () => {
      vi.advanceTimersByTime(500);
      await Promise.resolve();
    });

    // 3. Resolve V1
    await act(async () => {
      resolveFirst({ success: true });
      await Promise.resolve();
    });

    // VERIFY: isSaving must still be true because V2 is now active
    expect(result.current.isSaving).toBe(true);

    // 4. Resolve V2
    await act(async () => {
      resolveSecond({ success: true });
      await Promise.resolve();
    });

    expect(result.current.isSaving).toBe(false);
  });
});
