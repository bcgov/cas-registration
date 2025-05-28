"use client";
import { createContext } from "react";

export const SessionRoleContext = createContext(undefined);

const SessionRoleContextProvider = (props) => {
  return (
    <SessionRoleContext.Provider value={props.value}>
      {props.children}
    </SessionRoleContext.Provider>
  );
};

export default SessionRoleContextProvider;

// import { useState, createContext } from "react";
// import ReactDOM from "react-dom/client";

// const UserContext = createContext()
