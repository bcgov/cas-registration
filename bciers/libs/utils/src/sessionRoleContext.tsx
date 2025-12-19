"use client";
import { createContext } from "react";
import type { ReactNode, FC } from "react";

export const SessionRoleContext = createContext<string | undefined>(undefined);

interface SessionRoleContextProviderProps {
  value: string | undefined;
  children: ReactNode;
}

const SessionRoleContextProvider: FC<SessionRoleContextProviderProps> = (
  props,
) => {
  return (
    <SessionRoleContext.Provider value={props.value}>
      {props.children}
    </SessionRoleContext.Provider>
  );
};

export default SessionRoleContextProvider;
