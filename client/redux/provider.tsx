// Access Redux states within client-side components
"use client";
import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { store, resetAuth } from "@/redux/index";

// ❗️ Use the ReduxProvider component at the top level of the app component hierarchy (app\layout.tsx)

// 🌿 ReduxProvider ensures that Redux state and functionality are available to all components
// renders any child components that are passed to ReduxProvider
// and make the Redux store available to all components within the component tree of ReduxProvider
export const ReduxProvider = (props: React.PropsWithChildren) => {
  return <Provider store={store}>{props.children}</Provider>;
};
