"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "@/styles/layout.module.css";

export const NavClient = () => {
  const pathname = usePathname();

  return (
    <>
      <nav className={styles.nav}>
        <p>Client Side: </p>
        <Link
          className={`${styles.link} ${
            pathname === "/set" ? styles.active : ""
          }`}
          href="/set/csr"
        >
          Set Data
        </Link>
        <Link
          className={`${styles.link} ${
            pathname === "/get" ? styles.active : ""
          }`}
          href="/get/csr"
        >
          Get Data
        </Link>
      </nav>
    </>
  );
};
