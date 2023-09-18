"use client";

/* Core */
import Link from "next/link";
import { usePathname } from "next/navigation";

/* Instruments */
import styles from "../styles/layout.module.css";

export const Nav = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <Link
        className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
        href="/"
      >
        Count
      </Link>
      <Link
        className={`${styles.link} ${
          pathname === "/display" ? styles.active : ""
        }`}
        href="/display"
      >
        Display
      </Link>
    </nav>
  );
};
