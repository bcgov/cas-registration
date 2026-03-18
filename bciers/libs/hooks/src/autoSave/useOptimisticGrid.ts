import { useState, useRef, useCallback, useEffect } from "react";
import { actionHandler } from "@bciers/actions";

interface UseOptimisticGridOptions<T> {
  endpoint: string;
  getRecordKey: (record: T) => string;
  onSuccess?: () => void;
  debounceMs?: number;
}

/**
 * A reusable hook for managing server-side data grid autosave with optimistic UI toggles
 * Handles debouncing, request versioning, and sequential promise execution
 */
export function useOptimisticGrid<T extends { is_completed: boolean }>(
  options: UseOptimisticGridOptions<T>,
) {
  const { endpoint, getRecordKey, onSuccess, debounceMs = 500 } = options;

  // UI State: Tracks which unique keys are currently being sent to the server
  const [savingRecords, setSavingRecords] = useState<Record<string, boolean>>(
    {},
  );

  // Persistence State: Stores local overrides to merge with server data until PATCH finishes
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Safety Ref: Prevents state updates if the component unmounts during a network request
  const isMounted = useRef(true);

  // The Queue: A chain of promises that ensures PATCH requests are processed in the
  // exact order they were triggered, preventing race conditions in the database
  const saveChainRef = useRef<Promise<void>>(Promise.resolve());

  // Version Control: Tracks the 'latest' interaction per record
  // This ensures a late-resolving older request doesn't overwrite a newer local change
  const requestVersionRef = useRef<Record<string, number>>({});

  // Timer Registry: Stores active timeouts PER record to allow for debouncing in each row
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    return () => {
      isMounted.current = false;
      // Cleanup: Cancel any pending debounced saves when the component is destroyed
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  const runQueuedSave = useCallback(
    async (
      key: string,
      updatedRecord: T,
      requestVersion: number,
      onRollback?: () => void,
    ) => {
      try {
        // Perform the actual network request
        await actionHandler(endpoint, "PATCH", endpoint, {
          body: JSON.stringify([updatedRecord]),
        });

        if (!isMounted.current) return;

        // POST-SAVE LOGIC
        // Only clear the "Saving" and "Override" status if this specific
        // request matches the LATEST version stored in the ref
        if (requestVersionRef.current[key] === requestVersion) {
          setSavingRecords((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });

          // Clear the local override so the server-side data becomes the Source of Truth again
          setOverrides((prev) => {
            const next = { ...prev };
            delete next[key];
            return next;
          });

          onSuccess?.();
        }
      } catch (error: unknown) {
        // Ignore errors if the component is unmounted or if a newer click has already happened
        if (
          !isMounted.current ||
          requestVersionRef.current[key] !== requestVersion
        )
          return;

        const msg = error instanceof Error ? error.message : "Save failed.";
        setErrors((prev) => (prev.includes(msg) ? prev : [...prev, msg]));

        // ROLLBACK LOGIC
        // If the server fails,revert state
        if (onRollback) onRollback();

        // Ensure the local override reflects the rolled-back state to prevent UI flicker
        setOverrides((prev) => ({
          ...prev,
          [key]: !updatedRecord.is_completed,
        }));

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
   * Main persistence function: Handles the background saving of a record
   * @param updatedRecord - The full record containing the new checkbox state
   * @param requestVersion - A unique version ID for this specific user interaction
   * @param onRollback - Optional callback from the component to undo local state (e.g., counters)
   */
  const persistChange = useCallback(
    async (
      updatedRecord: T,
      requestVersion: number,
      onRollback?: () => void,
    ) => {
      const key = getRecordKey(updatedRecord);

      // DEBOUNCE LOGIC
      // If the user clicks a checkbox rapidly, we cancel the previous timer.
      // This ensures we only hit the API once the user stops clicking (prevents "spamming").
      if (debounceTimers.current[key]) {
        clearTimeout(debounceTimers.current[key]);
      }

      // Start the debounce timer
      debounceTimers.current[key] = setTimeout(() => {
        setSavingRecords((prev) => ({ ...prev, [key]: true }));
        setErrors([]);

        // SEQUENTIAL PROMISE LOGIC
        // Append the new PATCH task to a persistent promise ref
        // This forces requests to run one after another (FIFO), preventing
        // older requests from finishing LATER than newer ones and corrupting data
        saveChainRef.current = saveChainRef.current
          .catch(() => {}) // Prevent a previous failed save from breaking the whole queue
          .then(() =>
            runQueuedSave(key, updatedRecord, requestVersion, onRollback),
          );
      }, debounceMs);
    },
    [debounceMs, getRecordKey, runQueuedSave],
  );

  /**
   * Data Merger:
   * Call this on the data returned from the server (GET) to ensure unsaved
   * local changes (Overrides) aren't overwritten by "stale" server data
   */
  const applyOverrides = useCallback(
    (rows: T[]): T[] => {
      return rows.map((row) => {
        const overrideValue = overrides[getRecordKey(row)];
        return overrideValue === undefined
          ? row
          : { ...row, is_completed: overrideValue };
      });
    },
    [overrides, getRecordKey],
  );

  return {
    overrides,
    errors,
    isSaving: Object.keys(savingRecords).length > 0,
    saveChain: saveChainRef,
    requestVersionRef,
    persistChange,
    applyOverrides,
    setErrors,
  };
}
