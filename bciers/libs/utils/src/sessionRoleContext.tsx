"use client";
import {
  AwaitedReactNode,
  createContext,
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";

export const SessionRoleContext = createContext(undefined);

const SessionRoleContextProvider = (props: any) => {
  return (
    <SessionRoleContext.Provider value={props.value}>
      {props.children}
    </SessionRoleContext.Provider>
  );
};

export default SessionRoleContextProvider;
