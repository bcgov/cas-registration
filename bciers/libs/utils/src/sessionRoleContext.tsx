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

const SessionRoleContextProvider = (props: {
  value: undefined;
  children:
    | string
    | number
    | bigint
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | Iterable<ReactNode>
    | ReactPortal
    | Promise<AwaitedReactNode>
    | null
    | undefined;
}) => {
  return (
    <SessionRoleContext.Provider value={props.value}>
      {props.children}
    </SessionRoleContext.Provider>
  );
};

export default SessionRoleContextProvider;
