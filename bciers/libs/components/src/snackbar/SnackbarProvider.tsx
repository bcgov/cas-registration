"use client";

import { createContext, use, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Snackbar from "@mui/material/Snackbar";

const DEFAULT_AUTO_HIDE_DURATION = 5000;

interface ShowSnackbarOptions {
  autoHideDuration?: number;
}

interface SnackbarContextValue {
  showSnackbar: (message: ReactNode, options?: ShowSnackbarOptions) => void;
  hideSnackbar: () => void;
}

interface SnackbarState {
  open: boolean;
  message: ReactNode;
  autoHideDuration: number;
  // Bumped on every show so a new message restarts the auto-hide timer
  id: number;
}

// No-op default so components rendered without the provider (e.g. in isolation) don't crash
const SnackbarContext = createContext<SnackbarContextValue>({
  showSnackbar: () => {},
  hideSnackbar: () => {},
});

/**
 * App-wide snackbar, mounted once in RootLayout.
 * It lives above the route tree so it survives the triggering component being remounted
 * (e.g. a form key reset or a route change right after saving).
 */
export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<SnackbarState>({
    open: false,
    message: "",
    autoHideDuration: DEFAULT_AUTO_HIDE_DURATION,
    id: 0,
  });

  const showSnackbar = useCallback(
    (message: ReactNode, options?: ShowSnackbarOptions) =>
      setState((prev) => ({
        open: true,
        message,
        autoHideDuration:
          options?.autoHideDuration ?? DEFAULT_AUTO_HIDE_DURATION,
        id: prev.id + 1,
      })),
    [],
  );

  const hideSnackbar = useCallback(
    () => setState((prev) => ({ ...prev, open: false })),
    [],
  );

  const value = useMemo(
    () => ({ showSnackbar, hideSnackbar }),
    [showSnackbar, hideSnackbar],
  );

  return (
    <SnackbarContext value={value}>
      {children}
      <Snackbar
        key={state.id}
        open={state.open}
        message={state.message}
        autoHideDuration={state.autoHideDuration}
        onClose={(_event, reason) => {
          // Don't dismiss on the next click anywhere on the page; let it time out or be escaped
          if (reason === "clickaway") return;
          hideSnackbar();
        }}
        className="[&_.MuiSnackbarContent-root]:bg-bc-success-green"
      />
    </SnackbarContext>
  );
};

// Read with use() rather than useContext(): the shared test setup mocks useContext globally
export const useSnackbar = () => use(SnackbarContext);
