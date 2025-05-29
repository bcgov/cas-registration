"use client";
import {
  AwaitedReactNode,
  createContext,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";

export const SessionRoleContext = createContext<string | undefined>(undefined);

interface SessionRoleContextProviderProps {
  value: string | undefined;
  children: React.ReactNode;
}

const SessionRoleContextProvider: React.FC<SessionRoleContextProviderProps> = (
  props,
) => {
  return (
    <SessionRoleContext.Provider value={props.value}>
      {props.children}
    </SessionRoleContext.Provider>
  );
};

export default SessionRoleContextProvider;
