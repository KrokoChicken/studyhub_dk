"use client";

import styles from "./Navbar.module.css";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href={session ? "/dashboard" : "/"}>studyhub.dk</Link>
      </div>

      <ul className={styles.navLinks}>
        {status === "loading" ? null : session ? (
          <>
            {/* ✅ Display the user's email */}
            <li className={styles.email}>Hej, {session.user.email}</li>

            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={styles.buttonLink}
              >
                Log ud
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login">Log ind</Link>
            </li>
            <li className={styles.divider}>/</li>
            <li>
              <Link href="/register">Registrér</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
