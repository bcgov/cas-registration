import { useState, useRef, useCallback, useEffect } from "react";
import { actionHandler } from "@bciers/actions";

interface UseAutosaveGridOptions<T> {
  endpoint: string;
  getRecordKey: (record: T) => string;
  onSuccess?: () => void;
  debounceMs?: number;
}

/**
 * Hook: useAutosaveGrid
 *
 * Purpose:
 * Automatically save row changes to the server
 *
 * What it handles:
 * 1. Debouncing (avoid too many API calls if user clicks fast)
 * 2. Queueing saves (run requests one after another in order)
 * 3. Preventing stale saves from overriding newer ones
 * 4. Rolling back UI if a save fails
 * 5. Keeping UI consistent when server data is slightly behind
 */
export function useAutosaveGrid<T extends { is_completed: boolean }>(
  options: UseAutosaveGridOptions<T>,
) {
  const { endpoint, getRecordKey, onSuccess, debounceMs = 500 } = options;

  /**
   * Tracks which rows are currently being saved.
   * Example: { "facility-1": true, "facility-2": true }
   *
   * Used to show loading state
   */
  const [savingRecords, setSavingRecords] = useState<Record<string, boolean>>(
    {},
  );

  /**
   * Stores temporary local values for rows that were changed but not yet saved
   *
   * Why:
   * If the server sends old data before the PATCH finishes,
   * we still want to show the user's latest change in the UI
   */
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});

  /**
   * Stores error messages from failed saves
   */
  const [errors, setErrors] = useState<string[]>([]);

  /**
   * Promise queue:
   * Ensures all saves run one after another (not at the same time)
   *
   * This prevents race conditions where requests finish out of order
   */
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  /**
   * Tracks the "latest version" of each row.
   *
   * Every time a row is updated, we increase its version number
   * Lets us ignore outdated saves that finish late
   */
  const requestVersionRef = useRef<Record<string, number>>({});

  /**
   * Stores debounce timers for each row   *
   * Each row gets its own timer so rapid clicks only affect that row
   */
  const debounceTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );

  /**
   * Cleanup:
   * When the component unmounts, clear any pending timers
   */
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  /**
   * Actually performs the API save (called inside the queue)
   */
  const runQueuedSave = useCallback(
    async (
      key: string,
      updatedRecord: T,
      requestVersion: number,
      onRollback?: () => void,
    ) => {
      try {
        // Send PATCH request to backend
        await actionHandler(endpoint, "PATCH", endpoint, {
          body: JSON.stringify([updatedRecord]),
        });

        /**
         * Only update state if this is still the latest change for this row
         *
         * If the user clicked again after this request started,
         * we ignore this result because it's outdated.
         */
        if (requestVersionRef.current[key] === requestVersion) {
          // Remove "saving" state for this row
          setSavingRecords((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });

          // Remove override (server is now up-to-date)
          setOverrides((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });

          // Optional success callback
          onSuccess?.();
        }
      } catch (error: unknown) {
        /**
         * Ignore error if this is NOT the latest version
         * A newer user action already happened
         */
        if (requestVersionRef.current[key] !== requestVersion) return;

        const msg = error instanceof Error ? error.message : "Save failed.";

        // Add error (avoid duplicates)
        setErrors((prev) => (prev.includes(msg) ? prev : [...prev, msg]));

        /**
         * Rollback UI to previous state if save failed
         */
        if (onRollback) onRollback();

        /**
         * Keep override in sync with rollback
         * so UI does not flicker on next fetch
         */
        setOverrides((prev) => ({
          ...prev,
          [key]: !updatedRecord.is_completed,
        }));

        // Remove saving state
        setSavingRecords((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    },
    [endpoint, onSuccess],
  );

  /**
   * Called by the component when a row changes
   *
   * It schedules a save using debounce + queue
   */
  const persistChange = useCallback(
    async (
      updatedRecord: T,
      requestVersion: number,
      onRollback?: () => void,
    ) => {
      const key = getRecordKey(updatedRecord);

      /**
       * If user clicks the same row quickly,
       * cancel the previous pending save
       */
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
      }

      /**
       * Start debounce timer
       * After delay, queue the save
       */
      debounceTimers.current[key] = setTimeout(() => {
        // Mark row as saving
        setSavingRecords((prev) => ({ ...prev, [key]: true }));

        // Clear previous errors (optional UX choice)
        setErrors([]);

        /**
         * Add this save to the queue
         */
        saveChainRef.current = saveChainRef.current
          .catch(() => {}) // prevent chain from breaking
          .then(() =>
            runQueuedSave(key, updatedRecord, requestVersion, onRollback),
          );
      }, debounceMs);
    },
    [debounceMs, getRecordKey, runQueuedSave],
  );

  /**
   * Merge local overrides into server data
   *
   * Use this after fetching data from backend
   *
   * This prevents "UI flicker" where server returns old values
   * before the PATCH request has finished.
   */
  const applyOverrides = useCallback(
    (rows: T[]): T[] => {
      return rows.map((row) => {
        const overrideValue = overrides[getRecordKey(row)];

        // If no override, use server value
        if (overrideValue === undefined) return row;

        // Otherwise use local value
        return { ...row, is_completed: overrideValue };
      });
    },
    [overrides, getRecordKey],
  );

  return {
    overrides, // local temporary values
    errors, // save errors
    isSaving: Object.keys(savingRecords).length > 0, // any row saving?
    saveChain: saveChainRef, // queue (can await before navigation)
    requestVersionRef, // version tracking
    persistChange, // call this when user updates a row
    applyOverrides, // merge local + server data
    setErrors, // allow manual error clearing
  };
}
