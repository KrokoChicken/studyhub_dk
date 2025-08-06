"use client";

import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const res = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Forkert email eller adgangskode");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Log ind</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            className={styles.input}
            required
          />

          <label htmlFor="password" className={styles.label}>
            Adgangskode
          </label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className={styles.input}
            required
          />

          {error && <p style={{ color: "red", margin: "0" }}>{error}</p>}

          <button type="submit" className={styles.button}>
            Log ind
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.95rem", color: "#444" }}>
          Har du ikke en bruger? <Link href="/register">Opret en her</Link>
        </p>
      </div>
    </div>
  );
}
