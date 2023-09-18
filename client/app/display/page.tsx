"use client";
import { selectCount, useSelector } from "@/redux";
import styles from "./page.module.css";

export default function VerifyPage() {
  const count = useSelector(selectCount);
  return (
    <>
      <p>
        👇 Client Side Page to display counter state and verify that Redux state
        is persisted across page navigations
      </p>

      <span className={styles.value}>{count}</span>
    </>
  );
}
