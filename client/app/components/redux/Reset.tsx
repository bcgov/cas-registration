"use client";
import { useEffect } from "react";
import { resetAuth, resetUserData, resetOperatorsData, useDispatch } from "@/redux/index";

export default function ReduxReset() {
  const dispatch = useDispatch();
  // 🧹 Purge store data to prevent any data leakage that may be caused by SSR pages accessing Reux store w/o using client side selectors
  useEffect(() => {
    // 🚀 Call reset actions when the component mounts
    dispatch(resetAuth());
    dispatch(resetUserData());
    dispatch(resetOperatorsData())
  }, []); // 🔄 The empty dependency array ensures this effect runs only once when the component mounts

  // No need to return any JSX if the component doesn't render anything
  return <></>;
}
