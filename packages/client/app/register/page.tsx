"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/users/register", {
      method: "POST",
      body: JSON.stringify(form),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("Bruger oprettet!");
    } else {
      alert("Noget gik galt.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Opret bruger</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label htmlFor="name" className={styles.label}>
            Navn
          </label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className={styles.input}
            required
          />

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

          <button type="submit" className={styles.button}>
            Registrér
          </button>
        </form>
      </div>
    </div>
  );
}
