"use client";

import { useState } from "react";
import styles from "./SubjectList.module.css";
import Link from "next/link";

type Subject = {
  id: string;
  name: string;
};

type Props = {
  subjects: Subject[];
  onAddSubject: (name: string) => Promise<void>;
};

export default function SubjectList({ subjects, onAddSubject }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddSubject(newSubject);
    setNewSubject("");
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h2>Dine fag</h2>
          <button
            onClick={() => setShowModal(true)}
            className={styles.addButton}
            aria-label="Tilføj nyt fag"
          >
            +
          </button>
        </header>

        <ul className={styles.list}>
          {subjects.map((subject) => (
            <li key={subject.id} className={styles.listItem}>
              <Link href={`/subjects/${subject.id}`} className={styles.link}>
                {subject.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {showModal && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h3>Tilføj fag</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Fx Matematik"
                className={styles.input}
                required
                autoFocus
              />
              <div className={styles.actions}>
                <button type="submit" className={styles.saveButton}>
                  Gem
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelButton}
                >
                  Annuller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
