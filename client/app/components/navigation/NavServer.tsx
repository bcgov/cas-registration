"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/layout.module.css";

export const NavServer = () => {
  const pathname = usePathname();

  return (
    <>
      <nav className={styles.nav}>
        <p>Server Side: </p>
        <Link
          className={`${styles.link} ${
            pathname === "/set" ? styles.active : ""
          }`}
          href="/set/ssr"
        >
          Set Data
        </Link>
        <Link
          className={`${styles.link} ${
            pathname === "/get" ? styles.active : ""
          }`}
          href="/get/ssr"
        >
          Get Data
        </Link>
      </nav>
    </>
  );
};
